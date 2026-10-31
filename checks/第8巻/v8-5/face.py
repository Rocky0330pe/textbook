import numpy as np
n = 100                            # 1辺を100こに分ける
t = (np.arange(n) + 0.5) / n * 2 - 1   # タイルのまん中（-1〜1）
X, Y = np.meshgrid(t, t)
Fz = 1 / (X**2 + Y**2 + 1)**1.5    # 上の面（z=1）での z 成分
one = (Fz * (2/n)**2).sum()        # 1枚の量をたす
print(round(one, 4), round(6 * one, 4))
print(round(4 * np.pi, 4))
