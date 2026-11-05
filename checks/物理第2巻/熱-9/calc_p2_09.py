# -*- coding: utf-8 -*-
"""熱-9（冷やす・湿り気をはかる：冷凍と湿り空気）の数値をすべて計算する（組 熱W5）。

使い方：python3 -I calc_p2_09.py   → 画面に例題・表・図の数を出し、states_p2_09.csv（章で使った状態点と値）を書く。
- 水の飽和蒸気圧：IAPWS-IF97（iapws 1.5.5）。0 ℃より下（氷の上）は使わない。
- 湿り空気：CoolProp 8.0 の HAPropsSI（実在の湿り空気の式。増大係数をふくむ）。大気圧 101.325 kPa。
  本文の式（理想気体）x＝0.622 p_v/(p−p_v)、h＝1.006θ＋x(2501＋1.86θ) の値も並べ、差を出す。
- 冷媒：CoolProp 8.0（R32・R134a・R600a。比エンタルピーの基準は CoolProp の既定（0 ℃の飽和液で
  h＝200 kJ/kg、s＝1 kJ/(kg·K)。IIR の決まり）。理論サイクル：圧縮機の入口は蒸発温度の飽和蒸気、
  凝縮器の出口は凝縮温度の飽和液、圧縮は断熱可逆（s 一定）、膨張弁は h 一定。
"""
import csv, math, os
from iapws import IAPWS97 as W
from CoolProp.CoolProp import PropsSI
from CoolProp.HumidAirProp import HAPropsSI

K0 = 273.15
P0 = 101325.0
HERE = os.path.dirname(os.path.abspath(__file__))
rows = []
def rec(where, state, prop, val, unit, shown, src):
    rows.append(["熱-9", where, state, prop, repr(val), shown, unit, src])
IF = "IAPWS-IF97（iapws 1.5.5）"
CP = "CoolProp 8.0（HAPropsSI、101.325 kPa）"
CPR = "CoolProp 8.0（冷媒の状態式）"
pr = print

def ps(t):  # kPa（IF97）
    if t < 0.01:
        return W(T=273.16, x=0).P * 1e3 if abs(t) < 0.02 else None
    return W(T=t + K0, x=0).P * 1e3
def ps0(t):  # 0 ℃ も IF97 の式（領域4 は 273.15 K から使える）
    return W(T=t + K0, x=0).P * 1e3
def x_id(t, phi, p=101.325):
    pv = phi * ps0(t); return 0.622 * pv / (p - pv)
def h_id(t, x):
    return 1.006 * t + x * (2501 + 1.86 * t)
def dew_if(pv):
    lo, hi = 0.0, 60.0
    for _ in range(80):
        m = (lo + hi) / 2
        if ps0(m) < pv: lo = m
        else: hi = m
    return m
def HA(out, t, phi):
    return HAPropsSI(out, 'T', t + K0, 'P', P0, 'R', phi)

# ---------------------------------------------------------------- 表：中学の飽和水蒸気量（g/m^3）と飽和蒸気圧
pr("== 表 飽和蒸気圧と飽和水蒸気量（理想気体 ρ＝p/(R_v T)、R_v＝461.5 J/(kg·K)）")
for t in [0, 5, 10, 15, 20, 25, 30, 35, 40]:
    p_ = ps0(t); rho = p_ * 1e3 / (461.5 * (t + K0)) * 1e3
    xs = HA('W', t, 1.0)
    pr("  %2d ℃  p_s=%.3f kPa  飽和水蒸気量 %.1f g/m3  x_s(CoolProp)=%.4f  x_s(式)=%.4f" % (t, p_, rho, xs, x_id(t, 1)))
    rec("表 飽和水蒸気量", "飽和 %d ℃" % t, "p_s", p_, "kPa", "%.3f" % p_, IF)
    rec("表 飽和水蒸気量", "飽和 %d ℃" % t, "飽和水蒸気量", rho, "g/m3", "%.1f" % rho, IF + "＋理想気体")
    rec("表 空気線図の抜き出し", "飽和 %d ℃" % t, "x_s", xs, "kg/kg(DA)", "%.4f" % xs, CP)

# ---------------------------------------------------------------- 表：空気線図の抜き出し（本文）
pr("== 表 空気線図の抜き出し（x〔g/kg(DA)〕・h〔kJ/kg(DA)〕・露点・湿球）")
STATES = [(25, 0.6), (30, 0.7), (15, 1.0), (0, 0.8), (20, 0.5), (20, 0.21), (30, 0.5), (26, 0.5), (20, 0.6)]
for t, phi in STATES:
    W_ = HA('W', t, phi); h_ = HA('H', t, phi) / 1e3; D_ = HA('D', t, phi) - K0; B_ = HA('B', t, phi) - K0; V_ = HA('V', t, phi)
    xi = x_id(t, phi); hi = h_id(t, xi)
    pr("  %2d ℃ %3d %%  CoolProp: x=%.5f h=%.2f 露点=%.2f 湿球=%.2f v=%.4f   式: x=%.5f h=%.2f 露点(IF97)=%.2f"
       % (t, phi * 100, W_, h_, D_, B_, V_, xi, hi, dew_if(phi * ps0(t))))
    st = "湿り空気 %d ℃・%d %%" % (t, round(phi * 100))
    rec("表 空気線図の抜き出し", st, "x", W_, "kg/kg(DA)", "%.4f" % W_, CP)
    rec("表 空気線図の抜き出し", st, "h", h_, "kJ/kg(DA)", "%.1f" % h_, CP)
    rec("表 空気線図の抜き出し", st, "露点", D_, "℃", "%.1f" % D_, CP)
    rec("表 空気線図の抜き出し", st, "湿球温度", B_, "℃", "%.1f" % B_, CP)
    rec("表 空気線図の抜き出し", st, "比体積", V_, "m3/kg(DA)", "%.3f" % V_, CP)
    rec("例題（式で計算）", st, "x（式）", xi, "kg/kg(DA)", "%.4f" % xi, IF + "＋式 0.622p_v/(p−p_v)")
    rec("例題（式で計算）", st, "h（式）", hi, "kJ/kg(DA)", "%.1f" % hi, "式 1.006θ＋x(2501＋1.86θ)")

# ---------------------------------------------------------------- 例題
pr("== 例題")
pv = 0.6 * ps0(25)
pr("例1 25 ℃60 %%：p_s=%.3f p_v=%.3f kPa → 露点（IF97 で探す）%.2f ℃（CoolProp %.2f）" % (ps0(25), pv, dew_if(pv), HA('D', 25, 0.6) - K0))
pr("  はさむ：16 ℃ %.3f、17 ℃ %.3f、16.7 ℃ %.3f kPa" % (ps0(16), ps0(17), ps0(16.7)))
pvj = 0.5 * ps0(30)
pr("  じぶんで 30 ℃50 %%：p_v=%.3f → 露点 %.2f ℃（CoolProp %.2f）" % (pvj, dew_if(pvj), HA('D', 30, 0.5) - K0))
pr("  はさむ：18 ℃ %.3f、19 ℃ %.3f" % (ps0(18), ps0(19)))
x25 = x_id(25, 0.6)
pr("例2 x＝0.622×%.4f/(101.325−%.4f)＝%.5f（線図 %.5f）" % (pv, pv, x25, HA('W', 25, 0.6)))
xj = x_id(20, 0.6); pr("  じぶんで 20 ℃60 %%：p_v=%.4f x=%.5f（線図 %.5f）" % (0.6 * ps0(20), xj, HA('W', 20, 0.6)))
h25 = h_id(25, x25)
pr("例3 h=1.006×25+x(2501+1.86×25) = %.3f + %.3f = %.2f（線図 %.2f）" % (1.006 * 25, x25 * (2501 + 1.86 * 25), h25, HA('H', 25, 0.6) / 1e3))
hj = h_id(20, xj); pr("  じぶんで 20 ℃60 %%：h=%.2f（線図 %.2f）" % (hj, HA('H', 20, 0.6) / 1e3))
# 例4 冷却除湿
x30 = x_id(30, 0.7); x15 = x_id(15, 1.0)
h30 = h_id(30, x30); h15 = h_id(15, x15)
hw = (x30 - x15) * 4.19 * 15   # 出ていく水の比エンタルピー（15 ℃の水）
pr("例4 30 ℃70 %%：x=%.5f h=%.2f → 15 ℃飽和 x=%.5f h=%.2f：Δx=%.2f g/kg、Δh=%.2f、水が持ち去る %.2f → とる熱 %.2f"
   % (x30, h30, x15, h15, (x30 - x15) * 1e3, h30 - h15, hw, h30 - h15 - hw))
cpx = (HA('W', 30, 0.7) - HA('W', 15, 1.0)) * 1e3; cph = (HA('H', 30, 0.7) - HA('H', 15, 1.0)) / 1e3
pr("  線図：Δx=%.2f g/kg、Δh=%.2f" % (cpx, cph))
rec("例題4", "30 ℃70 %→15 ℃飽和", "Δx（式）", (x30 - x15) * 1e3, "g/kg(DA)", "%.1f" % ((x30 - x15) * 1e3), "式")
rec("例題4", "30 ℃70 %→15 ℃飽和", "Δh（式）", h30 - h15, "kJ/kg(DA)", "%.1f" % (h30 - h15), "式")
rec("例題4", "30 ℃70 %→15 ℃飽和", "Δx（線図）", cpx, "g/kg(DA)", "%.1f" % cpx, CP)
rec("例題4", "30 ℃70 %→15 ℃飽和", "Δh（線図）", cph, "kJ/kg(DA)", "%.1f" % cph, CP)
# 1 時間あたり：部屋の空気 500 m3/h をエアコンが通す（比体積 0.885）
G = 500 / HA('V', 30, 0.7)
pr("  500 m3/h（湿り空気）→ 乾いた空気 %.0f kg/h：水 %.2f kg/h、熱 %.2f kW" % (G, G * (x30 - x15), G * (h30 - h15 - hw) / 3600))
x26 = x_id(26, 0.5); x13 = x_id(13, 1.0)
pr("  じぶんで 26 ℃50 %%（x=%.5f h=%.2f）→ 13 ℃飽和（x=%.5f h=%.2f）：%s" % (x26, h_id(26, x26), x13, h_id(13, x13),
   "Δx=%.2f g/kg Δh=%.2f 露点=%.2f" % ((x26 - x13) * 1e3, h_id(26, x26) - h_id(13, x13), dew_if(0.5 * ps0(26)))))
# 例5 冬の換気
pv0 = 0.8 * ps0(0)
pr("例5 0 ℃80 %%：p_v=%.4f → 20 ℃で φ=%.1f %%（線図 %.1f %%）" % (pv0, pv0 / ps0(20) * 100,
   HAPropsSI('R', 'T', 293.15, 'P', P0, 'W', HA('W', 0, 0.8)) * 100))
x0 = x_id(0, 0.8); x2050 = x_id(20, 0.5)
pr("  加湿して 20 ℃50 %%：Δx=%.2f g/kg（x0=%.5f x=%.5f）" % ((x2050 - x0) * 1e3, x0, x2050))
pvj5 = 0.6 * ps0(5); pr("  じぶんで 5 ℃60 %% → 22 ℃：φ=%.1f %%" % (pvj5 / ps0(22) * 100))
# 例10 湿球温度（線図）と h 一定の線
hb = HA('H', 25, 0.6)
tw = HAPropsSI('T', 'H', hb, 'P', P0, 'R', 1.0) - K0
pr("例10 25 ℃60 %%：湿球 %.2f ℃、h 一定の線が飽和線に当たる温度 %.2f ℃" % (HA('B', 25, 0.6) - K0, tw))
pr("  じぶんで 30 ℃50 %%：湿球 %.2f ℃" % (HA('B', 30, 0.5) - K0))
rec("例題10", "湿り空気 25 ℃・60 %", "湿球温度", HA('B', 25, 0.6) - K0, "℃", "%.1f" % (HA('B', 25, 0.6) - K0), CP)
rec("例題10 じぶんでとこう", "湿り空気 30 ℃・50 %", "湿球温度", HA('B', 30, 0.5) - K0, "℃", "%.1f" % (HA('B', 30, 0.5) - K0), CP)
# 例11 窓
pr("例11 20 ℃50 %%：露点 %.2f ℃（はさむ 9 ℃ %.4f、10 ℃ %.4f、p_v=%.4f）" % (dew_if(0.5 * ps0(20)), ps0(9), ps0(10), 0.5 * ps0(20)))
pr("  じぶんで 22 ℃40 %%：露点 %.2f ℃（p_v=%.4f、7 ℃ %.4f、8 ℃ %.4f）" % (dew_if(0.4 * ps0(22)), 0.4 * ps0(22), ps0(7), ps0(8)))
rec("例題11 じぶんでとこう", "湿り空気 22 ℃・40 %", "露点", dew_if(0.4 * ps0(22)), "℃", "%.1f" % dew_if(0.4 * ps0(22)), IF)
# 例12 中学の表
rho25 = ps0(25) * 1e3 / (461.5 * 298.15) * 1e3
pr("例12 25 ℃ 飽和水蒸気量 %.2f g/m3、13.8 → %.1f %%" % (rho25, 13.8 / rho25 * 100))
rho20 = ps0(20) * 1e3 / (461.5 * 293.15) * 1e3; rho10 = ps0(10) * 1e3 / (461.5 * 283.15) * 1e3
pr("  じぶんで 20 ℃ 飽和 %.2f、8.7 g/m3 → %.1f %%、露点：10 ℃ %.2f g/m3（9 ℃ %.2f）" % (rho20, 8.7 / rho20 * 100, rho10, ps0(9) * 1e3 / (461.5 * 282.15) * 1e3))
# 中学の表のやり方と分圧のやり方は同じ答えになる（温度一定なら）
# 例13 マグヌス
for t in (0, 10, 25, 40):
    mag = 0.61094 * math.exp(17.625 * t / (t + 243.04))
    pr("例13 %2d ℃ IF97 %.4f マグヌス %.4f（差 %.2f %%）" % (t, ps0(t), mag, (mag / ps0(t) - 1) * 100))
rec("例題13", "飽和 25 ℃", "p_s（マグヌスの式）", 0.61094 * math.exp(17.625 * 25 / (25 + 243.04)), "kPa", "3.162", "Alduchov・Eskridge（1996）の係数")

# ---------------------------------------------------------------- 冷凍サイクル
pr("== 冷凍サイクル")
def cycle(fl, te, tc, sh=0.0):
    # sh：蒸発器の出口の過熱度〔K〕（0 なら飽和蒸気）。R600a は飽和蒸気から断熱圧縮すると出口が湿るので、冷蔵庫の例は 10 K にする
    Te, Tc = te + K0, tc + K0
    p1 = PropsSI('P', 'T', Te, 'Q', 1, fl)
    if sh > 0:
        h1 = PropsSI('H', 'T', Te + sh, 'P', p1, fl); s1 = PropsSI('S', 'T', Te + sh, 'P', p1, fl)
    else:
        h1 = PropsSI('H', 'T', Te, 'Q', 1, fl); s1 = PropsSI('S', 'T', Te, 'Q', 1, fl)
    p2 = PropsSI('P', 'T', Tc, 'Q', 0, fl)
    h2 = PropsSI('H', 'P', p2, 'S', s1, fl); T2 = PropsSI('T', 'P', p2, 'S', s1, fl)
    h3 = PropsSI('H', 'T', Tc, 'Q', 0, fl); h4 = h3
    x4 = PropsSI('Q', 'P', p1, 'H', h4, fl)
    q2 = PropsSI('Q', 'P', p2, 'S', s1, fl)   # −1 なら過熱（湿っていない）
    hc_g = PropsSI('H', 'T', Tc, 'Q', 1, fl)
    qe = h1 - h4; w = h2 - h1
    return dict(p1=p1 / 1e6, p2=p2 / 1e6, h1=h1 / 1e3, s1=s1 / 1e3, h2=h2 / 1e3, T2=T2 - K0, h3=h3 / 1e3, h4=h4 / 1e3, x4=x4,
                qe=qe / 1e3, w=w / 1e3, qc=(h2 - h3) / 1e3, cop=qe / w, carnot=Te / (Tc - Te), hcg=hc_g / 1e3, q2=q2, T1=Te + sh - K0)
for fl in ("R32", "R134a", "R600a"):
    href = PropsSI('H', 'T', K0, 'Q', 0, fl) / 1e3
    tcrit = PropsSI('Tcrit', fl) - K0; pcrit = PropsSI('pcrit', fl) / 1e6
    pr("  %s：0 ℃の飽和液の h=%.2f kJ/kg（基準）、臨界 %.2f ℃ %.3f MPa" % (fl, href, tcrit, pcrit))
    rec("表 冷媒", fl, "臨界温度", tcrit, "℃", "%.1f" % tcrit, CPR)
    rec("表 冷媒", fl, "臨界圧力", pcrit, "MPa", "%.2f" % pcrit, CPR)
for fl in ("R744",):
    pr("  R744 臨界 %.2f ℃" % (PropsSI('Tcrit', fl) - K0))
C6 = cycle("R32", 5, 45)
pr("例6 R32 5/45：" + " ".join("%s=%.4g" % kv for kv in C6.items()))
for k, u, f in [('p1', 'MPa', '%.3f'), ('p2', 'MPa', '%.3f'), ('h1', 'kJ/kg', '%.1f'), ('s1', 'kJ/(kg·K)', '%.4f'), ('h2', 'kJ/kg', '%.1f'),
                ('T2', '℃', '%.1f'), ('h3', 'kJ/kg', '%.1f'), ('x4', '-', '%.3f'), ('qe', 'kJ/kg', '%.1f'), ('w', 'kJ/kg', '%.1f'),
                ('qc', 'kJ/kg', '%.1f'), ('cop', '-', '%.2f'), ('carnot', '-', '%.2f')]:
    rec("例題6・8", "R32 理論サイクル 蒸発5 ℃・凝縮45 ℃", k, C6[k], u, f % C6[k], CPR)
C6b = cycle("R32", 5, 40); C6c = cycle("R32", 6, 45); C6d = cycle("R32", 10, 40)
pr("  じぶんで R32 5/40：COP=%.3f p2=%.3f h1=%.1f h2=%.1f h3=%.1f T2=%.1f" % (C6b['cop'], C6b['p2'], C6b['h1'], C6b['h2'], C6b['h3'], C6b['T2']))
rec("例題6 じぶんでとこう", "R32 理論サイクル 蒸発5 ℃・凝縮40 ℃", "COP", C6b['cop'], "-", "%.2f" % C6b['cop'], CPR)
for k in ('h1', 'h2', 'h3', 'p2'):
    rec("例題6 じぶんでとこう", "R32 理論サイクル 蒸発5 ℃・凝縮40 ℃", k, C6b[k], "", "%.4g" % C6b[k], CPR)
pr("  蒸発を 6 ℃に：COP=%.3f（+%.1f %%）" % (C6c['cop'], (C6c['cop'] / C6['cop'] - 1) * 100))
pr("  温度差を半分（10/40 → 差30、5/45 → 差40 …）参考：10/40 COP=%.3f" % C6d['cop'])
# 温度差と COP の表（2倍にすると）
for te, tc in [(5, 45), (10, 40), (15, 35), (20, 30)]:
    c_ = cycle("R32", te, tc)
    pr("  表 R32 %2d/%2d（差 %2d K）COP=%.2f カルノー=%.2f" % (te, tc, tc - te, c_['cop'], c_['carnot']))
    rec("② 表（温度差と COP）", "R32 蒸発%d ℃・凝縮%d ℃" % (te, tc), "COP", c_['cop'], "-", "%.1f" % c_['cop'], CPR)
# 例7 冷蔵庫
C7a = cycle("R600a", -25, 40, 10); C7b = cycle("R134a", -25, 40, 10)
C7w = cycle("R600a", -25, 40); pr("  参考 R600a 過熱度0：出口の乾き度 %.3f（湿る）" % C7w["q2"])
for nm, c_ in (("R600a", C7a), ("R134a", C7b)):
    pr("例7 %s −25/40：" % nm + " ".join("%s=%.4g" % kv for kv in c_.items()))
    for k in ('p1', 'p2', 'h1', 'h2', 'h3', 'qe', 'w', 'cop', 'T2', 'carnot'):
        rec("例題7", "%s 理論サイクル 蒸発−25 ℃・凝縮40 ℃・過熱度10 K" % nm, k, c_[k], "", "%.4g" % c_[k], CPR)
C7j = cycle("R600a", -20, 35, 10)
pr("  じぶんで R600a −20/35：COP=%.3f h1=%.1f h2=%.1f h3=%.1f" % (C7j['cop'], C7j['h1'], C7j['h2'], C7j['h3']))
rec("例題7 じぶんでとこう", "R600a 理論サイクル 蒸発−20 ℃・凝縮35 ℃・過熱度10 K", "COP", C7j['cop'], "-", "%.2f" % C7j['cop'], CPR)
# 例8 流量
md = 2.8 / C6['qe']; P = 2.8 / C6['cop']
pr("例8 2.8 kW：ṁ=%.4f kg/s=%.1f g/s、圧縮機 %.3f kW、凝縮器 %.3f kW" % (md, md * 1e3, P, md * C6['qc']))
md2 = 4.0 / C6['qe']; pr("  じぶんで 4.0 kW：%.1f g/s、圧縮機 %.2f kW" % (md2 * 1e3, 4.0 / C6['cop']))
# 暖房（COP_H＝COP_R＋1）
pr("  暖房として：COP_H=%.2f（凝縮 qc/w=%.2f）" % (C6['cop'] + 1, C6['qc'] / C6['w']))
# 冷媒の飽和表の抜き出し（R32）
pr("== 表 R32 の飽和表（抜き出し）")
for t in [-20, -10, 0, 5, 10, 20, 30, 40, 45, 50]:
    p_ = PropsSI('P', 'T', t + K0, 'Q', 0, 'R32') / 1e6
    hl = PropsSI('H', 'T', t + K0, 'Q', 0, 'R32') / 1e3; hg = PropsSI('H', 'T', t + K0, 'Q', 1, 'R32') / 1e3
    sg = PropsSI('S', 'T', t + K0, 'Q', 1, 'R32') / 1e3
    pr("  %3d ℃  p=%.4f MPa  h'=%.1f h''=%.1f s''=%.4f" % (t, p_, hl, hg, sg))
    st = "R32 飽和 %d ℃" % t
    rec("表 R32 飽和表", st, "p", p_, "MPa", "%.3f" % p_, CPR)
    rec("表 R32 飽和表", st, "h′", hl, "kJ/kg", "%.1f" % hl, CPR)
    rec("表 R32 飽和表", st, "h″", hg, "kJ/kg", "%.1f" % hg, CPR)
    rec("表 R32 飽和表", st, "s″", sg, "kJ/(kg·K)", "%.4f" % sg, CPR)
# 45 ℃ の過熱の R32（s 一定）
pr("  R32 2.79 MPa で s=%.4f のとき T=%.1f h=%.1f" % (C6['s1'], C6['T2'], C6['h2']))
# p-h 線図の座標（R32 の飽和線）
pr("== 図 R32 の p-h（飽和線：log p は MPa）")
pts = []
for t in [-40, -20, 0, 20, 40, 60, 70, 76, 78.0]:
    hl = PropsSI('H', 'T', t + K0, 'Q', 0, 'R32') / 1e3; hg = PropsSI('H', 'T', t + K0, 'Q', 1, 'R32') / 1e3
    p_ = PropsSI('P', 'T', t + K0, 'Q', 0, 'R32') / 1e6
    pr("  %5.1f ℃ p=%.4f h'=%.1f h''=%.1f" % (t, p_, hl, hg))
pr("  臨界 h=%.1f p=%.3f" % (PropsSI('H', 'T', PropsSI('Tcrit', 'R32'), 'P', PropsSI('pcrit', 'R32'), 'R32') / 1e3, PropsSI('pcrit', 'R32') / 1e6))
# 等エントロピー線（圧縮の線）
for p_ in [0.951, 1.5, 2.0, 2.5, 2.795]:
    pr("  s=s1 の線：p=%.3f MPa h=%.1f" % (p_, PropsSI('H', 'P', p_ * 1e6, 'S', C6['s1'] * 1e3, 'R32') / 1e3))

# ---------------------------------------------------------------- 例9 冷房負荷
people = 3 * 70; win = 6.3 * 2 * 8; equip = 300
pr("例9 人 %d W＋窓 %.1f W＋機器 %d W＝%.1f W" % (people, win, equip, people + win + equip))
pr("  じぶんで 人4・窓3 m2・ΔT 7 K・機器 200 W：%.1f W" % (4 * 70 + 6.3 * 3 * 7 + 200))
pr("  例9 の負荷を COP 5.3 で：電気 %.0f W（実際の COP 3 なら %.0f W）" % ((people + win + equip) / C6['cop'], (people + win + equip) / 3))
# 人の潜熱（汗・息の水）の除湿：45 W/人 → 水の量
pr("  人の潜熱 45 W は 1 時間に水 %.0f g（蒸発熱 2440 kJ/kg）" % (45 * 3600 / 2440))

# ---------------------------------------------------------------- 雲のできる高さ（⑥ のもっと知りたい）
pr("== 雲のできる高さ（25 ℃60 % の空気を、乾燥断熱で上げる。x は一定）")
T = 25 + K0; p = P0; z = 0.0; x = HA('W', 25, 0.6); dz = 1.0
Rs, cp, g = 287.0, 1005.0, 9.8
while True:
    pv_ = p * x / (0.622 + x) / 1e3
    td = dew_if(pv_)
    if T - K0 <= td:
        break
    rho = p / (Rs * T)
    p -= rho * g * dz
    T -= g / cp * dz
    z += dz
pr("  雲の底 %.0f m、そのときの温度 %.1f ℃・圧力 %.1f kPa（目安の式 125 m×(25−16.7)＝%.0f m）" % (z, T - K0, p / 1e3, 125 * (25 - (HA('D', 25, 0.6) - K0))))
rec("⑥ 本文", "25 ℃・60 % の空気を持ち上げたときの雲の底", "高さ", z, "m", "%.0f" % z, IF + "＋乾燥断熱（9.8 K/km）")

# ---------------------------------------------------------------- 章末問題
pr("== 章末問題")
pvA = 0.7 * ps0(28); pr("基本1 28 ℃70 %%：p_v=%.3f 露点 %.2f（はさむ 22 ℃ %.3f、23 ℃ %.3f）" % (pvA, dew_if(pvA), ps0(22), ps0(23)))
xA = x_id(28, 0.7); pr("基本2 x=%.5f h=%.2f（線図 x=%.5f h=%.2f）" % (xA, h_id(28, xA), HA('W', 28, 0.7), HA('H', 28, 0.7) / 1e3))
rec("章末 基本1・2", "湿り空気 28 ℃・70 %", "露点", dew_if(pvA), "℃", "%.1f" % dew_if(pvA), IF)
rec("章末 基本1・2", "湿り空気 28 ℃・70 %", "x（式）", xA, "kg/kg(DA)", "%.4f" % xA, "式")
rec("章末 基本1・2", "湿り空気 28 ℃・70 %", "h（式）", h_id(28, xA), "kJ/kg(DA)", "%.1f" % h_id(28, xA), "式")
rho30 = ps0(30) * 1e3 / (461.5 * 303.15) * 1e3; pr("基本3 30 ℃ 飽和水蒸気量 %.2f、18.2 g/m3 → %.1f %%" % (rho30, 18.2 / rho30 * 100))
pvB = 0.4 * ps0(-0.0 + 0) if False else 0.9 * ps0(5); pr("基本4 5 ℃90 %% を 20 ℃へ：φ=%.1f %%" % (pvB / ps0(20) * 100))
c_ = cycle("R32", 0, 50); pr("基本5 R32 0/50：COP=%.3f カルノー %.3f h1=%.1f h2=%.1f h3=%.1f p1=%.3f p2=%.3f" % (c_['cop'], c_['carnot'], c_['h1'], c_['h2'], c_['h3'], c_['p1'], c_['p2']))
for k in ('h1', 'h2', 'h3', 'cop', 'carnot', 'p1', 'p2'):
    rec("章末 基本5", "R32 理論サイクル 蒸発0 ℃・凝縮50 ℃", k, c_[k], "", "%.4g" % c_[k], CPR)
pr("基本6 冷房 3.6 kW・COP 4.5：電気 %.2f kW、1日8時間で %.1f kWh" % (3.6 / 4.5, 3.6 / 4.5 * 8))
# チャレンジ
x32 = x_id(32, 0.6); x14 = x_id(14, 1.0)
G = 600 / HA('V', 32, 0.6)
pr("チャレンジ1 32 ℃60 %%→14 ℃飽和、600 m3/h：G=%.0f kg/h Δx=%.2f g/kg 水 %.2f kg/h Δh=%.2f 熱 %.2f kW（水の持ち去り %.3f kW を引くと %.2f）"
   % (G, (x32 - x14) * 1e3, G * (x32 - x14), h_id(32, x32) - h_id(14, x14), G * (h_id(32, x32) - h_id(14, x14)) / 3600,
      G * (x32 - x14) * 4.19 * 14 / 3600, G * (h_id(32, x32) - h_id(14, x14) - (x32 - x14) * 4.19 * 14) / 3600))
rec("章末 チャレンジ1", "32 ℃60 %→14 ℃飽和", "x（式）", x32, "kg/kg(DA)", "%.4f / %.4f" % (x32, x14), "式")
pr("  比体積（線図）32 ℃60 %%：%.4f m3/kg(DA)" % HA('V', 32, 0.6))
c2 = cycle("R32", 5, 45); c3 = cycle("R32", 5, 55)
pr("チャレンジ2 夏の日よけ：凝縮 45→55 ℃ で COP %.2f→%.2f（電気 %.0f %% 増）" % (c2['cop'], c3['cop'], (c2['cop'] / c3['cop'] - 1) * 100))
rec("章末 チャレンジ2", "R32 理論サイクル 蒸発5 ℃・凝縮55 ℃", "COP", c3['cop'], "-", "%.2f" % c3['cop'], CPR)
for k in ('h1', 'h2', 'h3', 'p2'):
    rec("章末 チャレンジ2", "R32 理論サイクル 蒸発5 ℃・凝縮55 ℃", k, c3[k], "", "%.4g" % c3[k], CPR)
# チャレンジ3：冬の窓の結露 ガラス表面 8 ℃、室温 20 ℃ で何 % まで？
pr("チャレンジ3 表面 8 ℃・室温 20 ℃：φ 上限 %.1f %%（8 ℃ p_s=%.4f）" % (ps0(8) / ps0(20) * 100, ps0(8)))
pr("  表面 12 ℃なら %.1f %%" % (ps0(12) / ps0(20) * 100))

# ---------------------------------------------------------------- 空気線図の線（本文の小さな図。シミュレーションの出力）
pr("== 図 空気線図の線（x は g/kg(DA)）")
for phi in (0.2, 0.4, 0.6, 0.8, 1.0):
    pr("  φ=%d%%: " % (phi * 100) + " ".join("(%d,%.2f)" % (t, HA('W', t, phi) * 1e3) for t in range(0, 41, 2)))
for hh in (20, 40, 60, 80, 100):
    tsat_h = HAPropsSI('T', 'H', hh * 1e3, 'P', P0, 'R', 1.0) - K0
    x_at = HAPropsSI('W', 'H', hh * 1e3, 'P', P0, 'R', 1.0) * 1e3
    t_end = HAPropsSI('T', 'H', hh * 1e3, 'P', P0, 'W', 0.0) - K0
    pr("  h=%d：飽和線 (%.2f,%.2f) → x=0 (%.2f,0)" % (hh, tsat_h, x_at, t_end))
for tw in (10, 15, 20, 25):
    a = (tw, HAPropsSI('W', 'T', tw + K0, 'P', P0, 'R', 1.0) * 1e3)
    tend = HAPropsSI('T', 'B', tw + K0, 'P', P0, 'R', 0.05) - K0
    b = (tend, HAPropsSI('W', 'T', tend + K0, 'P', P0, 'R', 0.05) * 1e3)
    pr("  湿球 %d：(%.2f,%.2f)—(%.2f,%.2f)" % (tw, a[0], a[1], b[0], b[1]))

with open(os.path.join(HERE, "states_p2_09.csv"), "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["章", "使った所", "状態点", "量", "値（計算のまま）", "本文の値（丸め）", "単位", "出典"])
    w.writerows(rows)
pr("CSV:", len(rows), "行")
