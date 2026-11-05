# 波-12 ⑦の囲みのプログラム（本文と同じもの）。python3 ray_code.py
import numpy as np
def gap(d):  return np.array([[1, d], [0, 1]])        # すき間 d〔m〕
def lens(f): return np.array([[1, 0], [-1/f, 1]])     # 焦点距離 f〔m〕のレンズ
M = lens(0.1) @ gap(0.05) @ lens(0.1)   # 1枚め→すき間→2枚め（右から順に）
print(np.round(M, 3))
print("合成の焦点距離", round(-1/M[1, 0], 4))
ray = np.array([0.01, 0.0])             # 高さ 0.01 m、軸に平行な光
y, th = M @ ray
print("出た光", round(y, 4), round(th, 4), "軸まで", round(-y/th, 4))
