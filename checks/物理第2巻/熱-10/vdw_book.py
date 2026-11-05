# 本文⑧の Python の囲みと同じプログラム（出力を本文と照らし合わせる）
import numpy as np
from math import log
R = 8.314; a = 0.3640; b = 4.267e-5; T = 280.0   # CO2、1 mol
def diff(p):              # 等温線の下の面積 - 横の線の下の面積
    V = np.roots([p, -(p * b + R * T), a, -a * b])
    V = sorted(x.real for x in V if abs(x.imag) < 1e-9)
    Vl, Vg = V[0], V[-1]
    area = R * T * log((Vg - b) / (Vl - b)) + a * (1 / Vg - 1 / Vl)
    return area - p * (Vg - Vl), Vl, Vg
lo, hi = 4.2e6, 5.7e6     # 等温線の山と谷の間ではさむ
for k in range(30):
    mid = (lo + hi) / 2
    if diff(mid)[0] > 0: lo = mid
    else: hi = mid
d, Vl, Vg = diff(mid)
print(round(mid / 1e6, 3), round(Vl * 1000, 4), round(Vg * 1000, 4))
