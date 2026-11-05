# 電-2 の図の座標を作る（組 電W1）。出力 fig_p4_02_out.txt の TikZ の行を tex/p4-02.tex に貼った。
#  (1) ⑦：2つの点電荷の等電位線（電場に垂直な向きに少しずつ進めてかく）と電気力線（電-1 と同じ方法）。
#      電荷は (−15, 0)・(15, 0)〔図の mm〕、電位は 1/r の和（大きさをそろえた単位）。
#  (2) ⑫：とがった電極のまわりのラプラス方程式を、まわりの平均にならすくり返しで解き、等電位線をかく（四角を切る方法）。
import math
import numpy as np

out = []


def phi(x, y, qs):
    return sum(q / math.hypot(x - a, y - b) for q, (a, b) in qs)


def field(x, y, qs):
    ex = ey = 0.0
    for q, (a, b) in qs:
        dx, dy = x - a, y - b
        r3 = (dx * dx + dy * dy) ** 1.5
        ex += q * dx / r3
        ey += q * dy / r3
    return ex, ey


def step(x, y, f, h):
    k1 = f(x, y)
    k2 = f(x + h / 2 * k1[0], y + h / 2 * k1[1])
    k3 = f(x + h / 2 * k2[0], y + h / 2 * k2[1])
    k4 = f(x + h * k3[0], y + h * k3[1])
    return x + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), y + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])


def thin(pts, dmin=1.2):
    o = [pts[0]]
    for q in pts[1:-1]:
        if math.dist(q, o[-1]) >= dmin:
            o.append(q)
    o.append(pts[-1])
    return o


def coords(pts):
    return ' '.join('(%.1f,%.1f)' % p for p in pts)


def equip(qs, level, x0, box, h=0.25):
    # x 軸の上で φ=level の点を、x0 の近くで二分法で探す
    a, b = x0
    fa = phi(a, 0, qs) - level
    for _ in range(80):
        m = (a + b) / 2
        fm = phi(m, 0, qs) - level
        if (fa < 0) == (fm < 0):
            a, fa = m, fm
        else:
            b = m
    sx, sy = (a + b) / 2, 0.0

    def tang(sign):
        def f(x, y):
            ex, ey = field(x, y, qs)
            n = math.hypot(ex, ey)
            return -sign * ey / n, sign * ex / n
        return f
    res = []
    for sign in (1, -1):
        x, y = sx, sy
        pts = [(x, y)]
        closed = False
        for i in range(6000):
            x, y = step(x, y, tang(sign), h)
            # 等電位にもどす（小さなずれを直す）
            pts.append((x, y))
            if not (box[0] <= x <= box[1] and box[2] <= y <= box[3]):
                break
            if i > 40 and math.hypot(x - sx, y - sy) < 0.4:
                closed = True
                pts.append((sx, sy))
                break
        res.append((pts, closed))
        if closed:
            break
    if res[0][1]:
        return [res[0][0]], True
    return [res[1][0][::-1] + res[0][0][1:]], False


def fline(qs, ang, box, h=0.25):
    a0, b0 = qs[0][1]
    x, y = a0 + 2.2 * math.cos(math.radians(ang)), b0 + 2.2 * math.sin(math.radians(ang))
    pts = [(a0, b0), (x, y)]

    def f(px, py):
        ex, ey = field(px, py, qs)
        n = math.hypot(ex, ey)
        return ex / n, ey / n
    for _ in range(4000):
        x, y = step(x, y, f, h)
        if not (box[0] <= x <= box[1] and box[2] <= y <= box[3]):
            break
        hit = [(a, b) for q, (a, b) in qs if q < 0 and math.hypot(x - a, y - b) < 2.2]
        pts.append((x, y))
        if hit:
            pts.append(hit[0])
            break
    return pts


box = (-52, 52, -30, 30)
for name, qs, levels in [('pm', [(1, (-15, 0)), (-1, (15, 0))], [(0.15, (-14.9, -0.01)), (0.07, (-14.9, -0.01)), (0.03, (-14.9, -0.01)),
                                                                 (-0.15, (0.01, 14.9)), (-0.07, (0.01, 14.9)), (-0.03, (0.01, 14.9))]),
                         ('pp', [(1, (-15, 0)), (1, (15, 0))], [(0.35, (-14.9, -0.01)), (0.2, (-14.9, -0.01)), (0.35, (0.01, 14.9)), (0.2, (0.01, 14.9)),
                                                                (0.1, (15.1, 52)), (0.07, (15.1, 52)), (0.05, (15.1, 52))])]:
    out.append('%% 等電位線 ' + name)
    for lev, x0 in levels:
        # x0 は (はじめ, おわり) の x の範囲
        paths, closed = equip(qs, lev, x0, box)
        for pts in paths:
            pts = thin(pts)
            cyc = ' -- cycle' if closed else ''
            out.append('\\draw[sxc eq] plot[smooth%s] coordinates {%s};' % (', tension=0.6' if True else '', coords(pts)))
    if name == 'pm':
        out.append('\\draw[sxc eq] (0,-30) -- (0,30);')
    out.append('%% 電気力線 ' + name)
    angs = [0, 40, 80, 120, 160, 200, 240, 280, 320] if name == 'pm' else [40, 80, 120, 160, 200, 240, 280, 320]
    for side in ([qs] if name == 'pm' else [qs, [qs[1], qs[0]]]):
        for ang in angs:
            if name == 'pp' and side[0][1][0] > 0 and ang in (160, 200):
                continue
            if name == 'pp' and side[0][1][0] < 0 and ang in (0,):
                continue
            pts = thin(fline(side, ang if side[0][1][0] < 0 else (180 - ang) % 360, box))
            out.append('\\draw[sxc fl] plot[smooth] coordinates {%s};' % coords(pts))

# (2) とがった電極（図の mm：はば 120、高さ 60、2 mm のマス）
dx = 2.0
nx, ny = 61, 31
V = np.zeros((ny, nx))
fixed = np.zeros((ny, nx), bool)
V[0, :] = 0.0
fixed[0, :] = True          # 下の板 0 V（y=0）
V[-1, :] = 100.0
fixed[-1, :] = True         # 上の板 100 V（y=60）
# とがった針：x=40 mm（列 20）、上の板から y=30 mm（行 15）まで
for j in range(15, ny):
    V[j, 20] = 100.0
    fixed[j, 20] = True
# 左右のはしは、一様な電場の値で固定（遠くでは一様）
for j in range(ny):
    for i in (0, nx - 1):
        V[j, i] = 100.0 * j / (ny - 1)
        fixed[j, i] = True
for it in range(20000):
    Vn = V.copy()
    Vn[1:-1, 1:-1] = 0.25 * (V[:-2, 1:-1] + V[2:, 1:-1] + V[1:-1, :-2] + V[1:-1, 2:])
    Vn[fixed] = V[fixed]
    if np.max(np.abs(Vn - V)) < 1e-7:
        V = Vn
        break
    V = Vn
print('ラプラスのくり返しの回数', it)
# 針の先のすぐ下の電場と、一様な所（右のほう x=100 mm）の電場（V/mm）
Etip = (V[15, 20] - V[14, 20]) / dx
Eflat = (V[16, 50] - V[14, 50]) / (2 * dx)
print('針の先のすぐ下の電場 V/mm・右の一様な所 V/mm・比', Etip, Eflat, Etip / Eflat)
print('下の板の上（針の真下）と右の電場 V/mm', (V[1, 20] - V[0, 20]) / dx, (V[1, 50] - V[0, 50]) / dx)
out.append('%% とがった電極の等電位線（10 V ごと）')


def interp(p1, p2, v1, v2, lev):
    t = (lev - v1) / (v2 - v1)
    return (p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1]))


segs = []
for lev in range(10, 100, 10):
    for j in range(ny - 1):
        for i in range(nx - 1):
            c = [((i * dx, j * dx), V[j, i]), (((i + 1) * dx, j * dx), V[j, i + 1]), (((i + 1) * dx, (j + 1) * dx), V[j + 1, i + 1]), ((i * dx, (j + 1) * dx), V[j + 1, i])]
            pts = []
            for a in range(4):
                (pa, va), (pb, vb) = c[a], c[(a + 1) % 4]
                if (va - lev) * (vb - lev) < 0:
                    pts.append(interp(pa, pb, va, vb, lev))
            if len(pts) == 2:
                segs.append((lev, pts[0], pts[1]))
            elif len(pts) == 4:
                segs.append((lev, pts[0], pts[1]))
                segs.append((lev, pts[2], pts[3]))
# 線分をつないで折れ線にする
lines = []
for lev in range(10, 100, 10):
    ss = [(a, b) for l, a, b in segs if l == lev]
    used = [False] * len(ss)
    for s0 in range(len(ss)):
        if used[s0]:
            continue
        used[s0] = True
        poly = [ss[s0][0], ss[s0][1]]
        grown = True
        while grown:
            grown = False
            for t in range(len(ss)):
                if used[t]:
                    continue
                a, b = ss[t]
                if math.dist(a, poly[-1]) < 1e-6:
                    poly.append(b); used[t] = True; grown = True
                elif math.dist(b, poly[-1]) < 1e-6:
                    poly.append(a); used[t] = True; grown = True
                elif math.dist(a, poly[0]) < 1e-6:
                    poly.insert(0, b); used[t] = True; grown = True
                elif math.dist(b, poly[0]) < 1e-6:
                    poly.insert(0, a); used[t] = True; grown = True
        lines.append((lev, poly))
for lev, poly in lines:
    out.append('\\draw[sxc lap] %s;' % ' -- '.join('(%.1f,%.1f)' % p for p in poly))
open('fig_p4_02_out.txt', 'w').write('\n'.join(out) + '\n')
print('行数', len(out))
