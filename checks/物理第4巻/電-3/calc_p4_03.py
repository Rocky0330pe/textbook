# 電-3 の数値の検算（組 電W2）。python3 calc_p4_03.py > calc_p4_03_out.txt
import math
e0 = 8.85e-12; k = 8.99e9
e0x = 8.8541878188e-12
def p(*a): print(*a)
p("== 本文")
# ① 表：電圧と電荷（100 μF とします）
C=100e-6
for V in [1.5,3.0,4.5]: p("①表 V",V,"Q μC",C*V*1e6)
# ④ 平行板
S=0.01; d=1e-3
C0=e0*S/d; p("④ C0 pF", C0*1e12)
for dd in [0.5e-3,1e-3,2e-3,3e-3,4e-3]: p("  C(d) d mm",dd*1e3,"pF",e0*S/dd*1e12)
# ⑥ 比誘電率の表
for name,er in [("空気",1.0006),("PE",2.3),("PET",3.0),("ガラス",7),("水",80.2)]: p("⑥",name,"C pF",er*C0*1e12)
# ⑦ エネルギー
V=1000; Q=C0*V; E=V/d; U=0.5*C0*V**2
p("⑦ Q",Q,"E",E,"U",U,"u*Sd",0.5*e0*E**2*S*d)
p("⑦ 空気が耐える u (3e6 V/m) J/m3", 0.5*e0*(3e6)**2)
# ⑦ 電池で充電：電池の仕事 QV、たまる 1/2 QV
p("⑦ 電池の仕事", Q*V, "たまる", U)
p("== 例題")
p("例1 C pF", C0*1e12)
p("例2 Q C", Q, "E V/m", E, "U J", U)
C1,C2=2e-6,3e-6
Cs=C1*C2/(C1+C2); Cp=C1+C2
p("例3 直列 μF",Cs*1e6,"並列",Cp*1e6,"直列10V Q μC",Cs*10*1e6,"V1",Cs*10/C1,"V2",Cs*10/C2)
p("じ3 1μF,4μF 直列 並列, 直列 15V", 1*4/5, 5, "Q", 0.8*15, "V1",0.8*15/1,"V2",0.8*15/4)
er=3.0
p("例4 PET εr3.0 pF", er*C0*1e12, "同じQで電圧の比", 1/er)
p("じ4 PE 2.3 pF", 2.3*C0*1e12, "ガラス7", 7*C0*1e12)
Ca=2*C0; Cb=2*er*C0
p("例5 厚さ半分 pF", 1/(1/Ca+1/Cb)*1e12, "倍", 1/(1/Ca+1/Cb)/C0)
p("例5 面積半分 pF", (C0/2+er*C0/2)*1e12, "倍", (0.5+er/2))
er2=2.0
p("じ5 εr2 厚さ半分 倍", 2*er2/(1+er2), "面積半分 倍",(1+er2)/2, "pF", 2*er2/(1+er2)*C0*1e12,(1+er2)/2*C0*1e12)
# 例6 つなぎかえ
C1,C2,V0=3e-6,2e-6,10
Q0=C1*V0; Vf=Q0/(C1+C2); Ub=0.5*C1*V0**2; Ua=0.5*(C1+C2)*Vf**2
p("例6 つなぎかえ V",Vf,"Ub μJ",Ub*1e6,"Ua",Ua*1e6,"失う",(Ub-Ua)*1e6, "割合",(Ub-Ua)/Ub)
C1,C2,V0=1e-6,1e-6,12
Vf=C1*V0/(C1+C2); p("じ6 同じ1μF 12V V",Vf,"Ub",0.5*C1*V0**2*1e6,"Ua",0.5*(C1+C2)*Vf**2*1e6)
# 例7 EDLC
p("例7 EDLC 1F 2.7V J", 0.5*1*2.7**2, "1kg を持ち上げる高さ m", 0.5*2.7**2/(1*9.8), "例1のCの何倍", 1/C0)
p("じ7 EDLC 10F 2.5V J", 0.5*10*2.5**2, "半分の電圧まで使うと", 0.5*10*(2.5**2-1.25**2), "割合",(1-0.25))
# 例8 同軸
a,b,er=0.45e-3,1.6e-3,2.3
Cl=2*math.pi*er*e0/math.log(b/a); p("例8 同軸 pF/m", Cl*1e12, "ln", math.log(b/a), "Z0 Ω", 60/math.sqrt(er)*math.log(b/a))
p("例8 10 m で pF", Cl*10*1e12)
a,b,er=0.5e-3,3.5e-3,2.3
Cl2=2*math.pi*er*e0/math.log(b/a); p("じ8/章末 同軸 0.5/3.5 pF/m", Cl2*1e12)
a,b,er=0.5e-3,2.3e-3,1.0
# 例9 地球
R=6.371e6
Ce=4*math.pi*e0*R; p("例9 地球 μF", Ce*1e6, "1F の球の半径 m", 1/(4*math.pi*e0))
p("じ9 半径 10 cm の球 pF", 4*math.pi*e0*0.1*1e12, "30kVの電荷 C", 4*math.pi*e0*0.1*3e4)
# 例10 引力
F=Q**2/(2*e0*S); p("例10 引力 N", F, "½QE", 0.5*Q*E, "圧力 Pa", 0.5*e0*E**2)
p("じ10 100 V F N", (C0*100)**2/(2*e0*S))
# 例11 鏡像
Qc,h=20,5000
Eg=2*k*Qc/h**2; p("例11 地面の電場 V/m", Eg, "σ C/m2", e0*Eg)
for x in [0,2500,5000,10000]:
    Ex=2*k*Qc*h/(h**2+x**2)**1.5; p("  x m",x,"E V/m",Ex, "比", Ex/Eg)
# 誘導電荷の合計（数値）
tot=0; N=200000; xmax=5e6; dx=xmax/N
for i in range(N):
    r=(i+0.5)*dx; tot+=e0*2*k*Qc*h/(h**2+r**2)**1.5*2*math.pi*r*dx
p("  誘導電荷の合計 C", tot)
p("じ11 30 C 高さ 3 km", 2*k*30/3000**2)
# 例12 タッチパネル
Ct=7*e0*1e-4/1e-3; p("例12 タッチ pF", Ct*1e12)
p("じ12 0.5 mm 厚・εr 7・0.5cm2", 7*e0*0.5e-4/0.5e-3*1e12)
# 例13 圧電
Qp=400e-12*10; p("例13 圧電 Q C", Qp, "V", Qp/1e-9)
p("じ13 250 pC/N・20 N・2 nF V", 250e-12*20/2e-9)
# 例14 屈折
th2=math.degrees(math.atan(4*math.tan(math.radians(45)))); p("例14 角", th2)
p("例14 E2/E1 (Dn連続, Et連続)", math.sqrt(math.sin(math.radians(45))**2 + (math.cos(math.radians(45))/4)**2))
th=math.degrees(math.atan(2*math.tan(math.radians(30)))); p("じ14 εr1→2, 30°", th)
th=math.degrees(math.atan(1/4*math.tan(math.radians(60)))); p("じ14b εr4→1 60°", th)
p("== 章末")
C=e0*0.02/0.5e-3; p("基1 C pF",C*1e12,"Q",C*12,"E",12/0.5e-3,"U",0.5*C*144)
p("基2 並列",6,"直列",1/(1/1+1/2+1/3),"(1∥2)直列3",3*3/(3+3))
C=4*12/(16); p("基3 直列 μF",C,"Q μC",C*12,"V1",C*12/4,"V2",C*12/12)
C1,C2=4e-6,1e-6; V0=10; Vf=C1*V0/(C1+C2); p("基4 つなぎかえ 4μF10V+1μF V",Vf,"Ub",0.5*C1*V0**2*1e6,"Ua",0.5*(C1+C2)*Vf**2*1e6)
p("基5 50pF→PE", 50*2.3, "電圧の比", 1/2.3, "100 V なら", 100/2.3)
p("基6 u at 3e6", 0.5*e0*9e12, "1 L あたり J", 0.5*e0*9e12*1e-3)
a,b,er=0.5e-3,3.5e-3,2.3
p("チ1 同軸 C pF/m", 2*math.pi*er*e0/math.log(b/a)*1e12, "内外の電場の比", b/a)
q,h=1e-9,0.1
p("チ2 鏡像 力 N", k*q*q/(2*h)**2, "地面の電場", 2*k*q/h**2, "σ", e0*2*k*q/h**2)
p("チ3 εr2→6 30°", math.degrees(math.atan(3*math.tan(math.radians(30)))))
S,dd,V=1e-4,10e-6,20
p("チ4 MEMS F N", 0.5*e0*S*V**2/dd**2, "C pF", e0*S/dd*1e12)
p("チ5 d 2倍：Q一定 U 倍 2, 仕事", "V一定 U 倍 0.5")
# 球の静電容量（同心）
a,b=0.05,0.10
p("同心球 a5cm b10cm pF", 4*math.pi*e0*a*b/(b-a)*1e12)
p("CODATA ε0 で例1", e0x*S*1e12/1e-3 if False else e0x*0.01/1e-3*1e12)
p("== ⑦ 表計算（100 μF・10 V を 10 回・100 回に分ける）")
C = 100e-6; Q = C * 10
for N in (10, 100):
    dq = Q / N
    left = sum((i * dq / C) * dq for i in range(N)); right = sum(((i + 1) * dq / C) * dq for i in range(N))
    p("  N", N, "左 mJ", round(left * 1e3, 3), "右 mJ", round(right * 1e3, 3), "½CV² mJ", 0.5 * C * 100 * 1e3)
