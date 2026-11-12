# 原-7 ⑩ の囲みのプログラム（本文と同じもの）。python3 code_p5_07.py
import numpy as np
rng = np.random.default_rng(1)
N = 5000000
xyz = rng.uniform(-6, 6, (N, 3))            # a0 を単位に点をばらまく
r = np.sqrt((xyz**2).sum(axis=1))           # 原子核からの距離
keep = rng.random(N) < np.exp(-2 * r)       # |ψ|^2 に比例する確率で残す
rk = r[keep]
print(len(rk))                              # 残った点の数
print(round(rk.mean(), 2))                  # 距離の平均（a0 を単位に）
print(round((rk < 1).mean(), 2))            # a0 より内側の点の割合
print(round((rk < 3).mean(), 2))            # 3a0 より内側の点の割合
