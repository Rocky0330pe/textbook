# 原-3 ⑤の囲みのプログラム（紙面と同じ）と、図の点の座標を作るスクリプト（組 原W2）
# 紙面のプログラム：電子を1個ずつ、|ψ|^2 に比例する確率で落とす（はねのけ法）
import random, math
random.seed(3)
s = 5.4          # しまの間かく（μm）：例題6
w = 12.0         # 全体の広がり（μm）
def P(x):        # 届きやすさ（いちばん大きい所で1）
    return math.cos(math.pi * x / s)**2 * math.exp(-(x / w)**2)
def one():       # 電子1個がスクリーンに届く位置
    while True:
        x = random.uniform(-10, 10)
        if random.random() < P(x):
            return x
for N in [10, 100, 10000]:
    hist = [0] * 10     # 2 μm ずつ10の区間に分ける
    for i in range(N):
        hist[int((one() + 10) // 2)] += 1
    print(N, hist)
for k in range(10):     # 10000個のときの棒グラフ
    print('%3d' % (-10 + 2 * k), '*' * (hist[k] // 50))

# ---- ここから下は紙面に出さない：図の点（2次元）と細かいヒストグラム ----
random.seed(7)
def pt():
    return one(), random.uniform(-6, 6)
out = []
for N in [20, 200, 2000]:
    pts = [pt() for _ in range(N)]
    out.append((N, pts))
with open('dots_p5_03.txt', 'w') as f:
    for N, pts in out:
        f.write('%d\n' % N)
        f.write(' '.join('(%.2f,%.2f) circle(r)' % (x, y) for x, y in pts) + '\n')
random.seed(11)
hist = [0] * 20
for i in range(20000):
    hist[int((one() + 10) // 1)] += 1
print('細かい（1 μm ずつ、20000個）', hist)
