#!/usr/bin/env python3
"""物理第5巻 原-15（原子炉の中の中性子：核分裂と原子炉）の数値の検算（組 原W8）。
python3 calc_p5_15.py > calc_p5_15_out.txt
出典は tex/p5-15.tex の頭のコメント。〔仮〕は例題のために置いた値。"""
import math
import numpy as np

e = 1.602176634e-19        # C（定義値）
NA = 6.02214076e23         # /mol（定義値）
u_MeV = 931.49410372       # MeV（CODATA 2022）
MeV = 1e6 * e

# 原子の質量（NIST、AME2020 にもとづく。u）
m = dict(n=1.00866491606, H1=1.00782503223, H2=2.01410177812, H3=3.0160492779,
         He4=4.00260325413, Kr92=91.9261731, Ba141=140.9144033, U235=235.0439301,
         U238=238.0507884)
ab235, ab238 = 0.7204e-2, 99.2742e-2   # 存在比（NIST）

# 熱中性子（0.0253 eV）の断面積〔b〕：Pritychenko arXiv:2503.18990 表2・表3（JENDL-5.0 / ENDF/B-VIII.1）を丸めた値
sf5, sc5, sc8 = 585.0, 99.0, 2.68
nu = 2.43                  # 1回の分裂で出る中性子の数（ウラン235・熱中性子）
beta = 0.0065              # 遅発中性子の割合
Ef = 200.0                 # MeV／分裂（目安）


def p(label, *vals):
    out = []
    for v in vals:
        out.append(('%.4g' % v) if isinstance(v, float) else str(v))
    print(label + ':', ', '.join(out))


def B_per_A(Z, N, mass):
    return (Z * m['H1'] + N * m['n'] - mass) * u_MeV / (Z + N)


print('== ① 核分裂のエネルギー')
p('1核子あたりの結合エネルギー U235・Ba141・Kr92 MeV',
  B_per_A(92, 143, m['U235']), B_per_A(56, 85, m['Ba141']), B_per_A(36, 56, m['Kr92']))
Q = (m['U235'] + m['n'] - m['Ba141'] - m['Kr92'] - 3 * m['n']) * u_MeV
p('U235+n→Ba141+Kr92+3n の Q 値 MeV（原-11 例題10）', Q)
# エネルギーの内訳（Algora ら arXiv:2007.07918 表1、もとは Madland 2006）
parts = dict(破片の運動=166.2, 即発中性子=4.8, 即発γ=8.0, 破片のβ=7.0, 破片のγ=7.2, ニュートリノ=9.6)
tot = sum(parts.values())
p('内訳の合計 MeV・ニュートリノを除く MeV', tot, tot - parts['ニュートリノ'])
p('あとから出る β+γ MeV・割合 %（炉の熱に対して）', 7.0 + 7.2, (7.0 + 7.2) / (tot - 9.6) * 100)
# 化学反応との比（炭素の燃焼 393.5 kJ/mol）
eV_C = 393.5e3 / NA / e
p('炭素1個の燃焼 eV・200 MeV との比', eV_C, Ef * 1e6 / eV_C)

print('\n== 例題1 ウラン235 1 g')
E1 = 1 / m['U235'] * NA * Ef * MeV
p('原子の数', 1 / m['U235'] * NA)
p('エネルギー J・MW日・kWh', E1, E1 / (1e6 * 86400), E1 / 3.6e6)
p('炭素なら何 t（32.8 MJ/kg）', E1 / 32.8e6 / 1e3)
p('じぶんで1：1 W にする1秒の分裂の数', 1 / (Ef * MeV))

print('\n== 例題2 熱出力 3 GW')
for P in (3e9, 1e9):
    nf = P / (Ef * MeV)
    g_day = nf * 86400 * m['U235'] / NA
    p(f'熱出力 {P/1e9:.0f} GW：1秒の分裂・1日の分裂・g/日・kg/年', nf, nf * 86400, g_day, g_day * 365 / 1e3)
p('捕獲もふくめて減るウラン235 の割合（1+σc/σf）', 1 + sc5 / sf5)
p('3 GW で捕獲もふくめた g/日', 3e9 / (Ef * MeV) * 86400 * m['U235'] / NA * (1 + sc5 / sf5))

print('\n== 例題3 連鎖反応')
for k in (2, 1, 0.9, 1.1, 1.001):
    p(f'k={k}：10世代・100世代', k ** 10, k ** 100)
p('k=1.001 即発だけ ℓ=1e-4 s：1秒の世代の数・1秒の倍率', 1 / 1e-4, 1.001 ** 1e4)

print('\n== 例題4 η')


def eta(enr):
    N5, N8 = enr, 1 - enr
    return nu * N5 * sf5 / (N5 * (sf5 + sc5) + N8 * sc8)


for enr in (ab235, 0.03, 0.05, 1.0):
    p(f'濃縮度 {enr*100:.2f} %：η', eta(enr))

print('\n== 例題5 濃縮の段の数')
a = math.sqrt(352.0 / 349.0)
p('熱-14 の分離の倍率', a)
Rf = ab235 / ab238
for tgt in (0.03, 0.05, 0.20):
    p(f'0.72 % → {tgt*100:.0f} %：段の数（理想）', math.log((tgt / (1 - tgt)) / Rf) / math.log(a))
p('1.0043 で計算した 3 %', math.log((0.03 / 0.97) / Rf) / math.log(1.0043))

print('\n== 例題6 4因子公式（〔仮〕ε=1.03・p=0.75・f=0.90）')
eps, pp, ff = 1.03, 0.75, 0.90
k6 = eta(0.03) * eps * pp * ff
p('k∞', k6)
n0 = 1000.0
p('中性子の一生 1000 → 高速分裂後・減速後・燃料に吸われる・次の世代', n0 * eps, n0 * eps * pp, n0 * eps * pp * ff, n0 * eps * pp * ff * eta(0.03))
p('じぶんで6：f=0.85 の k∞', eta(0.03) * eps * pp * 0.85)
p('k=1 にするのに、もれと制御で失う割合 %', (1 - 1 / k6) * 100)

print('\n== 例題7 1群の臨界の大きさ（〔仮〕k∞=1.10・M²=60 cm²）')
for kinf in (1.10, 1.05):
    M2 = 60.0
    B = math.sqrt((kinf - 1) / M2)
    p(f'k∞={kinf}：B 1/cm・平板の厚さ cm・球の半径 cm・立方体の1辺 cm', B, math.pi / B, math.pi / B, math.sqrt(3) * math.pi / B)
kinf, M2 = 1.10, 60.0
for R in (77.0, 100.0, 50.0, 154.0):
    B2 = (math.pi / R) ** 2
    p(f'球 R={R} cm：もれない確率・k_eff', 1 / (1 + M2 * B2), kinf / (1 + M2 * B2))
p('2倍の図：もれる割合 M²B²（R=100）・（R=200）・比', M2 * (math.pi / 100) ** 2, M2 * (math.pi / 200) ** 2,
  (M2 * (math.pi / 200) ** 2) / (M2 * (math.pi / 100) ** 2))
# 差分で平板を確かめる（はしで0、まん中の値の比が cos に合うか）
a_cm = math.pi / math.sqrt((kinf - 1) / M2)
Nx = 200
x = np.linspace(-a_cm / 2, a_cm / 2, Nx + 1)
h = x[1] - x[0]
# -φ'' + (1/M²) φ = (k∞/M²)/k φ を固有値で解く（φ=0 at both ends）
A = np.zeros((Nx - 1, Nx - 1))
for i in range(Nx - 1):
    A[i, i] = 2 / h ** 2 + 1 / M2
    if i > 0: A[i, i - 1] = -1 / h ** 2
    if i < Nx - 2: A[i, i + 1] = -1 / h ** 2
w = np.linalg.eigvalsh(A)
keff = (kinf / M2) / w[0]
p('差分（200区間）で求めた平板 77 cm の k', keff)

print('\n== 例題8 反応度と周期（λ=0.08 /s、ℓ=1e-4 s）')
lam, ell = 0.08, 1e-4
for k in (1.001, 1.002, 1.003):
    rho = (k - 1) / k
    p(f'k={k}：ρ・ドル・即発だけの周期 s・遅発1群の周期 s', rho, rho / beta, ell / (k - 1), (beta - rho) / (lam * rho))
# 6群の値から1群の λ を作る（Akyurek の論文 arXiv:2101.09338 表2.1、もとは Keepin の方法）
T6 = np.array([54.51, 21.84, 6.00, 2.23, 0.496, 0.179])
a6 = np.array([0.038, 0.213, 0.188, 0.407, 0.128, 0.026])
tau_mean = np.sum(a6 * T6 / math.log(2))
p('6群の平均のおくれ s・1群の λ /s', tau_mean, 1 / tau_mean)
p('ρ=0.001 の周期を 6群で（inhour：ρ = ℓω + Σβiω/(ω+λi)）', 0)
li = math.log(2) / T6
bi = beta * a6


def inhour(om):
    return ell * om + np.sum(bi * om / (om + li))


for rho in (0.001, 0.002, 0.003):
    lo, hi = 1e-6, 10.0
    for _ in range(200):
        mid = (lo + hi) / 2
        if inhour(mid) > rho: hi = mid
        else: lo = mid
    p(f'6群の inhour ρ={rho}：周期 s', 1 / lo)
p('e 倍になる時間 69 s で 1分後・10分後の倍率（ρ=0.001）', math.exp(60 / 68.83), math.exp(600 / 68.83))
p('倍になる時間 s（周期×ln2）ρ=0.001', 68.83 * math.log(2))

print('\n== 例題9 1点炉の動特性（遅発1群、RK4、ρ 階段）')


def run(rho, Lam=1e-4, lam=0.08, beta=0.0065, tend=60.0, dt=1e-4):
    def f(y):
        n_, C_ = y
        return np.array([(rho - beta) / Lam * n_ + lam * C_, beta / Lam * n_ - lam * C_])
    y = np.array([1.0, beta / (Lam * lam)])
    t = 0.0
    out = {}
    marks = [0.1, 1, 10, 30, 60]
    j = 0
    while t < tend + 1e-9:
        while j < len(marks) and t >= marks[j] - dt / 2:
            out[marks[j]] = y[0]; j += 1
        k1 = f(y); k2 = f(y + dt / 2 * k1); k3 = f(y + dt / 2 * k2); k4 = f(y + dt * k3)
        y = y + dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4)
        t += dt
    return out


for rho in (0.001, 0.002):
    o = run(rho)
    p(f'ρ={rho}：0.1・1・10・30・60 s の出力', *[o[k] for k in (0.1, 1, 10, 30, 60)])
    p(f'ρ={rho}：即発跳躍 β/(β−ρ)', beta / (beta - rho))
# 2つの指数の和（グラフの式）
for rho in (0.001, 0.002):
    Lam = 1e-4
    a2, a1, a0 = Lam, beta - rho + lam * Lam, -lam * rho
    s1 = (-a1 + math.sqrt(a1 ** 2 - 4 * a2 * a0)) / (2 * a2)
    s2 = (-a1 - math.sqrt(a1 ** 2 - 4 * a2 * a0)) / (2 * a2)
    # n(0)=1、n'(0)=0（はじめはつり合い：(ρ-β)/Λ+λC0=ρ/Λ ではなく n'(0)=ρ/Λ）
    # n = A1 e^{s1 t} + A2 e^{s2 t}、A1+A2=1、A1 s1 + A2 s2 = ρ/Λ
    A1 = (rho / Lam - s2) / (s1 - s2)
    A2 = 1 - A1
    p(f'ρ={rho}：s1 1/s・周期 s・s2 1/s・A1・A2', s1, 1 / s1, s2, A1, A2)
    p(f'ρ={rho}：式で 1・10・60 s', *[A1 * math.exp(s1 * t) + A2 * math.exp(s2 * t) for t in (1, 10, 60)])

print('\n== 例題10 温度係数（〔仮〕）')
p('−3 pcm/K で 300 K：Δk', -3e-5 * 300)
p('ρ=0.001 を打ち消す温度 K', 0.001 / 3e-5)
p('じぶんで10：−2 pcm/K で ρ 0.0015 を打ち消す K', 0.0015 / 2e-5)

print('\n== 例題11 キセノン（ヨウ素135 6.58 h、キセノン135 9.14 h：ENSDF〔IAEA LiveChart〕、収率 6.4 %・0.24 %：IAEA LiveChart の'
      ' ウラン235 熱中性子の累積・独立収率、σ 2.6e6 b、φ〔仮〕）')
lI, lX = math.log(2) / 6.58, math.log(2) / 9.14   # 1/h
gI, gX, sX = 0.064, 0.0024, 2.6e6 * 1e-24


def xenon(phi):
    sxphi = sX * phi * 3600
    I0 = gI / lI
    X0 = (gI + gX) / (lX + sxphi)
    t = np.linspace(0, 72, 72001)
    X = X0 * np.exp(-lX * t) + I0 * lI / (lX - lI) * (np.exp(-lI * t) - np.exp(-lX * t))
    i = int(np.argmax(X))
    back = t[np.argmax((t > t[i]) & (X <= X0))]
    return I0 / X0, sxphi / (lX + sxphi), t[i], X[i] / X0, back, X0


for phi in (3e13, 1e13, 1e14):
    r = xenon(phi)
    p(f'φ={phi:.0e}：I/X・運転中に吸収で消える割合・山の時刻 h・山の高さ・もとにもどる時刻 h', *r[:5])
r = xenon(3e13)
p('グラフの式の係数（X0=1）：I0/X0・λI・λX', r[0], lI, lX)

print('\n== 例題12 崩壊熱（ウェイ・ウィグナーの式の目安 0.066[t^-0.2 − (t+T)^-0.2]）')


def ww(t, Top=365.25 * 86400):
    return 0.066 * (t ** -0.2 - (t + Top) ** -0.2)


for t, name in ((1, '1 s'), (10, '10 s'), (60, '1 分'), (3600, '1 h'), (86400, '1 日'), (10 * 86400, '10 日'),
                (30 * 86400, '30 日'), (365.25 * 86400, '1 年')):
    p(f'{name}：割合 %・3 GW で MW', ww(t) * 100, ww(t) * 3e3)
p('1日後 14 MW で 100 ℃の水を蒸発（2257 kJ/kg）：kg/s・t/h', ww(86400) * 3e9 / 2257e3, ww(86400) * 3e9 / 2257e3 * 3.6)
p('2倍の図：時間10倍で t^-0.2', 10 ** -0.2)
p('1 h と 10 h の比（運転1年）', ww(36000) / ww(3600))
p('運転がとても長い（T→∞）とき 1日後 %', 0.066 * 86400 ** -0.2 * 100)

print('\n== ⑫ 核融合')
Qdt = (m['H2'] + m['H3'] - m['He4'] - m['n']) * u_MeV
p('D+T Q 値 MeV', Qdt)
p('α と中性子の運動エネルギー MeV（運動量保存）', Qdt * m['n'] / (m['n'] + m['He4']), Qdt * m['He4'] / (m['n'] + m['He4']))
E13 = NA / (m['H2'] + m['H3']) * Qdt * MeV
p('1 g の D-T：J・ウラン235 1 g との比', E13, E13 / E1)
r13 = 500e6 / (Qdt * MeV)
p('ITER 500 MW：1秒の反応・燃料 mg/s・g/時', r13, r13 * (m['H2'] + m['H3']) / NA * 1e3 * 1e3 / 1e3 * 1e3 / 1e3, r13 * (m['H2'] + m['H3']) / NA * 3600)
p('26 keV を K に', 26e3 * e / 1.380649e-23)
p('Q=10：500/50', 500 / 50)
p('NIF 2022：3.15/2.05', 3.15 / 2.05)

print('\n== ⑬ 発電所の熱の流れ')
p('3 GW・効率 0.33：電気 GW・捨てる熱 GW', 3 * 0.33, 3 * 0.67)
p('海水を 7 K 上げる〔仮〕：流量 t/s（c=4.18）', 2.0e9 / (4.18e3 * 7) / 1e3)

print('\n== 章末問題')
p('基本1：熱出力 1 GW で 1年（365日）：分裂の数・ウラン235 kg', 1e9 / (Ef * MeV) * 365 * 86400, 1e9 / (Ef * MeV) * 365 * 86400 * m['U235'] / NA / 1e3)
p('基本2：k=1.05 で 20世代・k=0.95 で 20世代', 1.05 ** 20, 0.95 ** 20)
p('基本3：k=1.0025：ρ・ドル', 0.0025 / 1.0025, 0.0025 / 1.0025 / beta)
p('基本4：η=2.0・ε=1.02・p=0.80・f=0.85：k∞', 2.0 * 1.02 * 0.80 * 0.85)
p('基本5：崩壊熱 1 h・1 日（熱出力 2 GW、運転1年）MW', ww(3600) * 2e3, ww(86400) * 2e3)
p('基本6：D-T 1回 17.6 MeV、200 MeV との比・1 u あたり MeV 比',
  Ef / 17.6, (17.6 / 5.03) / (Ef / 236.05))
# チャレンジ
B = math.sqrt(0.08 / 50)
p('チャレンジ1：k∞=1.08・M²=50：球の半径 cm・立方体の1辺 cm・体積比 立方体/球', math.pi / B, math.sqrt(3) * math.pi / B,
  (math.sqrt(3) * math.pi / B) ** 3 / (4 / 3 * math.pi * (math.pi / B) ** 3))
# 円柱 H=D：B² = (2.405/R)² + (π/H)²、H=2R
R_c = math.sqrt(2.405 ** 2 + (math.pi / 2) ** 2) / B
p('チャレンジ1 補：円柱 H=2R の R・H cm', R_c, 2 * R_c)
o = run(0.0013)
p('チャレンジ2：ρ=0.0013（0.2 ドル）：即発跳躍・周期 s・60 s の出力（RK4）', beta / (beta - 0.0013), (beta - 0.0013) / (0.08 * 0.0013), o[60])
p('チャレンジ3：止めて1日後と10日後の比・30日で 3 GW の炉', ww(86400) / ww(864000), ww(30 * 86400) * 3e3)
# 崩壊熱 1 日後 14 MW の水 100 t の温度上昇（20 ℃から 100 ℃まで）時間
p('チャレンジ3 補：14 MW で 100 t の水を 20→100 ℃ にする時間 h', 100e3 * 4.18e3 * 80 / (ww(86400) * 3e9) / 3600)

print('\n== 本文の補足')
r0 = xenon(3e13)[0]
for t in (4, 8, 24, 48):
    p(f'例題11：止めて {t} h の X/X0', math.exp(-lX * t) + r0 * lI / (lX - lI) * (math.exp(-lI * t) - math.exp(-lX * t)))
p('例題7：球と立方体の体積 m3', 4 / 3 * math.pi * 76.95 ** 3 / 1e6, 133.3 ** 3 / 1e6)
lav = 0.9935 * 1e-4 + 0.0065 * 12.7
p('⑥平均の世代の時間 s・目安の周期 s（ρ=0.001・0.002）', lav, lav / 0.001, lav / 0.002)
p('⑧先行核と中性子の比 β/(λΛ)', beta / (0.08 * 1e-4))
p('③2 MeV の中性子の v/c・m/s、0.0253 eV の m/s', math.sqrt(2 * 2 / 939.565), math.sqrt(2 * 2 / 939.565) * 299792458,
  math.sqrt(2 * 0.0253 / 939.565e6) * 299792458)
p('⑬カルノーの効率（280 ℃・30 ℃）・実際/上限', 1 - 303.15 / 553.15, 0.33 / (1 - 303.15 / 553.15))
p('①ウラン235 の原子核の幾何断面積 b（r0=1.2 fm）', math.pi * (1.2e-15 * 235 ** (1 / 3)) ** 2 / 1e-28)
p('⑩Xe の吸収÷U235 の分裂', 2.6e6 / sf5)
p('⑧即発だけで 0.12 s 後（e^(10 t)）', math.exp(10 * 0.12))
