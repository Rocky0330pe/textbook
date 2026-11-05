# 波-7 ④ 表計算：2本の弦をつないだときのパルスの反射と透過（s=1 の1歩の式と、つなぎ目の式）
# 左の弦：Δx1=0.1 m（c1=20 m/s）、右の弦：線密度4倍、c2=10 m/s、Δx2=0.05 m。Δt=0.005 s。
# 1歩の式（s=1）：次＝左となり＋右となり−2つ前。つなぎ目：次＝−2つ前＋(2Z2・右＋2Z1・左)/(Z1+Z2)
import sys
def run(Z1, Z2, NL=20, NR=40, steps=60, show=()):
    N = NL + NR
    y_prev = [0.0] * (N + 1); y = [0.0] * (N + 1)
    tri = {2: 0, 3: 1, 4: 2, 5: 3, 6: 2, 7: 1, 8: 0}
    # 時刻0（行2）と時刻Δt（行3）：右へ1マス進んだ形
    for i, v in tri.items():
        y_prev[i] = float(v)
        y[i + 1] = float(v)
    rows = {0: y_prev[:], 1: y[:]}
    for n in range(2, steps + 1):
        yn = [0.0] * (N + 1)
        for i in range(1, N):
            if i == NL:
                yn[i] = -y_prev[i] + (2 * Z2 * y[i + 1] + 2 * Z1 * y[i - 1]) / (Z1 + Z2)
            else:
                yn[i] = y[i - 1] + y[i + 1] - y_prev[i]
        y_prev, y = y, yn
        rows[n] = y[:]
    return rows
rows = run(1.0, 2.0)
NL = 20
def fmt(v):
    return "%.2f" % v if abs(v) > 1e-9 else "0"
for n in (0, 1, 5, 10, 15, 16, 17, 20, 25, 30):
    r = rows[n]
    left = [fmt(v) for v in r[:NL + 1]]
    right = [fmt(v) for v in r[NL + 1:NL + 31]]
    print("t=%.3f" % (n * 0.005), "min_left %.3f" % min(r[:NL]), "max_right %.3f" % max(r[NL + 1:]))
    print("  L:", " ".join(left))
    print("  R:", " ".join(right))
# 軽い弦へ（Z2=Z1/2）
rows2 = run(2.0, 1.0)
r = rows2[30]
print("軽い弦へ: max_left %.3f max_right %.3f" % (max(r[:NL]), max(r[NL + 1:])))
# 同じ弦（Z2=Z1）
rows3 = run(1.0, 1.0)
r = rows3[30]
print("同じ弦: max|left| %.3f max_right %.3f" % (max(abs(v) for v in r[:NL]), max(r[NL + 1:])))

# 表に出す所：つなぎ目の近く（左 x=1.6〜2.0、右 x=2.05〜2.20）、時刻 n=13〜19
print("== 表に出す行")
cols = [16, 17, 18, 19, 20, 21, 22, 23, 24]
xs = [i * 0.1 if i <= 20 else 2.0 + (i - 20) * 0.05 for i in cols]
print("x:", " ".join("%.2f" % x for x in xs))
for n in range(12, 21):
    print("n=%d t=%.3f" % (n, n * 0.005), " ".join(fmt(rows[n][i]) for i in cols))
# グラフ用：t=0.040, 0.080, 0.120 の形（x と y）
print("== グラフ用の座標")
for n in (8, 16, 24):
    pts = []
    for i in range(0, 61):
        x = i * 0.1 if i <= 20 else 2.0 + (i - 20) * 0.05
        pts.append("(%.2f,%s)" % (x, fmt(rows[n][i])))
    print("n=%d" % n, " ".join(pts))
