# 原-1 ⑧の囲みのプログラム（紙面と同じ）。α 線の軌道を少しずつ進めて、曲がる角を求める。
# 最後に、式 θ=2 arctan(d/(2b)) の値も並べる（紙面の表の確かめ）。
from math import sqrt, atan2, degrees
d = 45.5                      # 正面から来たとき、いちばん近づく距離（fm）
for b in [200, 85, 40, 22.75, 10]:   # ねらいの距離（fm）
    x, y = -20000.0, b        # はじめの位置（fm）
    vx, vy = 1.0, 0.0         # はじめの速さを1とする
    r = sqrt(x * x + y * y)
    while r < 20001:
        dt = r / 1000         # 遠くでは大きく、近くでは小さく進める
        ax = d / 2 * x / r ** 3   # 原子核から押される加速度
        ay = d / 2 * y / r ** 3
        vx = vx + ax * dt     # 速度を先に進める
        vy = vy + ay * dt
        x = x + vx * dt
        y = y + vy * dt
        r = sqrt(x * x + y * y)
    print(b, round(degrees(atan2(vy, vx)), 1))

print('式の値')
for b in [200, 85, 40, 22.75, 10]:
    print(b, round(2 * degrees(atan2(d / 2, b)), 1))
