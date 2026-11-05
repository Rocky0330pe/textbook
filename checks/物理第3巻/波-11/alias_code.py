# 波-11 ②の囲みのプログラム（本文と同じもの）。python3 alias_code.py
import numpy as np
fs = 8000                          # 1秒に8000回とる
m = np.arange(8)                   # とる点の番号 0〜7
for f in [1000, 7000, 9000]:
    x = np.cos(2*np.pi*f*m/fs)     # とった点の値
    print(f, np.round(x, 3) + 0)   # +0 で -0. を 0. にそろえる
