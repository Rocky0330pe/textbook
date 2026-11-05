# 波-6（tex/p3-06.tex）の数値の検算。python3 checks/物理第3巻/波-6/calc_p3_06.py
import math
from math import pi, sqrt, sin, cos, cosh, sinh
from scipy.special import jn_zeros
from scipy.optimize import brentq

c = 343.0
E, rho, G = 205e9, 7850.0, 79e9
cst = sqrt(E / rho)


def p(label, *v):
    print(label, ':', ', '.join(('%.6g' % x) if isinstance(x, float) else str(x) for x in v))


print('== ③ 弦')
L, f1 = 0.65, 110.0
cA = 2 * L * f1
p('A弦の c', cA)
p('倍音 n=1..4', *[n * cA / (2 * L) for n in range(1, 5)])
p('12フレット（L/2）の f', cA / (2 * L / 2))
for m in (1, 2, 5, 7, 12):
    p('フレット %d の位置 mm（ナットから）・振動数' % m, 650 * (1 - 2 ** (-m / 12)), f1 * 2 ** (m / 12))
p('1フレットと2フレットの間 mm', 650 * (2 ** (-1 / 12) - 2 ** (-2 / 12)))
p('11→12 フレットの間 mm', 650 * (2 ** (-11 / 12) - 2 ** (-12 / 12)))
mu = 0.0063
FT = mu * cA ** 2
p('A弦 F_T（μ=6.3 g/m）', FT)
p('f1 from FT, mu', 1 / (2 * L) * sqrt(FT / mu))
p('半音上げる張力の倍率 2^(1/6)', 2 ** (1 / 6), FT * (2 ** (1 / 6) - 1))
p('張力2倍 → √2', sqrt(2), f1 * sqrt(2))

print('== ④ 気柱')
for Lp in (0.5,):
    p('開管・閉管 0.5 m', c / (2 * Lp), c / (4 * Lp))
p('閉管 0.5 m の倍音 n=1,3,5', c / 2, *[k * c / 2 for k in (1, 3, 5)])
p('ペットボトル 0.20 m 閉管', c / (4 * 0.20))
p('ペットボトル 口の半径 1.0 cm、開口端補正 0.6r', 0.6 * 0.01, c / (4 * (0.20 + 0.006)))
lam = c / 440
p('共鳴管 440 Hz：λ, λ/4, 3λ/4', lam, lam / 4, 3 * lam / 4)
L1, L2 = 0.18, 0.57
p('共鳴管：λ=2(L2−L1), c, 補正 λ/4−L1', 2 * (L2 - L1), 440 * 2 * (L2 - L1), 2 * (L2 - L1) / 4 - L1)
p('じぶんでとこう：500 Hz で L1=0.16, L2=0.50', 2 * (0.50 - 0.16), 500 * 2 * 0.34, 0.68 / 4 - 0.16)
p('管の長さ1.0 m のリコーダー的な開管？ フルート 0.6 m 開管', c / (2 * 0.6))

print('== ⑤ はじいた弦（9-2）')
for frac in (0.5, 0.2):
    bn = [2 * sin(n * pi * frac) / (n * n * pi * pi * frac * (1 - frac)) for n in range(1, 8)]
    p('はじく位置 %g、h=1 の b_n' % frac, *bn)
p('まん中：比 1, 1/9, 1/25', 1, 1 / 9, 1 / 25)
for d in (1 / 4, 1 / 5, 1 / 8):
    p('ピックアップ位置 %g で sin(nπd) n=1..8' % d, *[sin(n * pi * d) for n in range(1, 9)])

print('== ⑥ 棒')
p('鋼の棒 1 m 両はし自由 f1・f2', cst / 2, 2 * cst / 2)
p('鋼の棒 1 m 片はし固定 f1', cst / 4)
p('ねじり √(G/ρ), 1 m 両はし自由 f1', sqrt(G / rho), sqrt(G / rho) / 2)
p('アルミ 0.5 m 両はし自由', sqrt(69e9 / 2700) / (2 * 0.5))

print('== ⑦ 膜')
z = {n: jn_zeros(n, 3) for n in range(0, 4)}
for n in range(4):
    p('J%d の零点' % n, *z[n])
allz = sorted([(z[n][s], n, s + 1) for n in range(4) for s in range(3)])
for v, n, s in allz[:7]:
    print('  (%d,%d) %.4f 比 %.3f' % (n, s, v, v / z[0][0]))
# 長方形の膜 a=b
p('正方形の膜の比 (1,1),(1,2),(2,2),(1,3)', 1, sqrt(5 / 2), 2, sqrt(10 / 2))
# 太鼓の例：膜の張力（1 m あたり）S と面密度 σ
S_, sig = 2000.0, 0.25
cm = sqrt(S_ / sig)
p('膜 c=√(S/σ)（S=2000 N/m, σ=0.25 kg/m²）', cm)
R = 0.25
p('半径 0.25 m の f01, f11, f21', *[zz * cm / (2 * pi * R) for zz in (z[0][0], z[1][0], z[2][0])])

print('== ⑧ 部屋')
p('4 m の1番め', c / (2 * 4))
Lx, Ly, Lz = 4.0, 3.0, 2.5
modes = []
for nx in range(0, 4):
    for ny in range(0, 4):
        for nz in range(0, 3):
            if nx == ny == nz == 0:
                continue
            f = c / 2 * sqrt((nx / Lx) ** 2 + (ny / Ly) ** 2 + (nz / Lz) ** 2)
            modes.append((f, nx, ny, nz))
modes.sort()
for f, a, b, cc in modes[:8]:
    print('  (%d,%d,%d) %.1f Hz' % (a, b, cc, f))
p('電子レンジ 2.45 GHz の λ, λ/2 cm', 2.998e8 / 2.45e9, 2.998e8 / 2.45e9 / 2 * 100)
p('とけた間かく 6.0 cm → c', 2 * 0.060 * 2.45e9)
p('じぶんでとこう 6.2 cm → c', 2 * 0.062 * 2.45e9)

print('== ⑨ はり')
f = lambda x: cos(x) * cosh(x) - 1
roots = [brentq(f, a, b) for a, b in ((4, 5), (7, 8), (10.5, 11.5))]
p('cos βL cosh βL = 1 の根', *roots)
g = lambda x: cos(x) * cosh(x) + 1
p('片持ち cos cosh = −1 の根', *[brentq(g, a, b) for a, b in ((1, 2.5), (4, 5), (7, 8))])
p('比 (β2/β1)², (β3/β1)²', (roots[1] / roots[0]) ** 2, (roots[2] / roots[0]) ** 2)
# はさみうちの表
lo, hi = 4.5, 5.0
print('  はさみうち')
for i in range(8):
    mid = (lo + hi) / 2
    print('   %d lo=%.5f hi=%.5f mid=%.5f f(mid)=%.4f' % (i, lo, hi, mid, f(mid)))
    if f(lo) * f(mid) <= 0:
        hi = mid
    else:
        lo = mid
for x in (4.5, 4.6, 4.7, 4.72, 4.73, 4.74, 4.8, 5.0):
    print('   f(%.2f)=%.4f' % (x, f(x)))
# 鉄琴
h, Lb = 0.006, 0.20
k_ = cst * h / sqrt(12)
f1b = roots[0] ** 2 / (2 * pi * Lb ** 2) * k_
p('鉄琴 6 mm×0.20 m：√(EI/ρA)=c h/√12, f1, f2, f3', k_, f1b, f1b * (roots[1] / roots[0]) ** 2, f1b * (roots[2] / roots[0]) ** 2)
p('長さ 0.10 m にすると f1', roots[0] ** 2 / (2 * pi * 0.10 ** 2) * k_)
p('長さ 0.18 m の f1', roots[0] ** 2 / (2 * pi * 0.18 ** 2) * k_)
p('じぶんでとこう：アルミ 8 mm × 0.25 m', roots[0] ** 2 / (2 * pi * 0.25 ** 2) * sqrt(69e9 / 2700) * 0.008 / sqrt(12))
# 配管
I, w = 2.73e-7, 73.6
mpl = w / 9.8
for Lp in (4.0, 6.0, 3.0):
    p('SGP 50A 単純支持 %g m の f1, f2' % Lp, pi / (2 * Lp ** 2) * sqrt(E * I / mpl), 4 * pi / (2 * Lp ** 2) * sqrt(E * I / mpl))
p('m/L', mpl)
p('1800 rpm=30 Hz に合う間かく', sqrt(pi / (2 * 30) * sqrt(E * I / mpl)))
# 曲げ波の分散
p('曲げ波 c_p = √ω (EI/ρA)^(1/4)：鉄琴の板で 1 kHz', sqrt(2 * pi * 1000) * k_ ** 0.5)

print('== ⑩ 座屈と振動')
for r in (0.75, 0.5, 0.96):
    p('F/F_cr=%g の f/f0' % r, sqrt(1 - r))
# 例：SGP 50A 4 m を柱として F_cr
Fcr = pi ** 2 * E * I / 4.0 ** 2
p('SGP 50A 4 m の座屈荷重 N', Fcr)
p('ケーブル張力：L=50 m, m=50 kg/m, f1=1.0 Hz の張力 4mL²f²', 4 * 50 * 50 ** 2 * 1.0 ** 2)
p('同 f1=1.1 Hz', 4 * 50 * 50 ** 2 * 1.1 ** 2)

print('== 章末問題')
p('基本1：弦 0.60 m, c=240 m/s の f1,f2,f3', *[n * 240 / 1.2 for n in (1, 2, 3)])
p('基本2：閉管 0.34 m、開管 0.34 m（340 m/s）', 340 / (4 * 0.34), 340 / (2 * 0.34))
p('基本3：節の間 0.25 m → λ, f（340 m/s）', 0.5, 340 / 0.5)
p('基本4：7フレット（ナットから）', 650 * (1 - 2 ** (-7 / 12)), 110 * 2 ** (7 / 12))
p('基本5：張力 4倍 → 2倍、 長さ 2/3 → 1.5倍', 2, 1.5)
p('基本6：共鳴管 680 Hz、L1=0.12, L2=0.37', 2 * 0.25, 680 * 0.5, 0.125 - 0.12)
p('チャレンジ1：はり 長さ 2倍', 0.25)
p('チャレンジ2：鉄琴 f1=880 Hz にする長さ（6 mm 鋼）', sqrt(roots[0] ** 2 / (2 * pi * 880) * k_))
p('チャレンジ3：1/3 ではじく、消える n', 3, 6)
p('チャレンジ4：F=0.5F_cr → f', sqrt(0.5))

print('== はりのモードの形（両はし自由）と節')
import numpy as np
for r in roots[:2]:
    sg = (cosh(r) - cos(r)) / (sinh(r) - sin(r))
    Y = lambda x: cos(r * x) + cosh(r * x) - sg * (sin(r * x) + sinh(r * x))
    xs = np.linspace(0, 1, 2001)
    ys = np.array([Y(x) for x in xs])
    nodes = xs[1:][np.sign(ys[1:]) != np.sign(ys[:-1])]
    p('βL=%.4f σ=%.6f 節の位置 x/L' % (r, sg), *nodes)
    print('   Y(0)=%.3f Y(0.5)=%.3f' % (Y(0), Y(0.5)))
print('== Chladni etc none')

print('== ⑩ 両はしを止めたおもりの列（N 個）と弦（ω を √(k/m) で割った値）')
for N in (5, 20):
    for n in (1, 2, N):
        wd = 2 * sin(n * pi / (2 * (N + 1)))
        wc = n * pi / (N + 1)
        print('  N=%d n=%d 列 %.4f 弦 %.4f 比 %.4f' % (N, n, wd, wc, wd / wc))
import numpy as np
N = 5
K = 2 * np.eye(N) - np.eye(N, k=1) - np.eye(N, k=-1)
print('  N=5 の固有値の平方根（行列で）', np.sqrt(np.linalg.eigvalsh(K)))
print('== はりの式の確かめ：圧縮・引張のあるはり')
p('単純支持 ω²=(π/L)^4 EI/ρS ± (π/L)² F/ρS の形の確かめ（F=F_cr で0）', (pi) ** 4 - pi ** 2 * pi ** 2)

print('== 例題の追加の検算')
h = 5e-3
p('例題7 まん中 h=5 mm：b1,b3,b5 mm', 8 * h / pi ** 2 * 1e3, 8 * h / (9 * pi ** 2) * 1e3, 8 * h / (25 * pi ** 2) * 1e3)
p('じぶんでとこう7 1/4 ではじく b1 mm', 2 * h * sin(pi / 4) / (pi ** 2 * 0.25 * 0.75) * 1e3)
p('例題5 f1=(1/2L)√(F/μ)、半音上げの張力', 1 / 1.3 * sqrt(129 / 0.0063), 129 * 2 ** (1 / 6), 129 * (2 ** (1 / 6) - 1))
p('例題14 ケーブル 0.9 Hz の張力 kN', 4 * 50 * 50 ** 2 * 0.81 / 1e3)
p('ねじり/縦の比 √(G/E)', sqrt(G / E))
p('ペットボトル 0.15 m と補正', c / (4 * 0.15), c / (4 * 0.156))
p('フルート 0.60 m 開管 f1,f2', c / 1.2, 2 * c / 1.2)
p('部屋 5 m (1,0,0),(2,0,0)', c / 10, c / 5)
p('鉄琴の支え 22.4 % → 0.20 m で cm', 0.2245 * 20)
p('基本：弦 0.60 m c=240, 1/3 はじき', 200)
