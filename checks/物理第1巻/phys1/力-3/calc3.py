# 力-3 の数値（g=9.8）
from math import *
g=9.8
P=print
P("--- 1 bat: m=0.145, 40 in, 50 out, dt 1ms and 0.7ms")
dp=0.145*(50-(-40)); P("dp",dp,"F 1ms",dp/0.001,"F 0.7ms",dp/0.0007, "ratio to weight", dp/0.001/(0.145*g))
P("--- jibun1: tennis 0.057kg 30->-40? ")
m=0.057; dp=m*(40+30); P("tennis dp",dp,"F 5ms",dp/0.005)
P("--- 2 head 5kg 10m/s stop 0.01 / 0.05")
P(5*10/0.01, 5*10/0.05, "a g", 10/0.01/g, 10/0.05/g)
P("jibun2 egg 0.06kg from 1.25m: v",sqrt(2*g*1.25), "F 0.002", 0.06*sqrt(2*g*1.25)/0.002, "F 0.05",0.06*sqrt(2*g*1.25)/0.05)
P("--- 3 couple 20t 1.0 + 30t 0")
v=20*1.0/50; P("v",v,"K before",0.5*20000*1**2,"after",0.5*50000*v**2)
P("jibun3 couple 30t 1.2 + 10t 0: v", 30*1.2/40, "K", 0.5*30000*1.44, 0.5*40000*(30*1.2/40)**2)
P("--- 4 skate 5kg 4m/s person50")
P(-5*4/50)
P("jibun4 boat 60kg man jumps? 2kg ball 10 m/s, person+boat 80:", -2*10/80)
P("--- 5 e from 1.0->0.64", sqrt(0.64/1.0))
P("v down", sqrt(2*g*1.0), "v up", sqrt(2*g*0.64))
P("jibun5 tennis 2.54->1.40", sqrt(1.40/2.54))
P("ITF range", sqrt(134.62/254), sqrt(147.32/254))
P("--- 6 billiard general 1D solution check e=1 equal mass")
def coll(m1,m2,v1,v2,e):
    V=(m1*v1+m2*v2)/(m1+m2)
    v1p=V-e*m2/(m1+m2)*(v1-v2)
    v2p=V+e*m1/(m1+m2)*(v1-v2)
    return v1p,v2p
P(coll(1,1,2,0,1))
P("--- 7 car 1000@15 + 1500@0")
m1,m2=1000,1500; v=m1*15/(m1+m2); K0=0.5*m1*225; K1=0.5*(m1+m2)*v**2
P(v,K0,K1,K0-K1, "formula", 0.5*m1*m2/(m1+m2)*(1-0)*(15)**2)
P("jibun7 truck 2000@10 + car 1000 @ 0 stick:", 2000*10/3000, 0.5*2000*100-0.5*3000*(20/3)**2, 0.5*2000*1000/3000*100)
P("--- 8 boat 120, person 60 walk 3")
P(60*3/180)
P("jibun8 boat 150, person 50 walk 4:", 50*4/200)
P("--- 9 rocket u=3.0 R=10", 3.0*log(10))
u2=440*9.80665; P("LE-7A u", u2, u2*log(10))
P("u4.3", 4.3*log(10))
for R in [2,4,10,20]: P("R",R, log(R))
P("2stage: each R=sqrt? example: u=3, two stages each ratio 5:", 2*3*log(5), "single 25?", 3*log(25))
P("jibun9 u=2.5 R=8", 2.5*log(8), "R=e", 2.5)
P("--- 10 jet 10m/s 2cm2", 1000*2e-4*10*10, "Q L/min", 2e-4*10*60000)
P("jibun10 15 m/s, 1cm2", 1000*1e-4*15*15)
P("--- 12 bounce t0", sqrt(2*1.0/g), "total", sqrt(2*1.0/g)*(1+0.8)/(1-0.8))
t0=sqrt(2/g); s=t0; e=0.8; tt=t0
for n in range(1,60): tt+=2*t0*e**n
P("sum60", tt)
P("jibun12 e=0.5 h=0.8", sqrt(2*0.8/g)*(1.5/0.5))
P("--- distance total h(1+e^2)/(1-e^2)", 1.0*(1+0.64)/(1-0.64))
P("--- oblique 45deg e=0.5 v=10: vx", 10*cos(radians(45)), "vy", 10*sin(radians(45))*0.5, "angle", degrees(atan(0.5)))
P("=== rocket chunks: m0=10 (t), m1=1, u=3 km/s")
for N in [1,2,3,10,100,1000]:
    m=10.0; v=0.0; dm=9.0/N
    for i in range(N):
        v += 3*dm/m; m -= dm
    P(N, round(v,3))
P("exact", 3*log(10))
P("=== bounce table e=0.8 h=1.0")
t0=sqrt(2*1.0/g); T=t0
for n in range(0,11):
    h=0.8**(2*n); fl=2*t0*0.8**n
    P(n, round(h,3), round(fl,3) if n>0 else round(t0,3), round(T,3))
    T += 2*t0*0.8**(n+1)
P("=== partial sums 1+e+...")
s=0
for n in range(0,21):
    s+=0.8**n
    if n in (0,1,2,3,4,5,10,20): P(n, round(s,4))
P("limit", 1/(1-0.8))
P("=== ex3 landing 50kg 4m/s sand .10 mat .40")
for dt in [0.10,0.40]:
    J=50*4+50*g*dt; P(dt, J, "peak", 2*J/dt, "avg", J/dt)
P("jibun3 40kg 3m/s 0.20", 40*3+40*g*0.2, 2*(40*3+40*g*0.2)/0.2)
P("=== ex7 firework 1.0kg 20 m/s split 0.4 stops -> 0.6:", 20/0.6)
t=sqrt(2*45/g); P("fall 45m t",t,"CM",20*t,"B",20/0.6*t,"check",0.6*20/0.6*t)
P("jibun7 2.0kg 10 m/s, 1.5 stops -> 0.5:", 2*10/0.5, "h20 t", sqrt(40/g), "CM", 10*sqrt(40/g), "B", 40*sqrt(40/g))
P("=== ex9 m1=2 v1=3 m2=1 e=.5")
P(coll(2,1,3,0,0.5), "lost", 0.5*2*1/3*(1-0.25)*9)
P("jibun9 m1=1 v=4 m2=3 e=.5", coll(1,3,4,0,0.5), 0.5*3/4*0.75*16)
P("=== ex11 oblique 2 m/s 30deg", 2*cos(radians(30)), 2*sin(radians(30)))
P("=== ex15 spring 2kg 3m/s, 1kg, k800: V", 6/3, "E", 9-0.5*3*4, "x", sqrt(2*3/800), coll(2,1,3,0,1))
P("jibun15 1kg 4m/s, 3kg, k1200:", 4/4, 8-0.5*4*1, sqrt(2*6/1200), coll(1,3,4,0,1))
P("=== ex16 sled 20 box10 v3 mu.3")
def sled(M,m,v,mu):
    V=m*v/(M+m); f=mu*m*g; a1=f/m; a2=f/M; t=v/(a1+a2)
    d1=v*t-0.5*a1*t*t; d2=0.5*a2*t*t
    return V,f,a1,a2,t,d1,d2,d1-d2,(0.5*m*v*v-0.5*(M+m)*V*V)/f
P(sled(20,10,3,0.3)); P("jibun16", sled(30,10,4,0.4)); P("nyushi11", sled(3,1,4,0.5))
P("=== problems")
P("1 volley", 0.27*25/0.02)
P("2 catch", 0.15*20/0.01, 0.15*20/0.05)
P("3 merge", 2*3/3, 0.5*2*9, 0.5*3*4)
P("4 throw", 3*8/60)
P("5 e", sqrt(0.9/1.6))
P("6 jet", 1000*0.5e-4*400)
P("7 coll", coll(3,1,2,0,0.6), 0.5*3/4*(1-0.36)*4)
P("8 boat", 50*2.4/150)
P("9 bounce", sqrt(2*1.6/g)*1.6/0.4)
P("10 rocket", 2*log(5), 2*log(25))
P("12 nyushi spring: V", 6*1/3, "E", 18-0.5*3*4, "x k600", sqrt(2*12/600))
P("crash: 55km/h", 55/3.6, "a d=0.6", (55/3.6)**2/1.2, (55/3.6)**2/1.2/g, "t", 2*0.6/(55/3.6), "d=0.1 a/g", (55/3.6)**2/0.2/g)
P("bat F/weight", 13.05/0.0007/(0.145*g), "gravity impulse", 0.145*g*0.0007)
P("=== 2-stage rocket u=3.0")
P("single", 3*log(100/10))
d1=3*log(100/40); d2=3*log(34/4); P("stage1",d1,"stage2",d2,"total",d1+d2)
