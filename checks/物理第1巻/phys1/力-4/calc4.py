# 力-4 の数値（g=9.8）
from math import *
g=9.8; P=print
P("=== (1) table 40m")
for h in [40,30,20,10,0]:
    P(h, 2*g*(40-h), sqrt(2*g*(40-h)))
P("=== (3) sheet")
xs=list(range(0,101,10)); hs=[40,34,22,10,3,2,8,18,28,35,38]; mu=0.03
v2a=0; v2b=0
P("x h v2(no) v(no) v2(mu) v(mu)")
for i,(x,h) in enumerate(zip(xs,hs)):
    if i>0:
        dh=h-hs[i-1]; dx=x-xs[i-1]
        v2a=v2a-2*g*dh; v2b=v2b-2*g*dh-2*mu*g*dx
    P(x,h,round(v2a,1),round(sqrt(max(v2a,0)),1),round(v2b,1),round(sqrt(v2b),1) if v2b>=0 else '--')
# where stop in last segment
v2_90=2*g*5-2*mu*g*90; rate=2*g*0.3+2*mu*g; P("v2 at 90", v2_90, "stop dx", v2_90/rate, "h", 35+0.3*v2_90/rate)
P("=== ex1 coaster 60", sqrt(2*g*60), sqrt(2*g*60)*3.6)
P("jibun1 coaster 45 to 5", sqrt(2*g*40), "speed at 20 from 50:", sqrt(2*g*30))
P("=== ex2 loop r10 h", 2.5*10, "N bottom/mg", 1+2*g*25/10/g)
P("jibun2 r=8", 2.5*8)
P("=== ex3 20kg 30deg 4m", 20*g*4*0.5, "F", 20*g*0.5, "lift F", 20*g)
P("jibun3 15kg 30deg 6m", 15*g*6*0.5, 15*g*0.5)
P("=== ex4 toy gun", 0.05*sqrt(200/0.01))
P("jibun4 k400 4cm 20g", 0.04*sqrt(400/0.02))
P("=== ex5 skid", 400/(2*0.7*g))
P("jibun5 15 m/s mu .5", 225/(2*0.5*g), "25m/s mu.7", 625/(2*.7*g))
P("=== ex6 crane", 2000*g*0.5)
P("jibun6 elevator 600 1.5", 600*g*1.5)
P("=== ex7 stairs", 60*g*3/5)
P("jibun7 50kg 4m 8s", 50*g*4/8)
P("=== ex8 bike", 70*g*0.05/sqrt(1+0.05**2)*4, "tan approx", 70*g*0.05*4)
P("jibun8 80kg 8% 3 m/s", 80*g*0.08/sqrt(1+0.0064)*3, 80*g*0.08*3)
P("=== ex9 pump", 1000*g*(100/60000)*10, 1000*g*(100/60000)*10/0.6)
P("jibun9 5m 60L/min .5", 1000*g*(60/60000)*5, 1000*g*(60/60000)*5/0.5)
P("=== ex10 hydro", 1000*g*10*100*0.85/1e6)
P("jibun10 Q=2 H=50 .8", 1000*g*2*50*0.8/1e6)
GM=3.986e14; R=6.371e6
P("=== ex11 v2", sqrt(2*GM/R), "g=GM/R2", GM/R**2, "v1", sqrt(GM/R))
GMm=4.905e12; Rm=1.7374e6; P("moon v2", sqrt(2*GMm/Rm), "moon g", GMm/Rm**2)
P("=== ex12 two paths 10kg h5 mu .1")
for th in [30,10]:
    L=5/sin(radians(th)); dx=5/tan(radians(th)); Wf=-0.1*10*g*dx; Wg=10*g*5
    P(th, L, dx, Wg, Wf, sqrt(2*(Wg+Wf)/10))
P("jibun12 20kg h3 mu .2, 30 and 15")
for th in [30,15]:
    dx=3/tan(radians(th)); Wf=-0.2*20*g*dx; Wg=20*g*3; P(th, dx, Wg, Wf, sqrt(2*(Wg+Wf)/20) if Wg+Wf>0 else 'stop')
P("=== ex13 circle integral (-y,x)")
N=1000; s=0
for i in range(N):
    t0=2*pi*i/N; t1=2*pi*(i+1)/N
    x0,y0=cos(t0),sin(t0); x1,y1=cos(t1),sin(t1)
    xm,ym=(x0+x1)/2,(y0+y1)/2
    s+=(-ym)*(x1-x0)+xm*(y1-y0)
P(s, 2*pi)
s2=0
for i in range(N):
    t0=2*pi*i/N; t1=2*pi*(i+1)/N
    x0,y0=cos(t0),sin(t0); x1,y1=cos(t1),sin(t1)
    xm,ym=(x0+x1)/2,(y0+y1)/2
    s2+=(ym)*(x1-x0)+xm*(y1-y0)
P("(y,x) loop", s2)
for N in [4,8,100]:
    s=0
    for i in range(N):
        t0=2*pi*i/N; t1=2*pi*(i+1)/N
        x0,y0=cos(t0),sin(t0); x1,y1=cos(t1),sin(t1)
        xm,ym=(x0+x1)/2,(y0+y1)/2
        s+=(-ym)*(x1-x0)+xm*(y1-y0)
    P("N",N,round(s,4))
P("=== ex14 spring friction m.5 k50 mu.25 x0 .1: d", 0.25*0.5*g/50, "a", 0.1-2*0.25*0.5*g/50)
P("jibun14 m1 k200 mu.1 x0.15", 0.15-2*0.1*1*g/200)
P("nyushi12 m1 k100 mu.2 x0 .2")
d=0.2*1*g/100; a=0.2; seq=[a]
while a>d:
    a=a-2*d; seq.append(a)
P(d, seq, "D", (0.5*100*(0.04-seq[-1]**2))/(0.2*1*g))
P("=== ex15 hemisphere cos=2/3 deg", degrees(acos(2/3)), "r1.2 h", 1.2*2/3, "v", sqrt(2*g*1.2/3))
P("jibun15 r.6", 0.6*2/3, sqrt(2*g*0.6/3))
P("prob10 r.9", 0.9*2/3, sqrt(2*g*0.9/3))
P("=== problems")
P("1", sqrt(2*g*40)); P("2", 15*g*3, 15*g*0.5); P("3", 0.04*sqrt(400/0.02)); P("4", 225/(2*0.5*g)); P("5", 600*g*1.5)
P("6", 1000*g*(60/60000)*5, 1000*g*(60/60000)*5/0.5)
P("7 r6", 15, "N/mg", 1+2*15/6)
P("9 20kg h3 mu.2 45 vs 20")
for th in [45,20]:
    dx=3/tan(radians(th)); Wf=-0.2*20*g*dx; Wg=20*g*3; P(th, dx, Wg, Wf, sqrt(2*(Wg+Wf)/20))
P("== keta: K of car 1000kg 100km/h", 0.5*1000*(100/3.6)**2)
P("== baisuru K: v 10,20,30", [0.5*1*v*v for v in (10,20,30)])
P("== power car 1000kg climbing 10% at 20 m/s", 1000*g*0.1/sqrt(1.01)*20)
P("== mgh approx error at h=400km", (GM/R - GM/(R+4e5)), g*4e5, "ratio", (GM/R - GM/(R+4e5))/(GM/R**2*4e5))
