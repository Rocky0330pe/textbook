# -*- coding: utf-8 -*-
"""熱-12（流れが熱を運ぶ：対流熱伝達と沸騰）の数値をすべて計算する。
使い方：python3 calc_p2_12.py   （出力を calc_p2_12_out.txt に残す）
物性値：空気・水は CoolProp 8.0（IAPWS-95）で計算し、本文では2〜3けたに丸めた値を使う（第1巻 力-14 の表と同じ数）。
  空気20 ℃：ν=1.5e-5、k=0.026、Pr=0.71／空気40 ℃（膜の温度）：ν=1.70e-5、k=0.0274、Pr=0.71
  水20 ℃：ν=1.0e-6、k=0.60、Pr=7.0／水40 ℃：ν=0.658e-6、k=0.63、Pr=4.3
  飽和水100 ℃（1気圧）：ρ_l=958、ρ_v=0.598、L=2257 kJ/kg、σ=0.0589 N/m（IAPWS-IF97・IAPWS の表面張力の式）
  95 ℃の水（凝縮の膜）：ρ=962、μ=2.97e-4、k=0.675
"""
import math
import numpy as np
out = []
def p(*a):
    s = " ".join(str(x) for x in a); print(s); out.append(s)

try:
    import CoolProp.CoolProp as CP
    for T in (20, 40):
        TK = T + 273.15
        rho = CP.PropsSI("D", "T", TK, "P", 101325, "Air")
        p(f"CoolProp 空気 {T}℃: ρ={rho:.4f} ν={CP.PropsSI('V','T',TK,'P',101325,'Air')/rho:.4e} k={CP.PropsSI('L','T',TK,'P',101325,'Air'):.4f} Pr={CP.PropsSI('Prandtl','T',TK,'P',101325,'Air'):.3f}")
        rho = CP.PropsSI("D", "T", TK, "P", 101325, "Water")
        p(f"CoolProp 水 {T}℃: ρ={rho:.1f} ν={CP.PropsSI('V','T',TK,'P',101325,'Water')/rho:.4e} k={CP.PropsSI('L','T',TK,'P',101325,'Water'):.4f} Pr={CP.PropsSI('Prandtl','T',TK,'P',101325,'Water'):.3f}")
    TK = 373.124
    p("CoolProp 飽和水 1 atm:", CP.PropsSI("T", "P", 101325, "Q", 0, "Water") - 273.15,
      CP.PropsSI("D", "P", 101325, "Q", 0, "Water"), CP.PropsSI("D", "P", 101325, "Q", 1, "Water"),
      CP.PropsSI("H", "P", 101325, "Q", 1, "Water") - CP.PropsSI("H", "P", 101325, "Q", 0, "Water"),
      CP.PropsSI("I", "P", 101325, "Q", 0, "Water"))
    TK = 368.15
    p("CoolProp 水 95℃:", CP.PropsSI("D", "T", TK, "P", 101325, "Water"), CP.PropsSI("V", "T", TK, "P", 101325, "Water"), CP.PropsSI("L", "T", TK, "P", 101325, "Water"))
except Exception as e:
    p("CoolProp なし", e)

g = 9.8
p("==== ① 温まった空気は軽い")
p(f"  60 ℃と20 ℃の空気の密度の比 {293.15/333.15:.3f}（約{(1-293.15/333.15)*100:.0f} % 軽い）")

p("==== 例題1・② ニュートンの冷却則")
for Q, A, h in [(50, 0.1, 5), (50, 0.1, 50), (20, 0.05, 8), (20, 0.05, 40)]:
    p(f"  {Q} W・{A} m2・h={h}：ΔT={Q/(h*A):.0f} K、R_th={1/(h*A):.2f} K/W")

p("==== ③ 冷める曲線から h（つくったデータ）")
C = 840.0; A = 0.025; th0 = 80.0; ta = 20.0
noise = [0, 0.2, -0.1, 0.1, -0.2, 0.1, 0.0, -0.1, 0.1, 0.0, -0.1]
data = {}
for name, h in [("なし", 11.0), ("あり", 30.0)]:
    tau = C/(h*A)
    ts = np.arange(0, 21, 2)
    th = th0 + 0*ts
    th = ta + (th0-ta)*np.exp(-ts*60/tau)
    thr = np.round(th + np.array(noise[:len(ts)]), 1)
    thr[0] = 80.0
    data[name] = (ts, thr)
    y = np.log(thr - ta)
    slope = np.polyfit(ts, y, 1)[0]
    tau_fit = -1/slope
    p(f"  扇風機{name}：h={h} τ={tau/60:.2f} 分、データ {list(thr)}")
    p(f"    ln(θ−20) {list(np.round(y,3))}")
    p(f"    最小二乗の傾き {slope:.5f} /分 → τ={tau_fit:.1f} 分 → h={C/(tau_fit*60*A):.1f} W/(m2 K)")
p(f"  傾きの比（あり÷なし）")

p("==== 例題2 缶コーヒー")
C2, tau2, A2 = 1000, 1200, 0.032
R2 = tau2/C2
p(f"  R_th={R2} K/W、h={1/(R2*A2):.1f}、80→40 ℃（20 ℃）{tau2*math.log(60/20)/60:.1f} 分")
p(f"  jibun：C=840、τ=50 分、A=0.025：R={3000/840:.2f}、h={840/(3000*0.025):.1f}")

p("==== ④ フィンの表計算（6-11 のフィン：m=20 /m、長さ0.05 m、根もと40 K、先は断熱）")
m = 20.0; lf = 0.05; N = 10; dx = lf/N; Tb = 40.0
a = (m*dx)**2
th = np.zeros(N+1); th[0] = Tb
rows = {}
for it in range(1, 2001):
    new = th.copy()
    for i in range(1, N):
        new[i] = (th[i-1] + th[i+1])/(2 + a)
    new[N] = 2*th[N-1]/(2 + a)
    th = new
    if it in (1, 2, 3, 10, 50, 100, 200, 400, 800, 2000):
        rows[it] = th.copy()
for it, r in rows.items():
    p(f"  {it:4d} 回め：{np.round(r[[0,2,4,6,8,10]],2)}")
x = np.linspace(0, lf, N+1)
exact = Tb*np.cosh(m*(lf - x))/np.cosh(m*lf)
p(f"  cosh の式 {np.round(exact[[0,2,4,6,8,10]],2)}、先 {Tb/math.cosh(1):.2f}")
# 何回で先が 25.9 に 0.1 以内
th = np.zeros(N+1); th[0] = Tb
for it in range(1, 5001):
    new = th.copy()
    for i in range(1, N): new[i] = (th[i-1] + th[i+1])/(2 + a)
    new[N] = 2*th[N-1]/(2 + a); th = new
    if abs(th[N] - rows[2000][N]) < 0.05:
        p(f"  先が落ち着いた値の0.05 K 以内になるのは {it} 回め"); break
p(f"  フィン効率 tanh(mL)/(mL) = {math.tanh(1)/1:.3f}")

p("==== ⑤⑥ 例題3 平板（空気5 m/s、0.3 m）")
nu, k, Pr = 1.5e-5, 0.026, 0.71
Re = 5*0.3/nu; Nu = 0.664*Re**0.5*Pr**(1/3)
p(f"  Re={Re:.3g}、Nu={Nu:.1f}、h={Nu*k/0.3:.1f}、境界層の厚さ（後ろのはし）5x/√Re={5*0.3/math.sqrt(Re)*1e3:.1f} mm")
Re = 2*0.2/nu; Nu = 0.664*Re**0.5*Pr**(1/3)
p(f"  jibun 2 m/s・0.2 m：Re={Re:.3g}、Nu={Nu:.1f}、h={Nu*k/0.2:.1f}")
Re = 10*0.2/nu; Nu = 0.664*Re**0.5*Pr**(1/3)
p(f"  基3 10 m/s・0.2 m：Re={Re:.3g}、Nu={Nu:.1f}、h={Nu*k/0.2:.1f}")
p(f"  Pr^(1/3)：空気 {0.71**(1/3):.3f}、水 {7.0**(1/3):.3f}")

p("==== 例題4 円管・乱流（水40 ℃）")
nu4, k4, Pr4 = 0.658e-6, 0.63, 4.3
for v, d in [(1, 0.02), (2, 0.02), (0.5, 0.025)]:
    Re = v*d/nu4; Nu = 0.023*Re**0.8*Pr4**0.4
    p(f"  v={v}、d={d}：Re={Re:.3g}、Nu={Nu:.1f}、h={Nu*k4/d:.0f}")
Re = 1*0.02/1.5e-5*1.0
p(f"  同じ管に空気1 m/s（Re={1*0.02/1.5e-5:.0f}）→ 層流")
Re = 10*0.02/1.5e-5; Nu = 0.023*Re**0.8*0.71**0.4
p(f"  空気10 m/s・内径20 mm：Re={Re:.3g}、h={Nu*0.026/0.02:.0f}（水 1 m/s との比 {5025/(Nu*0.026/0.02):.0f}）")

p("==== 例題5 自然対流（縦の板0.5 m、60 ℃、空気20 ℃）")
nu5, k5, Pr5 = 1.70e-5, 0.0274, 0.71
beta = 1/313.15
for l, dT, nu_, k_ in [(0.5, 40, nu5, k5), (0.2, 60, 1.80e-5, 0.0281)]:
    Gr = g*beta*dT*l**3/nu_**2 if dT == 40 else g*(1/323.15)*dT*l**3/nu_**2
    Ra = Gr*Pr5; Nu = 0.59*Ra**0.25
    p(f"  l={l} ΔT={dT}：Gr={Gr:.3g} Ra={Ra:.3g} Nu={Nu:.1f} h={Nu*k_/l:.2f}")

p("==== 例題6 プラントル数")
p("  空気 0.71、水20 ℃ 7.0、δ/δ_T = Pr^(1/3)：空気 δ_T/δ =", round(0.71**(-1/3), 2), "水", round(7.0**(-1/3), 2))
nu_o, rho_o, c_o, k_o = 4.6e-5, 870, 1900, 0.13
alpha_o = k_o/(rho_o*c_o)
p(f"  作動油 VG46（40 ℃）：α={alpha_o:.3g}、Pr={nu_o/alpha_o:.0f}、δ_T/δ={(nu_o/alpha_o)**(-1/3):.2f}")

p("==== 例題7 限界熱流束（ズーバー）")
rl, rv, Lh, sg = 958.4, 0.598, 2257e3, 0.0589
qmax = 0.131*Lh*rv**0.5*(sg*g*(rl - rv))**0.25
p(f"  q_max={qmax/1e6:.3f} MW/m2（係数0.149 なら {qmax/0.131*0.149/1e6:.2f}）")
p(f"  抜山の値 108万〜180万 kcal/(m2 h) = {1.08e6*4186.8/3600/1e6:.2f}〜{1.8e6*4186.8/3600/1e6:.2f} MW/m2")
p(f"  ポット 1000 W・0.005 m2：{1000/0.005/1e6:.2f} MW/m2")
p(f"  チ：電熱線 直径1 mm・長さ0.1 m：面積 {math.pi*0.001*0.1:.3e} m2、q_max×面積 {qmax*math.pi*0.001*0.1:.0f} W")

p("==== 例題8 円管・層流")
for k_, d in [(0.60, 0.002), (0.026, 0.005)]:
    p(f"  k={k_} d={d}：h={3.66*k_/d:.0f}（熱流束一定 {4.36*k_/d:.0f}）")

p("==== 例題9 ピンフィン")
for kf in (200, 400):
    mm = math.sqrt(4*30/(kf*0.003)); ml = mm*0.03
    eta = math.tanh(ml)/ml
    Af = math.pi*0.003*0.03
    p(f"  k={kf}：m={mm:.2f} mL={ml:.3f} η={eta:.3f}、1本の熱（40 K）{eta*30*Af*40:.3f} W、フィンなしの根もと {30*math.pi*0.0015**2*40:.4f} W")
mm = math.sqrt(4*20/(200*0.005)); ml = mm*0.05
p(f"  基5 d=5 mm L=50 mm h=20 k=200：m={mm:.2f} mL={ml:.3f} η={math.tanh(ml)/ml:.3f}")
# 長さを2倍にすると
for lf2 in (0.03, 0.06, 0.12):
    mm = math.sqrt(4*30/(200*0.003)); ml = mm*lf2
    Q = math.sqrt(30*math.pi*0.003*200*math.pi*0.003**2/4)*40*math.tanh(ml)
    p(f"  長さ {lf2}：η={math.tanh(ml)/ml:.3f}、熱 {Q:.3f} W")
for ml in (0.5, 1, 2, 3):
    p(f"  mL={ml}：η={math.tanh(ml)/ml:.3f}")

p("==== 例題10 風速を何倍に")
for r in (1.5, 2):
    p(f"  熱 {r} 倍：層流 v×{r**2:.2f}、乱流 v×{r**1.25:.2f}")

p("==== 例題11 膜状凝縮")
rl95, mu95, k95 = 961.9, 2.97e-4, 0.675
for l in (0.3, 0.6):
    hN = 0.943*((g*rl95*(rl95 - rv)*k95**3*Lh)/(mu95*l*10))**0.25
    p(f"  l={l}：h={hN:.0f}、熱流束 {hN*10/1e3:.0f} kW/m2")

p("==== 例題12 熱交換器の予告")
for hw, ha in [(5000, 50), (5000, 100), (10000, 50)]:
    p(f"  水 {hw}・空気 {ha}：U={1/(1/hw+1/ha):.2f}")

p("==== 章末")
p(f"  基1 200 W・0.2 m2・h=10：{200/(10*0.2):.0f} K")
tau = 10/math.log(60/30)
p(f"  基2 80→50（20）10 分：τ={tau:.1f} 分={tau*60:.0f} s、R={tau*60/1000:.3f} K/W")
nu4, k4, Pr4 = 0.658e-6, 0.63, 4.3
Re = 0.5*0.025/nu4; Nu = 0.023*Re**0.8*Pr4**0.4
p(f"  基4 水 0.5 m/s・25 mm：Re={Re:.3g} h={Nu*k4/0.025:.0f}")
hw = 0.023*(1*0.02/0.658e-6)**0.8*4.3**0.4*0.63/0.02
hN = 0.943*((g*rl95*(rl95 - rv)*k95**3*Lh)/(mu95*0.3*10))**0.25
p(f"  チ 凝縮器：水 h={hw:.0f}、蒸気 h={hN:.0f}、U={1/(1/hw+1/hN):.0f}")
# チ ヒートシンク：アルミの板フィン 20枚（厚さ1 mm・高さ30 mm・奥行き50 mm）、h=40、根もと ΔT=40 K
n_f, t_f, H_f, W_f, h_f, k_f = 20, 0.001, 0.03, 0.05, 40, 200
mm = math.sqrt(2*h_f/(k_f*t_f)); ml = mm*H_f; eta = math.tanh(ml)/ml
Afin = 2*H_f*W_f
Qf = n_f*eta*h_f*Afin*40
Abase = 0.06*W_f - n_f*t_f*W_f
Qb = h_f*Abase*40
p(f"  チ ヒートシンク：m={mm:.1f} mL={ml:.2f} η={eta:.3f}、フィン {Qf:.1f} W、すきまの底 {Qb:.1f} W、合計 {Qf+Qb:.1f} W、フィンなし {h_f*0.06*W_f*40:.1f} W")

p("==== もっと知りたい：熱電対の時定数（ランツ・マーシャル Nu=2+0.6Re^½Pr^⅓）")
rc = 8500*400; D = 0.0005
for name, nu_, k_, Pr_, v in [("止まった空気", 1.5e-5, 0.026, 0.71, 0), ("空気5 m/s", 1.5e-5, 0.026, 0.71, 5), ("水1 m/s", 1.0e-6, 0.60, 7.0, 1)]:
    Re = v*D/nu_; Nu = 2 + 0.6*Re**0.5*Pr_**(1/3); h = Nu*k_/D
    p(f"  {name}: Re={Re:.0f} Nu={Nu:.2f} h={h:.0f} τ={rc*D/(6*h):.4f} s Bi={h*D/6/20:.3f}")

open(__file__.replace(".py", "_out.txt"), "w", encoding="utf-8").write("\n".join(out) + "\n")
