import numpy as np
r3 = 3 ** 0.5
# 節点の座標（m）：A B C D は下、E F G は上
P = {'A': (0, 0), 'B': (2, 0), 'C': (4, 0), 'D': (6, 0),
     'E': (1, r3), 'F': (3, r3), 'G': (5, r3)}
# 部材（2つの節点を結ぶ）
M = ['AB', 'BC', 'CD', 'EF', 'FG', 'AE', 'EB', 'BF', 'FC', 'CG', 'GD']
# 支点の反力：A は横とたて、D はたてだけ
R = [('A', 0), ('A', 1), ('D', 1)]
# 荷重（kN）：下向きはマイナス
L = {'B': (0, -12), 'C': (0, -6)}
names = list(P)
n = len(M) + len(R)
K = np.zeros((2 * len(names), n))
b = np.zeros(2 * len(names))
for j, (i, k) in enumerate(M):
    d = np.subtract(P[k], P[i])
    e = d / np.hypot(*d)
    K[2*names.index(i):2*names.index(i)+2, j] += e
    K[2*names.index(k):2*names.index(k)+2, j] -= e
for j, (i, c) in enumerate(R):
    K[2*names.index(i) + c, len(M) + j] = 1
for i, f in L.items():
    b[2*names.index(i):2*names.index(i)+2] = np.negative(f)
x = np.linalg.solve(K, b)
for name, v in zip(M + ['RAx', 'RAy', 'RDy'], x):
    print(name, round(v, 2))
