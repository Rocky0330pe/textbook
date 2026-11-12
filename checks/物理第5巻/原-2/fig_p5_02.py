# 原-2 ⑧の図（光子を1つずつ数える干渉じま）の点の座標を作る。乱数の種は固定（紙面と同じ点になる）。
# 強さの分布：cos^2(πx/1.0) × exp(-(x/2.2)^2)、x は -3〜3（しま1本の間かくを1とする）。
# 出力は TikZ の座標（単位 mm。はば 36 mm、高さ 18 mm の枠の中）。
import random, math
random.seed(5)


def sample():
    while True:
        x = random.uniform(-3, 3)
        w = math.cos(math.pi * x) ** 2 * math.exp(-(x / 2.2) ** 2)
        if random.random() < w:
            return x


for n in (20, 200, 1000):
    pts = []
    for i in range(n):
        x = sample()
        y = random.uniform(0.6, 17.4)
        pts.append((18 + x * 6, y))
    print(f'% n={n}')
    print(' '.join(f'({px:.1f},{py:.1f})' for px, py in pts))
