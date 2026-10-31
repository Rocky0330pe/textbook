# 力-10 板がたわむ：はりの曲げとたわみ　例題・じぶんでとこう・章末問題の数値（組 P1-6）
# g=9.8 m/s^2、鋼 E=205 GPa、すぎ E=7 GPa（巻末の表）
from math import pi, sqrt
g = 9.8
Es = 205e9; Ew = 7e9
def p(*a): print(*a)

p("== 例題1 本棚の板（単純支持・等分布）")
L, b, h, m = 0.8, 0.25, 0.018, 30
w = m*g/L; I = b*h**3/12
d = 5*w*L**4/(384*Ew*I); dc = m*g*L**3/(48*Ew*I)
p("w", w, "I", I, "delta mm", d*1e3, "center load mm", dc*1e3)
p("== じぶん1  L=0.9, b=0.30, h=0.020, 40kg")
L1,b1,h1,m1=0.9,0.30,0.020,40
w1=m1*g/L1; I1=b1*h1**3/12
p("w",w1,"I",I1,"delta mm",5*w1*L1**4/(384*Ew*I1)*1e3)

p("== 目でわかる：定規の実験の表（計算の見本）")
# 定規（アクリル）の見当：はばを30 mm、厚さ3 mm、E を仮に3 GPa
for Ls in [0.10,0.15,0.20,0.25]:
    pass

p("== 例題2 定規を寝かせる・立てる 30x3")
Iflat = 30*3**3/12; Iedge = 3*30**3/12
p(Iflat, Iedge, Iedge/Iflat)
p("== じぶん2  ものさし 25x2 → ", (25/2)**2)
p("厚さ2倍で1/8, はば2倍で1/2")

p("== 例題3 2点で支えた板 L=2.0 F=600 at a=0.5")
L,F,a = 2.0,600,0.5; bb=L-a
RA=F*bb/L; RB=F*a/L
p("RA",RA,"RB",RB,"Mmax",RA*a, "center FL/4", F*L/4)
p("== じぶん3 L=3.0 F=900 at 1.0")
L,F,a=3.0,900,1.0
p("RA",F*(L-a)/L,"RB",F*a/L,"Mmax",F*(L-a)/L*a)

p("== 例題4 はね出しの板 4 m、支点A(0) B(3)、板20kg、人60kg")
mb, mp = 20, 60
# 板の重心 2 m（Bの左1 m）。Bまわり：mb*g*1 = mp*g*x
x = mb*1/mp
p("x from B", x, "from A", 3+x)
# 人がB上（3m）にいるときの反力
for xp in [0,1.5,3.0,3.0+x]:
    RA = (mb*g*(3-2) + mp*g*(3-xp))/3
    p("xp",xp,"RA",RA,"RB",(mb+mp)*g-RA)
p("== じぶん4 板 5 m、支点 0 と 4 m、板 30 kg、人 50 kg")
x = 30*(4-2.5)/50
p("x from B",x)

p("== 例題5 本棚の板 Q, M, σ")
L,b,h,m=0.8,0.25,0.018,30
w=m*g/L
Q=w*L/2; M=w*L**2/8; Z=b*h**2/6
p("Q",Q,"M",M,"Z",Z,"sigma MPa",M/Z/1e6)
p("== じぶん5 L=0.9,b=0.30,h=0.020,40kg")
w=40*g/0.9; M=w*0.9**2/8; Z=0.30*0.020**2/6
p("Q",w*0.9/2,"M",M,"Z",Z,"sigma",M/Z/1e6)

p("== 例題6 片持ち 鋼 L=1 F=1kN I=1e-6")
L,F,I=1.0,1000,1e-6
p("delta mm",F*L**3/(3*Es*I)*1e3,"theta rad",F*L**2/(2*Es*I),"M at wall",F*L)
p("== じぶん6 L=1.5 F=500 I=2e-6")
L,F,I=1.5,500,2e-6
p("delta mm",F*L**3/(3*Es*I)*1e3)

p("== 例題7 2x4 材 38x89 単純支持 1.8 m 中央 1000 N")
L,F=1.8,1000
M=F*L/4
Zs=0.038*0.089**2/6; Zf=0.089*0.038**2/6
p("M",M,"Zs",Zs,"Zf",Zf,"sig stand",M/Zs/1e6,"sig flat",M/Zf/1e6,"ratio",Zs/Zf)
Is=0.038*0.089**3/12; If=0.089*0.038**3/12
p("I ratio", Is/If)
p("== じぶん7 105角 L=2.0 F=2000")
L,F=2.0,2000; M=F*L/4; Z=0.105**3/6
p("M",M,"Z",Z,"sig",M/Z/1e6)

p("== 例題8 H形 200x100x5.5x8（丸み無視） vs 同じ断面積の正方形")
H,B,tw,tf=200,100,5.5,8
IH=(B*H**3-(B-tw)*(H-2*tf)**3)/12
A=2*B*tf+(H-2*tf)*tw
s=sqrt(A); Isq=s**4/12
p("IH mm4",IH,"cm4",IH/1e4,"A",A,"s",s,"Isq",Isq,"ratio",IH/Isq)
# フランジだけの寄与
If_only=2*(B*tf**3/12+B*tf*((H-tf)/2)**2)
p("flange part",If_only, If_only/IH)
p("== じぶん8 H 150x75x5x7")
H,B,tw,tf=150,75,5,7
IH=(B*H**3-(B-tw)*(H-2*tf)**3)/12
A=2*B*tf+(H-2*tf)*tw; s=sqrt(A)
p("IH",IH,"cm4",IH/1e4,"A",A,"s",s,"Isq",s**4/12,"ratio",IH/(s**4/12))

p("== 例題9 パイプ D40 d30 vs 同じ断面積の中実")
D,dd=40,30
A=pi/4*(D**2-dd**2); ds=sqrt(D**2-dd**2)
Ip=pi/64*(D**4-dd**4); Is_=pi/64*ds**4
p("A",A,"ds",ds,"Ipipe",Ip,"Isolid",Is_,"ratio",Ip/Is_)
p("== じぶん9 D50 d40")
D,dd=50,40; ds=sqrt(D**2-dd**2)
Ip=pi/64*(D**4-dd**4); Is_=pi/64*ds**4
p("ds",ds,"Ipipe",Ip,"Isolid",Is_,"ratio",Ip/Is_)

p("== 例題10 重ね合わせ 本棚 30kg + 5kg 中央")
L,b,h=0.8,0.25,0.018; I=b*h**3/12; EI=Ew*I
w=30*g/L; F=5*g
d1=5*w*L**4/(384*EI); d2=F*L**3/(48*EI)
p("EI",EI,"d1",d1*1e3,"d2",d2*1e3,"sum",(d1+d2)*1e3)
p("== じぶん10 じぶん1の板 + 8 kg 中央")
L,b,h=0.9,0.30,0.020; I=b*h**3/12; EI=Ew*I
w=40*g/L; F=8*g
d1=5*w*L**4/(384*EI); d2=F*L**3/(48*EI)
p("d1",d1*1e3,"d2",d2*1e3,"sum",(d1+d2)*1e3)

p("== 例題11 SGP 50A")
Do,t=60.5e-3,3.8e-3; Di=Do-2*t
I=pi/64*(Do**4-Di**4); As=pi/4*(Do**2-Di**2); Aw=pi/4*Di**2
ms=As*7850; mw=Aw*1000; w=(ms+mw)*g
p("I",I,"As mm2",As*1e6,"ms",ms,"mw",mw,"w",w)
for Ls in [2,3,4,5,6]:
    p("span",Ls,"delta mm",5*w*Ls**4/(384*Es*I)*1e3, "L/delta", Ls/(5*w*Ls**4/(384*Es*I)))
p("ratio 6/4", (6/4)**4)
Z=I/(Do/2)
for Ls in [4,6]:
    M=w*Ls**2/8
    p("span",Ls,"M",M,"sigma MPa",M/Z/1e6)
p("== じぶん11 SGP 25A 34.0 x 3.2")
Do,t=34.0e-3,3.2e-3; Di=Do-2*t
I=pi/64*(Do**4-Di**4); As=pi/4*(Do**2-Di**2); Aw=pi/4*Di**2
w=(As*7850+Aw*1000)*g
p("I",I,"mass steel",As*7850,"water",Aw*1000,"w",w)
for Ls in [2,3]:
    p("span",Ls,"delta mm",5*w*Ls**4/(384*Es*I)*1e3)

p("== 例題12 3点で支える棚 2 x 0.8 m, w=367.5")
L=0.8; w=30*g/L
Rc=1.25*w*L; Re=0.375*w*L
p("Rc",Rc,"Re",Re,"sum",Rc+2*Re,"total",w*2*L)
b,h=0.25,0.018; I=b*h**3/12; EI=Ew*I
d_long=5*w*(2*L)**4/(384*EI)
p("delta if 1.6 m simply",d_long*1e3)
# 連続ばりの最大たわみ：数値で
import numpy as np
xs=np.linspace(0,L,200001)
# 左の径間：反力 Re、M(x)=Re x - w x^2/2 ; EI y''=-M ; y(0)=0, y(L)=0（中央支点）
# 解析：EI y = -(Re x^3/6 - w x^4/24) + C1 x ; y(L)=0
C1=(Re*L**3/6 - w*L**4/24)/L
y=(-(Re*xs**3/6 - w*xs**4/24) + C1*xs)/EI
p("max delta in span mm", y.max()*1e3, "at x", xs[y.argmax()], "coef", y.max()*EI/(w*L**4))
p("simply 0.8 m", 5*w*L**4/(384*EI)*1e3)
p("== じぶん12 2径間 各1.0 m w=500")
L=1.0; w=500
p("Rc",1.25*w*L,"Re",0.375*w*L)

p("== 例題13 両端固定 等分布 vs 単純支持 (1/5)")
L=0.8; w=30*g/L
p("M0 wL2/12", w*L**2/12, "center wL2/24", w*L**2/24, "simple wL2/8", w*L**2/8)
p("delta fixed", w*L**4/(384*EI)*1e3, "simple", 5*w*L**4/(384*EI)*1e3)
p("== じぶん13 両端固定 中央集中 FL^3/192EI vs 48 → 1/4")

p("== 章末問題")
# 基本1：長さ・厚さ・はばを変えたたわみの倍率
p("L 1.5倍:",1.5**3,"h 1.5倍:",1/1.5**3, "b 1.5 → ", 1/1.5)
# 基本2：反力 L=2.4, F=480 at 0.6
L,F,a=2.4,480,0.6
p("RA",F*(L-a)/L,"RB",F*a/L,"M",F*(L-a)/L*a)
# 基本3：長方形断面 I と Z: 40x60 (b=40,h=60)
b,h=40,60
p("I",b*h**3/12,"Z",b*h**2/6)
# 基本4：片持ち 先端 F=300 L=0.5 鋼 平鋼 50x6 立てる? 寝かせて
b,h=0.050,0.006; I=b*h**3/12
p("I",I,"delta",300*0.5**3/(3*Es*I)*1e3, "M", 300*0.5, "sig", 300*0.5/(b*h**2/6)/1e6)
# 基本5：等分布の単純支持の M_max と σ  角材 60x90 (立て) L=2.0, w=1500 N/m
b,h=0.060,0.090; L=2.0; w=1500
M=w*L**2/8; Z=b*h**2/6
p("M",M,"Z",Z,"sig",M/Z/1e6, "Q", w*L/2)
# 基本6：パイプの I  D=60.5 d=52.9 (SGP50A) already; D=89.1 t=4.2 (SGP80A)
Do,t=89.1,4.2; Di=Do-2*t
p("SGP80A I mm4",pi/64*(Do**4-Di**4))
# チャレンジ1：重ね合わせ 単純支持 等分布 + 中央集中 鋼 I=4e-6 L=3 w=2000 F=3000
L,I,w,F=3.0,4e-6,2000,3000; EI=Es*I
p("d1",5*w*L**4/(384*EI)*1e3,"d2",F*L**3/(48*EI)*1e3,"sum",(5*w*L**4/(384*EI)+F*L**3/(48*EI))*1e3)
# チャレンジ2：片持ち 等分布 wL^4/8EI (例題で見せる？) → 片持ち先端集中の重ね合わせで出す
# チャレンジ2：3点支持の中央の反力 L=1.2 each, w=800
L,w=1.2,800
p("Rc",1.25*w*L,"Re",0.375*w*L)
# チャレンジ3：配管の支持間隔：たわみを 2.5 mm 以下に SGP50A
Do,t=60.5e-3,3.8e-3; Di=Do-2*t
I=pi/64*(Do**4-Di**4); As=pi/4*(Do**2-Di**2); Aw=pi/4*Di**2
w=(As*7850+Aw*1000)*g
Lmax=(2.5e-3*384*Es*I/(5*w))**0.25
p("Lmax for 2.5 mm", Lmax)
# 入試1：はね出し 6 m 板 支点 1 m と 4 m?
# 板 長さ 6 m, 質量 30 kg, 支点 A: 左はし, B: 左から 4 m。人 60 kg が右へ歩く。
mb,mp=30,60
x=mb*(4-3)/mp
p("入試1 x beyond B",x,"from left",4+x)
# 入試2：一様な板 L=3, 質量 20 kg, 支点 A(0), B(3). 荷物 40 kg at 1.0 m. 反力
L,mb,mc,a=3.0,20,40,1.0
RA=(mb*g*L/2+mc*g*(L-a))/L; RB=(mb+mc)*g-RA
p("入試2 RA",RA,"RB",RB)
# 入試2 (2) 支点Bを左へ動かして… ひとまず
