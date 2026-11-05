# -*- coding: utf-8 -*-
"""熱-16（読みもの）の数値の検算（組 熱W9）。python3 calc_p2_16.py > calc_p2_16_out.txt"""
import math
MJ_per_kWh = 3.6
print("== ① 1 kWh に要る燃料の熱")
for name, eta in (("コンバインド", 0.60), ("石炭火力", 0.40), ("原子力", 0.33), ("記録", 0.6308)):
    print(name, eta, round(MJ_per_kWh/eta, 2), "MJ", " 捨てる熱", round(MJ_per_kWh/eta-MJ_per_kWh, 2), "MJ")

print("== ② 燃やして出る CO2（原子の数のバランス）")
M_CO2 = 44.01
LHV_CH4 = 802.6; HHV_CH4 = 890.6   # kJ/mol（熱-1）
dH_C = 393.5                       # kJ/mol 炭素の燃焼熱（CO2 の生成エンタルピー −393.5、NIST）
g_per_MJ_CH4_L = M_CO2*1000/LHV_CH4
g_per_MJ_CH4_H = M_CO2*1000/HHV_CH4
g_per_MJ_C = M_CO2*1000/dH_C
print("メタン 低発熱量で g/MJ", round(g_per_MJ_CH4_L, 1), " 高発熱量で", round(g_per_MJ_CH4_H, 1))
print("炭素 g/MJ", round(g_per_MJ_C, 1))
print("コンバインド0.60（低発熱量）1 kWh:", round(6.0*g_per_MJ_CH4_L), "g")
print("石炭を炭素とみた 0.40 1 kWh:", round(9.0*g_per_MJ_C), "g")
print("比", 9.0*g_per_MJ_C/(6.0*g_per_MJ_CH4_L))
print("メタン 1 mol の CO2 44 g・熱 802.6 kJ、炭素 1 mol 44 g・393.5 kJ。熱あたりの CO2 の比", g_per_MJ_C/g_per_MJ_CH4_L)

print("== ④ ライフサイクル（IPCC AR5 WG3 Annex III 表 A.III.2 の中央値）")
lca = [("石炭", 820), ("天然ガス（コンバインド）", 490), ("太陽光（大規模）", 48), ("地熱", 38), ("水力", 24), ("原子力", 12), ("風力（陸上）", 11)]
for n, v in lca: print(n, v)
print("石炭/風力", 820/11, " 直接の計算とくらべ：コンバインド 329 → 490、石炭 1006 → 820")

print("== ⑤ 設備利用率と太陽光 1 kW")
for cf in (0.13, 0.15, 0.158, 0.183):
    print(cf, round(1*8760*cf), "kWh/年")
print("1 kW のパネルの面積（日射 1000 W/m2・変換効率 0.20）", 1000/(1000*0.20), "m2")
print("年 1300 kWh は 1か月", 1300/12, "kWh")
print("== 風の力 1/2 rho A v^3")
rho = 1.2; D = 100; A = math.pi*D**2/4
for v in (5, 10, 12):
    print(v, "m/s", round(0.5*rho*A*v**3/1e6, 2), "MW")
print("ベッツの限界 16/27 =", 16/27, " 10 m/s での上限", 0.5*rho*A*1000*16/27/1e6, "MW")
print("== 揚水：1 m3 を 500 m 上げる")
E = 1000*9.8*500
print(E, "J =", E/3.6e6, "kWh")
print("100万 kW を 6 時間：", 1e9*6*3600/(1000*9.8*500), "m3")

print("== ⑥ ヒートポンプと給湯：300 L を 15→45 ℃")
Q = 300*4.2*30  # kJ
QkWh = Q/3600
print("Q", Q, "kJ =", QkWh, "kWh")
print("ヒートポンプ COP3.5 の電気", QkWh/3.5, "kWh；空気からの熱", QkWh-QkWh/3.5)
print("ガス 効率0.95 の熱", QkWh/0.95, "kWh =", Q/0.95/1000, "MJ → 13A", Q/0.95/1000/45, "m3N")
print("電気ヒーター（効率1）", QkWh, "kWh")
for n, e in (("ヒートポンプ", QkWh/3.5), ("電気ヒーター", QkWh)):
    print(n, "発電所（0.60）の燃料", e/0.60, "kWh =", e/0.60*3.6, "MJ")
T0 = 288.15; T = 318.15
m = 300; c = 4.2
Ex = m*c*((T-T0) - T0*math.log(T/T0))  # kJ
print("エクセルギー（最小の仕事）", Ex, "kJ =", Ex/3600, "kWh ；理想の COP", Q/Ex)
print("熱-6 ⑨ の式 Q(1-T0/T) を 45 ℃ に当てはめると（上限の目安）", Q*(1-T0/T)/3600, "kWh")
print("お湯の平均の温度 30 ℃（303.15 K）で Q(1-T0/Tm)", Q*(1-T0/303.15)/3600, "kWh")

print("== ⑦ 燃料電池")
dH = 285.83; dG = 237.13
print("理論の効率", dG/dH, " 電圧", dG*1000/(2*96485), "V  熱の電圧", dH*1000/(2*96485), "V")
print("0.70 V で使うとき", 0.70/(dH*1000/(2*96485)))
for Th in (1273.15, 1773.15):
    print("カルノー", Th-273.15, "℃/30 ℃", 1-303.15/Th)

print("== ⑧ 発熱量の基準")
print("63.08 % を高発熱量で数えると", 0.6308*LHV_CH4/HHV_CH4)
print("低/高", LHV_CH4/HHV_CH4)
print("1 toe =", 1e7*4.1868/1e6, "GJ（10^7 kcal、1 kcal＝4.1868 kJ）")
print("1 Btu =", 1055.06, "J")

print("== やってみよう：排出係数 0.45 kg/kWh で 260 kWh")
print(260*0.45, "kg")
