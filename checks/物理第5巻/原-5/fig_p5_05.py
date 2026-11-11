# 原-5 の図の座標を作る（組 原W3）。python3 fig_p5_05.py > fig_p5_05_out.txt
# (1) はてな？の点：幅 40 mm の箱の中に、|ψ1|² = 2 sin²(πx/L) にしたがう x と、一様な y の点を 70 個（乱数の種は 3）。
# (2) ⑫の差分法 N=10 の固有ベクトル（n=1・2）を、正しい形 √2 sin(nπx) とくらべる点。
import numpy as np

rng = np.random.default_rng(3)
pts = []
while len(pts) < 70:
    x = rng.random()
    if rng.random() < np.sin(np.pi * x)**2:
        y = rng.random()
        pts.append((round(1 + 38 * x, 1), round(1.5 + 19 * y, 1)))
print('(1) はてな？の点（mm）')
print(' '.join(f'{a}/{b}' for a, b in pts))
xs = np.array([p[0] for p in pts])
print('まん中の 1/3（13.67〜26.33 mm）に入った割合', np.mean((xs > 1 + 38 / 3) & (xs < 1 + 76 / 3)))

hb = 0.0380998
N = 10
dx = 1 / (N + 1)
H = (np.diag(np.full(N, 2.0)) + np.diag(np.full(N - 1, -1.0), 1) + np.diag(np.full(N - 1, -1.0), -1)) * hb / dx**2
w, v = np.linalg.eigh(H)
print('(2) N=10 の固有値', w[:3])
for n in (0, 1):
    vec = v[:, n] / np.sqrt(np.sum(v[:, n]**2) * dx)
    if vec[0] < 0:
        vec = -vec
    xg = np.arange(1, N + 1) * dx
    print(f'n={n + 1} 差分の点 (x, ψ)：', ' '.join(f'({x:.4f},{y:.3f})' for x, y in zip(xg, vec)))
    print('   正しい値：', ' '.join(f'{np.sqrt(2) * np.sin((n + 1) * np.pi * x):.3f}' for x in xg))
