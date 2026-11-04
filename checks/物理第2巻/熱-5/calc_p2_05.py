# -*- coding: utf-8 -*-
# 熱-5（tex/p2-05.tex）の数値の検算。組「熱W3」。python3 calc_p2_05.py > calc_p2_05_out.txt
# 温度は K（℃ に 273.15 をたす）。R = 8.31 J/(mol K)（数学 8-3 例題9 と同じ。3けたの答えはこれで出す）
from math import log, sqrt

R = 8.31
K = 273.15
def T(c): return c + K
def carnot(TH, TL): return 1 - TL / TH
def cop_r(TH, TL): return TL / (TH - TL)
def cop_h(TH, TL): return TH / (TH - TL)

out = []
def p(*a): out.append(" ".join(str(x) for x in a))

p("== 本文")
p("②の例 Q_H=100 kJ, Q_L=60 kJ: W_出", 100 - 60, "η", (100 - 60) / 100)
p("③ はてな 予告：ガソリン車の 1 L のエネルギー（約 34 MJ）— 本文では使わない")
p("④ COP4 のエアコン 1 kW → 暖房", 4 * 1, "kW、外からくみ上げる熱", 4 - 1, "kW")
p("⑤ はてな：600 ℃/30 ℃ η_C =", round(carnot(T(600), T(30)), 4))
p("⑤ グラフ η_C(T_H), T_L=300 K: T_H=400,600,900,1500 →",
  [round(carnot(x, 300), 3) for x in (400, 600, 900, 1500)])
p("⑤ 2倍にすると：T_H=600 K,T_L=300 K の温度差300 K を600 K に（T_H=900 K）→", round(carnot(900, 300), 3),
  "／T_L を下げて（T_H=600, T_L=0）→ 1")
p("⑤ COP_暖 グラフ：T_H=313.15 K（40 ℃）、外 −20,−10,0,10,20 ℃ →",
  [round(cop_h(T(40), T(c)), 2) for c in (-20, -10, 0, 10, 20)])
p("⑤ 温度差半分：外0 ℃→20 ℃（差40→20 K） COP_暖", round(cop_h(T(40), T(0)), 2), round(cop_h(T(40), T(20)), 2))
p("⑤ 夏の冷房（室内27 ℃→蒸発側として27 ℃、外35 ℃ と 45 ℃）COP_冷", round(cop_r(T(35), T(27)), 1), round(cop_r(T(45), T(27)), 1))

p("== ⑤ カルノーサイクル（単原子 γ=5/3、1 mol、600 K/300 K、V1=10 L、V2=20 L）")
g = 5 / 3
TH, TL = 600.0, 300.0
V1, V2 = 10e-3, 20e-3
V3 = V2 * (TH / TL) ** (1 / (g - 1))
V4 = V1 * (TH / TL) ** (1 / (g - 1))
for nm, V, Tm in (("1", V1, TH), ("2", V2, TH), ("3", V3, TL), ("4", V4, TL)):
    p(" 状態", nm, "V〔L〕", round(V * 1e3, 2), "p〔kPa〕", round(R * Tm / V / 1e3, 1), "T", Tm)
QH = R * TH * log(V2 / V1)
QL = R * TL * log(V3 / V4)
W23 = 1.5 * R * (TH - TL)   # 断熱でする仕事 = −ΔU = n C_V (TH−TL)
p(" Q_H =", round(QH, 1), "Q_L =", round(QL, 1), "W_出 =", round(QH - QL, 1), "η =", round((QH - QL) / QH, 4))
p(" 断熱 2→3 でする仕事 = 4→1 でされる仕事 =", round(W23, 1))
p(" V2/V1 =", V2 / V1, " V3/V4 =", round(V3 / V4, 6))

# 数値積分（本文の Python と同じ手順）
def pV(V, Tm): return R * Tm / V
def leg_iso(Va, Vb, Tm, N):
    s = 0.0
    for i in range(N):
        a = Va + (Vb - Va) * i / N; b = Va + (Vb - Va) * (i + 1) / N
        s += pV((a + b) / 2, Tm) * (b - a)
    return s
def leg_adi(Va, Vb, Ta, N):
    c = Ta * Va ** (g - 1)       # T V^(γ−1) 一定
    s = 0.0
    for i in range(N):
        a = Va + (Vb - Va) * i / N; b = Va + (Vb - Va) * (i + 1) / N
        m = (a + b) / 2
        s += R * (c / m ** (g - 1)) / m * (b - a)
    return s
for N in (10, 100, 1000):
    w12 = leg_iso(V1, V2, TH, N); w23 = leg_adi(V2, V3, TH, N)
    w34 = leg_iso(V3, V4, TL, N); w41 = leg_adi(V4, V1, TL, N)
    W = w12 + w23 + w34 + w41
    p(" 数値積分 N=", N, "各区間", round(w12, 1), round(w23, 1), round(w34, 1), round(w41, 1),
      "W_出", round(W, 1), "η", round(W / w12, 4))

p("== 例題")
p("例1 はてな 600/30 ℃:", round(carnot(T(600), T(30)) * 100, 1), "%")
p("じぶん1 500/20 ℃:", round(carnot(T(500), T(20)) * 100, 1), "%")
p("例2 Q_H=1000,W=350: Q_L", 1000 - 350, "η", 350 / 1000)
p("じぶん2 Q_H=800 J, Q_L=520 J: W", 800 - 520, "η", (800 - 520) / 800)
p("例3 冷凍庫 −18/30 ℃ COP_冷 カルノー", round(cop_r(T(30), T(-18)), 2))
p("じぶん3 冷蔵室 3 ℃/30 ℃:", round(cop_r(T(30), T(3)), 1))
p("例4 暖房 外0 ℃・40 ℃ COP_暖", round(cop_h(T(40), T(0)), 2), " 外−10 ℃", round(cop_h(T(40), T(-10)), 2))
p("じぶん4 外5 ℃・45 ℃", round(cop_h(T(45), T(5)), 2))
p("例5 3 kW 暖房 COP4: 電気", 3 / 4, "kW、外の熱", 3 - 0.75, " 電気ストーブ 3 kW。1時間で", 0.75 * 1, "kWh と", 3, "kWh")
p("じぶん5 2.4 kW を COP 3: 電気", 2.4 / 3, "外の熱", 2.4 - 0.8)
p("例6 OTEC 26 ℃/9 ℃:", round(carnot(T(26), T(9)) * 100, 2), "%")
p("  50 kW を出すのに要る Q_H（カルノーでも）", round(50 / carnot(T(26), T(9))), "kW、捨てる熱", round(50 / carnot(T(26), T(9)) - 50), "kW")
p("じぶん6 温泉の湯 90 ℃・川の水 20 ℃:", round(carnot(T(90), T(20)) * 100, 1), "%")
p("例7 PWR 280 ℃/30 ℃:", round(carnot(T(280), T(30)) * 100, 1), "%、実際 33 % の割合", round(0.33 / carnot(T(280), T(30)), 2))
p("じぶん7 石炭火力 600 ℃/30 ℃ 実際 0.42 の割合", round(0.42 / carnot(T(600), T(30)), 2))
p("例8 カルノー Q_H", round(QH), "W", round(QH - QL), "Q_L", round(QL))
QH2 = R * 500 * log(3); QL2 = R * 300 * log(3)
p("じぶん8 1 mol 500 K/300 K, 等温で3倍: Q_H", round(QH2), "Q_L", round(QL2), "W", round(QH2 - QL2), "η", round(1 - 300 / 500, 3))
p("例9 COP_冷=3.2 → COP_暖", 3.2 + 1, "／カルノーで確かめ（0 ℃/40 ℃）", round(cop_r(T(40), T(0)), 3), round(cop_h(T(40), T(0)), 3))
p("じぶん9 COP_暖=4.5 → COP_冷", 4.5 - 1)
e0 = carnot(T(600), T(30)); e1 = carnot(T(600), T(20)); e2 = carnot(T(610), T(30))
p("例10 600/30: η0", round(e0 * 100, 2), "T_L−10:", round(e1 * 100, 2), "+", round((e1 - e0) * 100, 2),
  " T_H+10:", round(e2 * 100, 2), "+", round((e2 - e0) * 100, 2))
p("  比 dη/dT_L : dη/dT_H = T_H/T_L =", round(T(600) / T(30), 2))
f0 = carnot(T(280), T(30)); f1 = carnot(T(280), T(20)); f2 = carnot(T(290), T(30))
p("じぶん10 280/30: T_L−10 +", round((f1 - f0) * 100, 2), " T_H+10 +", round((f2 - f0) * 100, 2))
p("例11 Q_L/Q_H=0.5, T_H=600 → T_L", 0.5 * 600)
p("  水の三重点 273.16 K を使う：Q/Q_3 = 1.366 → T =", round(1.366 * 273.16, 1), "K")
p("じぶん11 Q_L/Q_H = 0.40, T_H = 750 K → T_L", 0.40 * 750)
# 例12 p-V 図の長方形のサイクル（2原子 C_V = 5/2 R、熱-2 の例と同じ道）
pa, pb = 100e3, 200e3; Va, Vb = 1e-3, 3e-3
Q_AB = 2.5 * Va * (pb - pa)            # 定積で圧力を上げる（熱を受けとる）
Q_BC = 3.5 * pb * (Vb - Va)            # 定圧でふくらむ（受けとる）
Q_CD = 2.5 * Vb * (pb - pa)            # 定積で下げる（捨てる）
Q_DA = 3.5 * pa * (Vb - Va)            # 定圧で縮む（捨てる）
Win = Q_AB + Q_BC; Wout = Q_CD + Q_DA
p("例12 長方形サイクル: 受けとる", Q_AB, Q_BC, "合計", Win, " 捨てる", Q_CD, Q_DA, "合計", Wout,
  " W_出", Win - Wout, "=(Δp ΔV)", (pb - pa) * (Vb - Va), " η", round((Win - Wout) / Win, 4))
p("  pV（= nRT）の値 A,B,C,D〔J〕", pa * Va, pb * Va, pb * Vb, pa * Vb, " 最高/最低 =", pb * Vb / (pa * Va),
  " 同じ最高・最低の温度のカルノー", round(1 - (pa * Va) / (pb * Vb), 3))
# じぶん12：単原子（C_V = 3/2 R）で同じ長方形
Q1 = 1.5 * Va * (pb - pa) + 2.5 * pb * (Vb - Va)
p("じぶん12 単原子で同じ長方形: 受けとる熱", Q1, " η", round(200 / Q1, 4))
p("例13 第二種永久機関の船：文で答える（数値なし）")
p("  参考：船の機関 20 MW を海水の熱だけで、と考えると…（本文では数を使わない）")

p("== 章末問題")
p("基本1 ①Q_H=500 J,W=150 J: Q_L", 350, "η", 0.30, " ②η=0.25,W=200 J: Q_H", 200 / 0.25, "Q_L", 600)
p("基本2 カルノー 527 ℃/27 ℃:", round(carnot(T(527), T(27)), 4), " 727/27:", round(carnot(T(727), T(27)), 4))
p("基本3 冷凍機 Q_L=600 J, W=200 J: COP_冷", 3, "Q_H", 800, "COP_暖", 4)
p("基本4 ヒートポンプ給湯 COP 3.5 で 14 kWh の熱:", round(14 / 3.5, 2), "kWh の電気、外の熱", 14 - 4)
p("基本5 冷蔵庫 5 ℃/35 ℃ カルノー COP_冷", round(cop_r(T(35), T(5)), 2), " −5 ℃にすると", round(cop_r(T(35), T(-5)), 2))
p("基本6 熱力学温度 Q_L/Q_H=0.6, T_L=300 → T_H", round(300 / 0.6))
# チャレンジ1 長方形サイクル（単原子、p 300/100 kPa、V 2→4 L）
pa, pb = 100e3, 300e3; Va, Vb = 2e-3, 4e-3
Qin = 1.5 * Va * (pb - pa) + 2.5 * pb * (Vb - Va)
Wn = (pb - pa) * (Vb - Va)
p("チャレンジ1 長方形（単原子、100/300 kPa、2→4 L）: 受けとる", 1.5 * Va * (pb - pa), "+", 2.5 * pb * (Vb - Va), "=", Qin,
  " W", Wn, " η", round(Wn / Qin, 4), " 最高最低温度の比", pb * Vb / (pa * Va), " カルノー", round(1 - pa * Va / (pb * Vb), 3))
# チャレンジ2 2つのカルノー機関を直列（1000 K → T_M → 300 K）、どちらも同じ仕事
TM = (1000 + 300) / 2
p("チャレンジ2 直列カルノー：同じ仕事なら T_M =", TM, " 全体の効率", 1 - 300 / 1000,
  " 上の効率", round(1 - TM / 1000, 3), "下", round(1 - 300 / TM, 3))
p("  同じ効率なら T_M = sqrt(1000*300) =", round(sqrt(1000 * 300), 1), "各", round(1 - sqrt(0.3), 3))
# チャレンジ3 最大出力の効率（カーゾン・アルボーン）
for TH_, TL_ in ((T(600), T(30)), (T(280), T(30)), (T(565), T(25))):
    p("チャレンジ3 カーゾン・アルボーン", round(TH_ - K), "/", round(TL_ - K), "℃: 1−√",
      round(1 - sqrt(TL_ / TH_), 3), " カルノー", round(carnot(TH_, TL_), 3))
# チャレンジ4 冷凍機で熱力学温度：家の冷蔵庫の COP_冷 の上限から最低温度
p("チャレンジ4 外30 ℃で COP_冷=3 になる可逆冷凍機の低温側 T_L =", round(3 * T(30) / 4, 2), "K =", round(3 * T(30) / 4 - K, 1), "℃")

p("== ⑦ 実際とカルノーのくらべ（表）")
rows = [("原子力（加圧水型）", 280, 30, 0.33), ("石炭火力（超々臨界）", 600, 30, 0.42),
        ("コンバインドサイクル（タービン入口）", 1600, 30, 0.63), ("海洋温度差（久米島）", 26, 9, None)]
for nm, h, l, act in rows:
    c = carnot(T(h), T(l))
    p(" ", nm, h, l, "カルノー", round(c * 100), "% 実際", act, "割合", None if act is None else round(act / c, 2))

print("\n".join(out))
