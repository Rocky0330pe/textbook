#!/usr/bin/env python3
"""物理第2巻『熱学』の巻末「蒸気表・空気線図・物性値」の表と図のデータを作る（事務局）。

使い方:  python3 tools/mksteam2.py
  → tex/ph2-steamT.tex   飽和表（温度基準）
     tex/ph2-steamP.tex   飽和表（圧力基準）
     tex/ph2-steamS.tex   過熱蒸気表の抜き出し
     tex/ph2-refrig.tex   冷媒（R32・R134a・R600a）の飽和表
     tex/ph2-moist.tex    湿り空気の表（空気線図の抜き出し）
     tex/ph2-psychro.tex  空気線図（見開きの pgfplots の図。\\phPsychroChart で使う）
     checks/物理第2巻/巻末/mksteam2_check.txt  照らし合わせの結果
       ①iapws（IAPWS-IF97）と CoolProp（IAPWS-95）の差の最大
       ②本文の状態点の一覧（checks/物理第2巻/熱-8・熱-9/states_*.csv）と、表の同じ点の値（同じ丸め）の食いちがい

水・水蒸気：IAPWS-IF97 の式（Python の iapws 1.5.5）。手引き 2章の7・計画書 C-7。
冷媒・湿り空気：CoolProp 8.0（冷媒の状態式、HAPropsSI。湿り空気は 101.325 kPa）。
丸め（熱-8 の本文と同じ）：温度 小数2けた、h 小数1けた、s 小数4けた、v′ 小数6けた、v″（と過熱蒸気の v）4けた。
  飽和圧力〔kPa〕は 10 kPa 未満で小数4けた、100 kPa 未満で3けた、1000 kPa 未満で2けた、それより上は整数（熱-8 の表と同じ）。
"""
import csv, math, os, re, sys
from iapws import IAPWS97, __version__ as IAPWS_VER
import CoolProp
import CoolProp.CoolProp as CP

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
TEX = os.path.join(ROOT, 'tex')
CHK = os.path.join(ROOT, 'checks', '物理第2巻')
P_ATM = 101325.0
TC = 647.096 - 273.15          # 臨界温度 373.946 ℃
PC = 22.064                    # 臨界圧力 MPa
log = []


# ---------------------------------------------------------------- 丸め
def sig(x, n=4):
    """有効数字 n けた（指数を使わない書き方）"""
    if x == 0:
        return '0'
    d = n - 1 - int(math.floor(math.log10(abs(x))))
    d = max(d, 0)
    return '%.*f' % (d, x)


def f_t(t):   # 温度 ℃
    return '%.2f' % t


def f_pkpa(p):   # 飽和圧力 kPa（熱-8 の表と同じ）
    if p < 10:
        return '%.4f' % p
    if p < 100:
        return '%.3f' % p
    if p < 1000:
        return '%.2f' % p
    return '%.0f' % p


def nz(t):   # 「-0.0」を「0.0」に、負の数の「-」を数式のマイナスにする
    if re.match(r'^-0\.?0*$', t):
        return t[1:]
    return ('$-$' + t[1:]) if t.startswith('-') else t


def f_h(h):
    return nz('%.1f' % h)


def f_s(s):
    return nz('%.4f' % s)


def f_v1(v):
    return '%.6f' % v


def f_v2(v):
    return sig(v, 4)


def f_mpa(p):   # 表の圧力の列（MPa）。きりのよい数はそのまま
    s = ('%.6f' % p).rstrip('0').rstrip('.')
    return s


def numfmt(s):
    """5けた以上の整数部に、3けたごとの細いすきまを入れる（\\num と同じ見た目）"""
    m = re.match(r'^(-?)(\d+)(\.\d+)?$', s)
    if not m:
        return s
    ip = m.group(2)
    if len(ip) < 5:
        return s
    parts = []
    while len(ip) > 3:
        parts.insert(0, ip[-3:]); ip = ip[:-3]
    parts.insert(0, ip)
    return m.group(1) + r'\,'.join(parts) + (m.group(3) or '')


def write(name, text):
    with open(os.path.join(TEX, name), 'w', encoding='utf-8') as f:
        f.write(text)


HEAD = '%% 自動生成（tools/mksteam2.py）。直接編集しないこと。値は IAPWS-IF97 の式（iapws {}）・CoolProp {}\n'.format(
    IAPWS_VER, CoolProp.__version__)
STYLE = (r'width=\linewidth, rowhead=%d, colsep=3.2pt, rowsep=0.35pt, hlines={0.3pt,bkLine}, vline{2}={0.4pt,bkLine},'
         r' row{1-%d}={bg=bkVol!14, font=\sffamily\bfseries\scriptsize, halign=c}, cells={font=\scriptsize}')


# ---------------------------------------------------------------- 水と水蒸気
def sat_T(theta):
    T = theta + 273.15
    if theta >= TC - 1e-6:
        st = IAPWS97(T=647.096, x=0)
        return dict(T=theta, p=PC * 1000, v1=st.v, v2=st.v, h1=st.h, h2=st.h, s1=st.s, s2=st.s)
    l = IAPWS97(T=T, x=0); g = IAPWS97(T=T, x=1)
    return dict(T=theta, p=l.P * 1000, v1=l.v, v2=g.v, h1=l.h, h2=g.h, s1=l.s, s2=g.s)


def sat_P(pmpa):
    if pmpa >= PC - 1e-9:
        st = IAPWS97(T=647.096, x=0)
        return dict(T=TC, p=PC * 1000, v1=st.v, v2=st.v, h1=st.h, h2=st.h, s1=st.s, s2=st.s)
    l = IAPWS97(P=pmpa, x=0); g = IAPWS97(P=pmpa, x=1)
    return dict(T=l.T - 273.15, p=pmpa * 1000, v1=l.v, v2=g.v, h1=l.h, h2=g.h, s1=l.s, s2=g.s)


def cp_sat_T(theta):
    T = theta + 273.15
    return dict(p=CP.PropsSI('P', 'T', T, 'Q', 0, 'Water') / 1000,
                h1=CP.PropsSI('H', 'T', T, 'Q', 0, 'Water') / 1000, h2=CP.PropsSI('H', 'T', T, 'Q', 1, 'Water') / 1000,
                s1=CP.PropsSI('S', 'T', T, 'Q', 0, 'Water') / 1000, s2=CP.PropsSI('S', 'T', T, 'Q', 1, 'Water') / 1000)


T_ROWS = [0.01, 2, 4, 5, 6, 8, 10, 12, 14, 15, 16, 18, 20, 22, 24, 25, 26, 28, 30, 32, 34, 35, 36, 38, 40, 45, 50, 55,
          60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 140, 150, 160, 170, 180, 190, 200,
          210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 360, 370, round(TC, 2)]
P_ROWS = [0.000611657, 0.001, 0.0015, 0.002, 0.0025, 0.003, 0.004, 0.005, 0.006, 0.0075, 0.008, 0.01, 0.015, 0.02, 0.025,
          0.03, 0.034, 0.04, 0.05, 0.063, 0.07, 0.075, 0.08, 0.09, 0.1, 0.101325, 0.125, 0.15, 0.175, 0.2, 0.25, 0.3,
          0.35, 0.4, 0.45, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.2, 1.4, 1.5, 1.6, 1.8, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9,
          10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, PC]
SUP_P = [0.01, 0.1, 0.2, 0.5, 1, 2, 4, 10, 15, 25]
SUP_T = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700]

# ① 飽和表（温度基準）
rows = []
maxd = dict(p=0, h=0, s=0)
for t in T_ROWS:
    d = sat_T(t)
    if t < TC - 1e-6:
        c = cp_sat_T(t)
        maxd['p'] = max(maxd['p'], abs(c['p'] / d['p'] - 1))
        maxd['h'] = max(maxd['h'], abs(c['h1'] - d['h1']), abs(c['h2'] - d['h2']))
        maxd['s'] = max(maxd['s'], abs(c['s1'] - d['s1']), abs(c['s2'] - d['s2']))
    tt = '0.01' if t == 0.01 else (f_t(t) if t == round(TC, 2) else '%g' % t)
    crit = t >= TC - 1e-6
    rows.append(r'%s & %s & %s & %s & %s & %s & %s & %s & %s \\' % (
        tt + (r'\textsuperscript{*}' if crit else ''), numfmt(f_pkpa(d['p'])), f_v1(d['v1']), f_v2(d['v2']),
        f_h(d['h1']), f_h(d['h2']), f_h(d['h2'] - d['h1']), f_s(d['s1']), f_s(d['s2'])))
hdr = (r"{温度\\$\theta$〔℃〕} & {圧力\\$p_{\mathrm s}$〔kPa〕} & {$v'$\\〔m$^3$/kg〕} & {$v''$\\〔m$^3$/kg〕} & "
       r"{$h'$\\〔kJ/kg〕} & {$h''$\\〔kJ/kg〕} & {蒸発熱\\$L=h''-h'$} & {$s'$\\〔kJ/(kg·K)〕} & {$s''$\\〔kJ/(kg·K)〕} \\")
spec = r'colspec={Q[c,m,wd=11.5mm] Q[r,m,wd=13mm] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m]}, ' + STYLE % (1, 1)
write('ph2-steamT.tex', HEAD + '\\begin{longtblr}{%s}\n%s\n%s\n\\end{longtblr}\n' % (spec, hdr, '\n'.join(rows)))
log.append('飽和表（温度基準）%d 行。IF97（iapws）と IAPWS-95（CoolProp）の差の最大：p 相対 %.1e、h %.2f kJ/kg、s %.4f kJ/(kg·K)'
           % (len(rows), maxd['p'], maxd['h'], maxd['s']))
n_T = len(rows)

# ② 飽和表（圧力基準）
rows = []
for p in P_ROWS:
    d = sat_P(p)
    if p == 0.000611657:
        pp, tt = '0.000612', '0.01'
    elif p == 0.101325:
        pp, tt = '0.101325', f_t(d['T'])
    else:
        pp, tt = f_mpa(p), f_t(d['T'])
    crit = p >= PC - 1e-9
    rows.append(r'%s & %s & %s & %s & %s & %s & %s & %s & %s \\' % (
        pp + (r'\textsuperscript{*}' if crit else ''), tt, f_v1(d['v1']), f_v2(d['v2']), f_h(d['h1']), f_h(d['h2']),
        f_h(d['h2'] - d['h1']), f_s(d['s1']), f_s(d['s2'])))
hdr = (r"{圧力\\$p$〔MPa〕} & {飽和温度\\$\theta_{\mathrm s}$〔℃〕} & {$v'$\\〔m$^3$/kg〕} & {$v''$\\〔m$^3$/kg〕} & "
       r"{$h'$\\〔kJ/kg〕} & {$h''$\\〔kJ/kg〕} & {蒸発熱\\$L=h''-h'$} & {$s'$\\〔kJ/(kg·K)〕} & {$s''$\\〔kJ/(kg·K)〕} \\")
spec = r'colspec={Q[c,m,wd=13mm] Q[r,m,wd=12mm] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m]}, ' + STYLE % (1, 1)
write('ph2-steamP.tex', HEAD + '\\begin{longtblr}{%s}\n%s\n%s\n\\end{longtblr}\n' % (spec, hdr, '\n'.join(rows)))
log.append('飽和表（圧力基準）%d 行' % len(rows))
n_P = len(rows)

# ③ 過熱蒸気表（2つの圧力を1つの表にならべる。longtblr なので、ページでまたげる）
n_S = 0
def sup_col(p):
    """その圧力の列：見出し・飽和の行・温度ごとの行（dict θ→(v,h,s)）"""
    rows = {}
    global n_S
    if p < PC:
        d = sat_P(p); tsat = d['T']
        head = r'$p=\qty{%s}{MPa}$\\（飽和温度 \qty{%s}{\celsius}）' % (f_mpa(p), f_t(tsat))
        satrow = (f_v2(d['v2']), f_h(d['h2']), f_s(d['s2']))
    else:
        tsat = -1
        head = r'$p=\qty{%s}{MPa}$\\（臨界圧力より高い）' % f_mpa(p)
        satrow = ('―', '―', '―')
    for t in SUP_T:
        if t <= tsat + 0.5 or (p >= 15 and t < 350):
            continue        # 液（圧縮水）の行は入れない
        st = IAPWS97(P=p, T=t + 273.15)
        if st.region not in (2, 3, 5):
            continue
        rows[t] = (f_v2(st.v), f_h(st.h), f_s(st.s)); n_S += 1
    return head, satrow, rows
out = []
# 修2-6（Q6-16）：ページをまたいだとき、続きのページでくり返すのは見出しの2行だけ（「飽和」の行はくり返さない）
spec = (r'colspec={Q[c,m,wd=10mm] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m]}, width=\linewidth, rowhead=2, colsep=3.2pt, rowsep=0.3pt,'
        r' hlines={0.3pt,bkLine}, vline{2,5}={0.4pt,bkLine}, cell{1}{2,5}={c=3}{c}, row{1-2}={bg=bkVol!14, font=\sffamily\bfseries\scriptsize, halign=c},'
        r' row{3}={bg=bkLine!35}, cells={font=\scriptsize}')
for i in range(0, len(SUP_P), 2):
    h1, s1, r1 = sup_col(SUP_P[i]); h2, s2, r2 = sup_col(SUP_P[i + 1])
    lines = [r'{温度\\$\theta$〔℃〕} & {%s} & & & {%s} & & \\' % (h1, h2),
             r' & {$v$〔m$^3$/kg〕} & {$h$〔kJ/kg〕} & {$s$〔kJ/(kg·K)〕} & {$v$〔m$^3$/kg〕} & {$h$〔kJ/kg〕} & {$s$〔kJ/(kg·K)〕} \\',
             r'{\sffamily 飽和} & %s & %s & %s & %s & %s & %s \\' % (s1 + s2)]
    for t in sorted(set(r1) | set(r2)):
        a1 = r1.get(t, ('―',) * 3); a2 = r2.get(t, ('―',) * 3)
        lines.append(r'%d & %s & %s & %s & %s & %s & %s \\' % ((t,) + a1 + a2))
    out.append('\\begin{longtblr}{%s}\n%s\n\\end{longtblr}\\par\\vspace{1.5mm}' % (spec, '\n'.join(lines)))
write('ph2-steamS.tex', HEAD + '\n'.join(out) + '\n')
log.append('過熱蒸気表 %d 圧力・%d 行（飽和の行をのぞく）' % (len(SUP_P), n_S))

# ---------------------------------------------------------------- 冷媒
REF = [('R32', 'R32', list(range(-40, 65, 5)), 'ジフルオロメタン。家庭用エアコン'),
       ('R134a', 'R134a', list(range(-40, 65, 5)), 'テトラフルオロエタン。カーエアコン・冷蔵庫'),
       ('R600a', 'IsoButane', list(range(-40, 65, 5)), 'イソブタン。家庭用冷蔵庫')]
ref_tex = []
n_R = 0
ref_vals = {}
for name, fl, temps, desc in REF:
    Tc = CP.PropsSI('Tcrit', fl) - 273.15
    pc = CP.PropsSI('pcrit', fl) / 1e6
    lines = []
    for t in temps:
        T = t + 273.15
        p = CP.PropsSI('P', 'T', T, 'Q', 0, fl) / 1e6
        v2 = 1 / CP.PropsSI('D', 'T', T, 'Q', 1, fl)
        rho1 = CP.PropsSI('D', 'T', T, 'Q', 0, fl)
        h1 = CP.PropsSI('H', 'T', T, 'Q', 0, fl) / 1000
        h2 = CP.PropsSI('H', 'T', T, 'Q', 1, fl) / 1000
        s1 = CP.PropsSI('S', 'T', T, 'Q', 0, fl) / 1000
        s2 = CP.PropsSI('S', 'T', T, 'Q', 1, fl) / 1000
        ref_vals[(name, t)] = dict(p=p, h1=h1, h2=h2, s2=s2)
        lines.append(r'%s & %s & %s & %s & %s & %s & %s & %s \\' % (
            ('$-$%d' % -t) if t < 0 else '%d' % t, sig(p, 4), '%.1f' % rho1, f_v2(v2), f_h(h1), f_h(h2), f_s(s1), f_s(s2)))
        n_R += 1
    spec = (r'colspec={Q[c,m,wd=9mm] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m]}, ' + STYLE % (1, 1))
    hdr = (r"{温度\\$\theta$〔℃〕} & {圧力\\$p$〔MPa〕} & {液の密度\\$\rho'$〔kg/m$^3$〕} & {$v''$\\〔m$^3$/kg〕} & "
           r"{$h'$\\〔kJ/kg〕} & {$h''$\\〔kJ/kg〕} & {$s'$\\〔kJ/(kg·K)〕} & {$s''$\\〔kJ/(kg·K)〕} \\")
    ref_tex.append(r'''\phbkhead{%s（%s）の飽和表}
{\footnotesize\color{bkGray}臨界点 \qty{%.1f}{\celsius}・\qty{%.2f}{MPa}。\par}\vspace{0.5mm}
\begin{longtblr}{%s}
%s
%s
\end{longtblr}''' % (name, desc, Tc, pc, spec, hdr, '\n'.join(lines)))
write('ph2-refrig.tex', HEAD + '\n'.join(ref_tex) + '\n')
log.append('冷媒の飽和表 %d 行（R32・R134a・R600a、−40〜60 ℃）' % n_R)

# ---------------------------------------------------------------- 湿り空気の表（空気線図の抜き出し）
MOIST = [(0, 80), (5, 60), (10, 60), (15, 100), (20, 21), (20, 40), (20, 50), (20, 60), (22, 40), (25, 50), (25, 60),
         (26, 50), (28, 60), (28, 70), (30, 50), (30, 70), (32, 60), (35, 40), (35, 60)]
lines = []
moist_vals = {}
for th, rh in MOIST:
    T = th + 273.15; R = rh / 100
    x = CP.HAPropsSI('W', 'T', T, 'R', R, 'P', P_ATM)
    h = CP.HAPropsSI('H', 'T', T, 'R', R, 'P', P_ATM) / 1000
    v = CP.HAPropsSI('V', 'T', T, 'R', R, 'P', P_ATM)
    twb = CP.HAPropsSI('B', 'T', T, 'R', R, 'P', P_ATM) - 273.15
    tdp = CP.HAPropsSI('D', 'T', T, 'R', R, 'P', P_ATM) - 273.15
    moist_vals[(th, rh)] = dict(x=x, h=h, v=v, twb=twb, tdp=tdp)
    m = lambda z: ('$-$%.1f' % -z) if z < -0.05 else '%.1f' % z
    lines.append(r'%d & %d & %.4f & %.1f & %.3f & %s & %s \\' % (th, rh, x, h, v, m(twb), m(tdp)))
spec = (r'colspec={Q[c,m] Q[c,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m]}, ' + STYLE % (1, 1)).replace(r'\scriptsize}', r'\footnotesize}')
hdr = (r"{温度\\$\theta$〔℃〕} & {相対湿度\\$\varphi$〔\%〕} & {絶対湿度 $x$\\〔kg/kg(DA)〕} & {比エンタルピー $h$\\〔kJ/kg(DA)〕} & "
       r"{比体積\\〔m$^3$/kg(DA)〕} & {湿球温度\\〔℃〕} & {露点\\〔℃〕} \\")
write('ph2-moist.tex', HEAD + '\\begin{longtblr}{%s}\n%s\n%s\n\\end{longtblr}\n' % (spec, hdr, '\n'.join(lines)))
log.append('湿り空気の表 %d 行（CoolProp HAPropsSI、101.325 kPa）' % len(lines))
n_M = len(lines)

# ---------------------------------------------------------------- 空気線図（見開き）
# 横：乾球温度 θ（−10〜50 ℃）、縦：絶対湿度 x〔g/kg(DA)〕（0〜30）。線は CoolProp の HAPropsSI（101.325 kPa）
TMIN, TMAX, XMAX = -10, 50, 30.0


def xg(**kw):
    a = []
    for k, v in kw.items():
        a += [k, v]
    return CP.HAPropsSI('W', a[0], a[1], a[2], a[3], 'P', P_ATM) * 1000


def coords(pts):
    return ' '.join('(%.3f,%.4f)' % p for p in pts)


def tsat_of_x(xgkg):
    """絶対湿度 x の飽和温度（露点）"""
    return CP.HAPropsSI('D', 'W', xgkg / 1000, 'T', 300, 'P', P_ATM) - 273.15


plots = []
labels = []
MM_X, MM_Y = ((140 - 11) * 120 / 65) / (TMAX - TMIN), 130 / XMAX   # 図の1目もりの長さ（mm）。ph2-back.tex の \phPsychroSpread の図のはば


def ang(p, q):
    return math.degrees(math.atan2((q[1] - p[1]) * MM_Y, (q[0] - p[0]) * MM_X))


# 相対湿度（10〜100 %）
for rh in range(10, 101, 10):
    pts = []
    t = TMIN
    while t <= TMAX + 1e-9:
        x = xg(T=t + 273.15, R=rh / 100)
        if x > XMAX:
            # 上のはしで止める
            lo, hi = t - 0.5, t
            for _ in range(40):
                mid = (lo + hi) / 2
                if xg(T=mid + 273.15, R=rh / 100) > XMAX: hi = mid
                else: lo = mid
            pts.append((lo, XMAX))
            break
        pts.append((t, x))
        t += 0.5 if t < 30 else 0.25
    style = 'phPsySat' if rh == 100 else 'phPsyRH'
    plots.append(r'\addplot[%s] coordinates {%s};' % (style, coords(pts)))
    # 札：線の上の、見やすい所
    if rh < 100:
        tl = {10: 47, 20: 45, 30: 42, 40: 39.5, 50: 37, 60: 35, 70: 33, 80: 31.6, 90: 30.2}[rh]
        pe = pts[-1]
        if pe[1] >= XMAX - 1e-6:
            labels.append(r'\node[phPsyRHlab, anchor=south] at (axis cs:%.2f,%.3f) {%d\,\%%};' % (pe[0], XMAX + 0.15, rh))
        else:
            # 修2-6（Q6-14）：右のふちの外には絶対湿度の目もりを置くので、数はふちの内側の、線のすぐ上に置く
            te = TMAX - 0.3
            labels.append(r'\node[phPsyRHlab, fill=white, anchor=south east] at (axis cs:%.2f,%.3f) {%d\,\%%};'
                          % (te, xg(T=te + 273.15, R=rh / 100) + 0.25, rh))
# 比エンタルピー（−10〜130 kJ/kg(DA)、10 ごと）。飽和線から右下へ
for h in range(-10, 131, 10):
    pts = []
    t = TMIN
    while t <= TMAX + 1e-9:
        try:
            x = xg(T=t + 273.15, H=h * 1000)
        except ValueError:
            t += 0.5; continue
        if x < 0:
            # x=0 で止める
            pts.append((CP.HAPropsSI('T', 'W', 0, 'H', h * 1000, 'P', P_ATM) - 273.15, 0.0)); break
        xs = xg(T=t + 273.15, R=1.0)
        if x <= xs + 1e-9 and x <= XMAX:
            pts.append((t, x))
        t += 0.5
    if len(pts) >= 2:
        # 飽和線との交わりから始める
        lo, hi = TMIN, pts[0][0]
        try:
            for _ in range(40):
                mid = (lo + hi) / 2
                if xg(T=mid + 273.15, H=h * 1000) > xg(T=mid + 273.15, R=1.0): lo = mid
                else: hi = mid
            if hi > TMIN + 0.01:
                pts.insert(0, (hi, xg(T=hi + 273.15, R=1.0)))
        except ValueError:
            pass
        pts = [p for p in pts if p[1] <= XMAX + 1e-9]
        plots.append(r'\addplot[phPsyH] coordinates {%s};' % coords(pts))
        p0 = pts[0]
        if p0[1] < XMAX - 0.5 and p0[0] > TMIN + 0.3:
            labels.append(r'\node[phPsyHlab, anchor=south east] at (axis cs:%.2f,%.3f) {%d};' % (p0[0] - 0.2, p0[1] + 0.15, h))
        elif p0[1] >= XMAX - 0.5 and p0[0] < TMAX - 4:
            # 修2-6（Q6-15）：飽和線が上のふちの外にある線（110・120）は、上のふちから入った少し先の、線の上に数を置く
            tl = p0[0] + 3.0
            labels.append(r'\node[phPsyHlab, fill=white, inner sep=0.8pt] at (axis cs:%.2f,%.3f) {%d};'
                          % (tl, xg(T=tl + 273.15, H=h * 1000), h))
# 湿球温度（−5〜30 ℃、5 ごと）
def x_wb(t, tw):
    """乾球温度 t・湿球温度 tw の絶対湿度〔g/kg(DA)〕。HAPropsSI(W; T, B) がエラーのとき（湿球 0 ℃の近く）は、
    HAPropsSI(B; T, W) を見ながら W を2分法で求める（修2-6：前は 0 ℃の線が 1 ℃までしか引けていなかった）"""
    try:
        return xg(T=t + 273.15, B=tw + 273.15)
    except ValueError:
        pass
    lo, hi = 0.0, xg(T=t + 273.15, R=1.0) / 1000
    if CP.HAPropsSI('B', 'T', t + 273.15, 'W', 0.0, 'P', P_ATM) - 273.15 >= tw:
        return -1.0          # 乾いた空気（x=0）でも湿球温度が tw より高い：線は終わっている
    for _ in range(60):
        mid = (lo + hi) / 2
        if CP.HAPropsSI('B', 'T', t + 273.15, 'W', mid, 'P', P_ATM) - 273.15 < tw: lo = mid
        else: hi = mid
    return lo * 1000


for tw in range(-5, 31, 5):
    pts = []
    t = tw
    while t <= TMAX + 1e-9:
        x = x_wb(t, tw)
        if x < 0:
            break
        pts.append((t, x))
        t += 1.0
    if len(pts) >= 2:
        plots.append(r'\addplot[phPsyWB] coordinates {%s};' % coords(pts))
        # 修2-6（Q6-15）：湿球温度の数（単位 ℃ をつけて、比エンタルピーの数と分ける）。線の下のはしの近く
        # （x が 1.2 g/kg(DA) になる所）、そこまで行かずに右のふちに着く線は、右のふちの少し手前の、線の上に置く
        low = [q for q in pts if q[1] <= 1.2]
        if low:
            tl = low[0][0] - 0.5
        else:
            tl = TMAX - 2.5
        labels.append(r'\node[phPsyWBlab, fill=white] at (axis cs:%.2f,%.3f) {%s\,℃};'
                      % (tl, x_wb(tl, tw), ('$-$%d' % -tw) if tw < 0 else '%d' % tw))
# 比体積（0.76〜0.92、0.02 ごと）
for vv in [0.76, 0.78, 0.80, 0.82, 0.84, 0.86, 0.88, 0.90, 0.92]:
    pts = []
    t = TMIN
    while t <= TMAX + 1e-9:
        try:
            x = xg(T=t + 273.15, V=vv)
        except ValueError:
            t += 0.5; continue
        if 0 <= x <= xg(T=t + 273.15, R=1.0) + 1e-9 and x <= XMAX:
            pts.append((t, x))
        t += 0.5
    if len(pts) >= 2:
        plots.append(r'\addplot[phPsyV] coordinates {%s};' % coords(pts))
        pe = pts[-1]
        # 札は、下のふちの外（目もりの数の下の行）に、線が下のふちに着く所に置く
        bot = min(pts, key=lambda q: q[1])
        labels.append(r'\node[phPsyVlab, anchor=north, yshift=-4.6mm] at (axis cs:%.2f,0) {%.2f};' % (bot[0], vv))
labels.append(r'\node[phPsyVlab, anchor=north east, yshift=-4.6mm] at (axis cs:%.2f,0) {比体積〔m$^3$/kg(DA)〕};' % (TMIN - 0.3))
# 本文で使った点（熱-9）
PTS = [('A', 20, 50, '熱-9 ⑥'), ('B', 25, 60, '熱-9 例題10'), ('C', 30, 70, '熱-9 例題4'), ('D', 15, 100, '熱-9 例題4')]
for lab, th, rh, where in PTS:
    x = xg(T=th + 273.15, R=rh / 100)
    plots.append(r'\addplot[phPsyPt] coordinates {(%.2f,%.4f)};' % (th, x))
    # 修2-6：D は、左にある比エンタルピーの数「40」と並んで「40 D」と読めたので、A と同じく右下に置く
    # 第23回：D は飽和線の上にあるので、札は線の外（上の空いた所）に置く（相対湿度の線にかからないように）
    labels.append((r'\node[phPsyPtlab, anchor=south] at (axis cs:%.2f,%.3f) {%s};' % (th, x + 0.35, lab)) if lab == 'D' else
                  (r'\node[phPsyPtlab, anchor=north west] at (axis cs:%.2f,%.3f) {%s};' % (th + 0.3, x - 0.1, lab)) if lab == 'A' else (r'\node[phPsyPtlab, anchor=east] at (axis cs:%.2f,%.3f) {%s};' % (th - 0.3, x - 0.05, lab)))
psy = HEAD + r'''%% 空気線図（101.325 kPa）。横：乾球温度、縦：絶対湿度。線：相対湿度・比エンタルピー・湿球温度・比体積（CoolProp の HAPropsSI）
\pgfplotsset{
  phPsyRH/.style={bkBlue!80!black, line width=0.6pt, mark=none},
  phPsySat/.style={bkBlue!80!black, line width=1.6pt, mark=none},
  phPsyH/.style={bkRed!75!black, line width=0.45pt, mark=none},
  phPsyWB/.style={bkGreen!70!black, line width=0.45pt, dash pattern=on 2.4pt off 1.6pt, mark=none},
  phPsyV/.style={bkPurple!75!black, line width=0.45pt, dash pattern=on 0.8pt off 1.2pt, mark=none},
  phPsyPt/.style={only marks, mark=*, mark size=1.5pt, bkInk, mark options={fill=white, line width=0.8pt}}}
\tikzset{phPsyRHlab/.style={font=\sffamily\scriptsize, text=bkBlue!80!black, inner sep=0.8pt},
  phPsyHlab/.style={font=\sffamily\scriptsize, text=bkRed!75!black, inner sep=0.6pt},
  phPsyVlab/.style={font=\sffamily\scriptsize, text=bkPurple!75!black, inner sep=0.8pt},
  phPsyWBlab/.style={font=\sffamily\scriptsize, text=bkGreen!50!black, inner sep=0.6pt},
  phPsyPtlab/.style={font=\sffamily\bfseries\scriptsize, text=bkInk, inner sep=0.6pt}}
\newcommand\phPsychroAxis[2]{%% #1＝図のはば、#2＝高さ
\begin{tikzpicture}
\begin{axis}[name=psy, width=#1, height=#2, scale only axis, xmin=%d, xmax=%d, ymin=0, ymax=%g,
  axis lines=box, axis line style={bkInk, line width=0.7pt}, clip=true, clip mode=individual,
  xtick={-10,-5,...,50}, minor xtick={-9,...,49}, ytick={0,2,...,30}, minor ytick={1,3,...,29},
  yticklabel pos=left, ylabel near ticks,
  grid=both, major grid style={bkLine, line width=0.35pt}, minor grid style={bkLine!45, line width=0.2pt},
  tick label style={font=\sffamily\footnotesize, text=bkInk}, major tick length=2pt, minor tick length=1pt,
  xlabel={乾球温度 $\theta$〔℃〕}, xlabel style={at={(axis description cs:0.78,0)}, anchor=north, yshift=-9.5mm}, ylabel={絶対湿度 $x$〔g/kg(DA)〕},
  label style={font=\sffamily\small, text=bkInk}, /pgf/number format/1000 sep={}, scaled ticks=false]
%s
%s
\end{axis}
%% 修2-6（Q6-14）：右のふちにも絶対湿度の目もりと名前（見開きの右のページで、左のページまで線をたどらずに x を読む）
\begin{axis}[at={(psy.south west)}, anchor=south west, width=#1, height=#2, scale only axis, xmin=%d, xmax=%d, ymin=0, ymax=%g,
  hide x axis, axis y line*=right, axis line style={draw=none}, ytick={0,2,...,30}, yticklabel pos=right, ylabel near ticks,
  tick label style={font=\sffamily\footnotesize, text=bkInk}, major tick length=0pt,
  ylabel={絶対湿度 $x$〔g/kg(DA)〕}, label style={font=\sffamily\small, text=bkInk}, scaled ticks=false]
\addplot[draw=none] coordinates {(%d,0)};
\end{axis}
%% 図の左はしから軸の左のふちまでの長さを \ph@psyoff に残す（見開きの切れ目を、軸の上の決まった温度に置くため）
\pgfextractx{\pgf@xa}{\pgfpointanchor{psy}{south west}}\pgfextractx{\pgf@xb}{\pgfpointanchor{current bounding box}{south west}}%%
\global\ph@psyoff=\dimexpr\pgf@xa-\pgf@xb\relax
\end{tikzpicture}}
''' % (TMIN, TMAX, XMAX, '\n'.join(plots), '\n'.join(labels), TMIN, TMAX, XMAX, TMIN)
write('ph2-psychro.tex', psy)
log.append('空気線図：線 %d 本（相対湿度10本・比エンタルピー・湿球温度・比体積）、点 %d' % (len(plots) - len(PTS), len(PTS)))

# ---------------------------------------------------------------- 気体・空気・水の物性（CoolProp。1気圧）
fl = []
GASES = [('ヘリウム He', 'Helium'), ('アルゴン Ar', 'Argon'), ('水素 H$_2$', 'Hydrogen'), ('窒素 N$_2$', 'Nitrogen'),
         ('酸素 O$_2$', 'Oxygen'), ('空気', 'Air'), ('二酸化炭素 CO$_2$', 'CarbonDioxide'), ('メタン CH$_4$', 'Methane')]
lines = []
a_gas = {}
for nm, f in GASES:
    M = CP.PropsSI('M', f)
    cpm = CP.PropsSI('CPMOLAR', 'T', 300, 'P', P_ATM, f); cvm = CP.PropsSI('CVMOLAR', 'T', 300, 'P', P_ATM, f)
    a = CP.PropsSI('A', 'T', 293.15, 'P', P_ATM, f)
    Z = CP.PropsSI('Z', 'T', 300, 'P', P_ATM, f)
    a_gas[f] = a
    lines.append(r'%s & %.3f & %.0f & %.1f & %.1f & %.2f & %.0f & %.4f \\' % (nm, M * 1000, 8.314462618 / M, cvm, cpm, cpm / cvm, a, Z))
spec = r'colspec={Q[l,m,wd=24mm] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m]}, ' + STYLE % (1, 1)
hdr = (r"気体 & {モル質量 $M$\\〔g/mol〕} & {$R_{\mathrm s}=R/M$\\〔J/(kg·K)〕} & {$C_V$\\〔J/(mol·K)〕} & {$C_p$\\〔J/(mol·K)〕} & "
       r"{比熱比\\$\gamma$} & {音速 $a$\\〔m/s〕} & {圧縮係数\\$Z$} \\")
fl.append(r'\begin{longtblr}{%s}' % spec + '\n' + hdr + '\n' + '\n'.join(lines) + '\n\\end{longtblr}')
fl.append(r'\par{\footnotesize\color{bkGray}$C_V$・$C_p$・$\gamma$・$Z$ は\qty{300}{K}、音速は\qty{20}{\celsius}の値（1気圧。CoolProp %s で計算）。熱-3 の表、熱-4 の音速（空気 %.0f、ヘリウム %.0f）、熱-14 の等分配と同じ値。\par}\vspace{2mm}'
          % (CoolProp.__version__[:3], a_gas['Air'], a_gas['Helium']))   # 修2-6（U-10）：前は手で「1007」と書いていた
# 空気（1気圧）
lines = []
for th in [-20, 0, 20, 27, 40, 60, 100, 200]:
    T = th + 273.15
    g = lambda k: CP.PropsSI(k, 'T', T, 'P', P_ATM, 'Air')
    rho, cp, k, mu = g('D'), g('CPMASS'), g('CONDUCTIVITY'), g('VISCOSITY')
    lines.append(r'%s & %.3f & %.1f & %.4f & %.2f & %.1f & %.2f & %.1f \\' % (
        ('$-$%d' % -th) if th < 0 else '%d' % th, rho, cp, k, mu * 1e5, mu / rho * 1e6, g('PRANDTL'), k / (rho * cp) * 1e6))
hdr = (r"{温度\\$\theta$〔℃〕} & {密度 $\rho$\\〔kg/m$^3$〕} & {比熱 $c_p$\\〔J/(kg·K)〕} & {熱伝導率 $k$\\〔W/(m·K)〕} & "
       r"{粘度 $\mu$\\〔$10^{-5}$\,Pa·s〕} & {動粘度 $\nu$\\〔$10^{-6}$\,m$^2$/s〕} & {プラントル数\\Pr} & {熱拡散率 $\alpha$\\〔$10^{-6}$\,m$^2$/s〕} \\")
spec = r'colspec={Q[c,m,wd=11mm] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m]}, ' + STYLE % (1, 1)
fl.append(r'\phbkhead{空気の物性（1気圧）}' + '\n' + r'\begin{longtblr}{%s}' % spec + '\n' + hdr + '\n' + '\n'.join(lines) + '\n\\end{longtblr}')
# 水（1気圧の液）
lines = []
for th in [0.01, 10, 20, 25, 40, 60, 80, 99]:
    T = th + 273.15
    g = lambda k: CP.PropsSI(k, 'T', T, 'P', P_ATM, 'Water')
    rho, cp, k, mu = g('D'), g('CPMASS'), g('CONDUCTIVITY'), g('VISCOSITY')
    beta = g('ISOBARIC_EXPANSION_COEFFICIENT')
    lines.append(r'%s & %.1f & %.0f & %.3f & %.3f & %.2f & %.3f & %s \\' % (
        '0.01' if th == 0.01 else '%d' % th, rho, cp, k, mu * 1e3, g('PRANDTL'), k / (rho * cp) * 1e7,
        ('$-$%.2f' % (-beta * 1e4)) if beta < 0 else '%.2f' % (beta * 1e4)))
hdr = (r"{温度\\$\theta$〔℃〕} & {密度 $\rho$\\〔kg/m$^3$〕} & {比熱 $c_p$\\〔J/(kg·K)〕} & {熱伝導率 $k$\\〔W/(m·K)〕} & "
       r"{粘度 $\mu$\\〔mPa·s〕} & {プラントル数\\Pr} & {熱拡散率 $\alpha$\\〔$10^{-7}$\,m$^2$/s〕} & {体膨張率 $\beta$\\〔$10^{-4}$/K〕} \\")
spec = r'colspec={Q[c,m,wd=10mm] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m] Q[r,m]}, ' + STYLE % (1, 1)
fl.append(r'\phbkhead{水の物性（1気圧の液）}' + '\n' + r'\begin{longtblr}{%s}' % spec + '\n' + hdr + '\n' + '\n'.join(lines) + '\n\\end{longtblr}')
fl.append(r'\par{\footnotesize\color{bkGray}空気・水の値は CoolProp %s（空気：Lemmon ほかの状態式、水：IAPWS-95 と IAPWS の粘度・熱伝導率の式）で計算した。本文の目安：空気 $c_p=\qty{1.005}{kJ/(kg.K)}$（\qty{20}{\celsius}で 1.006。熱-3・熱-4・熱-6・熱-7・熱-8）・$R_{\mathrm s}=\qty{287}{J/(kg.K)}$（熱-3・熱-4・熱-6・熱-7）・$\gamma=1.40$・$k=0.026$・$\mu=1.8\times10^{-5}$、水 $c=\qty{4.18}{kJ/(kg.K)}$（本文は 4.2）・$k=0.60$。\par}' % CoolProp.__version__[:3])
write('ph2-fluid.tex', HEAD + '\n'.join(fl) + '\n')
log.append('気体・空気・水の物性の表（CoolProp）：気体 %d 行・空気 8 行・水 8 行' % len(GASES))

# ---------------------------------------------------------------- 本文の状態点との照らし合わせ
def num(s):
    s = s.strip()
    m = re.match(r'^-?[\d.]+', s.replace('−', '-'))
    return m.group(0) if m else None


def dec(s):
    return len(s.split('.')[1]) if '.' in s else 0


mism = []
checked = 0
for ch, fn in (('熱-8', 'states_p2_08.csv'), ('熱-9', 'states_p2_09.csv')):
    path = os.path.join(CHK, ch, fn)
    if not os.path.exists(path):
        continue
    for r in csv.DictReader(open(path, encoding='utf-8')):
        pt, q, txt, where = r['状態点'], r['量'], r['本文の値（丸め）'], r['使った所']
        t = num(txt)
        if t is None or '補間' in pt or '式' in q or 'マグヌス' in q:
            continue
        mine = None
        m = re.match(r'^飽和 ([\d.]+) ℃$', pt)
        if m:
            d = sat_T(float(m.group(1)))
            mine = {'p_s': d['p'], 'h″−h′': d['h2'] - d['h1']}.get(q)
        m = re.match(r'^飽和 ([\d.]+) (MPa|kPa)$', pt)
        if m:
            p = float(m.group(1)) / (1 if m.group(2) == 'MPa' else 1000)
            d = sat_P(p)
            mine = {'T': d['T'], 'h′': d['h1'], 'h″': d['h2'], 's′': d['s1'], 's″': d['s2'], 'v′': d['v1'], 'v″': d['v2'],
                    'h″−h′': d['h2'] - d['h1']}.get(q)
        m = re.match(r'^過熱 ([\d.]+) MPa・(\d+) ℃$', pt)
        if m:
            st = IAPWS97(P=float(m.group(1)), T=float(m.group(2)) + 273.15)
            mine = {'h': st.h, 's': st.s, 'v': st.v}.get(q)
        m = re.match(r'^R32 飽和 (-?\d+) ℃$', pt)
        if m and ('R32', int(m.group(1))) in ref_vals:
            d = ref_vals[('R32', int(m.group(1)))]
            mine = {'p': d['p'], 'h′': d['h1'], 'h″': d['h2'], 's″': d['s2']}.get(q)
        m = re.match(r'^湿り空気 (\d+) ℃・(\d+) %$', pt)
        if m and (int(m.group(1)), int(m.group(2))) in moist_vals and '式' not in r['出典']:
            d = moist_vals[(int(m.group(1)), int(m.group(2)))]
            mine = {'h': d['h'], 'x': d['x'], '比体積': d['v'], '湿球温度': d['twb'], '露点': d['tdp']}.get(q)
        if mine is None:
            continue
        checked += 1
        # 表の丸め（表に出すけた）で書いた値と、本文の値を、本文のけたでくらべる
        mv = round(mine, dec(t))
        if abs(mv - float(t)) > 0.5 * 10 ** (-dec(t)) + 1e-12:
            mism.append('%s %s「%s」%s：本文 %s、表（計算） %.6g' % (ch, where, pt, q, txt, mine))
log.append('本文の状態点と表の照らし合わせ：%d 点。食いちがい %d 点' % (checked, len(mism)))
log += ['  ' + s for s in mism]
os.makedirs(os.path.join(CHK, '巻末'), exist_ok=True)
with open(os.path.join(CHK, '巻末', 'mksteam2_check.txt'), 'w', encoding='utf-8') as f:
    f.write('tools/mksteam2.py の出力（iapws %s・CoolProp %s）\n' % (IAPWS_VER, CoolProp.__version__))
    f.write('\n'.join(log) + '\n')
print('\n'.join(log))
print('ROWS', dict(T=n_T, P=n_P, S=n_S, R=n_R, M=n_M))
