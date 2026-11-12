# 原-6 ⑥ の本文の Python（有限の井戸を差分法で解く）。実行結果を本文にそのまま載せた。
import numpy as np
L, N = 3.0, 1200                  # x は −3〜3 nm、点の数 N
dx = 2 * L / (N + 1)
x = -L + dx * np.arange(1, N + 1)
U = np.where(abs(x) < 0.5, 0.0, 1.0)   # 井戸の中 0 eV、外 1 eV
a = 0.0381 / dx**2
H = (np.diag(2*a + U) + np.diag(-a*np.ones(N-1), 1)
     + np.diag(-a*np.ones(N-1), -1))
E = np.linalg.eigvalsh(H)         # 固有値だけを小さい順に
print(E[E < 1].round(3))          # 壁より低い（閉じこめられた）準位
