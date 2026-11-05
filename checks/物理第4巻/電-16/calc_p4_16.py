# 電-16 読みもの「電気を届ける・電気を変える」の数値の確かめ（組 電W7b）
# 使い方: python3 calc_p4_16.py > calc_p4_16_out.txt
import math

print("== 見本の計算1：発電所が止まった直後の周波数の下がり方 ==")
f0, H, ratio = 50.0, 5.0, 0.01
dfdt = f0 * ratio / (2 * H)
print(f"df/dt = {dfdt:.4f} Hz/s  (f0={f0}, H={H} s, 1 %)")
print(f"0.2 Hz 下がるまで（何もしないとき）= {0.2/dfdt:.2f} s")
print(f"60 Hz なら df/dt = {60*ratio/(2*H):.4f} Hz/s")
print(f"H を半分（2.5 s）にすると df/dt = {f0*ratio/(2*2.5):.4f} Hz/s")
print(f"2 % の電源が止まると df/dt = {f0*0.02/(2*H):.4f} Hz/s")
# K = H P_n の例：100万 kW の発電機で H=5 s → K
Pn = 1.0e9
K = H * Pn
print(f"100万kW・H=5 s の回るエネルギー K = {K:.3e} J = {K/3.6e6:.0f} kWh")
# はずみ車の式で確かめ：K=1/2 J w^2、2極 50 Hz で 3000 min^-1
w = 2 * math.pi * 3000 / 60
J = 2 * K / w**2
print(f"3000 min^-1 の角速度 {w:.1f} rad/s、K=5e9 J になる慣性モーメント J = {J:.3e} kg m^2")
# dK/dt = (2K/f) df/dt の確かめ（数値微分）
def Kf(f):
    return K * (f / f0) ** 2
h = 1e-6
print(f"dK/df（数値）= {(Kf(f0+h)-Kf(f0-h))/(2*h):.6e}、2K/f = {2*K/f0:.6e}")

print()
print("== ② のシミュレーション（調速機あり。1 % の電源が止まる。H=5 s、D=1、R=0.05、Tg=5 s とする）==")
D, R, Tg, dPL = 1.0, 0.05, 5.0, 0.01
dt = 0.1
df = 0.0  # 周波数のずれ（基準の何倍か）
dPg = 0.0  # 調速機で増えた出力（全体の何倍か）
rows = []
t = 0.0
fmin, tmin = 0.0, 0.0
pts = []
for n in range(0, 601):
    t = n * dt
    if n % 10 == 0:
        pts.append((t, df * f0))
    if n in (0, 10, 20, 30, 40, 50, 60, 80, 100, 150, 200, 300, 600):
        rows.append((t, df * f0, dPg))
    if df < fmin:
        fmin, tmin = df, t
    ddf = (dPg - dPL - D * df) / (2 * H)
    ddPg = (-df / R - dPg) / Tg
    df += ddf * dt
    dPg += ddPg * dt
for r in rows:
    print(f"t={r[0]:5.1f} s  Δf={r[1]:+.4f} Hz  ΔPg={r[2]:.5f}")
print(f"いちばん下がる所：Δf={fmin*f0:+.4f} Hz（t={tmin:.1f} s）")
print(f"落ち着く値（式）：Δf = -dPL/(1/R + D) × f0 = {-dPL/(1/R+D)*f0:+.4f} Hz")
print("図の点（1 s ごと）：")
print(" ".join(f"({p[0]:.0f},{p[1]:.4f})" for p in pts))

print()
print("== 見本の計算2：単相全波整流の平均 ==")
V = 100.0
Vp = math.sqrt(2) * V
avg_full = 2 * Vp / math.pi
avg_half = Vp / math.pi
print(f"山 {Vp:.2f} V、全波の平均 2√2V/π = {avg_full:.2f} V、半波の平均 = {avg_half:.2f} V")
# 数値積分で確かめ
N = 100000
s = sum(abs(Vp * math.sin(math.pi * (k + 0.5) / N)) for k in range(N)) / N
print(f"数値積分（半周期の平均）= {s:.3f} V")
print(f"200 V なら全波の平均 = {2*math.sqrt(2)*200/math.pi:.1f} V")

print()
print("== 見本の計算3：太陽光で 1 GW をつくる広さ ==")
P = 1.0e9
G = 1000.0
eta = 0.20
A = P / (G * eta)
print(f"A = {A:.3e} m^2 = {A/1e6:.2f} km^2、一辺 {math.sqrt(A)/1000:.2f} km の正方形")
print(f"効率 10 % なら {P/(G*0.10)/1e6:.1f} km^2、効率 25 % なら {P/(G*0.25)/1e6:.1f} km^2")
cf = 0.15
E = 1.0e6 * 8760 * cf  # kW × h
print(f"設備利用率 0.15 で1年 {E:.3e} kWh = {E/1e8:.1f} 億kWh")
print(f"日本の発電電力量 9911 億kWh（2024年度）との比 {E/1e8/9911*100:.3f} %")

print()
print("== 見本の計算4：直流で送る（新北本連系 250 kV・1200 A）==")
Vd, Id = 250e3, 1200.0
Pd = Vd * Id
print(f"P = VI = {Pd/1e6:.0f} MW")
Rl = 2.0
loss = Rl * Id**2
print(f"抵抗 2 Ω とすると損失 RI^2 = {loss/1e6:.2f} MW（{loss/Pd*100:.2f} %）")
I2 = Pd / 125e3
print(f"同じ電力を 125 kV で送ると I = {I2:.0f} A、損失 {Rl*I2**2/1e6:.2f} MW（{Rl*I2**2/Pd*100:.2f} %）")
print(f"北本連系の合計 600+300 = {600+300} MW")

print()
print("== 本文の数 ==")
print(f"東西の連系 210 → 300 万kW：{(300-210)/210*100:.1f} % 増、120 → 210：{(210-120)/120*100:.0f} % 増")
print(f"再エネ 23.1 % × 9911 億kWh = {0.231*9911:.0f} 億kWh")
print(f"太陽光 9.8 % / 再エネ 22.9 %（2023年度）= {9.8/22.9*100:.0f} %")
# 揚水：熱-16 ⑤ と同じ 1 m^3・500 m
Ep = 1000 * 9.8 * 500
print(f"揚水 1 m^3・500 m：{Ep:.2e} J = {Ep/3.6e6:.2f} kWh（熱-16 ⑤ と同じ）")
print(f"効率 0.70：くみ上げに 100 kWh 使うと {100*0.7:.0f} kWh もどる")
# 周波数変換：50 Hz と 60 Hz の周期
print(f"50 Hz の周期 {1000/50:.1f} ms、60 Hz の周期 {1000/60:.2f} ms")
# 同期速度（電-12 ⑧）：2極
for f in (50, 60):
    print(f"2極 {f} Hz：{120*f/2:.0f} min^-1")
# 周波数が 0.2 Hz 下がったときの回転数の変化
print(f"50 Hz → 49.8 Hz：3000 → {120*49.8/2:.0f} min^-1（{0.2/50*100:.1f} %）")
# 回るエネルギーの変化：1 % の電源（H=5、Pn）を 4 s 補う
print(f"1 % を 4 s 補うエネルギー＝{0.01*4:.2f} × Pn・s、K の {0.01*4/H*100:.1f} %")
print(f"f が 0.2 Hz 下がると K は {(1-(49.8/50)**2)*100:.2f} % 減る（=0.8 %）")
# 北海道のブラックアウト：UFR 約130万kW、2・4号機 約116万kW（数を書くだけ）
# 直流の電流と交流の山：DC-DC 降圧
Vin = 400.0
for d in (0.25, 0.5, 0.75):
    print(f"降圧の DC-DC：入力 {Vin:.0f} V、オンの割合 {d} → 平均 {d*Vin:.0f} V")
