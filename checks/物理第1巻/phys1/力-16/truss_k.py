import numpy as np
r3 = 3 ** 0.5
P = [(0, 0), (2, 0), (1, r3)]       # 節点 A, B, C（m）
M = [(0, 2), (1, 2), (0, 1)]        # 部材 AC, BC, AB
EA = 2.05e8                         # 鋼で断面積 10 cm2（N）
K = np.zeros((6, 6))                # 全体の剛性行列
for i, k in M:
    d = np.subtract(P[k], P[i])
    L = np.hypot(d[0], d[1])
    c, s = d / L                    # 部材の向き（cos, sin）
    t = np.array([[c*c, c*s], [c*s, s*s]])
    ke = EA / L * np.block([[t, -t], [-t, t]])
    n = [2*i, 2*i+1, 2*k, 2*k+1]
    K[np.ix_(n, n)] += ke           # 要素の行列を、たし合わせる
F = np.zeros(6)
F[5] = -10e3                        # C に下向き 10 kN
free = [2, 4, 5]                    # 動ける向き：Bx, Cx, Cy
u = np.zeros(6)
u[free] = np.linalg.solve(K[np.ix_(free, free)], F[free])
print('変位（mm）', np.round(u * 1000, 4))
for i, k in M:
    d = np.subtract(P[k], P[i])
    L = np.hypot(d[0], d[1])
    du = u[2*k:2*k+2] - u[2*i:2*i+2]
    N = EA / L * np.dot(d / L, du)  # のび×EA/L＝部材の力
    print('ABC'[i] + 'ABC'[k], round(N / 1000, 2), 'kN')
