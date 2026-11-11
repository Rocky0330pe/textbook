# 原-1 の図の座標を作る：⑧の α 線の軌道（5.0 MeV・金、d=45.5 fm）。
# 出力は TikZ の coordinates（単位 fm）。紙面では x=0.36 mm/fm で描く。
from math import sqrt
d = 45.5
box = (-150, 150, -40, 150)
for b in [8, 22.75, 45, 85, 130]:
    x, y = -20000.0, b
    vx, vy = 1.0, 0.0
    r = sqrt(x * x + y * y)
    pts = []
    last = None
    while r < 20001:
        dt = min(r / 1000, 0.5)
        ax = d / 2 * x / r ** 3; ay = d / 2 * y / r ** 3
        vx += ax * dt; vy += ay * dt
        x += vx * dt; y += vy * dt
        r = sqrt(x * x + y * y)
        if box[0] <= x <= box[1] and box[2] <= y <= box[3]:
            if last is None or (x - last[0]) ** 2 + (y - last[1]) ** 2 > 36:
                pts.append((x, y)); last = (x, y)
        elif pts and r > 160:
            break
    print(f'% b={b}')
    print(' '.join(f'({px:.1f},{py:.1f})' for px, py in pts))
