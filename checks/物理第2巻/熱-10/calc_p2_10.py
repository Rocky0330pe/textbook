# -*- coding: utf-8 -*-
"""熱-10（わく温度を圧力で読む：自由エネルギーと相平衡）の数値の検算。組 熱W4。
水と水蒸気の値は IAPWS-IF97 の式から計算する（iapws 1.5.5。手引き BRIEF-phys2 2章の7）。
氷は IAPWS 2006（iapws._iapws._Ice）、昇華圧は IAPWS 2011（_Sublimation_Pressure）。
CO2 の本当の値は CoolProp 8.0（Span-Wagner の状態式）。
"""
from math import log, exp, sqrt
from iapws import IAPWS97
from iapws._iapws import _Ice, _Sublimation_Pressure
import numpy as np

R = 8.314462618
M = 0.01801528        # 水のモル質量 kg/mol
Rs = R / M            # 461.5 J/(kg K)
K0 = 273.15

def p(label, v, fmt="{:.5g}"):
    print(label, fmt.format(v) if not isinstance(v, str) else v)

def Tsat(PkPa):
    return IAPWS97(P=PkPa / 1000, x=0).T
def psat(TK):
    return IAPWS97(T=TK, x=0).P * 1000   # kPa
def sat(TK):
    l = IAPWS97(T=TK, x=0); g = IAPWS97(T=TK, x=1)
    return l, g

print("==== ① 飽和の表（IF97）：温度〔℃〕・飽和圧力〔kPa〕")
for t in (0.01, 10, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200):
    print("  %6.2f ℃  %10.4f kPa" % (t, psat(t + K0)))
print("==== 圧力 → 飽和温度")
for P in (63, 80, 101.325, 181.325, 201.325, 1000):
    print("  %8.3f kPa  %8.3f ℃" % (P, Tsat(P) - K0))

print("==== 基準：1気圧（101.325 kPa）の沸点と蒸発熱")
T1 = Tsat(101.325)
l, g = sat(T1)
L1 = (g.h - l.h) * 1000
p("T1 K", T1); p("T1 ℃", T1 - K0); p("L1 kJ/kg", L1 / 1000)
p("s' s''", "%.4f %.4f" % (l.s, g.s)); p("h' h''", "%.2f %.2f" % (l.h, g.h))
p("g' = h - Ts", l.h - T1 * l.s); p("g'' = h - Ts", g.h - T1 * g.s)
p("v' v''", "%.6f %.4f" % (l.v, g.v))
p("クラペイロン dp/dT = L/(T Δv) Pa/K", L1 / (T1 * (g.v - l.v)))
p("クラウジウス・クラペイロン dp/dT = L p/(Rs T^2) Pa/K", L1 * 101325 / (Rs * T1 ** 2))
# 数で：1 K の上で
p("IF97 の傾き (psat(T+0.5)-psat(T-0.5)) Pa/K", (psat(T1 + 0.5) - psat(T1 - 0.5)) * 1000)

def cc_T(P2kPa, T1=T1, P1=101.325, L=L1):
    inv = 1 / T1 - Rs * log(P2kPa / P1) / L
    return 1 / inv
def cc_p(T2, T1=T1, P1=101.325, L=L1):
    return P1 * exp(L / Rs * (1 / T1 - 1 / T2))

print("==== 例1 圧力なべ ゲージ80 kPa（絶対181.325 kPa）")
p("IF97 ℃", Tsat(181.325) - K0); p("CC ℃", cc_T(181.325) - K0)
print("==== じ1 ゲージ100 kPa（絶対201.325 kPa）")
p("IF97 ℃", Tsat(201.325) - K0); p("CC ℃", cc_T(201.325) - K0)
print("==== 基1 富士山頂 63 kPa")
p("IF97 ℃", Tsat(63) - K0); p("CC ℃", cc_T(63) - K0)
print("==== ④ 表の見こみ：80 kPa（高原）")
p("IF97 ℃", Tsat(80) - K0); p("CC ℃", cc_T(80) - K0)

print("==== 例2 80 ℃と100 ℃の蒸気圧から L を見積もる")
def L2(t1, t2):
    T1_, T2_ = t1 + K0, t2 + K0
    p1, p2 = psat(T1_), psat(T2_)
    return p1, p2, Rs * log(p2 / p1) / (1 / T1_ - 1 / T2_)
a = L2(80, 100); p("p80 p100", "%.3f %.3f" % (a[0], a[1])); p("L kJ/kg", a[2] / 1000)
l, g = sat(90 + K0); p("90 ℃の本当の L", g.h - l.h)
a = L2(40, 60); p("じ2 p40 p60", "%.4f %.4f" % (a[0], a[1])); p("じ2 L", a[2] / 1000)
l, g = sat(50 + K0); p("50 ℃の本当の L", g.h - l.h)
a = L2(20, 40); p("基2 p20 p40", "%.4f %.4f" % (a[0], a[1])); p("基2 L", a[2] / 1000)
l, g = sat(30 + K0); p("30 ℃の本当の L", g.h - l.h)

print("==== ③ 表計算：ln p と 1/T（60〜140 ℃、10 ℃ごと）の最小二乗")
ts = [60, 70, 80, 90, 100, 110, 120, 130, 140]
X = []; Y = []
for t in ts:
    T = t + K0; P = psat(T)
    X.append(1000 / T); Y.append(log(P))
    print("  %3d ℃ %8.2f K  1000/T=%.4f  p=%8.3f kPa  ln p=%.4f" % (t, T, 1000 / T, P, log(P)))
X = np.array(X); Y = np.array(Y)
sl = np.cov(X, Y, bias=True)[0, 1] / np.var(X)
b0 = Y.mean() - sl * X.mean()
p("傾き（1000/T あたり）", sl); p("切片", b0)
p("L = -傾き×1000×Rs kJ/kg", -sl * 1000 * Rs / 1000)
l, g = sat(100 + K0); p("100 ℃の L", g.h - l.h)
# 直線で 181 kPa の温度
xs = (log(181.325) - b0) / sl
p("直線で 181.325 kPa の T ℃", 1000 / xs - K0)
xs = (log(63) - b0) / sl
p("直線で 63 kPa の T ℃", 1000 / xs - K0)
# 残差の最大
res = Y - (sl * X + b0)
p("残差の最大の大きさ", abs(res).max())

print("==== 例3 氷の融点の圧力変化（0 ℃・1気圧）")
ice = _Ice(273.15, 0.101325)
vi = 1 / ice["rho"]
wl = IAPWS97(T=273.16, P=0.101325)   # 0 ℃付近の水（領域1）
vw = wl.v
Lf = 333.6e3   # 融解熱（IAPWS の値から h の差で確かめる）
p("氷の密度", ice["rho"]); p("水の密度", 1 / vw)
p("Δv = v水 − v氷 m3/kg", vw - vi)
Lf334 = 334e3
dTdp = 273.15 * (vw - vi) / Lf334
p("dT/dp K/MPa（L=334）", dTdp * 1e6)
p("10 MPa で", dTdp * 1e7)
p("じ3 −1 K に要る圧力 MPa", -1 / dTdp / 1e6)
# スケート：重さ 590 N、刃の面積 0.6 cm2
p("スケートの圧力 MPa", 590 / 0.6e-4 / 1e6)

print("==== 例4 ファンデルワールス CO2（a=0.3640 Pa m6/mol2、b=4.267e-5 m3/mol）")
a_, b_ = 0.3640, 4.267e-5
Tc = 8 * a_ / (27 * R * b_); pc = a_ / (27 * b_ ** 2); Vc = 3 * b_
p("Tc K", Tc); p("pc MPa", pc / 1e6); p("Vc L/mol", Vc * 1000); p("Zc", pc * Vc / (R * Tc))
import CoolProp.CoolProp as CP
p("CO2 本当の Tc", CP.PropsSI("Tcrit", "CO2")); p("pc", CP.PropsSI("pcrit", "CO2") / 1e6)
rc = CP.PropsSI("rhomolar_critical", "CO2"); p("Vc L/mol", 1000 / rc); p("Zc", CP.PropsSI("pcrit", "CO2") / (rc * R * CP.PropsSI("Tcrit", "CO2")))
print("==== じ4 N2（a=0.1370、b=3.87e-5）")
a2, b2 = 0.1370, 3.87e-5
p("Tc", 8 * a2 / (27 * R * b2)); p("pc MPa", a2 / (27 * b2 ** 2) / 1e6)
p("N2 本当の Tc", CP.PropsSI("Tcrit", "N2")); p("pc", CP.PropsSI("pcrit", "N2") / 1e6)

def vdw(V, T, a=a_, b=b_, n=1):
    return n * R * T / (V - n * b) - a * n ** 2 / V ** 2
print("==== 例5 CO2 1 mol・0.5 L・300 K")
for V in (0.5e-3, 1.0e-3, 2.0e-3):
    pv = vdw(V, 300); pi = R * 300 / V
    preal = CP.PropsSI("P", "T", 300, "Dmolar", 1 / V, "CO2")
    print("  V=%.1f L  vdW %.3f MPa  理想 %.3f MPa  本当 %.3f MPa  Z(vdW)=%.3f  Z(本当)=%.3f" % (V * 1000, pv / 1e6, pi / 1e6, preal / 1e6, pv * V / (R * 300), preal * V / (R * 300)))
    print("     引力の項 a/V^2 = %.3f MPa、体積の直しだけ RT/(V-b) = %.3f MPa" % (a_ / V ** 2 / 1e6, R * 300 / (V - b_) / 1e6))

print("==== 例6 100 ℃（101.325 kPa）での蒸発：ΔS = L/T")
p("L/T kJ/(kg K)", L1 / T1 / 1000)
l, g = sat(T1); p("s''−s'", g.s - l.s)
l, g = sat(50 + K0); p("じ6 50 ℃ L", g.h - l.h); p("じ6 L/T", (g.h - l.h) / (50 + K0)); p("s''−s'", g.s - l.s)
l, g = sat(120 + K0); p("基4 120 ℃ L", g.h - l.h); p("基4 L/T", (g.h - l.h) / (120 + K0))

print("==== 例7 マクスウェル (∂S/∂V)_T = (∂p/∂T)_V = nR/V")
p("n=1, V=0.0224（8-3 と同じ R=8.31）", 8.31 / 0.0224)
p("R=8.314", 8.314 / 0.0224)
p("じ7 n=2, V=0.050", 2 * 8.314 / 0.050)
# 数値で：S(T,V) = n Cv ln T + n R ln V
Cv = 2.5 * 8.314
S = lambda T, V: Cv * log(T) + 8.314 * log(V)
pp = lambda T, V: 8.314 * T / V
h = 1e-6
p("数値 (∂S/∂V)_T", (S(273, 0.0224 + h) - S(273, 0.0224 - h)) / (2 * h))
p("数値 (∂p/∂T)_V", (pp(273 + 1e-3, 0.0224) - pp(273 - 1e-3, 0.0224)) / 2e-3)
# −1 の関係（理想気体、n=1、T=273、V=0.0224）
T, V = 273.0, 0.0224; P = 8.314 * T / V
d1 = 8.314 / V; d2 = P / 8.314; d3 = -8.314 * T / P ** 2
p("(∂p/∂T)_V", d1); p("(∂T/∂V)_p", d2); p("(∂V/∂p)_T", d3); p("積", d1 * d2 * d3)
p("p", P)

print("==== 例8 −1 の関係：密閉した水を温める（20 ℃・0.1 MPa）")
for t in (20, 60, 4):
    w = IAPWS97(T=t + K0, P=0.101325)
    beta = w.alfav; kap = w.xkappa   # 1/K, 1/MPa
    print("  %d ℃  β=%.4e /K  κ_T=%.4e /MPa  β/κ = %.4f MPa/K（CoolProp の (∂p/∂T)_ρ = %.4f MPa/K）  v=%.6f  cp=%.1f  cv=%.1f  cp-cv(式)=%.2f J/(kg K)" %
          (t, beta, kap, beta / kap, CP.PropsSI("d(P)/d(T)|Dmass", "T", t + K0, "Dmass", CP.PropsSI("D", "T", t + K0, "P", 101325, "Water"), "Water") / 1e6, w.v, w.cp * 1000, w.cv * 1000, (t + K0) * w.v * beta ** 2 / (kap * 1e-6)))
w = IAPWS97(T=20 + K0, P=0.101325)
p("理想気体の β", 1 / (20 + K0)); p("理想気体の κ 1/MPa", 1 / 0.101325)
p("空気（理想気体）β/κ kPa/K", (1 / 293.15) / (1 / 101.325))

print("==== 例9 三重点・昇華（フリーズドライ）")
p("三重点 psat(273.16) Pa", psat(273.16) * 1000)
p("昇華圧 273.16 K", _Sublimation_Pressure(273.16) * 1e6)
def Tsub(PPa):
    lo, hi = 190.0, 273.16
    for _ in range(60):
        mid = (lo + hi) / 2
        if _Sublimation_Pressure(mid) * 1e6 < PPa: lo = mid
        else: hi = mid
    return (lo + hi) / 2
for PPa in (611.657, 300, 100, 50, 10):
    print("  %7.1f Pa の昇華温度 %.2f K（%.1f ℃）" % (PPa, Tsub(PPa), Tsub(PPa) - K0))
# 昇華熱 = 融解熱 + 蒸発熱（0 ℃）
l, g = sat(273.16)
p("0.01 ℃の蒸発熱", g.h - l.h); p("昇華熱（334 を足す）", g.h - l.h + 334)
# CC で 100 Pa（昇華熱 2835 kJ/kg、三重点から）
Ls = (g.h - l.h + 334) * 1000
T2 = 1 / (1 / 273.16 - Rs * log(100 / 611.657) / Ls)
p("CC で 100 Pa の昇華温度 ℃", T2 - K0)
T2 = 1 / (1 / 273.16 - Rs * log(50 / 611.657) / Ls)
p("CC で 50 Pa の昇華温度 ℃", T2 - K0)

print("==== 例10 燃料電池（25 ℃・1気圧）")
dH, dG = 285.83e3, 237.13e3
F = 96485.33
p("ΔG/ΔH", dG / dH); p("E = ΔG/(2F) V", dG / (2 * F)); p("TΔS = ΔH−ΔG kJ", (dH - dG) / 1000)
p("熱の電圧 ΔH/(2F)", dH / (2 * F))
dHg, dGg = 241.83e3, 228.59e3
p("じ10 気体の水 ΔG/ΔH", dGg / dHg); p("じ10 E", dGg / (2 * F))
p("基6 100個", 100 * dG / (2 * F))
p("基6 0.70 V のときの効率（ΔH 基準）", 0.70 / (dH / (2 * F)))

print("==== 例11 ΔF＝最小の仕事（等温）")
p("1 mol 300 K 1/2", R * 300 * log(2)); p("じ11 2 mol 300 K 1/3", 2 * R * 300 * log(3))
p("基5 0.5 mol 280 K 1/4", 0.5 * R * 280 * log(4))

print("==== 例12 氷はなぜ 0 ℃より上でとける（ΔG≈ΔH−TΔS、ΔH と ΔS は0 ℃の値で一定）")
Lf = 334e3; dSf = Lf / 273.15
for t in (-10, 0, 10):
    p("  %d ℃ の Δg（とける向き）kJ/kg" % t, (Lf - (t + K0) * dSf) / 1000)
print("じ12 1気圧の水 110 ℃・90 ℃（蒸発の Δg）")
for t in (90, 110):
    p("  %d ℃ の Δg kJ/kg" % t, (L1 - (t + K0) * L1 / T1) / 1000)

print("==== チャレンジ：g' と g'' を iapws の h と s から（1気圧、90・100・110 ℃）")
for t in (90, 100, 110):
    T = t + K0
    if t == 100: T = T1
    try:
        wl = IAPWS97(T=T, P=0.101325)
    except Exception as e:
        wl = None
    # 1気圧で 90 ℃は液、110 ℃は蒸気が安定。もう片方は準安定の値（IF97 の式の外挿）
    l = IAPWS97(T=T, P=0.101325)
    print("  t=%.2f ℃ 安定な相の領域 %s  h=%.2f s=%.4f g=%.2f" % (T - K0, l.region, l.h, l.s, l.h - T * l.s))
# 準安定の相を IF97 の式（領域1と領域2）で直接計算
from iapws.iapws97 import _Region1, _Region2
for t in (90, 100, 110):
    T = t + K0 if t != 100 else T1
    r1 = _Region1(T, 0.101325); r2 = _Region2(T, 0.101325)
    g1 = r1["h"] - T * r1["s"]; g2 = r2["h"] - T * r2["s"]
    print("  %.2f ℃ 液 h=%.2f s=%.4f g=%.2f | 蒸気 h=%.2f s=%.4f g=%.2f | g''−g'=%.2f" % (T - K0, r1["h"], r1["s"], g1, r2["h"], r2["s"], g2, g2 - g1))

print("==== 本文のそのほかの数")
from math import pi
A = pi * (0.0145 / 2) ** 2
p("やってみよう 注射器の断面積 cm2", A * 1e4); p("引く力 N（25 ℃）", (101.325 - psat(298.15)) * 1000 * A)
p("121 ℃の飽和圧力 kPa", psat(394.15)); p("10 MPa の飽和温度 ℃", Tsat(10000) - K0)
l, g = sat(T1); p("v''/v'（1気圧）", g.v / l.v)
l, g = sat(117.14 + K0); p("117 ℃の蒸発熱", g.h - l.h)
l, g = sat(60 + K0); p("60 ℃の蒸発熱", g.h - l.h)
p("110 ℃/100 ℃ の飽和圧力の比", psat(383.15) / psat(373.15))
p("100 ℃付近 1 K あたりの増え（割合）", (psat(T1 + 0.5) - psat(T1 - 0.5)) / 101.325)
x = (17.965 - log(181.3)) / 4.983; p("④ 圧力なべ 1000/T", x); p("④ ℃", 1000 / x - K0)
x = (17.965 - log(63)) / 4.983; p("④ 富士山頂 1000/T", x); p("④ ℃", 1000 / x - K0)
p("③ L = 4.983×1000×461.5 kJ/kg", 4.983 * 1000 * 461.5 / 1000)
p("ジュール・トムソン N2 300 K（K/100 kPa）", (2 * 0.1370 / (R * 300) - 3.87e-5) / 29.12 * 1e5)
p("CoolProp N2 300 K（K/100 kPa）", CP.PropsSI("d(T)/d(P)|Hmass", "T", 300, "P", 101325, "N2") * 1e5)
p("逆転温度 2a/(Rb) K", 2 * 0.1370 / (R * 3.87e-5))
p("燃料電池 ΔH/(2F) V", 285.83e3 / (2 * 96485))
