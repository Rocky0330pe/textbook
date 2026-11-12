#!/usr/bin/env python3
"""第32回 修5-3（原-6〜8）：直しで変えた・新しく置いた数の検算。
出力は fix3_p5_06_08_out.txt。紙面に書いた途中の数（κ＝5.12 など）で計算した値と、くわしい定数の値を並べる。"""
from math import *
import numpy as np

hbar = 1.054571817e-34; me = 9.1093837015e-31; e = 1.602176634e-19
NA = 6.02214076e23; kB = 1.380649e-23; h = 2 * pi * hbar
k1 = sqrt(2 * me * e) / hbar * 1e-9          # 1 eV の κ〔nm⁻¹〕
out = []
p = out.append

p('== 原-6')
p('κ(1 eV) = %.4f nm^-1（紙面 5.12）' % k1)
# F3-2・表1・例題3：1 eV の壁、厚さ 1 nm（紙面の κ=5.12 で 3.6e-5 にそろえた）
p('e^-2κa 1nm: κ=5.12 → %.3e、くわしい κ → %.3e' % (exp(-2 * 5.12), exp(-2 * k1)))
p('e^-2κa 0.5nm: %.3e、2nm: %.3e' % (exp(-5.12), exp(-4 * 5.12)))
for a in (0.5, 1.0):
    T = 1 / (1 + sinh(5.12 * a) ** 2)
    p('例題3 a=%.1f: sinh=%.3f, T=%.3e, 近似=%.3e, 比=%.2f' % (a, sinh(5.12 * a), T, exp(-2 * 5.12 * a), T / exp(-2 * 5.12 * a)))
T05 = 1 / (1 + sinh(2.56) ** 2); T10 = 1 / (1 + sinh(5.12) ** 2)
p('F3-2: 0.024^2=%.2e、T(1nm)=%.2e、比 T(1nm)/T(0.5nm)^2=%.3f（4分の1）' % (T05 ** 2, T10, T10 / T05 ** 2))
# 例題6
f = 3.00e10 * 2143; p('例題6 f=%.3e Hz, ħω=%.4f eV' % (f, 4.14e-15 * f))
# 章末 基本4（新）：酸化膜 8→7 nm
kap = 5.12 * sqrt(3.2); p('基本4 κ=%.3f, e^{2κ}=%.2e' % (kap, exp(2 * kap)))
# 章末 基本5（新）：電子と陽子
kp = 5.12 * sqrt(1836)
p('基本5 電子 e^-%.3f=%.3f, 陽子 κ=%.1f e^-%.1f=%.2e' % (2 * 5.12 * 0.1, exp(-2 * 5.12 * 0.1), kp, 2 * kp * 0.1, exp(-2 * kp * 0.1)))
# チャレンジ（N2）
hw = 1.23984198e-4 * 2330; thE = hw / 8.617333e-5; x = thE / 300
p('N2 ħω=%.4f eV θE=%.0f K x=%.2f C/R=%.2e e^11.2=%.3e' % (hw, thE, x, x * x * exp(x) / (exp(x) - 1) ** 2, exp(11.2)))
# 図1(イ) の位相：tan φ = −k/κ
phi = degrees(pi - atan(1.2 / 0.12)); p('図1 φ=%.1f°' % phi)

p('== 原-7')
p('基本7（チャレンジから移した）T=%.2f K' % (1.16e-4 / (8.62e-5 * log(2))))
p('基本6 Na 1 mol: %.1f kJ（1.60e-19, 6.02e23）' % (5.14 * 1.60e-19 * 6.02e23 / 1e3))
from scipy.optimize import brentq
g = lambda x: 1 - exp(-x) * (1 + x + x * x / 2)
x = brentq(lambda x: g(x) - 0.5, 1, 4)
p('チャレンジ（新）半分の半径 x=%.4f r=%.4f a0 = %.1f pm、g(2.67)=%.4f g(2.68)=%.4f' % (x, x / 2, x / 2 * 52.9, g(2.67), g(2.68)))
n = 7.87e6 / 55.85 * 6.02e23; p('例題9 n原子=%.3e M=%.3e μ0M=%.2f、1μB=%.2f' % (n, n * 2.2 * 9.27e-24, 4e-7 * pi * n * 2.2 * 9.27e-24, 4e-7 * pi * n * 9.27e-24))

p('== 原-8')
nmg = 2 * 1.74e6 / 24.31 * NA; kF = (3 * pi ** 2 * nmg) ** (1 / 3)
p('基本6（新）Mg n=%.3e EF=%.2f eV' % (nmg, hbar ** 2 * kF ** 2 / (2 * me) / e))
th = radians(38.47 / 2); d = 0.1541 / (2 * sin(th))
p('基本2（新）Al θ=%.2f° sin=%.4f d=%.4f nm a=%.4f nm' % (degrees(th), sin(th), d, d * sqrt(3)))
p('基本7 ln99×0.0517=%.3f eV' % (log(99) * 0.0517))
p('チャレンジ WF 銀 κ=%.0f W/(m K)' % (2.44e-8 * 293 / 1.59e-8))
p('チャレンジ 電子=格子 T=%.2f K' % sqrt(5 * 343 ** 3 / (24 * pi ** 2 * 8.2e4)))
P = 3 * pi / 2
for a in (0.5e-9, 0.25e-9):
    qa = np.linspace(1e-6, 3.2 * pi, 200000)
    F = np.cos(qa) + P * np.sin(qa) / qa
    E = (hbar * qa / a) ** 2 / (2 * me) / e
    ok = np.abs(F) <= 1
    edge = np.flatnonzero(np.diff(ok.astype(int)))
    p('KP a=%.2f nm 帯のはし %s' % (a * 1e9, np.round(E[edge], 2)))
p('F3-27 銅 a=%.4f nm, a/√2=%.4f nm, 38/0.255=%.0f' % ((4 / 8.49e28) ** (1 / 3) * 1e9, (4 / 8.49e28) ** (1 / 3) * 1e9 / sqrt(2), 38 / 0.255))
p('F3-4 n_i(Si) の目安 2.8e19×1.04e19 の根 × e^-21.6 = %.2e /cm3' % (sqrt(2.8e19 * 1.04e19) * exp(-1.12 / (2 * 0.02585))))
p('例題12 Δ=%.2f meV、kT(4.2K)=%.2f meV、比 %.1f' % (1.76 * 8.62e-5 * 9.5e3, 8.62e-5 * 4.2e3, 1.76 * 9.5 / 4.2))

txt = '\n'.join(out)
print(txt)
import os
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fix3_p5_06_08_out.txt'), 'w').write(txt + '\n')
