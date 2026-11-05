# -*- coding: utf-8 -*-
"""熱-0（序章）の数値の検算（組 熱W9）。python3 calc_p2_00.py > calc_p2_00_out.txt"""
print("== やってみよう：検針票を MJ に")
E_kWh = 260; gas_m3 = 30; HHV13A = 45.0
print("電気 260 kWh =", E_kWh*3.6, "MJ")
print("ガス 30 m3N =", gas_m3*HHV13A, "MJ")
print("260 kWh を効率0.40の発電所でつくる燃料の熱 =", E_kWh*3.6/0.40, "MJ")

print("== 例題1：100万 kW・効率0.40")
P = 1000.0; eta = 0.40
Qin = P/eta; Qout = Qin - P
print("燃料の熱", Qin, "MW  捨てる熱", Qout, "MW")
print("1日の燃料の熱", Qin*1e6*86400/1e12, "TJ")
print("== コンバインド 50万 kW・効率0.60")
P2 = 500.0; eta2 = 0.60
print("燃料の熱", P2/eta2, "MW  捨てる熱", P2/eta2-P2, "MW")
LHV_CH4 = 802.6e3/16.04e-3  # J/kg
print("メタンの低発熱量 MJ/kg", LHV_CH4/1e6, " 1秒のガス kg/s", P2/eta2*1e6/LHV_CH4,
      " 1日 t", P2/eta2*1e6/LHV_CH4*86400/1000)
print("== 2倍にすると：捨てる熱÷電気 (1-η)/η")
for e in (0.3, 0.33, 0.40, 0.50, 0.60, 0.6308, 0.7):
    print(e, round((1-e)/e, 3))
print("0.60 と 0.40 の比", ((1-0.6)/0.6)/((1-0.4)/0.4))
print("同じ電気に要る燃料の比 0.40/0.60 →", (1/0.4)/(1/0.6))

print("== 例題2：電気ポット 1.0 L を 20→100 ℃、1.0 kW、効率0.90")
Q = 1.0*4.2*80  # kJ
t = Q/(1.0*0.90)
print("Q", Q, "kJ  t", t, "s =", t/60, "分")
print("効率1なら", Q/1.0, "s", Q/60, "分")
print("2.0 L なら", 2*t, "s", 2*t/60, "分")

print("== 例題3：捨てる熱 1500 MW を 7 K の海水で")
rho = 1025; c = 3.99e3; dT = 7
V = Qout*1e6/(rho*c*dT)
print("V-dot", V, "m3/s ; 1日", V*86400, "m3")
print("熱-8 例題11 の 1488 MW なら", 1488e6/(rho*c*dT))
print("水の値（1000 kg/m3・4.2）なら", Qout*1e6/(1000*4200*dT))
pool = 25*10*1.2
print("25 m プール", pool, "m3 を満たす時間", pool/V, "s")
print("温度差を 14 K にすると", Qout*1e6/(rho*c*14))
print("コンバインド 333 MW なら", (P2/eta2-P2)*1e6/(rho*c*dT))
print("1000 MW のコンバインド(0.60) なら 捨てる", 1000/0.6-1000, "MW 海水", (1000/0.6-1000)*1e6/(rho*c*dT))
print("海水 1 kg が 7 K 上がる熱", rho*0+c*dT/1000, "kJ/kg")

print("== 63.08 %")
print("捨てる割合", 1-0.6308, " 捨てる熱÷電気", (1-0.6308)/0.6308)
print("== 単位")
print("1 kWh =", 3.6e6, "J")
