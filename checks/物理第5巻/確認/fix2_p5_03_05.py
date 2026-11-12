# 修5-2（第32回 確認の組 F2 の指摘）：原-3〜5 で直した数の検算。python3 fix2_p5_03_05.py > fix2_p5_03_05_out.txt
# 定数は CODATA 2022。紙面の丸めた定数（h=6.63e-34 など）で計算した値も並べる（H-5）。
import math
import numpy as np
h = 6.62607015e-34; hbar = h / (2 * math.pi); e = 1.602176634e-19; c = 299792458.0
me = 9.1093837139e-31; mp = 1.67262192595e-27; u = 1.66053906892e-27
a0 = 5.29177210544e-11; Rinf = 10973731.568157; re = 2.8179403205e-15
hc = h * c / e * 1e9

print('== 原-3')
# F2-12 ルスカの見こみ：75 kV・0.02 rad
V = 75e3
lam = h / math.sqrt(2 * me * e * V * (1 + e * V / (2 * me * c**2)))
print('F2-12 75 kV の波長 pm', lam * 1e12, ' λ/α nm', lam / 0.02 * 1e9, ' 0.61λ/α nm', 0.61 * lam / 0.02 * 1e9)
# F2-13 C60（720 u）：波長 2.5〜2.8 pm の幅
m60 = 720 * u
print('F2-13 C60 の質量 kg', m60, ' 紙面 720×1.66e-27 =', 720 * 1.66e-27)
for L in (2.5e-12, 2.8e-12, 3.0e-12):
    v = 6.63e-34 / (1.20e-24 * L)
    print(f'   λ={L*1e12:.1f} pm → v={v:.0f} m/s, sinθ=λ/100nm={L/100e-9:.2e}, 1 m 先 {L/100e-9*1e6:.0f} μm, 1 nm/λ={1e-9/L:.0f}')
print('   v=220 m/s → λ =', 6.63e-34 / (1.20e-24 * 220) * 1e12, 'pm')
# F2-16 2.0 fm は 0.1 nm の何分の1
print('F2-16 0.1 nm / 2.0 fm =', 0.1e-9 / 2.0e-15)
# F2-27 50 kV：紙面の手順（5.48 を 3けたに丸めて √1.049 でわる）
l0 = 1.226 / math.sqrt(50e3) * 1e3
print('F2-27 λ0 pm', l0, ' 1+50/1022=', 1 + 50 / 1022, ' 5.48/√1.049=', 5.48 / math.sqrt(1.049),
      ' 丸めずに', l0 / math.sqrt(1 + 50 / 1022))
# F2-14 相対論の点線と実線の差（両対数のグラフで見分けられるか）
for V in (1e3, 1e4, 1e5, 3e5, 1e6):
    r = 1 / math.sqrt(1 + V / 1021998)
    print(f'F2-14 V={V:.0e} 相対論/非相対論 = {r:.3f}')

print('== 原-4')
# F2-18 Na の2本（3けた）
print('F2-18 1240/589.0 =', 1240 / 589.0, ' 1240/589.6 =', 1240 / 589.6)
# F2-19 0.010968 で 3→5
R = 0.010968
print('F2-19 n\'=3, n=5:', 1 / (R * (1 / 9 - 1 / 25)), '  n=4:', 1 / (R * (1 / 9 - 1 / 16)), '  n=6:', 1 / (R * (1 / 9 - 1 / 36)))
# F2-20 古典の電子が落ちるまでに回る回数：1周の時間は半径の 3/2 乗に比例するので、回数＝∫dt/T(r)
tau = a0**3 / (4 * re**2 * c)
v1 = c / 137.035999
T0 = 2 * math.pi * a0 / v1
# r(t)^3 = a0^3 (1 - t/τ)、T(r)=T0 (r/a0)^{3/2} → 回数 = ∫0^τ dt / (T0 (1-t/τ)^{1/2}) = 2τ/T0
print('F2-20 落ちる時間 s', tau, ' はじめの1周 s', T0, ' τ/T0', tau / T0, ' 2τ/T0（回る回数）', 2 * tau / T0)
# 数値積分でも確かめる
ts = np.linspace(0, tau, 2000001)[:-1]
dt = ts[1] - ts[0]
print('   数値積分', np.sum(dt / (T0 * np.sqrt(1 - ts / tau))))
# F2-21 銅の K 吸収端 8.98 keV < 20 keV（20 kV でも Kα・Kβ が出る）
print('F2-21 20 kV の最短波長 pm', 1240 / 20, ' 銅の K 端 8.979 keV → pm', hc / 8.979)
# F2-32 例題2 R_H、例題5、章末問題2
RH = Rinf / (1 + me / mp)
print('F2-32 R_H =', RH, ' R∞×0.999456 =', 1.0973732e7 * 0.999456)
for Rh in (1.0967758e7, 1.0967762e7):
    l0 = 36 / (5 * Rh) * 1e9
    print(f'   R_H={Rh:.7e} → λ0={l0:.3f} nm, 空気 {l0/1.000276:.3f} nm')
print('   Hβ 真空', 16 / (3 * 1.0967758e7) * 1e9)
a_round = (1.055e-34)**2 / (9.11e-31 * 8.99e9 * (1.60e-19)**2)
print('   例題5 a0（紙面の丸め）', a_round, ' v1 を 5.31e-11 で', 1.055e-34 / (9.11e-31 * 5.31e-11), ' 5.29e-11 で', 1.055e-34 / (9.11e-31 * 5.29e-11))
print('   章末問題2 16×0.0529 =', 16 * 0.0529, ' 16×a0(CODATA) nm', 16 * a0 * 1e9)

print('== 原-5')
# F2-2 やってみよう③：0.05 きざみ・0.35〜0.65 の7行
xs = np.arange(0.35, 0.65 + 1e-9, 0.05)
print('F2-2 0.05 きざみ 7行', xs, ' 合計×0.05 =', np.sum(2 * np.sin(np.pi * xs)**2) * 0.05)
print('   正しい積分', 1 / 3 + math.sqrt(3) / (2 * math.pi))
# F2-3 N=10 の固有値
for N in (10, 50, 200):
    dx = 1 / (N + 1)
    a = 0.0380998 / dx**2
    H = np.diag(np.full(N, 2 * a)) + np.diag(np.full(N - 1, -a), 1) + np.diag(np.full(N - 1, -a), -1)
    w = np.linalg.eigvalsh(H)
    print(f'F2-3 N={N}', w[:3])
E1 = h**2 / (8 * me * 1e-18) / e
print('   式 E1', E1, ' E2', 4 * E1, ' E3', 9 * E1, ' N=10 の E1 のずれ %', (0.37348 / E1 - 1) * 100)
# F2-24 紙面の丸めた定数で
E1J = (6.63e-34)**2 / (8 * 9.11e-31 * 1e-18)
print('F2-24 丸めた定数 E1 J', E1J, ' eV', E1J / 1.60e-19, ' CODATA eV', E1)
# F2-23 はてな？の点（fig_p5_05.py と同じ乱数で、箱 0〜40 mm に 40x で置く）
rng = np.random.default_rng(3)
pts = []
while len(pts) < 70:
    x = rng.random()
    if rng.random() < np.sin(np.pi * x)**2:
        y = rng.random()
        pts.append((x, y))
xs = np.array([p[0] for p in pts])
print('F2-23 まん中の 1/3 に入った数', int(np.sum((xs > 1 / 3) & (xs < 2 / 3))), ' 割合', np.mean((xs > 1 / 3) & (xs < 2 / 3)))
old = np.round(1 + 38 * xs, 1)
print('   もとの図（1+38x mm）を箱 0〜40 mm の 1/3 で数えると', int(np.sum((old > 40 / 3) & (old < 80 / 3))))
new = [(round(40 * x, 2), round(1.5 + 19 * y, 1)) for x, y in pts]
print('   新しい点（40x mm）', ','.join(f'{a}/{b}' for a, b in new))
nx = np.array([p[0] for p in new])
print('   新しい図で数えると', int(np.sum((nx > 40 / 3) & (nx < 80 / 3))), ' いちばん左・右', nx.min(), nx.max())
