# 電-13 ⑥の数値実験：10 m の同軸ケーブル（50 Ω）を 0.1 m の箱 100 個に分け、先に 75 Ω をつなぐ。
# 電源の電圧は 5 ns かけて 0→2 V に上げる（立ち上がりの時間。すぐ上げると、箱に分けたための波打ちが大きい）。
# 本文の phcode と同じ計算（出力を本文の phcodeout に写す）。図のデータも出す。
# python3 ladder_p4_13.py > ladder_p4_13_out.txt
N = 100                     # 箱の数（1つの箱は 0.1 m）
L = 0.25e-6 * 0.1           # 1つの箱のコイル  L'Δx〔H〕
C = 101e-12 * 0.1           # 1つの箱のコンデンサー C'Δx〔F〕
Rs, RL = 50.0, 75.0         # 電源の内部抵抗 50 Ω、先の抵抗 75 Ω
dt = 0.01e-9                # 1歩 0.01 ns
v = [0.0] * (N + 1)         # 節の電圧 v[0]〜v[N]
i = [0.0] * N               # 箱のコイルの電流
snap = {}
for step in range(1, 12001):          # 120 ns まで
    E = 2.0 * min(step * dt / 5e-9, 1)  # 電源：5 ns で 0 V から 2 V へ上げる
    for k in range(N):                # コイル：電圧の差で電流が変わる
        i[k] += (v[k] - v[k + 1]) / L * dt
    v[0] += ((E - v[0]) / Rs - i[0]) / (C / 2) * dt
    for k in range(1, N):             # コンデンサー：入る電流と出る電流の差
        v[k] += (i[k - 1] - i[k]) / C * dt
    v[N] += (i[N - 1] - v[N] / RL) / (C / 2) * dt
    if step % 2000 == 0:              # 20 ns ごとに表示
        print(round(step * dt * 1e9), round(v[50], 2), round(v[N], 2))
    if step in (3000, 7000):
        snap[step] = v[:]
print("--- 図のデータ（位置 m, 30 ns, 70 ns）")
for k in range(0, N + 1, 2):
    print(round(k * 0.1, 1), round(snap[3000][k], 3), round(snap[7000][k], 3))
