# 電-11 例題11 の囲みのプログラム（本文と同じもの）。出力を本文の phcodeout と照らし合わせる。
import math
V, I, pf = 100, 10, 0.85
phi = math.acos(pf)
for deg in range(0, 361, 60):
    t = math.radians(deg)
    p = 0
    for k in range(3):
        s = k*2*math.pi/3
        v = math.sqrt(2)*V*math.sin(t - s)
        i = math.sqrt(2)*I*math.sin(t - s - phi)
        p = p + v*i
    print(deg, round(p, 1))
