# -*- coding: utf-8 -*-
"""熱-11（壁を通りぬける熱：熱伝導と熱抵抗）の数値をすべて計算する。
使い方：python3 calc_p2_11.py   （出力を calc_p2_11_out.txt に残す）
物性値（本文の値）：
  熱伝導率 k〔W/(m·K)〕：銅 400、アルミ 237、鋼 50、ステンレス 16、ガラス 1.0、コンクリート 1.6、
    れんが 0.6、水 0.60、木 0.15、グラスウール 0.04、空気 0.026（数学 8-4・8-13・6-3 と同じ数）
  表面の熱抵抗（1 m² あたり）：室内側 0.11、外気側 0.04 m²·K/W（建築研究所の外皮の計算資料）
  複層ガラスの空気層（12 mm）の熱抵抗 0.17 m²·K/W（下で、伝導と放射から見積もって確かめる）
"""
import math
import numpy as np

out = []
def p(*a):
    s = " ".join(str(x) for x in a)
    print(s); out.append(s)

sigma = 5.670e-8
p("==== ② フーリエの法則・熱伝導率")
for name, k in [("銅",400),("アルミ",237),("鋼",50),("ステンレス",16),("ガラス",1.0),("コンクリート",1.6),
                ("れんが",0.6),("水",0.60),("木",0.15),("グラスウール",0.04),("空気",0.026)]:
    p(f"  {name}: k={k}  厚さ1 cm・温度差1 K の熱流束 {k/0.01:.3g} W/m2")
p("  ②の2倍：コンクリート0.2 m→0.4 m、20 K：", 1.6*20/0.2, "→", 1.6*20/0.4)

p("==== ③ 熱抵抗（1 m²）")
Rc15 = 0.15/1.6; Rgw = 0.10/0.04
p(f"  コンクリート0.15 m：{Rc15:.4f}  グラスウール0.10 m：{Rgw:.3f}  和 {Rc15+Rgw:.3f}")
q3 = 20/(Rc15+Rgw)
p(f"  20 K の熱流束 {q3:.2f} W/m2、コンクリートの中の温度差 {q3*Rc15:.2f} K、グラスウール {q3*Rgw:.2f} K")
p(f"  コンクリートだけ0.15 m の熱流束 {20/Rc15:.0f} W/m2、比 {(20/Rc15)/q3:.1f} 倍")
# 並列：壁 8 m²（U=0.4 とする）と窓 2 m²
# ③本文の並列の例：壁10 m²のうち窓2 m²（窓は単板 6.45、壁は例題3 の 1/2.59）
Uw = 1/(Rc15+Rgw)

p("==== ④ 窓の熱貫流率")
Rsi, Rso = 0.11, 0.04
Rgap = 0.17
U1 = 1/(Rsi+0.005/1.0+Rso)
U2 = 1/(Rsi+0.003/1.0+Rgap+0.003/1.0+Rso)
p(f"  単板5 mm：1/U={Rsi+0.005+Rso:.3f}  U={U1:.2f}")
p(f"  複層3+A12+3：1/U={Rsi+0.006+Rgap+Rso:.3f}  U={U2:.2f}  比 U2/U1={U2/U1:.2f}")
# 空気層の熱抵抗の見積もり：伝導＋放射（ガラスの放射率0.84、平均10 ℃）
kair = 0.025; gap = 0.012; eps = 0.84; Tm = 283.15
hc = kair/gap; hr = 4*sigma*Tm**3/(2/eps-1)
p(f"  空気層の見積もり：伝導 h={hc:.2f}、放射 h={hr:.2f}、合計 {hc+hr:.2f} → R={1/(hc+hr):.3f}")
p(f"  伝導だけなら R={gap/kair:.2f}（放射があるので0.17まで下がる）")
for A, dT in [(2,20),(3,25)]:
    p(f"  面積{A}・温度差{dT}：単板 {U1*A*dT:.0f} W、複層 {U2*A*dT:.0f} W")
# 室内側の表面温度
def Tsi(U, Tin, Tout):
    return Tin - U*(Tin-Tout)*Rsi
for Tout in [0,-5,-10]:
    p(f"  外{Tout}℃・室20℃：単板 表面 {Tsi(U1,20,Tout):.2f}℃、複層 {Tsi(U2,20,Tout):.2f}℃")

p("==== 露点（IAPWS-IF97 の飽和蒸気圧から）")
try:
    from iapws import IAPWS97
    def psat(Tc): return IAPWS97(T=Tc+273.15, x=0).P*1e6
    def Tsat(pp):
        from iapws import IAPWS97 as I
        return I(P=pp/1e6, x=0).T-273.15
    for rh in [0.5, 0.6]:
        pv = rh*psat(20)
        p(f"  20℃・{int(rh*100)}%：p_v={pv:.1f} Pa、露点 {Tsat(pv):.2f}℃")
except Exception as e:
    p("  iapws なし", e)

p("==== ⑤ 2層の壁の差分（箱の熱のバランス）")
kc, rhoc, cc = 1.6, 2300, 880
kg, rhog, cg = 0.04, 16, 840
p(f"  熱拡散率 コンクリート {kc/(rhoc*cc):.2e}、グラスウール {kg/(rhog*cg):.2e} m2/s")
def wall(order, dx=0.05, dt=60.0, hours=24, Tin=20.0, Tout=0.0, T0=20.0):
    layers = []
    for name in order:
        if name == "c": layers += [("c", kc, rhoc*cc)]*int(round(0.15/dx))
        else: layers += [("g", kg, rhog*cg)]*int(round(0.10/dx))
    n = len(layers)
    k = np.array([l[1] for l in layers]); C = np.array([l[2]*dx for l in layers])
    # 箱の中心どうしの熱抵抗（1 m²）
    Rb = np.array([dx/(2*k[i]) + dx/(2*k[i+1]) for i in range(n-1)])
    R0 = dx/(2*k[0]); Rn = dx/(2*k[-1])
    # 安定の条件
    G = np.zeros(n)
    G[0] += 1/R0; G[-1] += 1/Rn
    for i in range(n-1): G[i] += 1/Rb[i]; G[i+1] += 1/Rb[i]
    dtmax = min(C/G)
    T = np.full(n, T0)
    rec = []
    steps = int(hours*3600/dt)
    for s in range(steps+1):
        t = s*dt
        qin = (Tin - T[0])/R0      # 部屋の側から壁に入る熱流束
        qout = (T[-1] - Tout)/Rn   # 外へ出ていく熱流束
        rec.append((t, qin, qout, T.copy()))
        flow = np.zeros(n)
        flow[0] += (Tin - T[0])/R0
        flow[-1] += (Tout - T[-1])/Rn
        for i in range(n-1):
            f = (T[i] - T[i+1])/Rb[i]
            flow[i] -= f; flow[i+1] += f
        T = T + dt*flow/C
    return rec, dtmax, layers
for order, nm in [("cg","外断熱（部屋の側がコンクリート）"),("gc","内断熱（部屋の側がグラスウール）")]:
    rec, dtmax, layers = wall(order)
    p(f"  {nm}：箱 {[l[0] for l in layers]}、Δt の上限 {dtmax:.0f} s（Δt=60 s で計算）")
    for t, qin, qout, T in rec:
        if t in (0, 600, 1800, 3600, 2*3600, 4*3600, 8*3600, 12*3600, 24*3600):
            p(f"    t={t/3600:5.2f} h  部屋から入る {qin:6.2f} W/m2  外へ出る {qout:6.2f} W/m2  箱の温度 {np.round(T,2)}")
    # 部屋から入る熱が定常の90 % に達する時刻
    qs = 20/(Rc15+Rgw)
    for t, qin, qout, T in rec:
        if qin >= 0.9*qs:
            p(f"    部屋から入る熱が定常 {qs:.2f} の90 % をこえる時刻 {t/3600:.2f} h"); break
    tot_in = sum(r[1] for r in rec[:-1])*60
    p(f"    24 時間に部屋から入った熱 {tot_in/1e3:.0f} kJ/m2（定常なら {qs*86400/1e3:.0f} kJ/m2）")
# 例題12 の手計算：外断熱の最初の2歩（箱の考え）
rec, dtmax, layers = wall("cg", dt=60)
p("  外断熱の最初の3歩：", [np.round(r[3],3) for r in rec[:4]])

# 8-13 のアルミの棒を、箱の考えで（同じ数になるか）
p("==== 例題12：8-13 のアルミの棒（箱の考えで同じ式）")
al = 1e-4; dx = 0.01; dt = 0.25; r = al*dt/dx**2
T = np.array([100]+[20]*10, dtype=float)
t = 0
while T[5] <= 50:
    Tn = T.copy()
    for i in range(1, 10): Tn[i] = T[i] + r*(T[i-1]-2*T[i]+T[i+1])
    Tn[10] = T[10] + r*(2*T[9]-2*T[10])
    T = Tn; t += dt
    if t in (0.25, 0.5, 0.75): p(f"  t={t}: {np.round(T[:5],3)}")
p(f"  まん中が50 ℃をこえる時刻 {t} s（T={T[5]:.2f}）")

p("==== ⑦ 円筒・球")
def Rcyl(r1, r2, k, L=1): return math.log(r2/r1)/(2*math.pi*k*L)
for r1, r2 in [(0.03,0.06),(0.03,0.09),(0.03,0.045)]:
    p(f"  管 r1={r1} r2={r2} k=0.04 ΔT=100：{100/Rcyl(r1,r2,0.04):.1f} W/m")
# 薄い円筒で平板に近い
r1, t_ = 0.10, 0.005
p(f"  薄い：ln(1+t/r1)/(2πk)={math.log(1+t_/r1)/(2*math.pi*1):.6f}  平板 t/(k·2πr1)={t_/(2*math.pi*r1):.6f}")
# 臨界半径
for k, h, r1 in [(0.2,10,0.001),(0.15,15,0.001),(0.1,10,0.005)]:
    rc = k/h
    def Q(r): return 1/(math.log(r/r1)/(2*math.pi*k) + 1/(2*math.pi*r*h))
    p(f"  臨界半径 k={k} h={h}：{rc*1e3:.1f} mm、r1={r1*1e3} mm の裸：{Q(r1):.4f} W/(m K)")
    for rr in [0.002, 0.005, 0.008, 0.01, 0.02, 0.04]:
        if rr >= r1: p(f"      r={rr*1e3:.0f} mm：{Q(rr):.4f}  裸との比 {Q(rr)/Q(r1):.2f}")
# 熱が生まれる円柱（燃料棒）
qg, R, kf = 4e8, 0.0041, 3.0
p(f"  燃料棒（q_gen=4e8 W/m3、半径4.1 mm、k=3）：中心と表面の差 {qg*R**2/(4*kf):.0f} K、1 m あたり {qg*math.pi*R**2/1e3:.1f} kW/m")
# 平板で熱が生まれる（⑥）
qg2, L2, k2 = 5000, 0.05, 1.0
p(f"  ⑥板（厚さ0.1 m、q_gen=5000 W/m3、k=1.0、表面0 ℃）：中心 {qg2*L2**2/(2*k2):.2f} ℃")

p("==== ⑧ ビオ数と時定数")
def lump(d, h, k, rho, c):
    r = d/2; V_A = r/3
    Bi = h*V_A/k; tau = rho*c*V_A/h
    return Bi, tau
Bi, tau = lump(0.010, 10, 50, 7850, 460)
p(f"  鋼球 10 mm、h=10：Bi={Bi:.2e}、τ={tau:.0f} s={tau/60:.1f} 分、300→50 ℃（空気20 ℃）{tau*math.log(280/30)/60:.1f} 分")
Bi, tau = lump(0.020, 20, 237, 2700, 897)
p(f"  アルミ球 20 mm、h=20：Bi={Bi:.2e}、τ={tau:.0f} s={tau/60:.1f} 分")
Bi, tau = lump(0.006, 50, 400, 8900, 385)
p(f"  銅球 6 mm、h=50：Bi={Bi:.2e}、τ={tau:.1f} s")
# ビオ数が大きいとき：ガラス玉
Bi, tau = lump(0.05, 200, 1.0, 2500, 800)
p(f"  ガラス玉 50 mm を水で冷やす h=200：Bi={Bi:.2f}（0.1 より大きい）")

p("==== ⑨ 平板の変数分離（9-1⑧）")
ast = 50/(7850*460)
p(f"  鋼の熱拡散率 {ast:.3e}")
for L in [0.02, 0.04]:
    t1 = L**2/(math.pi**2*ast)
    p(f"  鋼 厚さ {L}：τ1={t1:.2f} s、中心の差が1割 {t1*math.log(4/math.pi/0.1):.1f} s")
t1 = 0.01**2/(math.pi**2*9.8e-5)
p(f"  アルミ 1 cm：τ1={t1:.3f} s")
# 卵
for r in [0.02, 0.013]:
    tau = r**2/(math.pi**2*1.4e-7)
    t70 = tau*math.log(2/((100-70)/(100-20)))
    p(f"  卵 r={r}: r²/α={r**2/1.4e-7/60:.1f} 分、球の1項め τ={tau/60:.2f} 分、中心70 ℃まで {t70/60:.1f} 分")
# 変数分離と差分の比べ（Python の囲みの出力）
L = 0.02; a = ast; N = 20; dxp = L/N; dtp = 0.4*dxp**2/a
x = np.linspace(0, L, N+1)
Tp = np.full(N+1, 100.0); Tp[0] = Tp[-1] = 0.0
tt = 0.0; marks = [1.0, 2.0, 5.0]; res = {}
while tt < 5.0 - 1e-12:
    Tp[1:-1] = Tp[1:-1] + a*dtp/dxp**2*(Tp[2:]-2*Tp[1:-1]+Tp[:-2]); tt += dtp
    for m in marks:
        if m not in res and tt >= m - 1e-9: res[m] = Tp[N//2]
def series(xx, t, n=399):
    s = 0
    for k in range(1, n+1, 2):
        s += 400/(k*math.pi)*math.exp(-a*(k*math.pi/L)**2*t)*math.sin(k*math.pi*xx/L)
    return s
for m in marks:
    p(f"  中心 t={m}s：差分 {res[m]:.2f}、級数 {series(L/2, m):.2f}、1項め {400/math.pi*math.exp(-m/(L**2/(math.pi**2*a))):.2f}")

p("==== ⑩ 地中の温度")
for name, w in [("年", 2*math.pi/(365.25*86400)), ("日", 2*math.pi/86400)]:
    d = math.sqrt(2*5e-7/w)
    p(f"  {name}：δ={d:.3f} m")
    for z in [0.1, 1, 2, 5]:
        lag = z/d/w/86400
        p(f"    z={z}：振幅 {math.exp(-z/d):.3f}、おくれ {lag:.1f} 日 = {lag*24:.1f} 時間")
    p(f"    振幅1割の深さ {d*math.log(10):.2f} m、1/12 の深さ {d*math.log(12):.2f} m")

p("==== 例題10 CPU")
p("  100 W×0.3 K/W =", 100*0.3, "K、内訳 0.05+0.05+0.2 → チップ", 35+100*0.3, "℃")
p("  65 W×0.5 =", 65*0.5)

p("==== 章末問題")
p("  基1 断熱材の厚さ：L ≥", 0.04*20/10, "m")
UA = 8*Uw + 2*U2
p(f"  基2 並列：壁 8 m²（U={Uw:.3f}）＋窓 2 m²（U={U2:.2f}）：UA={UA:.2f} W/K、20 K で {UA*20:.0f} W、窓の割合 {2*U2/UA*100:.0f} %")
p(f"  基3 蒸気管：{2*math.pi*0.05*10*150/math.log(2):.0f} W")
Bi, tau = lump(0.006, 50, 400, 8900, 385)
p(f"  基4 銅球 Bi={Bi:.2e} τ={tau:.1f} s、80→30 ℃（水20 ℃・h=50 のまま）{tau*math.log(60/10):.0f} s")
d = math.sqrt(2*5e-7/(2*math.pi/86400))
p(f"  基5 日の変化 z=0.1：振幅 {math.exp(-0.1/d):.2f}、おくれ {0.1/d/(2*math.pi)*24:.2f} 時間")
p(f"  基6 外−10 ℃・複層：{Tsi(U2,20,-10):.2f} ℃")
p(f"  チ7 燃料棒：上の値")
d = math.sqrt(2*5e-7/(2*math.pi/(365.25*86400)))
p(f"  チ8 地下室：振幅 12 K→1 K の深さ {d*math.log(12):.1f} m、おくれ {d*math.log(12)/d/(2*math.pi)*365.25:.0f} 日")

p("  チ9 たくわえていた熱の減った分（定常の折れ線、箱のまん中）")
qs = 20/(Rc15+Rgw)
for order in ["cg","gc"]:
    xs = [0.025,0.075,0.125,0.175,0.225]; rel = 0; parts = {"c":0,"g":0}
    if order == "cg":
        def th(x): return 20-qs*x/1.6 if x<0.15 else 20-qs*0.15/1.6-qs*(x-0.15)/0.04
        kinds = "cccgg"
    else:
        def th(x): return 20-qs*x/0.04 if x<0.10 else 20-qs*0.10/0.04-qs*(x-0.10)/1.6
        kinds = "ggccc"
    for x, kd in zip(xs, kinds):
        C = 101200 if kd=="c" else 672
        parts[kd] += C*(20-th(x))
    p(f"    {order}: 箱 {[round(th(x),3) for x in xs]}  コンクリート {parts['c']/1e6:.4f} MJ、グラスウール {parts['g']/1e6:.4f} MJ、合計 {(parts['c']+parts['g'])/1e6:.3f} MJ")
p(f"  例題1 jibun(2) 並列：{(0.40*8+U2*2)*20:.0f} W")
p(f"  基2 並列：{(0.5*12+6.5*3)*25:.1f} W、窓 {6.5*3/(0.5*12+6.5*3)*100:.0f} %")

open(__file__.replace(".py", "_out.txt"), "w", encoding="utf-8").write("\n".join(out)+"\n")
