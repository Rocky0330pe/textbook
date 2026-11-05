# -*- coding: utf-8 -*-
"""熱-6（もとにもどらない変化：エントロピー）の数値の検算。組 熱W4。
例題・じぶんでとこう・章末問題・表計算・グラフの数をすべてここで計算する。
水の比熱は本文 4.2 kJ/(kg·K)。3けたが要る所だけ 4.18（BRIEF-phys2 2章の6）。
"""
from math import log, sqrt

R = 8.314          # J/(mol K)
c42 = 4200.0       # 水の比熱（本文）
c418 = 4180.0      # 水の比熱（3けた）
Lf = 334e3         # 氷の融解熱 J/kg（巻末の表の候補・理科年表の値 333.5 を3けたで）
K0 = 273.15
cp_air, cv_air, Rs_air = 1005.0, 718.0, 287.0

def K(t):
    return t + K0

def p(label, v, fmt="{:.4g}"):
    print(label, fmt.format(v))

print("==== 例題・じぶんでとこう")
# 例1 80 ℃と20 ℃の水1 kg ずつ
Tf = (80 + 20) / 2
dS1 = c42 * (log(K(Tf) / K(80)) + log(K(Tf) / K(20)))
p("例1 まぜた温度 ℃", Tf)
p("例1 お湯 ΔS", c42 * log(K(Tf) / K(80)))
p("例1 水 ΔS", c42 * log(K(Tf) / K(20)))
p("例1 合計 ΔS J/K", dS1)
# じぶん1 60 ℃と20 ℃
Tfj = 40
dSj1 = c42 * (log(K(Tfj) / K(60)) + log(K(Tfj) / K(20)))
p("じ1 お湯", c42 * log(K(Tfj) / K(60)))
p("じ1 水", c42 * log(K(Tfj) / K(20)))
p("じ1 合計", dSj1)
# 例2 氷1 kg がとける
p("例2 ΔS", Lf / K0)
p("じ2 氷0.2 kg", 0.2 * Lf / K0)
# 例3 1000 J が 400 K → 300 K
p("例3 高温側", -1000 / 400)
p("例3 低温側", 1000 / 300)
p("例3 合計", -1000 / 400 + 1000 / 300)
p("じ3 500 J 350→280", -500 / 350 + 500 / 280)
# 例4 R ln2
p("例4 R ln2", R * log(2))
p("じ4 2 mol 3倍", 2 * R * log(3))
# 例5 水1 kg 20→100（4.18）
p("例5 ΔS(4.18)", c418 * log(K(100) / K(20)))
p("例5 ΔS(4.2)", c42 * log(K(100) / K(20)))
p("例5 Q/T を 20 ℃でわる（まちがい）", c418 * 80 / K(20))
p("例5 Q/T を 100 ℃でわる（まちがい）", c418 * 80 / K(100))
p("例5 平均の温度 60 ℃でわる", c418 * 80 / K(60))
p("じ5 2 kg 10→60", 2 * c418 * log(K(60) / K(10)))
# 例6 カルノー 600/300、1 mol、体積2倍
dS6 = R * log(2)
p("例6 ΔS", dS6)
p("例6 Q_H", 600 * dS6)
p("例6 Q_L", 300 * dS6)
p("例6 W", 300 * dS6)
dSj6 = R * log(3)
p("じ6 ΔS", dSj6)
p("じ6 Q_H", 500 * dSj6)
p("じ6 W", 200 * dSj6)
p("じ6 効率", 200 / 500)
# 例7 エクセルギー
p("例7 600 K 1000 J T0=300", 1000 * (1 - 300 / 600))
p("じ7 900 K 2000 J", 2000 * (1 - 300 / 900))
# 例8 例1 の混合で失われるエクセルギー
T0 = K(20)
p("例8 T0 S_gen kJ", T0 * dS1 / 1000)
p("じ8 T0 S_gen kJ（じ1）", T0 * dSj1 / 1000)
# 例9 20 ℃の部屋の熱、外0 ℃
p("例9 割合", 1 - K(0) / K(20))
p("じ9 25 ℃／−5 ℃", 1 - K(-5) / K(25))
# 例11 摩擦100 J at 300 K
p("例11", 100 / 300)
p("じ11 50 W × 60 s at 320 K", 50 * 60 / 320)
# 例12 空気 300 K 100 kPa → 600 K 500 kPa
p("例12 cp ln", cp_air * log(2))
p("例12 R ln", Rs_air * log(5))
p("例12 Δs", cp_air * log(2) - Rs_air * log(5))
p("じ12 290→580 K, 100→800 kPa", cp_air * log(2) - Rs_air * log(8))
# 例13 クラウジウスの不等式
p("例13 ∮", 1000 / 600 - 600 / 300)
p("例13 効率", 400 / 1000, "{:.2f}")
p("例13 カルノー", 1 - 300 / 600)
p("例13 T0 S_gen", 300 * (600 / 300 - 1000 / 600))
p("じ13 ∮（1000 J at 500 K、W 450 J、550 J at 300 K）", 1000 / 500 - 550 / 300)

print("==== ③ 表計算：1 K ずつ熱を移す（4200 J）。まん中の温度でわる")
TA, TB = 80.0, 20.0
tot = 0.0
rows = []
for i in range(1, 31):
    dQ = c42 * 1.0
    TAm, TBm = TA - 0.5, TB + 0.5
    dA, dB = -dQ / K(TAm), dQ / K(TBm)
    tot += dA + dB
    TA -= 1; TB += 1
    rows.append((i, TA, TB, dA, dB, dA + dB, tot))
for r in rows:
    if r[0] in (1, 2, 3, 10, 20, 28, 29, 30):
        print("%2d  TA=%.0f TB=%.0f dSA=%.3f dSB=%.3f 増え=%.3f 累計=%.2f" % r)
# 1回で30 K分を一度に移すと？（はじめの温度でわる：見こみのずれ）
print("一度に移す（はじめの温度でわる）", -30 * c42 / K(80) + 30 * c42 / K(20))
# 逆向き（冷たい方から熱い方へ 1 K 分）
print("逆向き1回", +c42 / K(79.5) - c42 / K(20.5))

print("==== ④ 自由膨張・混合")
p("1 mol 2倍", R * log(2))
p("2 mol 2倍", 2 * R * log(2))
p("N2 1 mol と O2 1 mol をまぜる", 2 * R * log(2))
p("分子100個が左半分に集まる確率", 0.5 ** 100)

print("==== ⑤ はてな？の答え：分けるのに要る最小の仕事 T0ΔS")
p("最小の仕事 kJ", K(20) * dS1 / 1000)

print("==== ⑥ 積分因子：理想気体 1 mol 2原子 Cv=5/2 R")
Cv = 2.5 * R
# δQ = Cv dT + RT/V dV、 ∂Cv/∂V = 0、 ∂(RT/V)/∂T = R/V
V = 0.0224
p("R/V（V=22.4 L）", R / V)

print("==== ⑧ 熱-2 例6 の長方形サイクルを T-s 線図に（2原子、n を A で 300 K）")
n = 200.0 / (R * 300)   # pV = 200 J（200 kPa × 1 L）
Cv, Cp = 2.5 * R, 3.5 * R
pts = {"A": (200e3, 1e-3), "B": (200e3, 3e-3), "C": (100e3, 3e-3), "D": (100e3, 1e-3)}
T = {k: P * Vv / (n * R) for k, (P, Vv) in pts.items()}
print("n =", round(n, 5), "mol", {k: round(v, 1) for k, v in T.items()})
def S(P, Vv):
    Tt = P * Vv / (n * R)
    return n * Cv * log(Tt / 300) + n * R * log(Vv / 1e-3)
Sv = {k: S(*v) for k, v in pts.items()}
print({k: round(v, 4) for k, v in Sv.items()})
# 面積：A→B 定圧 Q=nCp(TB−TA)、B→C 定積 Q=nCv(TC−TB)、C→D 定圧、D→A 定積
QAB = n * Cp * (T["B"] - T["A"]); QBC = n * Cv * (T["C"] - T["B"])
QCD = n * Cp * (T["D"] - T["C"]); QDA = n * Cv * (T["A"] - T["D"])
print("各区間の熱", round(QAB, 1), round(QBC, 1), round(QCD, 1), round(QDA, 1), "合計", round(QAB + QBC + QCD + QDA, 2))
# T-s の曲線の点（グラフ用）
def ts_isobar(P, V1, V2, N=8):
    out = []
    for k in range(N + 1):
        Vv = V1 + (V2 - V1) * k / N
        out.append((round(S(P, Vv), 4), round(P * Vv / (n * R), 1)))
    return out
def ts_isochor(Vv, P1, P2, N=8):
    out = []
    for k in range(N + 1):
        P = P1 + (P2 - P1) * k / N
        out.append((round(S(P, Vv), 4), round(P * Vv / (n * R), 1)))
    return out
print("AB", ts_isobar(200e3, 1e-3, 3e-3))
print("BC", ts_isochor(3e-3, 200e3, 100e3))
print("CD", ts_isobar(100e3, 3e-3, 1e-3))
print("DA", ts_isochor(1e-3, 100e3, 200e3))
# 数値で T dS の閉じた積分
import numpy as np
def loop_area():
    tot = 0.0
    segs = [("p", 200e3, 1e-3, 3e-3), ("v", 3e-3, 200e3, 100e3), ("p", 100e3, 3e-3, 1e-3), ("v", 1e-3, 100e3, 200e3)]
    for kind, a, b, c in segs:
        N = 20000
        for k in range(N):
            if kind == "p":
                V1 = b + (c - b) * k / N; V2 = b + (c - b) * (k + 1) / N
                s1, s2 = S(a, V1), S(a, V2); Tm = a * (V1 + V2) / 2 / (n * R)
            else:
                P1 = b + (c - b) * k / N; P2 = b + (c - b) * (k + 1) / N
                s1, s2 = S(P1, a), S(P2, a); Tm = (P1 + P2) / 2 * a / (n * R)
            tot += Tm * (s2 - s1)
    return tot
p("∮T dS（数値）", loop_area())

print("==== ⑨ エクセルギーの帯：電気ストーブ1 kW と ヒートポンプ COP 4、部屋20 ℃・外0 ℃")
frac = 1 - K(0) / K(20)
p("熱1000 W のエクセルギー W", 1000 * frac)
p("ストーブ 失われる W", 1000 - 1000 * frac)
p("ヒートポンプ 電気 W", 1000 / 4)
p("ヒートポンプ 失われる W", 250 - 1000 * frac)
p("いちばんよい COP", 1 / frac)

print("==== 章末問題")
p("基1 600 J at 300 K", 600 / 300); p("基1 600 J at 600 K", 600 / 600)
Q = 0.2 * Lf
p("基2 水 ΔS", -Q / K0); p("基2 まわり", Q / K(-10)); p("基2 合計", -Q / K0 + Q / K(-10))
p("基3 0.5 kg 20→80", 0.5 * c42 * log(K(80) / K(20)))
p("基4 2 mol 2倍", 2 * R * log(2))
p("基5 800 K", 1000 * (1 - 300 / 800)); p("基5 400 K", 1000 * (1 - 300 / 400))
p("基6 ∮", 1000 / 500 - 700 / 300); p("基6 S_gen", 700 / 300 - 1000 / 500); p("基6 失われる仕事", 300 * (700 / 300 - 1000 / 500)); p("基6 カルノーの仕事", 1000 * (1 - 300 / 500))
p("基7 定圧 1.5倍", cp_air * log(1.5)); p("基7 定積", cv_air * log(1.5))
# チャレンジ1 銅 1 kg ずつ 400 K と 300 K
cc = 385.0
p("チ1 ふれさせる ΔS", cc * (log(350 / 400) + log(350 / 300)))
Tf2 = sqrt(400 * 300)
p("チ1 可逆の最後の温度", Tf2); p("チ1 最大の仕事 J", cc * (700 - 2 * Tf2))
# チャレンジ2 T-s の三角形
p("チ2 正味の仕事", 0.5 * 200 * 2); p("チ2 受けとる熱", 500 * 2); p("チ2 捨てる熱", 500 * 2 - 0.5 * 200 * 2)
p("チ2 効率", 0.5 * 200 * 2 / (500 * 2)); p("チ2 カルノー", 1 - 300 / 500)
# 捨てる熱：斜めの線の下の面積 = (500+300)/2*2 = 800
p("チ2 捨てる熱（台形）", (500 + 300) / 2 * 2)
# チャレンジ3 暖房 2 kW
p("チ3 最小の電力 W", 2000 * frac); p("チ3 いちばんよい COP", 1 / frac)
# 基本8 カルノーの T-S の長方形 800/300 K、ΔS = 3.0 J/K
p("基8 受けとる熱", 800 * 3.0); p("基8 捨てる熱", 300 * 3.0); p("基8 仕事", 500 * 3.0); p("基8 効率", 1500 / 2400)
# チャレンジ11 0 ℃の氷 1 kg が 20 ℃の部屋でとけて 20 ℃の水に
s_ice = Lf / K0 + c42 * log(K(20) / K0)
Qroom = Lf + c42 * 20
p("チ11 氷→水 ΔS", s_ice); p("チ11 とける分", Lf / K0); p("チ11 温まる分", c42 * log(K(20) / K0))
p("チ11 部屋の熱", Qroom); p("チ11 部屋 ΔS", -Qroom / K(20)); p("チ11 S_gen", s_ice - Qroom / K(20))
p("チ11 失われた仕事 kJ", K(20) * (s_ice - Qroom / K(20)) / 1000)
# ⑥ Python の囲み（michi_book.py）の答え：道A・道Bの熱の差と、式の値
p("⑥ 道の熱の差", R * 600 * log(2) - R * 300 * log(2)); p("⑥ ΔS の式", (2.5 * R + R) * log(2))
