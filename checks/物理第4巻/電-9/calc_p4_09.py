# 電-9 の数値の検算（組 電W5）。python3 calc_p4_09.py > calc_p4_09_out.txt
import math
pi = math.pi
def p(*a): print(*a)
p("== 例題1：RC（6-4 と同じ）")
E, R, C = 10, 20e3, 100e-6
tau = R * C
p("τ s:", tau, " はじめの電流 mA:", E / R * 1e3, " t=τ の v_C V:", E * (1 - math.exp(-1)))
p("じぶん1：放電 10 V・20 kΩ・100 μF：2 s 後 V:", 10 * math.exp(-1), " 1 V まで s:", tau * math.log(10))
p("== 例題2：充電器（はてな）")
for C in (470e-6, 1000e-6):
    tau = 10e3 * C
    p(f"C={C}: τ s={tau:.4g}, 5→2 V の時間 s={tau*math.log(5/2):.4g}")
p("== 例題3：リレー")
E, R, L = 12, 400, 0.2
tau = L / R
p("τ ms:", tau * 1e3, " i∞ mA:", E / R * 1e3, " 1 ms 後 mA:", E / R * (1 - math.exp(-1e-3 / tau)) * 1e3)
p("じぶん3：5 V・70 Ω・0.02 H：τ ms・i∞ mA:", 0.02 / 70 * 1e3, 5 / 70 * 1e3)
p("== 例題4：ダイオード")
p("U J:", 0.5 * 0.2 * 0.03 ** 2, " 0.5 ms 後の電流 mA:", 30 * math.exp(-1))
p("じぶん4：400 Ω を足す：τ ms・コイルの電圧 V・スイッチの電圧 V:", 0.2 / 800 * 1e3, 0.03 * 400, 12 + 0.03 * 400)
p("== 例題5：充電のエネルギー")
C, E = 100e-6, 10
p("コンデンサー mJ:", 0.5 * C * E * E * 1e3, " 電池 mJ:", C * E * E * 1e3, " 抵抗 mJ:", 0.5 * C * E * E * 1e3)
# 数値積分で R によらないことを確かめる
for R in (1e3, 1e5):
    tau = R * C; dt = tau / 20000; t = 0; W = 0
    while t < 20 * tau:
        i = E / R * math.exp(-t / tau); W += R * i * i * dt; t += dt
    p(f"R={R}: 抵抗の熱（数値積分）mJ={W*1e3:.4f}, τ s={tau}")
p("段階充電 n 段の損失（½CE²/n）mJ:", [round(0.5 * C * E * E / n * 1e3, 3) for n in (1, 2, 5, 10)])
p("== 例題6：LC")
L, C = 10e-3, 1e-6
w = 1 / math.sqrt(L * C)
p("ω rad/s:", w, " f Hz:", w / 2 / pi, " T ms:", 2 * pi / w * 1e3)
p("10 V に充電：エネルギー μJ:", 0.5 * C * 100 * 1e6, " 最大電流 A:", math.sqrt(C * 100 / L))
p("じぶん6：C 4 μF の f Hz:", 1 / (2 * pi * math.sqrt(L * 4e-6)))
p("== 例題7：臨界抵抗")
p("R_c Ω:", 2 * math.sqrt(L / C), " じぶん7（10 mH・0.1 μF）Ω:", 2 * math.sqrt(10e-3 / 0.1e-6))
p("== 例題8：RLC に 10 V")
def peak(R, L=10e-3, C=1e-6, E=10):
    z = R / 2 * math.sqrt(C / L); wn = 1 / math.sqrt(L * C)
    wd = wn * math.sqrt(1 - z * z)
    return z, E * (1 + math.exp(-pi * z / math.sqrt(1 - z * z))), pi / wd
for R in (20, 100):
    z, vmax, tp = peak(R)
    p(f"R={R}: ζ={z}, 最大 V={vmax:.4g}, 時刻 ms={tp*1e3:.4g}")
p("== 例題9：電球の突入電流")
p("100 V・8.2 Ω A:", 100 / 8.2, " 100 W の点灯中 A:", 1.0, " 比:", 100 / 8.2)
p("じぶん9：40 W・冷たいとき 15 Ω：A・点灯中 A・比:", 100 / 15, 40 / 100, 100 / 15 / 0.4)
p("== 例題10：フラッシュ")
p("100 μF・300 V J:", 0.5 * 100e-6 * 300 ** 2, " 1 ms の仕事率 kW:", 0.5 * 100e-6 * 300 ** 2 / 1e-3 / 1e3, " 600 V なら J:", 0.5 * 100e-6 * 600 ** 2)
p("== 例題11：モーターと RL")
p("τ s:", 0.02 / 0.01, " i∞ A:", 2 / 0.01, " じぶん（I 0.04）τ s:", 0.04 / 0.01)
p("== 例題12：コンデンサーをつなぐ")
C1, V1 = 10e-6, 10
V = C1 * V1 / (2 * C1)
p("V:", V, " 前 mJ:", 0.5 * C1 * V1 ** 2 * 1e3, " 後 mJ:", 0.5 * 2 * C1 * V ** 2 * 1e3)
C2 = 30e-6
V2 = C1 * V1 / (C1 + C2)
p("じぶん12（30 μF）V:", V2, " 後 mJ:", 0.5 * (C1 + C2) * V2 ** 2 * 1e3, " 失う割合:", 1 - (C1 + C2) * V2 ** 2 / (C1 * V1 ** 2))
p("== ⑩ のプログラム（RLC・10 V・速度を先に進める）")
L, C, R, E = 10e-3, 1e-6, 20, 10
dt = 1e-6; q = 0; i = 0; t = 0; vmax = 0; tmax = 0
for k in range(3001):
    if k % 250 == 0:
        print(round(t * 1e3, 2), round(q / C, 2))
    i = i + (E - R * i - q / C) / L * dt
    q = q + i * dt
    t = t + dt
    if q / C > vmax: vmax, tmax = q / C, t
p("最大 V・時刻 ms:", round(vmax, 2), round(tmax * 1e3, 3))
p("== 章末問題")
p("基本1：RC 1 kΩ・470 μF：τ s・3τ s:", 1e3 * 470e-6, 3 * 1e3 * 470e-6)
p("基本2：RL 100 Ω・0.5 H・6 V：τ ms・i∞ mA:", 0.5 / 100 * 1e3, 6 / 100 * 1e3)
p("基本3：LC 0.1 mH・0.01 μF f kHz:", 1 / (2 * pi * math.sqrt(0.1e-3 * 0.01e-6)) / 1e3)
p("基本4：47 μF を 12 V：コンデンサー mJ・電池 mJ・熱 mJ:", 0.5 * 47e-6 * 144 * 1e3, 47e-6 * 144 * 1e3, 0.5 * 47e-6 * 144 * 1e3)
p("基本5：半減の時間 = τ ln2（τ=2 s）:", 2 * math.log(2))
p("チャレンジ1：2段充電の熱 mJ（100 μF・10 V）:", 0.5 * C1 * 0 + 2 * 0.5 * 100e-6 * 5 ** 2 * 1e3)
z = 50 / 2 * math.sqrt(1e-6 / 10e-3)
p("チャレンジ2：R 50 Ω の ζ・行きすぎ V:", z, 10 * math.exp(-pi * z / math.sqrt(1 - z * z)))
# 9 V の電池と行きすぎを 12 V 以下にする ζ：1+exp(-πζ/√(1-ζ²)) ≤ 12/9
ov = 12 / 9 - 1
lnr = math.log(ov)
zz = -lnr / math.sqrt(pi ** 2 + lnr ** 2)
p("チャレンジ3：行きすぎを 1/3 以下にする ζ:", zz, " R Ω（10 mH・1 μF）:", zz * 200)
