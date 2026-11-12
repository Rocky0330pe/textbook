# 物理第5巻 原-12「こわれる原子核：放射性崩壊と半減期」の数値の検算（組 原W6）。
# 使い方：python3 calc_p5_12.py > calc_p5_12_out.txt
# 原子の質量：NIST（AME2020 にもとづく。../原-11/nist_masses_20261111.json）〔確〕。
# 半減期の出典（章の頭のコメントにも書いた）
#   環境省「放射線による健康影響等に関する統一的な基礎資料（令和7年度版）」〔確〕：
#     I-131 約8日・Cs-134 約2年・Cs-137 約30年（01-02-07）、U-238 45億年・K-40 13億年（01-02-08）、
#     Rn-222 約3.8日・Po-218 約3分・Pb-214 約27分・Bi-214 約20分・Po-214 約1.6e-4 s・Pb-210 約22年・Bi-210 約5日・
#     Po-210 約138日（02-05-04）、体重60 kg の K-40 4000 Bq（02-05-11 のスライド）。
#   数学の本と同じ値：C-14 5730年（6-4）、Tc-99m 6時間（3-11）、Mo-99 約66時間（6-14）。
#   ENSDF の評価値（出典の組が 11月11日に IAEA LiveChart の API で確かめ直した。はじめは二次資料2つで照らしていた）〔確〕：
#     C-14 5700±30 年、Ra-226 1600±7 年、Po-212 294.3±0.8 ns（はじめの 0.30 μs を 0.294 μs に。例題12 は 0.29 μs）、
#     U-235 7.04×10^8 年、U-238 4.468×10^9 年。
#   中性子の寿命：UCNτ 877.75 s（arXiv:2106.10375）〔確〕、ビームの方法 887.7 s（Yue ら, arXiv:1309.2623）〔確〕。
import json, math, os, random

here = os.path.dirname(os.path.abspath(__file__))
M = {k: float(v[0]) for k, v in json.load(open(os.path.join(here, '..', '原-11', 'nist_masses_20261111.json'))).items()}
uMeV = 931.49410372; NA = 6.02214076e23; alpha = 7.2973525643e-3
year = 365.25 * 86400; day = 86400; hour = 3600
ln2 = math.log(2)


def p(label, *vals):
    print(f"{label}: " + ", ".join(f"{float(v):.6g}" if isinstance(v, (int, float)) else str(v) for v in vals))


print('== ② 例題1：α崩壊の Q 値（NIST の質量）')
for par, dau, Zd in (('Ra226', 'Rn222', 86), ('Po210', 'Pb206', 82), ('U238', 'Th234', 90), ('Po212', 'Pb208', 82),
                     ('Po214', 'Pb210', 82), ('Po218', 'Pb214', 82), ('Rn222', 'Po218', 84)):
    Q = (M[par] - M[dau] - M['He4']) * uMeV
    Ad = int(dau[2:]) if dau[:2].isalpha() else 0
    Ka = Q * M[dau] / (M[dau] + M['He4'])
    p(f'{par}→{dau}+α：Δm u・Q MeV・α の運動エネルギー MeV・反動 MeV', M[par] - M[dau] - M['He4'], Q, Ka, Q - Ka)
p('丸めの式 4.871×222/226', 4.871 * 222 / 226)

print('\n== ③ 半減期の表（Tc-99m 6 h）')
for t in (0, 1, 3, 6, 9, 12, 18, 24):
    p(f't={t} h の残り %', 100 * 0.5 ** (t / 6))
p('例題2：I-131 80日 → (1/2)^10・%', 0.5 ** 10, 100 * 0.5 ** 10)
p('じぶんでとこう2：Cs-134 2年で10年 → 1/32 %', 100 * 0.5 ** 5)
p('章末：Cs-137 30年で120年 → 1/16 %', 100 * 0.5 ** 4)
p('章末：I-131 8日で 1/8 になるまで 日', 3 * 8)
print('半減期のはしご（秒）：')
hl = [('Po-212', 0.294e-6), ('Po-214', 1.6e-4), ('Po-218', 3 * 60), ('Tc-99m', 6 * hour), ('Rn-222', 3.8 * day),
      ('I-131', 8 * day), ('Po-210', 138 * day), ('Cs-137', 30 * year), ('C-14', 5730 * year), ('Ra-226', 1600 * year),
      ('K-40', 1.3e9 * year), ('U-238', 4.5e9 * year)]
for n, s in hl:
    p(f'  {n}', s, math.log10(s))

print('\n== ④ 例題4：ラジウム226 1 g の放射能')
N_Ra = 1 / 226.025 * NA
lam_Ra = ln2 / (1600 * year)
p('原子の数・λ（1/s）・放射能 Bq', N_Ra, lam_Ra, lam_Ra * N_Ra)
p('丸め：6.02e23/226・0.693/(1600×3.16e7)', 6.02e23 / 226, 0.693 / (1600 * 3.16e7), 6.02e23 / 226 * 0.693 / (1600 * 3.16e7))
N_U = 1 / 238.05 * NA
p('じぶんでとこう4：U-238 1 g（45億年）：原子の数・Bq', N_U, ln2 / (4.5e9 * year) * N_U)
p('  丸め 6.02e23/238×0.693/(4.5e9×3.16e7)', 6.02e23 / 238 * 0.693 / (4.5e9 * 3.16e7))
N_Cs = 1 / 136.907 * NA
p('章末 チャレンジ以外：Cs-137 1 g（30年）Bq', ln2 / (30 * year) * N_Cs)

print('\n== ④ 例題5：体の中のカリウム40')
mK = 120.0; ab = 0.000117
N40 = mK * ab / 39.964 * NA
p('K-40 の質量 g・原子の数', mK * ab, N40)
p('放射能 Bq（13億年・12.5億年）', ln2 / (1.3e9 * year) * N40, ln2 / (1.25e9 * year) * N40)
p('丸め：0.0140/40×6.02e23・×0.693/(1.3e9×3.16e7)', 0.0140 / 40 * 6.02e23, 0.0140 / 40 * 6.02e23 * 0.693 / (1.3e9 * 3.16e7))
mB = 0.36
NB = mB * ab / 39.964 * NA
p('じぶんでとこう5：カリウム 0.36 g〔仮〕：原子の数・Bq', NB, ln2 / (1.3e9 * year) * NB)
p('  丸め 0.36×0.000117/40×6.02e23×0.693/(1.3e9×3.16e7)', 0.36 * 0.000117 / 40 * 6.02e23 * 0.693 / (1.3e9 * 3.16e7))
p('1年に1個こわれる確率（K-40）', ln2 / 1.3e9)

print('\n== ⑤ サイコロ（1/6）と λ')
p('離散：半分になる回数 log(1/2)/log(5/6)・連続の近似 ln2/(1/6)', math.log(0.5) / math.log(5 / 6), ln2 / (1 / 6))
p('1回で 1/100 こわれるとき：離散・近似', math.log(0.5) / math.log(0.99), ln2 / 0.01)
random.seed(12)
n = 100; rows = [n]
for k in range(10):
    n = sum(1 for _ in range(n) if random.randint(1, 6) != 1)
    rows.append(n)
print('やってみよう（100個、種 12）：', rows)
print('式 100×(5/6)^k：', [round(100 * (5 / 6) ** k, 1) for k in range(11)])
random.seed(1)
n = 10000; rows2 = [n]
for k in range(10):
    n = sum(1 for _ in range(n) if random.random() >= 1 / 6)
    rows2.append(n)
print('Python（1万個、random.seed(1)）：', rows2)
print('式 10000×(5/6)^k：', [round(10000 * (5 / 6) ** k) for k in range(11)])
p('τ=T/ln2：Tc-99m 6 h・C-14 5730 年', 6 / ln2, 5730 / ln2)

print('\n== ⑦ 例題6：炭素14')
for T in (5730, 5700):
    p(f'T={T}：60%・25%・80%・10%・12.5%・50000年の残り%', T * math.log2(1 / 0.6), T * math.log2(4), T * math.log2(1 / 0.8),
      T * math.log2(10), T * 3, 100 * 0.5 ** (50000 / T))
p('5700 と 5730 の差 %', (5730 - 5700) / 5730 * 100)
p('log10(0.6)・log10(2)', math.log10(0.6), math.log10(2))
p('丸め：5730×(−log10 0.6)/log10 2', 5730 * 0.2218 / 0.3010)

print('\n== ⑧ 例題7：親と子（数学 6-14：τ1=2 h、τ2=1 h、1000個）')
t1, t2 = 2.0, 1.0
tm = t1 * t2 / (t1 - t2) * math.log(t1 / t2)
N2 = lambda t: 1000 * t2 / (t1 - t2) * (math.exp(-t / t1) - math.exp(-t / t2))
p('子がいちばん多い時刻 h・数・そのときの親・親の放射能/h・子の放射能/h', tm, N2(tm), 1000 * math.exp(-tm / t1), 1000 * math.exp(-tm / t1) / t1, N2(tm) / t2)
p('じぶんでとこう7：t=2 h の子・親', N2(2), 1000 * math.exp(-1))
t1, t2 = 4.0, 1.0
tm = t1 * t2 / (t1 - t2) * math.log(t1 / t2)
N2b = 1000 * t2 / (t1 - t2) * (math.exp(-tm / t1) - math.exp(-tm / t2))
p('章末 チャレンジ：τ1=4 h、τ2=1 h：時刻 h・子の最大', tm, N2b)

print('\n== ⑧ 例題8：ラドン222 の永続平衡（3.82日）')
TRn = 3.82
p('99%・90%・50% になる日数', TRn * math.log2(100), TRn * math.log2(10), TRn)
p('3.8 日で 99%', 3.8 * math.log2(100))

print('\n== ⑧ 例題9：モリブデン99（66 h）→ テクネチウム99m（6.0 h）')
TM, TT = 66.0, 6.0
lM, lT = ln2 / TM, ln2 / TT
tmax = math.log(lT / lM) / (lT - lM)
p('λM・λT 1/h・いちばん多い時刻 h', lM, lT, tmax)
p('過渡平衡の比 A_T/A_M = λT/(λT−λM)', lT / (lT - lM))
p('いちばん多いときの A_T/A_M（同じ）', lT / (lT - lM) * (1 - math.exp(-(lT - lM) * tmax)))
p('ln(66/6)・ln(11)/(0.1155−0.0105)', math.log(11), math.log(11) / (0.1155 - 0.0105))
for t in (0, 6, 12, 23, 24, 48, 72):
    AT = lT / (lT - lM) * (math.exp(-lM * t) - math.exp(-lT * t))
    p(f'  t={t} h：親の放射能（はじめ1）・子の放射能', math.exp(-lM * t), AT)

print('\n== ⑨ 例題10：ポアソン分布（数学 6-4：0.3 回/s、10 s）')
mu = 3.0
for k in range(10):
    p(f'  P({k})', mu ** k * math.exp(-mu) / math.factorial(k))
p('P(0)・P(1)・P(3)・P(≥1)', math.exp(-3), 3 * math.exp(-3), 27 / 6 * math.exp(-3), 1 - math.exp(-3))
p('平均100・1000 の σ と割合', 10, 0.1, math.sqrt(1000), math.sqrt(1000) / 1000)

print('\n== ⑨ 例題11：正味の計数')
for (g, b, tmin) in ((1200, 900, 10), (4800, 3600, 40)):
    p(f'{tmin} 分ずつ：正味 cpm・σ cpm', (g - b) / tmin, math.sqrt(g + b) / tmin)
t_need = 300 / 25
p('章末 チャレンジ：200 cpm と 100 cpm、正味の5%（5 cpm）にする時間 分', t_need)

print('\n== ⑩ α崩壊とトンネル（ガモフ因子）')
hbarc = 197.3269804; e2 = alpha * hbarc   # MeV fm


def gamow(Q, Zd, Ad):
    mu_r = 4.0026 * Ad / (4.0026 + Ad) * uMeV
    v_c = math.sqrt(2 * Q / mu_r)
    return 2 * math.pi * 2 * Zd * alpha / v_c


R = 1.2 * (234 ** (1 / 3) + 4 ** (1 / 3))
p('U-238：接する距離 fm・クーロンの壁の高さ MeV', R, 2 * 90 * e2 / R)
p('壁の外へ出る距離（壁の高さ=Q）fm', 2 * 90 * e2 / 4.27)
data = [('Po-212', 'Po212', 'Pb208', 82, 208, 0.294e-6), ('Po-214', 'Po214', 'Pb210', 82, 210, 1.6e-4),
        ('Po-218', 'Po218', 'Pb214', 82, 214, 180), ('Rn-222', 'Rn222', 'Po218', 84, 218, 3.8 * day),
        ('Po-210', 'Po210', 'Pb206', 82, 206, 138 * day), ('Ra-226', 'Ra226', 'Rn222', 86, 222, 1600 * year),
        ('U-238', 'U238', 'Th234', 90, 234, 4.5e9 * year)]
pts = []
for name, par, dau, Zd, Ad, T in data:
    Q = (M[par] - M[dau] - M['He4']) * uMeV
    G = gamow(Q, Zd, Ad)
    pts.append((name, G / math.log(10), math.log10(T), Q))
    p(f'{name}：Q MeV・2πη・2πη/ln10・log10 T(s)', Q, G, G / math.log(10), math.log10(T))
print('G-N の図：coordinates {' + ' '.join(f'({g:.2f},{t:.2f})' for _, g, t, _ in pts) + '}')
xs = [g for _, g, _, _ in pts]; ys = [t for _, _, t, _ in pts]
nn = len(xs); mx = sum(xs) / nn; my = sum(ys) / nn
sl = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
p('最小二乗の傾き・切片', sl, my - sl * mx)
G1 = gamow((M['Po212'] - M['Pb208'] - M['He4']) * uMeV, 82, 208)
G2 = gamow((M['U238'] - M['Th234'] - M['He4']) * uMeV, 90, 234)
p('例題12：Po-212 と U-238 の 2πη・e^{-2πη} の比の桁・半減期の比の桁（4.5e9 年、0.29 μs）', G1, G2, (G2 - G1) / math.log(10),
  math.log10(4.5e9 * year / 0.29e-6))
G3 = gamow((M['Rn222'] - M['Po218'] - M['He4']) * uMeV, 84, 218)
G4 = gamow((M['Ra226'] - M['Rn222'] - M['He4']) * uMeV, 86, 222)
p('じぶんでとこう12：Rn-222 と Ra-226 の 2πη・比の桁・半減期の比の桁', G3, G4, (G4 - G3) / math.log(10), math.log10(1600 * year / (3.82 * day)))
G5 = gamow((M['Po214'] - M['Pb210'] - M['He4']) * uMeV, 82, 210)
G6 = gamow((M['Po210'] - M['Pb206'] - M['He4']) * uMeV, 82, 206)
p('章末 チャレンジ：Po-214 と Po-210 の 2πη・比の桁・半減期の比の桁（1.6e-4 s、138 日）', G5, G6, (G6 - G5) / math.log(10), math.log10(138 * day / 1.6e-4))

print('本文の近似（m_α c^2=3727 MeV、α=1/137、反動なし）：')


def g_simple(Q, Z):
    v = math.sqrt(2 * Q / 3727)
    return 4 * math.pi * Z / (137 * v), v


for n_, Q_, Z_ in (('Po212', 8.95, 82), ('U238', 4.27, 90), ('Rn222', 5.59, 84), ('Ra226', 4.87, 86), ('Po214', 7.83, 82), ('Po210', 5.41, 82)):
    G_, v_ = g_simple(Q_, Z_)
    p(f'  {n_}：v/c・2πη', v_, G_)
p('  けたの差 U/Po212・Ra/Rn・Po210/Po214', (g_simple(4.27, 90)[0] - g_simple(8.95, 82)[0]) / math.log(10),
  (g_simple(4.87, 86)[0] - g_simple(5.59, 84)[0]) / math.log(10), (g_simple(5.41, 82)[0] - g_simple(7.83, 82)[0]) / math.log(10))
p('  半減期の比 U/Po212（45億年・0.29 μs）', 4.5e9 * 3.16e7 / 0.29e-6)

print('\n== ⑪ 中性子の寿命')
p('UCNτ 877.75 s・ビーム 887.7 s・差 s・差 %', 877.75, 887.7, 887.7 - 877.75, (887.7 - 877.75) / 877.75 * 100)
p('平均寿命 880 s の半減期 s・分', 880 * ln2, 880 * ln2 / 60)

print('\n== ⑫ 例題13：オクロ（U-235 7.04e8 年、U-238 4.47e9 年、存在比 0.7204 %・99.2742 %）')
R_now = 0.007204 / 0.992742
for ago in (1.0e9, 2.0e9, 4.6e9):
    R = R_now * math.exp(ago * (ln2 / 7.04e8 - ln2 / 4.47e9))
    p(f'{ago/1e9:.1f}×10^9 年前の U-235 の割合 %・比', R / (1 + R) * 100, R)
p('いまの比（U-235/U-238）', R_now)
p('20億年で U-235 は 2^(20/7.04) 倍・U-238 は 2^(20/44.7) 倍', 2 ** (20 / 7.04), 2 ** (20 / 44.7))
p('丸めの計算：0.00726×2^(2.84)/2^(0.447)', 0.00726 * 2 ** (20 / 7.04) / 2 ** (20 / 44.7))
