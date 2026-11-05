# 電-1 ⑩：2つの点電荷（+1 nC を (−0.1, 0)、−1 nC を (0.1, 0)〔m〕）の電場の表と、矢印の地図。
# 表の数（本文の表）と、図の矢印の座標（図の 1 m＝200 mm、矢印の長さは大きさの 1/3 乗に比例）を出す。
import math
k = 8.99e9
qs = [(1e-9, (-0.1, 0.0)), (-1e-9, (0.1, 0.0))]


def E(x, y):
    ex = ey = 0.0
    for q, (a, b) in qs:
        dx, dy = x - a, y - b
        r3 = (dx * dx + dy * dy) ** 1.5
        ex += k * q * dx / r3
        ey += k * q * dy / r3
    return ex, ey


print('== 表（x, y, Ex, Ey, |E|）')
for (x, y) in [(0.0, 0.0), (0.0, 0.05), (0.0, 0.1), (0.0, 0.2), (0.1, 0.1), (-0.2, 0.0), (0.2, 0.0), (-0.1, 0.1)]:
    ex, ey = E(x, y)
    print('%5.2f %5.2f %9.1f %9.1f %9.1f' % (x, y, ex, ey, math.hypot(ex, ey)))

# Python の囲みと同じ計算（本文のプログラムの出力を確かめる）
print('== プログラムの出力')
for (x, y) in [(0.0, 0.0), (0.0, 0.1), (0.1, 0.1)]:
    ex, ey = E(x, y)
    print(x, y, round(ex), round(ey), round(math.hypot(ex, ey)))

print('== 図の矢印（mm）')
s = 200.0  # 1 m = 200 mm
lines = []
for i in range(-5, 6):
    for j in range(-3, 4):
        x, y = i * 0.05, j * 0.05
        if any(abs(x - a) < 1e-9 and abs(y - b) < 1e-9 for q, (a, b) in qs):
            continue
        ex, ey = E(x, y)
        m = math.hypot(ex, ey)
        L = 2.2 * (m / 100.0) ** (1 / 3)  # 100 N/C で 2.2 mm
        L = min(L, 8.5)
        ux, uy = ex / m, ey / m
        X, Y = x * s, y * s
        lines.append('\\draw[sxb arr] (%.1f,%.1f) -- (%.1f,%.1f);' % (X - ux * L / 2, Y - uy * L / 2, X + ux * L / 2, Y + uy * L / 2))
print('\n'.join(lines))
