# 力-4（tex/p1-04.tex）の数値の検算。g=9.8
from math import sqrt, sin, cos, tan, atan, radians, degrees, pi, acos
g = 9.8
def p(label, *v): print(label, *[round(x, 4) if isinstance(x, float) else x for x in v])
p("①の速さ", *[sqrt(2*g*d) for d in (10,20,30,40)])
# ③の表計算
xs=[0,10,20,30,40,50,60,70,80,90,100]; hs=[40,34,22,10,3,2,8,18,28,35,38]
c=e=0.0
print("x h v2なし v v2あり v")
for i in range(len(xs)):
    if i>0:
        dh=hs[i]-hs[i-1]; dx=xs[i]-xs[i-1]
        c=c-2*g*dh; e=e-2*g*dh-2*0.03*g*dx
    print(xs[i], hs[i], round(c,2), round(sqrt(c),1) if c>=0 else '-', round(e,2), round(sqrt(e),1) if e>=0 else '-')
# 止まる位置（x=90〜100 の区間で直線とみる）
e90=45.08; per=(2*g*3+2*0.03*g*10)/10
p("止まる x", 90+e90/per, "高さ", 35+0.3*e90/per)
p("摩擦の分 90 m", 2*0.03*g*90)
p("図 摩擦あり和 x=90,97", 392-0.03*g*90, 392-0.03*g*97)
# 円のプログラム
N=100; W=0.0
for i in range(N):
    t0, t1 = 2*pi*i/N, 2*pi*(i+1)/N
    x0,y0,x1,y1=cos(t0),sin(t0),cos(t1),sin(t1)
    xm,ym=(x0+x1)/2,(y0+y1)/2
    W += (-ym)*(x1-x0)+xm*(y1-y0)
print("円 F=(-y,x)", round(W,4), repr(W))
W=0.0
for i in range(N):
    t0, t1 = 2*pi*i/N, 2*pi*(i+1)/N
    x0,y0,x1,y1=cos(t0),sin(t0),cos(t1),sin(t1)
    xm,ym=(x0+x1)/2,(y0+y1)/2
    W += (ym)*(x1-x0)+xm*(y1-y0)
print("円 F=(y,x)", round(W,10))
p("v=√(2gh) 10,20,40,80", *[sqrt(2*g*hh) for hh in (10,20,40,80)])
GM=3.986e14; R=6.371e6
p("第2宇宙速度", sqrt(2*GM/R), "第1", sqrt(GM/R), sqrt(g*R))
p("例1", sqrt(2*g*60), sqrt(2*g*60)*3.6, "じぶん", sqrt(2*g*30))
p("例2 N0/mg", (g+2*g*25/10)/g)
p("例3", 20*g*0.5, 20*g*0.5*4, "じぶん", 15*g*0.5, 15*g*0.5*6)
p("例4", 0.05*sqrt(200/0.01), 0.5*200*0.05**2, "じぶん", 0.04*sqrt(400/0.02))
p("例5", 400/(2*0.7*g), 1600/(2*0.7*g), 0.7*g, "じぶん", 625/(2*0.7*g))
p("例6", 2000*g*0.5, "じぶん", 600*g*1.5)
p("例7", 60*g*3/5, "じぶん", 50*g*4/8)
s=0.05/sqrt(1+0.05**2); p("例8", s, 70*g*s*4, 4*s, 70*g*4*s, "じぶん", 80*g*0.08*3)
Q=0.1/60; p("例9", Q, 1000*Q*g*10, 1000*Q*g*10/0.6, "じぶん", 1000*1e-3*g*5, 1000*1e-3*g*5/0.5)
p("例10", 0.85*1000*10*g*100, "じぶん", 0.8*1000*2*g*50)
p("例11", sqrt(2*GM/R), 2*GM/R, "月", sqrt(2*4.905e12/1.737e6))
def sled(m,h,th,mu):
    dx=h/tan(radians(th)); return dx, mu*m*g*dx, sqrt(2*(m*g*h-mu*m*g*dx)/m)
p("例12 A", *sled(10,5,30,0.1)); p("例12 B", *sled(10,5,10,0.1)); p("μ=0", sqrt(2*g*5))
p("じぶん12 30", *sled(20,3,30,0.2)); p("じぶん12 15", *sled(20,3,15,0.2))
a=0.10-2*0.25*0.5*g/50; p("例14", a, 50*a, 0.25*0.5*g, "じぶん", 0.15-2*0.1*1*g/200)
p("例15", 2/3*1.2, sqrt(2*g*1.2/3), degrees(acos(2/3)), "じぶん", 0.4, sqrt(2*g*0.6/3))
p("1000 kg 100 km/h", 0.5*1000*(100/3.6)**2)
p("軽 64PS", 64*735.49875)
# 章末
p("基本1", sqrt(2*g*40)); p("基本2", 25*g*0.342, 25*g*0.342*5); p("基本3", 0.06*sqrt(300/0.03))
p("基本4", 225/(2*0.5*g)); p("基本5", 500*g*0.8); p("基本6", 1000*2e-3*g*8, 1000*2e-3*g*8/0.7)
p("チャ 火星", sqrt(2*4.283e13/3.39e6)); p("チャ そり45", *sled(20,3,45,0.2)); p("そり20(0.364)", sqrt(2*(g*3-0.2*g*3/0.364)))
p("チャ 半球", 0.6, sqrt(2*g*0.9/3)); p("チャ 自転車", 60*g*0.06*5); p("チャ 発電", 0.8*1000*5*g*40)
# 入試1：鉛直面内の円の内側、v0^2=3gr
# 角θ（いちばん下から）: v^2=gr(1+2cosθ), N=mg(1+3cosθ)
c=-1/3; p("入試1 高さ/r", 1-c, "v^2/(gr)", 1+2*c, "N下/mg", 1+3)
# 入試2
k,m,mu=100,1.0,0.2; f=mu*m*g; x=0.2; side=1; dist=0; stops=[]
while True:
    if k*abs(x) <= f: break
    xn = abs(x)-2*f/k
    dist += abs(x)+xn if xn>0 else 0
    x = -side*xn if False else xn; side=-side; stops.append((side, round(xn,4)))
    if k*xn <= f: break
print("入試2 止まる位置（側, 距離）", stops, "道のり", round(dist,4), "エネルギー法", round((0.5*k*0.2**2-0.5*k*stops[-1][1]**2)/f,4))
