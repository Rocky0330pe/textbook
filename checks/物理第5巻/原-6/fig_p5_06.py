# 原-6 の図の座標を作る（組 原W3）。python3 fig_p5_06.py > fig_p5_06_out.txt
# 波束が壁に当たる：時間をふくむシュレディンガー方程式を、クランク・ニコルソン法（差分）で進める。
#   電子、はじめの位置 x=−12 nm、はばσ=1.5 nm、平均のエネルギー 1.5 eV。壁は高さ 2 eV・厚さ 0.3 nm（x=0〜0.3 nm）。
#   長さは nm、時間は fs、エネルギーは eV。ħ=0.6582 eV·fs、ħ²/(2m)=0.0381 eV·nm²。
import numpy as np
from scipy.linalg import solve_banded

hbar = 0.658211957       # eV fs
hb2m = 0.0380998         # eV nm^2
L, N = 60.0, 6000
x = np.linspace(-L / 2, L / 2, N)
dx = x[1] - x[0]
U0, a = 2.0, 0.3
U = np.where((x >= 0) & (x <= a), U0, 0.0)
E0 = 1.5
k0 = np.sqrt(E0 / hb2m)
sig = 1.5
x00 = -12.0
psi = np.exp(-(x - x00)**2 / (4 * sig**2)) * np.exp(1j * k0 * x)
psi /= np.sqrt(np.sum(np.abs(psi)**2) * dx)
dt = 0.05
r = 1j * dt / (2 * hbar)
A = hb2m / dx**2
main = 1 + r * (2 * A + U)
off = -r * A * np.ones(N)
ab = np.zeros((3, N), dtype=complex)
ab[0, 1:] = off[1:]
ab[1, :] = main
ab[2, :-1] = off[:-1]
def step(ps):
    rhs = (1 - r * (2 * A + U)) * ps
    rhs[1:] += r * A * ps[:-1]
    rhs[:-1] += r * A * ps[1:]
    return solve_banded((1, 1), ab, rhs)

v = np.sqrt(2 * E0 / 0.51099895e6) * 299.792458  # nm/fs
print('k0 1/nm', round(k0, 3), ' 速さ nm/fs', round(v, 4), ' 壁までの時間 fs', round(12 / v, 1))
snaps = {0.0: None, 16.0: None, 30.0: None}
t = 0.0
out = {}
nsteps = int(round(30.0 / dt))
for i in range(nsteps + 1):
    tt = round(i * dt, 6)
    if tt in snaps:
        out[tt] = np.abs(psi)**2
    if i < nsteps:
        psi = step(psi)
P_trans = np.sum(np.abs(psi[x > a])**2) * dx
P_ref = np.sum(np.abs(psi[x < 0])**2) * dx
print('30 fs 後：右へぬけた確率・はね返った確率', round(P_trans, 3), round(P_ref, 3))
# 平面波の正確な透過率（平均のエネルギーで）
kap = np.sqrt((U0 - E0) / hb2m)
T = 1 / (1 + U0**2 * np.sinh(kap * a)**2 / (4 * E0 * (U0 - E0)))
print('平面波（1.5 eV）の正確な透過率', round(T, 3))
# 図の点（x を −22〜14 nm、0.25 nm ごと）
sel = (x > -22) & (x < 14)
for tt, d in out.items():
    xs = x[sel][::25]
    ys = d[sel][::25]
    print(f't={tt} fs の |ψ|²（x nm, 1/nm）：', ' '.join(f'({xx:.2f},{yy:.4f})' for xx, yy in zip(xs, ys)))
    print('   いちばん高い値', round(float(d.max()), 4))
