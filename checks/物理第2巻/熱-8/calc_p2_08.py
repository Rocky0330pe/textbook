# -*- coding: utf-8 -*-
"""熱-8（水蒸気で回す：蒸気表とランキンサイクル）の数値をすべて計算する（組 熱W5）。

使い方：python3 -I calc_p2_08.py            → 画面に例題・表・図の数を出し、
        同じフォルダに states_p2_08.csv（章で使った状態点と値の一覧）を書く。
水・水蒸気：iapws 1.5.5 の IAPWS97（IAPWS-IF97 の式）。CoolProp 8.0 の IAPWS-95 と照らし合わせる（最後に最大の差を出す）。
本文の丸め：温度 ℃ は小数2けた（本文では1けた）、圧力は4けた、h は小数1けた〔kJ/kg〕、s は小数4けた〔kJ/(kg·K)〕、
v′ は小数6けた、v″ は4けた〔m^3/kg〕。巻末の蒸気表も同じ丸めにしてもらう（報告に書く）。
"""
import csv, math, os
from iapws import IAPWS97 as W
from CoolProp.CoolProp import PropsSI

K0 = 273.15
HERE = os.path.dirname(os.path.abspath(__file__))
rows = []   # CSV の行

def rec(where, state, prop, val, unit, shown, src="IAPWS-IF97（iapws 1.5.5）"):
    rows.append([ "熱-8", where, state, prop, repr(val), shown, unit, src ])

def sat_p(P):   # P〔MPa〕の飽和
    return W(P=P, x=0), W(P=P, x=1)
def sat_t(Tc):
    return W(T=Tc + K0, x=0), W(T=Tc + K0, x=1)

def pr(*a):
    print(*a)

# ---------------------------------------------------------------- 表1：温度基準の飽和蒸気圧（本文の表）
pr("== 表1 飽和蒸気圧（温度基準）")
for Tc in [0.01, 10, 20, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 350]:
    l, g = sat_t(Tc)
    kpa = l.P * 1e3
    s = ("%.4f" % kpa) if kpa < 10 else ("%.3f" % kpa if kpa < 100 else ("%.2f" % kpa if kpa < 1000 else "%.0f" % kpa))
    pr("  %6.2f ℃  p_s = %s kPa   L = %.1f kJ/kg" % (Tc, s, g.h - l.h))
    rec("表 飽和蒸気圧", "飽和 %g ℃" % Tc, "p_s", kpa, "kPa", s)
    rec("表 飽和蒸気圧", "飽和 %g ℃" % Tc, "h″−h′", g.h - l.h, "kJ/kg", "%.1f" % (g.h - l.h))
crit_T, crit_p = 647.096, 22.064
pr("  臨界点 %.3f ℃ %.3f MPa（IF97 の定数）" % (crit_T - K0, crit_p))
rec("表 飽和蒸気圧", "臨界点", "T", crit_T - K0, "℃", "373.95")
rec("表 飽和蒸気圧", "臨界点", "p", crit_p, "MPa", "22.064")
rec("表 飽和蒸気圧", "三重点", "T", 0.01, "℃", "0.01")
rec("表 飽和蒸気圧", "三重点", "p", 0.611657, "kPa", "0.6117")

# ---------------------------------------------------------------- 表2：圧力基準の飽和表
pr("== 表2 飽和表（圧力基準）")
PLIST = [0.01, 0.1, 0.2, 0.5, 1.0, 2.0, 4.0, 10.0]
for P in PLIST:
    l, g = sat_p(P)
    pr("  %6g MPa  %7.2f ℃  v'=%.6f v''=%.4g  h'=%.1f h''=%.1f  s'=%.4f s''=%.4f" % (P, l.T - K0, l.v, g.v, l.h, g.h, l.s, g.s))
    st = "飽和 %g MPa" % P
    rec("表 飽和表（圧力基準）", st, "T", l.T - K0, "℃", "%.2f" % (l.T - K0))
    rec("表 飽和表（圧力基準）", st, "v′", l.v, "m3/kg", "%.6f" % l.v)
    rec("表 飽和表（圧力基準）", st, "v″", g.v, "m3/kg", "%.4g" % g.v)
    rec("表 飽和表（圧力基準）", st, "h′", l.h, "kJ/kg", "%.1f" % l.h)
    rec("表 飽和表（圧力基準）", st, "h″", g.h, "kJ/kg", "%.1f" % g.h)
    rec("表 飽和表（圧力基準）", st, "s′", l.s, "kJ/(kg·K)", "%.4f" % l.s)
    rec("表 飽和表（圧力基準）", st, "s″", g.s, "kJ/(kg·K)", "%.4f" % g.s)

# ---------------------------------------------------------------- 表3：過熱蒸気表
pr("== 表3 過熱蒸気表")
SUP = {1.0: [200, 250, 300, 350, 400, 500], 4.0: [300, 400, 500, 600], 10.0: [350, 400, 500, 600]}
for P, Ts in SUP.items():
    for Tc in Ts:
        s_ = W(P=P, T=Tc + K0)
        pr("  %4g MPa %3d ℃  v=%.4g h=%.1f s=%.4f" % (P, Tc, s_.v, s_.h, s_.s))
        st = "過熱 %g MPa・%d ℃" % (P, Tc)
        rec("表 過熱蒸気表", st, "v", s_.v, "m3/kg", "%.4g" % s_.v)
        rec("表 過熱蒸気表", st, "h", s_.h, "kJ/kg", "%.1f" % s_.h)
        rec("表 過熱蒸気表", st, "s", s_.s, "kJ/(kg·K)", "%.4f" % s_.s)

# ---------------------------------------------------------------- 例題
pr("== 例題")
def tsat(PkPa):
    return W(P=PkPa / 1e3, x=0).T - K0
# 例1 富士山頂
t1 = tsat(63); pr("例1 63 kPa の飽和温度 %.2f ℃（1気圧 %.2f ℃）" % (t1, tsat(101.325)))
rec("例題1", "飽和 63 kPa", "T", t1, "℃", "87.18（答え 約87 ℃）")
rec("例題1", "飽和 101.325 kPa", "T", tsat(101.325), "℃", "99.97")
# 例1 の確かめ：1 km 上がるごとの沸点の下がり方（目安）
tj = tsat(34); pr("  じぶんで：34 kPa → %.1f ℃" % tj)
rec("例題1 じぶんでとこう", "飽和 34 kPa", "T", tj, "℃", "72.0（答え 約72 ℃）")
# 例2 1 MPa
l, g = sat_p(1.0); pr("例2 1 MPa：%.2f ℃ h'=%.1f h''=%.1f L=%.1f" % (l.T - K0, l.h, g.h, g.h - l.h))
l5, g5 = sat_p(0.5); pr("  じぶんで 0.5 MPa：%.2f ℃ h'=%.1f h''=%.1f L=%.1f" % (l5.T - K0, l5.h, g5.h, g5.h - l5.h))
rec("例題2", "飽和 1 MPa", "h″−h′", g.h - l.h, "kJ/kg", "2014.4")
rec("例題2 じぶんでとこう", "飽和 0.5 MPa", "h″−h′", g5.h - l5.h, "kJ/kg", "2107.9")
# 例3 直線補間
a, b = tsat(100), tsat(200)
lin = a + (b - a) * (150 - 100) / (200 - 100)
pr("例3 100 kPa %.2f、200 kPa %.2f → 150 kPa 補間 %.2f、本当 %.2f、ずれ %.2f K" % (a, b, lin, tsat(150), tsat(150) - lin))
rec("例題3", "飽和 150 kPa（補間）", "T", lin, "℃", "109.9")
rec("例題3", "飽和 150 kPa", "T", tsat(150), "℃", "111.35")
a2, b2 = tsat(1000), tsat(2000); lin2 = (a2 + b2) / 2
pr("  じぶんで 1・2 MPa → 1.5 MPa 補間 %.2f、本当 %.2f" % (lin2, tsat(1500)))
rec("例題3 じぶんでとこう", "飽和 1.5 MPa（補間）", "T", lin2, "℃", "196.1")
rec("例題3 じぶんでとこう", "飽和 1.5 MPa", "T", tsat(1500), "℃", "198.30")
# 3-12 につなぐ：温度で補間する飽和蒸気圧の失敗（20 と 40 ℃ から 30 ℃）
p20, p40, p30 = [W(T=t + K0, x=0).P * 1e3 for t in (20, 40, 30)]
pr("  補間の失敗：20・40 ℃ → 30 ℃ %.3f kPa（本当 %.3f）、対数で補間 %.3f" % ((p20 + p40) / 2, p30, math.sqrt(p20 * p40)))
rec("③ 本文", "飽和 30 ℃（20・40 ℃ から直線補間）", "p_s", (p20 + p40) / 2, "kPa", "4.862")
rec("③ 本文", "飽和 30 ℃（対数で補間）", "p_s", math.sqrt(p20 * p40), "kPa", "4.156")
# 例4 湿り蒸気
l10, g10 = sat_p(0.01)
h4 = l10.h + 0.9 * (g10.h - l10.h)
pr("例4 10 kPa x=0.9：h=%.1f（h'=%.1f h''=%.1f）" % (h4, l10.h, g10.h))
rec("例題4", "湿り蒸気 10 kPa・x=0.9", "h", h4, "kJ/kg", "2344.7（答え 約2345）")
l1, g1 = sat_p(0.1)
h4j = l1.h + 0.95 * (g1.h - l1.h)
pr("  じぶんで 100 kPa x=0.95：h=%.1f（h'=%.1f h''=%.1f）" % (h4j, l1.h, g1.h))
rec("例題4 じぶんでとこう", "湿り蒸気 100 kPa・x=0.95", "h", h4j, "kJ/kg", "%.0f" % h4j)
# 乾き度から体積
v4 = l10.v + 0.9 * (g10.v - l10.v); pr("  10 kPa x=0.9 の v=%.3f m3/kg" % v4)
rec("② 本文", "湿り蒸気 10 kPa・x=0.9", "v", v4, "m3/kg", "%.2f" % v4)
# 例5 蒸発熱とやかん
l100, g100 = sat_t(100); L100 = g100.h - l100.h
m_k = 1.0 * 60 / L100
pr("例5 100 ℃ L=%.1f → 1.0 kW で1分 %.1f g" % (L100, m_k * 1e3))
rec("例題5", "飽和 100 ℃", "h″−h′", L100, "kJ/kg", "2256.5（答え 約2260）")
rec("例題5", "1.0 kW・60 s で蒸発する量", "m", m_k * 1e3, "g", "%.1f（答え 約27 g）" % (m_k * 1e3))
l200, g200 = sat_t(200); L200 = g200.h - l200.h
pr("  じぶんで 200 ℃ L=%.1f、60 kJ で %.1f g" % (L200, 60 / L200 * 1e3))
rec("例題5 じぶんでとこう", "飽和 200 ℃", "h″−h′", L200, "kJ/kg", "1939.7")

# 例6〜11 ランキン
def rankine(Pb, Tb, Pc, reheat=None, eta_t=1.0):
    s1 = W(P=Pb, T=Tb + K0)
    lc, gc = sat_p(Pc)
    wp = lc.v * (Pb - Pc) * 1e3
    h4_ = lc.h + wp
    if reheat is None:
        s2s = W(P=Pc, s=s1.s)
        h2 = s1.h - eta_t * (s1.h - s2s.h)
        wt = s1.h - h2
        qin = s1.h - h4_
        x2 = (h2 - lc.h) / (gc.h - lc.h)
        return dict(h1=s1.h, s1=s1.s, h2=h2, x2=x2, h3=lc.h, v3=lc.v, wp=wp, h4=h4_, wt=wt, qin=qin,
                    qout=h2 - lc.h, eta=(wt - wp) / qin)
    Pr, Tr = reheat
    sa = W(P=Pr, s=s1.s); sb = W(P=Pr, T=Tr + K0); sc = W(P=Pc, s=sb.s)
    wt = (s1.h - sa.h) + (sb.h - sc.h)
    qin = (s1.h - h4_) + (sb.h - sa.h)
    return dict(h1=s1.h, ha=sa.h, hb=sb.h, sb=sb.s, hc=sc.h, xc=sc.x, Ta=sa.T - K0, wp=wp, h4=h4_, wt=wt, qin=qin,
                qout=sc.h - lc.h, eta=(wt - wp) / qin)

R = rankine(10, 500, 0.01)
pr("例6 ランキン 10 MPa 500 ℃→10 kPa：h1=%.1f s1=%.4f h2=%.1f x2=%.4f h3=%.1f v3=%.6f wp=%.2f h4=%.1f wt=%.1f qin=%.1f qout=%.1f η=%.4f"
   % (R['h1'], R['s1'], R['h2'], R['x2'], R['h3'], R['v3'], R['wp'], R['h4'], R['wt'], R['qin'], R['qout'], R['eta']))
for k, u, f in [('h1', 'kJ/kg', '%.1f'), ('s1', 'kJ/(kg·K)', '%.4f'), ('h2', 'kJ/kg', '%.1f'), ('x2', '-', '%.3f'),
                ('h3', 'kJ/kg', '%.1f'), ('wp', 'kJ/kg', '%.1f'), ('h4', 'kJ/kg', '%.1f'), ('wt', 'kJ/kg', '%.1f'),
                ('qin', 'kJ/kg', '%.1f'), ('qout', 'kJ/kg', '%.1f'), ('eta', '-', '%.3f')]:
    rec("例題6〜8・11", "ランキン 10 MPa・500 ℃→10 kPa", k, R[k], u, f % R[k])
# 例6 の手で計算：2の状態を s から乾き度で
x2h = (R['s1'] - l10.s) / (g10.s - l10.s)
h2h = l10.h + x2h * (g10.h - l10.h)
pr("  手計算 x2=(s1-s')/(s''-s')=%.4f、h2=%.1f" % (x2h, h2h))
# 表の丸めた値で手計算した場合
s1r = round(R['s1'], 4); slr, sgr = round(l10.s, 4), round(g10.s, 4)
hlr, hgr = round(l10.h, 1), round(g10.h, 1)
x2r = (s1r - slr) / (sgr - slr); h2r = hlr + x2r * (hgr - hlr)
h1r = round(R['h1'], 1); wpr = round(l10.v, 6) * (10000 - 10)
h4r = hlr + wpr; wtr = h1r - h2r; qinr = h1r - h4r
pr("  表の値（丸め）で：x2=%.4f h2=%.1f wt=%.1f wp=%.2f qin=%.1f η=%.4f qout=%.1f" % (x2r, h2r, wtr, wpr, qinr, (wtr - wpr) / qinr, h2r - hlr))
# 例7 ポンプ（じぶんで 15 MPa）
wp15 = l10.v * (15000 - 10)
pr("例7 ポンプ %.2f kJ/kg（タービンの %.2f %%）、じぶんで 15 MPa → %.2f" % (R['wp'], R['wp'] / R['wt'] * 100, wp15))
rec("例題7 じぶんでとこう", "ポンプ 10 kPa→15 MPa", "w_P", wp15, "kJ/kg", "%.1f" % wp15)
# 気体の圧縮機と比べる（熱-4 例4：空気 1 kg 圧力比8 で約245 kJ）→ 本文で一言
# 例8 じぶんで：4 MPa 500 ℃ → 10 kPa の乾き度
s45 = W(P=4, T=773.15); s45e = W(P=0.01, s=s45.s)
pr("  例8 じぶんで 4 MPa 500 ℃ s=%.4f → 10 kPa x=%.3f" % (s45.s, s45e.x))
rec("例題8 じぶんでとこう", "4 MPa・500 ℃→10 kPa（断熱可逆）", "x", s45e.x, "-", "%.3f" % s45e.x)
# 例9 再熱
RH = rankine(10, 500, 0.01, reheat=(4, 500))
pr("例9 再熱 4 MPa→500 ℃：ha=%.1f（Ta=%.1f ℃） hb=%.1f sb=%.4f hc=%.1f xc=%.4f wt=%.1f qin=%.1f η=%.4f"
   % (RH['ha'], RH['Ta'], RH['hb'], RH['sb'], RH['hc'], RH['xc'], RH['wt'], RH['qin'], RH['eta']))
for k, u, f in [('ha', 'kJ/kg', '%.1f'), ('Ta', '℃', '%.1f'), ('hb', 'kJ/kg', '%.1f'), ('sb', 'kJ/(kg·K)', '%.4f'),
                ('hc', 'kJ/kg', '%.1f'), ('xc', '-', '%.3f'), ('wt', 'kJ/kg', '%.1f'), ('qin', 'kJ/kg', '%.1f'), ('eta', '-', '%.3f')]:
    rec("例題9", "再熱 10 MPa・500 ℃→4 MPa→500 ℃→10 kPa", k, RH[k], u, f % RH[k])
RH2 = rankine(10, 500, 0.01, reheat=(2, 500))
pr("  じぶんで 再熱 2 MPa：η=%.4f xc=%.4f ha=%.1f hb=%.1f hc=%.1f" % (RH2['eta'], RH2['xc'], RH2['ha'], RH2['hb'], RH2['hc']))
rec("例題9 じぶんでとこう", "再熱 2 MPa→500 ℃", "eta", RH2['eta'], "-", "%.3f" % RH2['eta'])
rec("例題9 じぶんでとこう", "再熱 2 MPa→500 ℃", "x", RH2['xc'], "-", "%.3f" % RH2['xc'])
# 例10 再生
def regen(pf):
    s1 = W(P=10, T=773.15); s6 = W(P=pf, s=s1.s)
    lc = W(P=0.01, x=0); lf = W(P=pf, x=0)
    s2 = W(P=0.01, s=s1.s)
    h4a = lc.h + lc.v * (pf - 0.01) * 1e3
    h4b = lf.h + lf.v * (10 - pf) * 1e3
    y = (lf.h - h4a) / (s6.h - h4a)
    wt = (s1.h - s6.h) + (1 - y) * (s6.h - s2.h)
    wp = (1 - y) * (h4a - lc.h) + (h4b - lf.h)
    qin = s1.h - h4b
    return dict(h6=s6.h, x6=s6.x, T6=s6.T - K0, hf=lf.h, h4a=h4a, h4b=h4b, y=y, wt=wt, wp=wp, qin=qin, eta=(wt - wp) / qin,
                qout=(1 - y) * (s2.h - lc.h))
RG = regen(0.5)
pr("例10 再生 0.5 MPa：h6=%.1f(x=%.3f) hf=%.1f h4a=%.1f h4b=%.1f y=%.4f wt=%.1f wp=%.2f qin=%.1f η=%.4f"
   % (RG['h6'], RG['x6'], RG['hf'], RG['h4a'], RG['h4b'], RG['y'], RG['wt'], RG['wp'], RG['qin'], RG['eta']))
for k, u, f in [('h6', 'kJ/kg', '%.1f'), ('hf', 'kJ/kg', '%.1f'), ('h4a', 'kJ/kg', '%.1f'), ('h4b', 'kJ/kg', '%.1f'),
                ('y', '-', '%.3f'), ('wt', 'kJ/kg', '%.1f'), ('wp', 'kJ/kg', '%.1f'), ('qin', 'kJ/kg', '%.1f'), ('eta', '-', '%.3f')]:
    rec("例題10", "再生 10 MPa・500 ℃、抽気 0.5 MPa（開放給水加熱器）", k, RG[k], u, f % RG[k])
RG2 = regen(1.0)
pr("  じぶんで 1 MPa：y=%.4f η=%.4f h6=%.1f hf=%.1f h4a=%.1f" % (RG2['y'], RG2['eta'], RG2['h6'], RG2['hf'], RG2['h4a']))
rec("例題10 じぶんでとこう", "抽気 1 MPa", "y", RG2['y'], "-", "%.3f" % RG2['y'])
rec("例題10 じぶんでとこう", "抽気 1 MPa", "eta", RG2['eta'], "-", "%.3f" % RG2['eta'])
# 例11 復水器と 100万 kW
wnet = R['wt'] - R['wp']
mdot = 1000e3 / wnet
Qc = mdot * R['qout'] / 1e3   # MW
sea = Qc * 1e6 / (3990 * 7) / 1025
pr("例11 捨てる熱 %.1f kJ/kg、100万 kW：蒸気 %.0f kg/s、復水器 %.0f MW、海水 7 K で %.1f m3/s" % (R['qout'], mdot, Qc, sea))
rec("例題11", "100万 kW（例6 のサイクル）", "蒸気の流量", mdot, "kg/s", "%.0f" % mdot)
rec("例題11", "100万 kW（例6 のサイクル）", "復水器で捨てる熱", Qc, "MW", "%.0f" % Qc)
mdot_j = 500e3 / wnet
pr("  じぶんで 50万 kW：%.0f kg/s、%.0f MW" % (mdot_j, mdot_j * R['qout'] / 1e3))
# 例12 過熱蒸気
h300 = W(P=1, T=573.15).h; h250 = W(P=1, T=523.15).h; h280 = W(P=1, T=553.15).h
lin280 = h250 + (h300 - h250) * 30 / 50
pr("例12 1 MPa 300 ℃ h=%.1f、250 ℃ %.1f、280 ℃ 補間 %.1f（本当 %.1f）" % (h300, h250, lin280, h280))
rec("例題12", "過熱 1 MPa・280 ℃（補間）", "h", lin280, "kJ/kg", "%.1f" % lin280)
rec("例題12", "過熱 1 MPa・280 ℃", "h", h280, "kJ/kg", "%.1f" % h280)
h4_400 = W(P=4, T=673.15).h; h4_500 = W(P=4, T=773.15).h; h4_450 = W(P=4, T=723.15).h
lin450 = (h4_400 + h4_500) / 2
pr("  じぶんで 4 MPa 450 ℃ 補間 %.1f（本当 %.1f）" % (lin450, h4_450))
rec("例題12 じぶんでとこう", "過熱 4 MPa・450 ℃（補間）", "h", lin450, "kJ/kg", "%.1f" % lin450)
# 過熱の度合い
# 例13 圧力なべ
pr("例13 200 kPa → %.2f ℃、ゲージ 80 kPa（絶対 181.3） → %.2f ℃" % (tsat(200), tsat(181.325)))
rec("例題13", "飽和 200 kPa", "T", tsat(200), "℃", "120.21")
rec("例題13 じぶんでとこう", "飽和 181.3 kPa（ゲージ圧 80 kPa）", "T", tsat(181.325), "℃", "%.1f" % tsat(181.325))
# ⑧ 本文：タービンの断熱効率 0.85
R85 = rankine(10, 500, 0.01, eta_t=0.85)
pr("⑧ タービンの断熱効率 0.85：wt=%.1f h2=%.1f x2=%.3f η=%.4f" % (R85['wt'], R85['h2'], R85['x2'], R85['eta']))
rec("⑧ 本文", "ランキン（タービン断熱効率0.85）", "eta", R85['eta'], "-", "%.3f" % R85['eta'])
rec("⑧ 本文", "ランキン（タービン断熱効率0.85）", "x2", R85['x2'], "-", "%.3f" % R85['x2'])
# ⑧ 本文：原子力（沸騰水型） 7 MPa の飽和蒸気 → 5 kPa
s7 = W(P=7, x=1); s7e = W(P=0.005, s=s7.s); l5k = W(P=0.005, x=0)
wpn = l5k.v * (7000 - 5); qn = s7.h - (l5k.h + wpn); etan = ((s7.h - s7e.h) - wpn) / qn
pr("⑧ 7 MPa 飽和（%.1f ℃）→ 5 kPa（%.1f ℃）：x=%.3f η=%.3f" % (s7.T - K0, l5k.T - K0, s7e.x, etan))
rec("⑧ 本文", "7 MPa 飽和蒸気→5 kPa", "eta", etan, "-", "%.3f" % etan)
rec("⑧ 本文", "7 MPa 飽和蒸気→5 kPa", "x", s7e.x, "-", "%.3f" % s7e.x)
rec("⑧ 本文", "飽和 7 MPa", "T", s7.T - K0, "℃", "%.1f" % (s7.T - K0))
rec("⑧ 本文", "飽和 5 kPa", "T", l5k.T - K0, "℃", "%.1f" % (l5k.T - K0))
# 超臨界 25 MPa 600 ℃ → 5 kPa（再熱なし・あり）
Rsc = rankine(25, 600, 0.005)
Rsc2 = rankine(25, 600, 0.005, reheat=(4, 600))
pr("⑧ 25 MPa 600 ℃→5 kPa：η=%.3f x=%.3f、再熱 4 MPa 600 ℃：η=%.3f x=%.3f" % (Rsc['eta'], Rsc['x2'], Rsc2['eta'], Rsc2['xc']))
rec("⑧ 本文", "25 MPa・600 ℃→再熱 4 MPa・600 ℃→5 kPa", "eta", Rsc2['eta'], "-", "%.3f" % Rsc2['eta'])
# カルノーとの比べ（熱-5）：500 ℃と 45.8 ℃
tc10 = l10.T
pr("⑥ カルノー（773.15 K / %.2f K）= %.3f" % (tc10, 1 - tc10 / 773.15))
rec("⑥ 本文", "カルノー 500 ℃・45.8 ℃", "eta", 1 - tc10 / 773.15, "-", "%.3f" % (1 - tc10 / 773.15))
# 平均の受熱温度 q_in / (s1 - s4)
s4 = W(P=10, h=R['h4']).s
Tm = R['qin'] / (R['s1'] - s4)
pr("⑥ 平均の受熱温度 %.1f K（%.1f ℃）、1-T_L/T_m = %.3f" % (Tm, Tm - K0, 1 - tc10 / Tm))
rec("⑥ 本文", "ランキン 10 MPa・500 ℃ の平均の受熱温度", "T_m", Tm - K0, "℃", "%.0f" % (Tm - K0))

# ---------------------------------------------------------------- 章末問題
pr("== 章末問題")
# 基本1：0.2 MPa の飽和温度と L
l2, g2 = sat_p(0.2); pr("基本1 0.2 MPa：%.2f ℃ L=%.1f" % (l2.T - K0, g2.h - l2.h))
# 基本2：2 MPa x=0.8 の h
l2m, g2m = sat_p(2.0); pr("基本2 2 MPa x=0.8：h=%.1f" % (l2m.h + 0.8 * (g2m.h - l2m.h)))
rec("章末 基本2", "湿り蒸気 2 MPa・x=0.8", "h", l2m.h + 0.8 * (g2m.h - l2m.h), "kJ/kg", "%.0f" % (l2m.h + 0.8 * (g2m.h - l2m.h)))
# 基本3：4 MPa 350 ℃ を 300 と 400 から補間
h350l = (W(P=4, T=573.15).h + W(P=4, T=673.15).h) / 2; h350 = W(P=4, T=623.15).h
pr("基本3 4 MPa 350 ℃ 補間 %.1f（本当 %.1f）" % (h350l, h350))
rec("章末 基本3", "過熱 4 MPa・350 ℃（補間）", "h", h350l, "kJ/kg", "%.1f" % h350l)
# 基本4：井戸のポンプ（20 ℃の水）の吸い上げの限界
hmax = (101.325 - 2.3392) * 1e3 / (998.2 * 9.8); pr("基本4 吸い上げの限界 %.2f m" % hmax)
# 基本5：なべ 80 kPa（高原）
pr("基本5 80 kPa → %.1f ℃" % tsat(80))
rec("章末 基本5", "飽和 80 kPa", "T", tsat(80), "℃", "%.1f" % tsat(80))
# 基本6：ランキン 4 MPa 400 ℃ → 10 kPa
R4 = rankine(4, 400, 0.01)
pr("基本6 4 MPa 400 ℃→10 kPa：h1=%.1f s1=%.4f x2=%.3f h2=%.1f wt=%.1f wp=%.2f qin=%.1f η=%.3f" % (R4['h1'], R4['s1'], R4['x2'], R4['h2'], R4['wt'], R4['wp'], R4['qin'], R4['eta']))
for k in ['h1', 's1', 'x2', 'h2', 'wt', 'wp', 'qin', 'eta']:
    rec("章末 基本6", "ランキン 4 MPa・400 ℃→10 kPa", k, R4[k], "", "%.4g" % R4[k])
# チャレンジ1：復水器の圧力を 10 kPa → 5 kPa
R5 = rankine(10, 500, 0.005)
pr("チャレンジ1 10 MPa 500 ℃→5 kPa：η=%.4f x=%.3f wt=%.1f（10 kPa では η=%.4f）" % (R5['eta'], R5['x2'], R5['wt'], R['eta']))
rec("章末 チャレンジ1", "ランキン 10 MPa・500 ℃→5 kPa", "eta", R5['eta'], "-", "%.3f" % R5['eta'])
rec("章末 チャレンジ1", "ランキン 10 MPa・500 ℃→5 kPa", "x2", R5['x2'], "-", "%.3f" % R5['x2'])
rec("章末 チャレンジ1", "飽和 5 kPa", "h′", W(P=0.005, x=0).h, "kJ/kg", "%.1f" % W(P=0.005, x=0).h)
rec("章末 チャレンジ1", "飽和 5 kPa", "s′・s″", "%.4f・%.4f" % (W(P=0.005, x=0).s, W(P=0.005, x=1).s), "kJ/(kg·K)", "")
# チャレンジ2：タービン断熱効率 0.85 の乾き度・効率（⑧ で見せた形）→ 4 MPa 400 ℃
R4e = rankine(4, 400, 0.01, eta_t=0.85)
pr("チャレンジ2 4 MPa 400 ℃、断熱効率0.85：wt=%.1f x2=%.3f η=%.3f" % (R4e['wt'], R4e['x2'], R4e['eta']))
rec("章末 チャレンジ2", "ランキン 4 MPa・400 ℃→10 kPa（断熱効率0.85）", "eta", R4e['eta'], "-", "%.3f" % R4e['eta'])
# チャレンジ3：PWR 二次系 6 MPa 飽和 → 5 kPa（沸騰水型と同じ形）
s6 = W(P=6, x=1); s6e = W(P=0.005, s=s6.s)
wp6 = l5k.v * (6000 - 5); eta6 = ((s6.h - s6e.h) - wp6) / (s6.h - l5k.h - wp6)
pr("チャレンジ3 6 MPa 飽和 %.1f ℃ h''=%.1f s''=%.4f → 5 kPa x=%.3f η=%.3f" % (s6.T - K0, s6.h, s6.s, s6e.x, eta6))
rec("章末 チャレンジ3", "6 MPa 飽和蒸気→5 kPa", "eta", eta6, "-", "%.3f" % eta6)

# ---------------------------------------------------------------- シミュレーション（Python の囲みと同じ計算）
pr("== シミュレーション：ボイラーの圧力と効率（500 ℃・600 ℃、10 kPa）")
for Tb in (500, 600):
    for Pb in (2, 4, 6, 8, 10, 15, 20):
        r_ = rankine(Pb, Tb, 0.01)
        pr("  %d ℃ %2d MPa  η=%.3f  x2=%.3f" % (Tb, Pb, r_['eta'], r_['x2']))

# ---------------------------------------------------------------- 図の座標
pr("== 図：飽和蒸気圧（0〜100 ℃）")
pr(" ".join("(%d,%.3f)" % (t, W(T=t + K0, x=0).P * 1e3) for t in range(0, 101, 5)))
pr("== 図：相図の飽和線（log10 p〔Pa〕）")
pts = [0.01, 20, 50, 100, 150, 200, 250, 300, 350, 373.9]
pr(" ".join("(%.2f,%.4f)" % (t, math.log10(W(T=t + K0, x=0).P * 1e6)) for t in pts))
pr("== 図：T-s の飽和ドーム（s′, s″ と T）")
for t in [0.01, 20, 45.81, 100, 150, 200, 250, 300, 311.0, 340, 360, 370, 373.0]:
    l_, g_ = sat_t(t)
    pr("  %.2f  s'=%.4f  s''=%.4f  h'=%.1f h''=%.1f" % (t, l_.s, g_.s, l_.h, g_.h))
pr("  臨界 s=%.4f h=%.1f" % (W(P=22.064, T=647.096).s, W(P=22.064, T=647.096).h))
pr("== 図：10 MPa の等圧線（T-s、液〜過熱）")
for t in [46, 100, 150, 200, 250, 300, 310.99]:
    s_ = W(P=10, T=t + K0) if t < 310.99 else W(P=10, x=0)
    pr("  %.1f s=%.4f" % (t, s_.s))
for t in [311.0, 350, 400, 450, 500]:
    s_ = W(P=10, T=t + K0 + 0.01) if t < 311.1 else W(P=10, T=t + K0)
    pr("  %.1f s=%.4f h=%.1f" % (t, s_.s, s_.h))
pr("== 図：h-s 線図の等圧線（0.01・0.1・1・4・10 MPa）")
for P in (0.01, 0.1, 1, 4, 10):
    l_, g_ = sat_p(P)
    line = ["(%.3f,%.0f)" % (l_.s + x * (g_.s - l_.s), l_.h + x * (g_.h - l_.h)) for x in (0.6, 0.7, 0.8, 0.9, 1.0)]
    T0 = g_.T - K0
    for t in [T0 + 30, T0 + 80, T0 + 150, 400, 500, 600]:
        if t <= T0 + 1: continue
        s_ = W(P=P, T=t + K0)
        if s_.s > 8.8: continue
        line.append("(%.3f,%.0f)" % (s_.s, s_.h))
    pr("  %g MPa: %s" % (P, " ".join(sorted(set(line), key=lambda z: float(z[1:].split(',')[0])))))
pr("== 図：h-s の飽和線（x=1）")
pr(" ".join("(%.3f,%.0f)" % (W(P=P, x=1).s, W(P=P, x=1).h) for P in (0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 4, 8, 12, 16, 20)))

# ---------------------------------------------------------------- CoolProp（IAPWS-95）と照らし合わせ
mx = 0
for P in PLIST:
    for q in (0, 1):
        h_if = W(P=P, x=q).h
        h_cp = PropsSI('H', 'P', P * 1e6, 'Q', q, 'Water') / 1e3
        mx = max(mx, abs(h_if - h_cp))
pr("== 照合：飽和の h の IF97 と IAPWS-95（CoolProp）の差の最大 %.2f kJ/kg" % mx)

# ================================================================ 追記：本文の手計算（表の丸めた値で）と、追加の例題・章末問題
pr("== 追記：表の丸めた値での手計算")
T = lambda P, Tc: W(P=P, T=Tc + 273.15)
rd = lambda v, n: round(v, n)
h1, s1 = 3375.1, 6.5993; hl, hg, sl, sg, vl, vg = 191.8, 2583.9, 0.6492, 8.1489, 0.001010, 14.67
wp = vl * (10000 - 10); h4 = hl + wp
x2 = (s1 - sl) / (sg - sl); h2 = hl + x2 * (hg - hl)
pr("例6 x2=%.4f h2=%.1f w_出=%.1f w_入=%.2f h4=%.1f q_入=%.1f q_出=%.1f η=%.4f" % (x2, h2, h1 - rd(h2, 1), wp, h4, h1 - rd(h4, 1), rd(h2, 1) - hl, (h1 - rd(h2, 1) - rd(wp, 1)) / (h1 - rd(h4, 1))))
for e in (0.85, 0.88):
    w = e * 1285.5; h2e = h1 - w; xe = (h2e - hl) / (hg - hl)
    pr("  断熱効率 %.2f：w=%.1f h2=%.1f x2=%.4f η=%.4f" % (e, w, h2e, xe, (w - 10.1) / 3173.2))
Tm = 3173.2 / (6.5993 - 0.6492); pr("  T_m=%.1f K η=1-318.96/T_m=%.4f" % (Tm, 1 - 318.96 / Tm))
v2 = vl + x2 * (vg - vl); pr("例8 v2=%.2f m3/kg、v1=0.03281、比 %.0f" % (v2, v2 / 0.03281))
xj = (7.0919 - sl) / (sg - sl); vj = vl + xj * (vg - vl); pr("  じぶんで 4 MPa 500 ℃→10 kPa：x=%.4f v=%.2f v1=0.08644 比 %.0f" % (xj, vj, vj / 0.08644))
rec("例題8", "ランキンのタービン出口（10 kPa・x=0.793）", "v", v2, "m3/kg", "%.2f" % v2)
rec("例題8 じぶんでとこう", "10 kPa・x=0.859", "v", vj, "m3/kg", "%.2f" % vj)
ha, hb, sb = 3102.7, 3445.8, 7.0919
xc = (sb - sl) / (sg - sl); hc = hl + xc * (hg - hl)
wt = (h1 - ha) + (hb - rd(hc, 1)); qin = (h1 - 201.9) + (hb - ha)
pr("例9 xc=%.4f hc=%.1f w_出=%.1f q_入=%.1f η=%.4f" % (xc, hc, wt, qin, (wt - 10.1) / qin))
ha2 = W(P=2, s=6.5993); hb2 = T(2, 500)
pr("  じぶんで 2 MPa：h_a=%.1f T_a=%.1f h_b=%.1f s_b=%.4f" % (ha2.h, ha2.T - K0, hb2.h, hb2.s))
rec("例題9 じぶんでとこう", "2 MPa で s=6.5993", "h", ha2.h, "kJ/kg", "%.1f" % ha2.h)
rec("例題9 じぶんでとこう", "過熱 2 MPa・500 ℃", "h・s", "%.1f・%.4f" % (hb2.h, hb2.s), "", "")
xc2 = (rd(hb2.s, 4) - sl) / (sg - sl); hc2 = hl + xc2 * (hg - hl)
wt2 = (h1 - rd(ha2.h, 1)) + (rd(hb2.h, 1) - rd(hc2, 1)); qin2 = (h1 - 201.9) + (rd(hb2.h, 1) - rd(ha2.h, 1))
pr("  　　 xc=%.4f hc=%.1f w=%.1f q=%.1f η=%.4f" % (xc2, hc2, wt2, qin2, (wt2 - 10.1) / qin2))
fr = (6.5993 - 6.3638) / (6.7712 - 6.3638); pr("  4 MPa で s=6.5993 を補間：h=%.1f（本当 3102.7）" % (2961.7 + fr * (3214.4 - 2961.7)))
h6 = 640.2 + (6.5993 - 1.8606) / (6.8206 - 1.8606) * 2107.9
p1_ = 0.001010 * 490; h3p = hl + p1_; p2_ = 0.001093 * 9500; h4b = 640.2 + p2_
y = (640.2 - rd(h3p, 1)) / (rd(h6, 1) - rd(h3p, 1))
wt3 = (h1 - rd(h6, 1)) + (1 - y) * (rd(h6, 1) - 2089.6); wp3 = (1 - y) * p1_ + p2_
pr("例10 x6=%.4f h6=%.1f ポンプ1 %.2f h3'=%.1f ポンプ2 %.2f h4=%.1f y=%.4f w_出=%.1f w_入=%.2f q=%.1f η=%.4f"
   % ((6.5993 - 1.8606) / 4.96, h6, p1_, h3p, p2_, h4b, y, wt3, wp3, h1 - rd(h4b, 1), (wt3 - wp3) / (h1 - rd(h4b, 1))))
h6j = W(P=1, s=6.5993).h
y2 = (762.7 - 192.8) / (rd(h6j, 1) - 192.8); wt4 = (h1 - rd(h6j, 1)) + (1 - y2) * (rd(h6j, 1) - 2089.6)
wp4 = (1 - y2) * 0.00101 * 990 + 0.001127 * 9000; q4 = h1 - (762.7 + 0.001127 * 9000)
pr("  じぶんで 1 MPa：h6=%.1f y=%.4f w_出=%.1f w_入=%.2f q=%.1f η=%.4f" % (h6j, y2, wt4, wp4, q4, (wt4 - wp4) / q4))
rec("例題10 じぶんでとこう", "1 MPa で s=6.5993", "h", h6j, "kJ/kg", "%.1f" % h6j)
wn = 1285.5 - 10.1; md = 1e6 / wn; Qo = md * 1897.8 / 1e3
pr("例11 w_正味=%.1f ṁ=%.1f kg/s 捨てる熱 %.0f MW 海水 %.1f m3/s" % (wn, md, Qo, Qo * 1e3 / (3.99 * 7) / 1025))
pr("例13 ゲージ 99 kPa → 絶対 %.1f kPa → %.2f ℃。じぶんで ゲージ 80 → %.1f kPa、補間 %.1f ℃（本当 %.1f）"
   % (99 + 101.3, tsat(200.3), 181.3, 99.61 + (181.3 - 100) / 100 * (120.21 - 99.61), tsat(181.3)))
pr("例1 85・90 ℃から：%.2f ℃（80・100 ℃からだと %.2f）" % (85 + 5 * (63 - 57.867) / (70.182 - 57.867), 80 + 20 * (63 - 47.415) / (101.42 - 47.415)))
pr("  じぶんで 70・75 ℃から 34 kPa：%.2f" % (70 + 5 * (34 - 31.201) / (38.595 - 31.201)))
pr("  基本1 90・95 ℃から 80 kPa：%.2f（本当 %.2f）" % (90 + 5 * (80 - 70.182) / (84.609 - 70.182), tsat(80)))
for tt in (70, 75, 85, 90, 95):
    rec("例題1・章末", "飽和 %d ℃" % tt, "p_s", W(T=tt + K0, x=0).P * 1e3, "kPa", "%.3f" % (W(T=tt + K0, x=0).P * 1e3))
pr("例5 60/2256.5=%.4f kg、じぶんで 60/1939.7=%.4f kg、基本 180/2256.5=%.4f kg" % (60 / 2256.5, 60 / 1939.7, 180 / 2256.5))
l5, g5 = sat_p(0.005)
pr("5 kPa 飽和：T=%.2f v'=%.6f h'=%.1f h''=%.1f s'=%.4f s''=%.4f" % (l5.T - K0, l5.v, l5.h, g5.h, l5.s, g5.s))
hl5, hg5, sl5, sg5, vl5 = round(l5.h, 1), round(g5.h, 1), round(l5.s, 4), round(g5.s, 4), round(l5.v, 6)
x5 = (s1 - sl5) / (sg5 - sl5); h25 = hl5 + x5 * (hg5 - hl5); wp5 = vl5 * (10000 - 5)
pr("チャレンジ1 x2=%.4f h2=%.1f w_出=%.1f w_入=%.2f q_入=%.1f η=%.4f" % (x5, h25, h1 - h25, wp5, h1 - hl5 - wp5, (h1 - h25 - wp5) / (h1 - hl5 - wp5)))
for (hh, ss, lab) in ((3445.8, 7.0919, "4 MPa 500 ℃"), (3214.4, 6.7712, "4 MPa 400 ℃")):
    xx = (ss - sl) / (sg - sl); h2x = hl + xx * (hg - hl); w_ = hh - h2x; wpp = 0.001010 * 3990; q_ = hh - (hl + wpp)
    pr("  %s → 10 kPa：x=%.4f h2=%.1f w=%.1f wp=%.2f q=%.1f η=%.4f" % (lab, xx, h2x, w_, wpp, q_, (w_ - wpp) / q_))
    we = 0.85 * w_; h2e = hh - we; xe = (h2e - hl) / (hg - hl)
    pr("    断熱効率0.85：w=%.1f h2=%.1f x=%.4f η=%.4f" % (we, h2e, xe, (we - wpp) / q_))
wn9 = 1471.4 - 10.1; md9 = 1e6 / wn9; pr("チャレンジ 再熱で100万 kW：ṁ=%.1f kg/s 捨てる熱 (2246.8-191.8)=%.1f → %.0f MW" % (md9, 2246.8 - 191.8, md9 * 2055.0 / 1e3))

with open(os.path.join(HERE, "states_p2_08.csv"), "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["章", "使った所", "状態点", "量", "値（計算のまま）", "本文の値（丸め）", "単位", "出典"])
    w.writerows(rows)
pr("CSV:", len(rows), "行")
