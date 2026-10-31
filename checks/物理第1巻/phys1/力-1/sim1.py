# 力-1 ④ 投げたボールの道すじを時間で刻んで計算する（本文の phcode と同じ）
import math
g = 9.8
v0 = 10.0
th = math.radians(45)
for dt in [0.1, 0.01, 0.001]:
    t, x, y = 0.0, 0.0, 0.0
    vx, vy = v0 * math.cos(th), v0 * math.sin(th)
    while True:
        x = x + vx * dt
        y = y + vy * dt
        vy = vy - g * dt
        t = t + dt
        if y < 0:
            break
    print(dt, round(x, 2))
