# -*- coding: utf-8 -*-
"""熱-10 ⑧：ファンデルワールスの等温線と等面積の規則（本文の Python の囲みと同じ考え）。
① 換算の形 p_r = 8T_r/(3V_r - 1) - 3/V_r^2 で、T_r = 0.9 の飽和の圧力を「はさんでさがす」（2-13⑤）。
② CO2（a=0.3640、b=4.267e-5）を 280 K で。CoolProp の本当の飽和圧力とくらべる。
"""
import numpy as np
from math import log
import CoolProp.CoolProp as CP
R = 8.314462618

def roots_vdw(p, T, a, b):
    # p V^3 - (p b + R T) V^2 + a V - a b = 0（n = 1 mol）
    r = np.roots([p, -(p * b + R * T), a, -a * b])
    r = sorted(x.real for x in r if abs(x.imag) < 1e-12 and x.real > b)
    return r

def area_diff(p, T, a, b):
    V = roots_vdw(p, T, a, b)
    if len(V) < 3:
        return None, V
    Vl, Vg = V[0], V[-1]
    # 等温線の下の面積（∫p dV）と、横線の下の面積（p (Vg - Vl)）の差
    integ = R * T * log((Vg - b) / (Vl - b)) + a * (1 / Vg - 1 / Vl)
    return integ - p * (Vg - Vl), V

def saturation(T, a, b, lo, hi):
    for _ in range(80):
        mid = (lo + hi) / 2
        d, V = area_diff(mid, T, a, b)
        if d is None:
            raise ValueError("3つの根がない")
        if d > 0: lo = mid      # 等温線の下が広い → 横線を上げる
        else: hi = mid
    d, V = area_diff((lo + hi) / 2, T, a, b)
    return (lo + hi) / 2, V

# ① 換算の形（a = 3、b = 1/3、R → 8/3 となる単位）を、CO2 の値で臨界点に合わせて計算してから比にする
a, b = 0.3640, 4.267e-5
Tc = 8 * a / (27 * R * b); pc = a / (27 * b ** 2); Vc = 3 * b
for Tr in (0.85, 0.9, 0.95):
    T = Tr * Tc
    # 極小・極大の間でさがす
    Vs = np.linspace(1.05 * b, 20 * b, 20000)
    pv = R * T / (Vs - b) - a / Vs ** 2
    i_min = np.argmin(pv[: len(pv) // 2]);
    dp = np.diff(pv)
    ext = [i for i in range(1, len(dp)) if dp[i - 1] * dp[i] < 0]
    pmin, pmax = pv[ext[0]], pv[ext[1]]
    ps, V = saturation(T, a, b, max(pmin, 1.0), pmax)
    print("T_r=%.2f  p_s/p_c=%.4f  V液/Vc=%.4f  V気/Vc=%.4f  （極小 %.4f、極大 %.4f）" % (Tr, ps / pc, V[0] / Vc, V[-1] / Vc, pmin / pc, pmax / pc))

# ② CO2 280 K
T = 280.0
Vs = np.linspace(1.05 * b, 20 * b, 20000)
pv = R * T / (Vs - b) - a / Vs ** 2
dp = np.diff(pv)
ext = [i for i in range(1, len(dp)) if dp[i - 1] * dp[i] < 0]
pmin, pmax = pv[ext[0]], pv[ext[1]]
ps, V = saturation(T, a, b, max(pmin, 1.0), pmax)
print("CO2 280 K：極小 %.3f MPa、極大 %.3f MPa" % (pmin / 1e6, pmax / 1e6))
print("CO2 280 K：ファンデルワールスの飽和圧力 %.3f MPa、液 %.4f L/mol、気体 %.4f L/mol" % (ps / 1e6, V[0] * 1000, V[-1] * 1000))
preal = CP.PropsSI("P", "T", T, "Q", 0, "CO2")
print("CoolProp の飽和圧力 %.3f MPa、液 %.4f L/mol、気体 %.4f L/mol" % (preal / 1e6, 1000 / CP.PropsSI("Dmolar", "T", T, "Q", 0, "CO2"), 1000 / CP.PropsSI("Dmolar", "T", T, "Q", 1, "CO2")))
print("CO2 三重点", CP.PropsSI("Ttriple", "CO2"), "K", CP.PropsSI("ptriple", "CO2") / 1e6, "MPa")
# 本文の Python の囲みと同じ、はさんでさがす手順（回数と答え）
lo, hi = 4.2e6, 5.7e6
for k in range(30):
    mid = (lo + hi) / 2
    d, V = area_diff(mid, T, a, b)
    if d > 0: lo = mid
    else: hi = mid
print("本文の囲み（30回）：", round((lo + hi) / 2 / 1e6, 3), "MPa")
# 換算の等温線（グラフ用の点）
for Tr in (0.9, 1.0, 1.1):
    pts = []
    for Vr in (0.45, 0.5, 0.55, 0.6, 0.7, 0.8, 1.0, 1.2, 1.5, 2.0, 2.5, 3.0, 4.0):
        pr = 8 * Tr / (3 * Vr - 1) - 3 / Vr ** 2
        pts.append("(%.2f,%.3f)" % (Vr, pr))
    print("T_r=%.1f" % Tr, "".join(pts))
