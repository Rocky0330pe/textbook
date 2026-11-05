# 第27回 確認の直し（修4-5：電-12〜14）で、足した・変えた数の検算
# 出力は fix5_check_out.txt
import math

print("== 電-12 ④ 表計算：直流モーター（K=0.05, R=0.5, V=12）。B2 =0.05*(12-0.05*A2)/0.5、C2 =B2*A2、A3 =A2+40")
K, R, V = 0.05, 0.5, 12
rows = []
w = 0
while w <= 240:
    T = K * (V - K * w) / R
    rows.append((w, round(T, 4), round(T * w, 3)))
    w += 40
for r in rows:
    print("  ω=%3d  T=%.3f  Tω=%.1f" % r)
print("  図4 の数：出力の最大は ω=120 で 72 W、例題3（ω=200）は T=0.2・40 W")
assert abs(rows[3][2] - 72) < 1e-9 and abs(rows[5][1] - 0.2) < 1e-9 and abs(rows[5][2] - 40) < 1e-9

print("== 電-12 ⑦ 表計算：誘導モーター（200 V・4極・50 Hz、R2'=0.1、X=0.8）")
print("  D2 =115.47/SQRT(C2^2+0.8^2)、E2 =3*D2^2*C2/157.08（115.47≈200/√3=%.4f、157.08≈ωs=%.4f）" % (200 / math.sqrt(3), 2 * math.pi * 1500 / 60))
for s in (1, 0.5, 0.25, 0.125, 0.08, 0.04, 0.02):
    n = 1500 * (1 - s); c = 0.1 / s
    I2 = 115.47 / math.sqrt(c * c + 0.8 ** 2); T = 3 * I2 ** 2 * c / 157.08
    I2e = 200 / math.sqrt(3) / math.sqrt(c * c + 0.64); Te = 3 * I2e ** 2 * c / (2 * math.pi * 25)
    print("  s=%-6g n=%-7g R2'/s=%-5g I2=%6.2f T=%6.2f（厳密な定数で T=%6.2f）" % (s, n, c, I2, T, Te))
print("  本文：s=1 で 39.2、s=0.125 で 159.2、s=0.04 で 92.4（図8 の点と同じ）")

print("== 電-12 例題7・例題13（3けたの断りを足しただけ。数は同じ）")
print("  定格の効率 =", 10000 / 10200, " 最大 =", 10000 * math.sqrt(1 / 3) / (10000 * math.sqrt(1 / 3) + 100))
om = 2 * math.pi * 1500 / 60
print("  ω=%.2f  Ta=%.2f  合計=%.2f  P=%.0f W" % (om, 0.2 * om / 3, 20 + 0.2 * om / 3, 20 * om))
print("  チャレンジ（30 kVA）：", 30000 / 30450, 15000 / 15180, 24000 / 24450)
print("  基本7（例題4のモーターに12 V）：最後の速さ", 0.1 * 12 / 0.01, "時定数", 0.005 / 0.01, "b=0:", 0.1 * 12 / 0.005, 0.005 / 0.005)

print("== 電-13（数は変えていない。3けたの断りを足した例題の数）")
eps0 = 8.854187817e-12; mu0 = 4e-7 * math.pi
L = math.log(1.6 / 0.45)
print("  例題1 C' =", 2 * math.pi * 2.3 * 8.85e-12 / L, " 例題5 t =", 20 / (3.00e8 / math.sqrt(2.3)))
print("  例題10 1/cos(π/10) =", 1 / math.cos(math.pi / 10), " 例題11 √5000 =", math.sqrt(5000))
print("  例題12 1/cosh1 =", 1 / math.cosh(1), " sinh1/cosh1 =", math.tanh(1))

print("== 電-14 例題6：外の導体の近くの S は、内側の導線の表面の (a/b)^2 倍")
a, b = 0.45, 1.6
print("  (a/b)^2 =", (a / b) ** 2, " → 約", round((b / a) ** 2, 1), "分の1（1.0 mm の点に比べると", (1.0 / b) ** 2, "倍）")
print("  じぶんでとこう6（5 V・75 Ω、同じケーブル）：S(1 mm) =", 5 * (5 / 75) / (2 * math.pi * 1e-6 * L))

print("== 電-14 ⑩ 表計算の式の検算：表計算の式どおりに1行ずつ計算し、プログラムの出力と比べる")
def sheet(init, steps=3, N=10):
    # 行 = 歩。列 B..K = E[0..9]、M..V = h[0..9]
    E = [0] * N; h = [0] * N
    for i, v in init.items():
        E[i] = v
    out = [(0, E[:], h[:])]
    for n in range(1, steps + 1):
        hn = h[:]
        for i in range(N - 1):          # M3 =M2-(C2-B2) … U3 まで（h[9] は 0 のまま）
            hn[i] = h[i] - (E[i + 1] - E[i])
        En = E[:]
        for i in range(1, N):           # C3 =C2-(N3-M3) … K3 まで（同じ行の新しい h を使う。E[0] は 0）
            En[i] = E[i] - (hn[i] - hn[i - 1])
        E, h = En, hn
        out.append((n, E[:], h[:]))
    return out
def prog(init, steps=3, N=10):
    E = [0] * N; h = [0] * N
    for i, v in init.items():
        E[i] = v
    out = [(0, E[:], h[:])]
    for n in range(1, steps + 1):
        for i in range(N - 1):
            h[i] = h[i] - (E[i + 1] - E[i])
        for i in range(1, N):
            E[i] = E[i] - (h[i] - h[i - 1])
        out.append((n, E[:], h[:]))
    return out
for init in ({4: 2, 5: 4, 6: 2}, {4: 1, 5: 2, 6: 1}):
    s1 = sheet(init); s2 = prog(init)
    assert s1 == s2
    print("  はじめ", init)
    for n, E, h in s1:
        print("   ", n, ' '.join('%2d' % v for v in E), '|', ' '.join('%2d' % v for v in h))
print("  表計算の式とプログラムの出力は同じ（2,4,2 は本文の表、1,2,1 はチャレンジ）")
print("  チャレンジ（5.0 mm）：Δt ≦", 5.0e-3 / 3.00e8, "s、200歩で", 200 * 5.0e-3, "m")
