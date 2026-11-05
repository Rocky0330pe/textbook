# 電-1 ⑤の電気力線の図（図の座標 mm）を作る。2つの点電荷を (−15,0)・(15,0) に置き、
# 正の電荷のまわりから出る線を、電場の向きに RK4 で少しずつ進めてかく（8-5④ の「矢印をつなぐ」）。
# 出力は TikZ の座標（plot coordinates）。tex/p4-01.tex の図にそのまま貼った。
import math
import sys


def field(x, y, qs):
    ex = ey = 0.0
    for q, (a, b) in qs:
        dx, dy = x - a, y - b
        r3 = (dx * dx + dy * dy) ** 1.5
        ex += q * dx / r3
        ey += q * dy / r3
    return ex, ey


def trace(x, y, qs, box, sign=1, h=0.25, nmax=4000):
    pts = [(x, y)]
    for _ in range(nmax):
        def f(px, py):
            ex, ey = field(px, py, qs)
            n = math.hypot(ex, ey)
            return sign * ex / n, sign * ey / n
        k1 = f(x, y)
        k2 = f(x + h / 2 * k1[0], y + h / 2 * k1[1])
        k3 = f(x + h / 2 * k2[0], y + h / 2 * k2[1])
        k4 = f(x + h * k3[0], y + h * k3[1])
        x += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])
        y += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
        if not (box[0] <= x <= box[1] and box[2] <= y <= box[3]):
            break
        if any(math.hypot(x - a, y - b) < 2.2 for q, (a, b) in qs if q * sign < 0):
            pts.append((x, y))
            pts.append([(a, b) for q, (a, b) in qs if q * sign < 0 and math.hypot(x - a, y - b) < 2.2][0])
            return pts[:-2:6] + pts[-2:]
        pts.append((x, y))
    return pts[::6] + [pts[-1]]


def out(name, qs, starts_angles, box):
    print('%% ' + name)
    for ang in starts_angles:
        a0, b0 = qs[0][1]
        x = a0 + 2.2 * math.cos(math.radians(ang))
        y = b0 + 2.2 * math.sin(math.radians(ang))
        pts = trace(x, y, qs, box)
        s = ' '.join('(%.1f,%.1f)' % p for p in pts)
        print('\\draw[sxb line] plot[smooth] coordinates {(%.1f,%.1f) %s};' % (a0, b0, s))


box = (-52, 52, -30, 30)
angs = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
out('正と負（±同じ大きさ）', [(1, (-15, 0)), (-1, (15, 0))], angs, box)
out('正と正：左の電荷から', [(1, (-15, 0)), (1, (15, 0))], [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330], box)
out('正と正：右の電荷から', [(1, (15, 0)), (1, (-15, 0))], [0, 30, 60, 90, 120, 150, 210, 240, 270, 300, 330], box)
