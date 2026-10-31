# 力-11 ねじる・ふくらむ・曲がる：ねじりと座屈　数値（組 P1-6）
# 鋼 E=205 GPa、G=79 GPa（E/(2(1+0.3))=78.8）、アルミ合金 E=69 GPa（巻末の表）、STK500 降伏点 355 MPa
from math import pi, sqrt, sin, cos, exp
g=9.8; Es=205e9; G=79e9; Ea=69e9
def p(*a): print(*a)
p("G from E,nu", Es/(2*1.3))

p("== 目でわかる① ストロー/スパゲッティ：長さ2倍で1/4")
p("== 例題1 アルミ棒 d=5mm L=0.5m 両はしピン")
d=5e-3; L=0.5; I=pi*d**4/64
Fcr=pi**2*Ea*I/L**2
p("I",I,"Fcr",Fcr)
p("== じぶん1 アルミ d=4 mm L=0.4 m", pi**2*Ea*pi*(4e-3)**4/64/0.4**2)
p("== 例題2 長さ2倍・直径2倍")
p("L x2:",Fcr/4,"d x2:",Fcr*16)
p("== じぶん2 長さ1.5倍・直径1.5倍 → ", 1/1.5**2, 1.5**4, 1.5**4/1.5**2)
p("== 例題3 下を固定・上は自由 有効長さ 2L  d=5mm L=0.5")
p("Fcr", pi**2*Ea*I/(2*L)**2)
p("== じぶん3 両はし固定 有効長さ 0.5L", pi**2*Ea*I/(0.5*L)**2)
p("== 例題4 足場の鋼管 48.6x2.4, 3.6 m")
D,t=48.6e-3,2.4e-3; di=D-2*t
A=pi/4*(D**2-di**2); I=pi/64*(D**4-di**4); i=sqrt(I/A)
p("A mm2",A*1e6,"I mm4",I*1e12,"i mm",i*1e3, "Z mm3", I/(D/2)*1e9)
for Ls in [3.6,1.8]:
    Fc=pi**2*Es*I/Ls**2; lam=Ls/i
    p("L",Ls,"Fcr kN",Fc/1e3,"lambda",lam,"sigma_cr MPa",Fc/A/1e6)
Fy=A*355e6
p("Fy kN",Fy/1e3, "mass kg/m", A*7850)
p("== 例題5 細長比の境 lambda_p = pi sqrt(E/sy)")
lam_p=pi*sqrt(Es/355e6); p("lam_p",lam_p,"L at lam_p", lam_p*i)
p("== じぶん4 アルミ棒 d=10 mm L=1.0 → λ", 1.0/(10e-3/4), "Fcr", pi**2*Ea*pi*(10e-3)**4/64/1.0**2)
p("== じぶん5: 足場管 2.4 m  →", pi**2*Es*I/2.4**2/1e3, 2.4/i)
p("== 例題6 ポンプの軸 P=100 kW n=3000/min tau_a=50 MPa")
P=100e3; n=3000/60; w=2*pi*n; T=P/w
d=(16*T/(pi*50e6))**(1/3)
p("omega",w,"T",T,"d",d)
p("== じぶん6 P=15 kW n=1500/min tau=40 MPa")
P=15e3; w=2*pi*1500/60; T=P/w; d=(16*T/(pi*40e6))**(1/3)
p("T",T,"d",d)
p("== 例題7 ねじれ角 d=32mm L=1.0 T=318.3 G=79e9")
d=32e-3; Ip=pi*d**4/32; T=100e3/(2*pi*50)
phi=T*1.0/(G*Ip)
p("Ip",Ip,"phi rad",phi,"deg",phi*180/pi, "tau_max", 16*T/(pi*d**3)/1e6)
p("== じぶん7 d=25 mm L=0.8 T=100")
d=25e-3; Ip=pi*d**4/32; phi=100*0.8/(G*Ip); p("phi",phi,"deg",phi*180/pi)
p("== 例題8 中空軸 D40 d30 vs 同じ面積の中実 26.46")
D,dd=40e-3,30e-3; ds=sqrt(D**2-dd**2)
Zp_h=pi*(D**4-dd**4)/(16*D); Zp_s=pi*ds**3/16
Ip_h=pi*(D**4-dd**4)/32; Ip_s=pi*ds**4/32
p("ds",ds,"Zp_h",Zp_h*1e9,"Zp_s",Zp_s*1e9,"ratio",Zp_h/Zp_s,"Ip ratio",Ip_h/Ip_s)
p("== じぶん8 D50 d40 vs ds=30")
D,dd=50e-3,40e-3; ds=sqrt(D**2-dd**2)
p("ds",ds,"Zp ratio",(pi*(D**4-dd**4)/(16*D))/(pi*ds**3/16))
p("== 例題9 空気タンク p=1.0MPa(ゲージ) r=0.15 t=3mm")
pg=1.0e6; r=0.15; t=3e-3
p("sig_th",pg*r/t/1e6,"sig_z",pg*r/(2*t)/1e6)
p("== じぶん9 p=0.8 MPa r=0.25 t=4 mm", 0.8e6*0.25/4e-3/1e6, 0.8e6*0.25/(2*4e-3)/1e6)
p("== 例題10 缶 p=0.3 MPa r=33mm t=0.1mm")
p("sig_th", 0.3e6*0.033/1e-4/1e6, "sig_z", 0.3e6*0.033/2e-4/1e6)
p("== じぶん10 ペットボトル? p=0.4 MPa r=0.045 t=0.3mm", 0.4e6*0.045/0.3e-3/1e6)
p("== 例題11 球形タンク r=5 m p=1.0 MPa sigma_a=150 MPa →t", 1.0e6*5/(2*150e6))
p("== じぶん11 r=8 m p=0.6 sig=120 →", 0.6e6*8/(2*120e6))
p("magdeburg: p0=101325, r=0.25 m: F=", 101325*pi*0.25**2)
p("== 例題12 コイルばね G=79e9 d=1mm D=10mm n=10")
d=1e-3; Dm=10e-3; nn=10
k=G*d**4/(8*Dm**3*nn); p("k",k,"x for 1 kg mm",9.8/k*1e3)
tau=8*9.8*Dm/(pi*d**3); p("tau for 1kg MPa",tau/1e6)
p("== じぶん12 d=2mm D=20mm n=8", G*(2e-3)**4/(8*(20e-3)**3*8))
p("== 例題13 L字 b=1.0 h=2.0 F=200, SGP50A I")
Do,t=60.5e-3,3.8e-3; Di=Do-2*t; I=pi/64*(Do**4-Di**4); EI=Es*I
b,h,F=1.0,2.0,200
d1=F*b**3/(3*EI); d2=F*b**2*h/EI
p("EI",EI,"arm",d1*1e3,"post",d2*1e3,"total",(d1+d2)*1e3)
p("== じぶん13 b=0.5 h=1.0 F=300 same EI")
b,h,F=0.5,1.0,300
p("total mm",(F*b**3/(3*EI)+F*b**2*h/EI)*1e3)
p("== カスティリアーノで片持ち FL^3/3EI 確認")
p("== 手でわかる④ 初期たわみ y0 → y0/(1-F/Fcr)")
for r_ in [0,0.2,0.4,0.5,0.6,0.8,0.9,0.95,0.99]:
    p(r_, 1/(1-r_))
# 例：アルミ棒 Fcr=83.6 N、初期たわみ 1 mm
Fc=pi**2*Ea*(pi*(5e-3)**4/64)/0.25
for F in [0,20,40,60,70,80]:
    p("F",F,"amp", 1/(1-F/Fc), "y mm", 1.0/(1-F/Fc))
p("== はさんでさがす（シューティング）")
def yL(F, EI=Ea*pi*(5e-3)**4/64, L=0.5, n=2000):
    dx=L/n; y=0; v=1.0
    for i in range(n):
        a=-F/EI*y
        v+=a*dx; y+=v*dx
    return y
lo,hi=10,150
p("yL lo",yL(lo),"hi",yL(hi))
for it in range(30):
    mid=(lo+hi)/2
    if yL(mid)>0: lo=mid
    else: hi=mid
p("Fcr by shooting",(lo+hi)/2)
p("== 章末")
# 基本：座屈の倍率、P=Tω、σθ
p("基本1: L 1/2 →4倍, d 1.5倍→",1.5**4)
P=7.5e3; n=1450/60; T=P/(2*pi*n); p("基本2 T",T, "tau d=20mm", 16*T/(pi*(20e-3)**3)/1e6)
p("基本3 pipe tank p=0.5 r=0.3 t=5mm", 0.5e6*0.3/5e-3/1e6, 0.5e6*0.3/(2*5e-3)/1e6)
p("基本4 coil d=3 D=30 n=12", G*(3e-3)**4/(8*(30e-3)**3*12))
# 基本5 足場 2.0 m の鋼管 Fcr
D,t=48.6e-3,2.4e-3; di=D-2*t; I=pi/64*(D**4-di**4)
p("基本5 Fcr 2.0 m", pi**2*Es*I/2.0**2/1e3, "λ", 2.0/sqrt(I/(pi/4*(D**2-di**2))))
# チャレンジ: 中空軸の直径を決める D, d=0.8D, T=1000, tau=40
T=1000; tau=40e6
D=(16*T/(pi*tau*(1-0.8**4)))**(1/3); p("チャレンジ1 D",D,"d",0.8*D)
ds=(16*T/(pi*tau))**(1/3); p("solid ds",ds,"mass ratio", (D**2-(0.8*D)**2)/ds**2)
# チャレンジ2 初期たわみの増幅
p("チャレンジ2 F/Fcr=0.75 →",1/(1-0.75))
# チャレンジ3 L字 b=0.8 h=1.2 F=150 EI=SGP25A
Do,t=34e-3,3.2e-3; Di=Do-2*t; I=pi/64*(Do**4-Di**4); EI=Es*I
b,h,F=0.8,1.2,150
p("チャレンジ3 EI",EI,"delta mm",(F*b**3/(3*EI)+F*b**2*h/EI)*1e3)
# 入試1 マグデブルク r=0.20 m p0=1.0e5 p_in=0.2e5
r=0.20; p("入試1 F", (1.0e5-0.2e5)*pi*r**2)
# 入試2 ばね k、半分に切る→2k、2本並列→2k、直列→k/2
p("入試2 k=490 N/m, 0.5 kg: x", 0.5*9.8/490, "half", 0.5*9.8/980, "parallel", 0.5*9.8/980, "series", 0.5*9.8/245)
