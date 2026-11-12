"""修5-6（第32回 F6）で変えた数の検算。python3 fix6_p5_15_16.py
原-15・原-16 の直した数（F6-1・F6-2・F6-3・F6-5・F6-6・F6-16・F6-18）を、紙面に書いた途中の数でも計算して確かめる（H-5）。"""
import math
import numpy as np

print("== F6-1 ルンゲ・クッタ法（4次）の1歩の時間 h と安定（原-15 ⑧）")
rho, beta, lam, Lam = 0.001, 0.0065, 0.08, 1e-4
A = np.array([[(rho - beta) / Lam, lam], [beta / Lam, -lam]])
s = np.real(np.linalg.eigvals(A))
print("  極 s1, s2 =", sorted(s))
s2 = min(s)
print("  1/|s2| = %.4f s" % (1 / abs(s2)))
# RK4 の安定の境：|1+z+z^2/2+z^3/6+z^4/24|<=1、z=h*s2（実数）で z≈-2.785
zc = -2.785293563
print("  安定の境 h = %.4f s" % (zc / s2))


def run(h, T=60.0):
    y = np.array([1.0, beta / (Lam * lam)])
    n = int(round(T / h))
    f = lambda y: A @ y
    for i in range(n):
        k1 = f(y); k2 = f(y + h / 2 * k1); k3 = f(y + h / 2 * k2); k4 = f(y + h * k3)
        y = y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)
        if not np.isfinite(y[0]) or abs(y[0]) > 1e6:
            return "こわれる（t=%.2f s）" % ((i + 1) * h)
    return "%.4f" % y[0]


for h in (1e-4, 0.01, 0.03, 0.05, 0.06):
    print("  h=%g s → 60 秒後 n=%s" % (h, run(h)))

print("== F6-2 原-16 例題3（P=1.5 MW のまま）")
P = 1.5e6
print("  温まる時間 %.3g s = %.1f h" % (1.0e6 * 4.18e3 * 70 / P, 1.0e6 * 4.18e3 * 70 / P / 3600))
print("  1日に蒸発 %.4g kg" % (P * 86400 / 2.257e6))

print("== F6-3 原-15 例題1：1 g のウラン235 と炭素")
E = 1 / 235 * 6.02e23 * 200 * 1.60e-13
print("  E=%.3g J、炭素 %.3g kg、質量の比 %.3g 倍" % (E, E / 3.28e7, E / 3.28e7 * 1000))

print("== F6-5 濃縮度6 % の η")
eta = lambda e: 2.43 * 585 * e / (684 * e + 2.68 * (1 - e))
for e in (0.0072, 0.03, 0.05, 0.06):
    print("  %.4f → η=%.4f" % (e, eta(e)))
print("  6 %%/3 %% = %.4f" % (eta(0.06) / eta(0.03)))

print("== F6-6 濃縮の段の数")
print("  1-0.0072=%.4f、(0.03/0.97)/(0.0072/0.9928)=%.3f" % (1 - 0.0072, (0.03 / 0.97) / (0.0072 / 0.9928)))

print("== F6-16 原-15 例題9")
print("  e^(0.0145*60)=%.4f、1.18*2.39=%.4f、くわしく %.4f" % (math.exp(0.0145 * 60), 1.18 * 2.39,
      beta / (beta - rho) * math.exp(lam * rho / (beta - rho) * 60)))

print("== F6-18 章末問題1（1 GW、365日）")
r = 1e9 / (200 * 1.60e-13)
N = r * 365 * 86400
mol = N / 6.02e23
print("  1秒 %.3g 回、1年 %.4g 回、%.4g mol、%.4g kg" % (r, N, mol, mol * 235 / 1000))
print("  紙面の途中の数：9.9e26/6.02e23=%.4g mol、1.64e3*235=%.4g g" % (9.9e26 / 6.02e23, 1.64e3 * 235))
print("== F6-18 チャレンジ（1）（2）")
B = math.sqrt(0.08 / 50)
R = math.pi / B; a = math.sqrt(3) * math.pi / B
print("  B=%.4f、R=%.2f、a=%.2f" % (B, R, a))
print("  136^3/(4/3 π 79^3)=%.4f、9√3/(4π)=%.4f" % (136 ** 3 / (4 / 3 * math.pi * 79 ** 3), 9 * math.sqrt(3) / (4 * math.pi)))
