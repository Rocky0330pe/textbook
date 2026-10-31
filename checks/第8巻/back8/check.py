# 第8巻 巻末の数の検算
import numpy as np, math
from math import pi, sqrt
p=lambda *a: print(*a)
# 板 sigma=10+5x+2y, 2m x 1m
f=lambda x,y:10+5*x+2*y
xs=np.linspace(0,2,2001); ys=np.linspace(0,1,1001)
X,Y=np.meshgrid((xs[:-1]+xs[1:])/2,(ys[:-1]+ys[1:])/2); p('板',(f(X,Y)*(2/2000)*(1/1000)).sum())
mx=np.array([0.25,0.75,1.25,1.75]); my=np.array([0.25,0.75]); p('4x2 中点',sum(f(a,b)*0.25 for a in mx for b in my), '左下の角',sum(f(a-0.25,b-0.25)*0.25 for a in mx for b in my))
p('内側 int_0^2', '20+10+4y')
p('sqrt(pi)',sqrt(pi),'1/sqrt2',1/sqrt(2))
GM=3.986e14; R=6.371e6; p('g',GM/R**2,'半分の深さ',GM/R**2/2)
e0=8.85e-12; p('1/(4pi e0)',1/(4*pi*e0),'Q/e0',1e-9/e0)
mu0=4*pi*1e-7; p('c',1/sqrt(mu0*e0),1/sqrt(mu0*8.854e-12)); p('B',mu0*10/(2*pi*0.05))
p('管',0.2*pi*0.01**2/2*1e6,'mL/s')
h=lambda x,y:100-0.01*x**2-0.02*y**2
p('h(30,20)',h(30,20),'grad',-0.02*30,-0.04*20,'|grad|',math.hypot(0.6,0.8),'全微分 real',h(31,21)-h(30,20))
a=100; b=sqrt(100/0.02); p('体積',pi*a*b*100/2,'仕事',50*9.8*(100-83))
# F1=(y,x), F2=(-y,x)
def line(F,pts,n=20000):
    tot=0
    for (x0,y0),(x1,y1) in zip(pts[:-1],pts[1:]):
        t=(np.arange(n)+0.5)/n; x=x0+(x1-x0)*t; y=y0+(y1-y0)*t
        Fx,Fy=F(x,y); tot+=((Fx*(x1-x0)+Fy*(y1-y0))/n).sum()
    return tot
F1=lambda x,y:(y,x); F2=lambda x,y:(-y,x)
A=[(0,0),(1,0),(1,1)]; Bp=[(0,0),(0,1),(1,1)]; sq=[(0,0),(1,0),(1,1),(0,1),(0,0)]
p('F1 A,B',line(F1,A),line(F1,Bp),'F2 A,B',line(F2,A),line(F2,Bp),'F2 square',line(F2,sq))
th=np.linspace(0,2*pi,200001); p('F2 circle r=1', line(F2,list(zip(np.cos(th),np.sin(th))),n=1), 2*pi)
# robot
L1,L2,t1,t2=0.30,0.25,math.radians(30),math.radians(45)
J=np.array([[-L1*math.sin(t1)-L2*math.sin(t1+t2),-L2*math.sin(t1+t2)],[L1*math.cos(t1)+L2*math.cos(t1+t2),L2*math.cos(t1+t2)]])
p('J',J.round(4),'det',round(np.linalg.det(J),4))
p('wall q',-1.6*(-100))
# cube F=(x^2,xy,-z): faces
n=400; u=(np.arange(n)+0.5)/n; U,V=np.meshgrid(u,u)
faces={'x=1':(1**2+0*U).mean(),'x=0':-(0*U).mean(),'y=1':(U*1).mean(),'y=0':-(U*0).mean(),'z=1':(-1+0*U).mean(),'z=0':-(-0*U).mean()}
p('cube faces',faces,'sum',sum(faces.values()),'div int',3*0.5-1)
# six fields
hh=1e-6
for name,F in [('ア',lambda x,y:(x,y)),('イ',lambda x,y:(-x,-y)),('ウ',lambda x,y:(1,0)),('エ',lambda x,y:(-y,x)),('オ',lambda x,y:(y,0)),('カ',lambda x,y:(x,0))]:
    x0,y0=0.3,0.7
    dFx_dx=(F(x0+hh,y0)[0]-F(x0-hh,y0)[0])/(2*hh); dFy_dy=(F(x0,y0+hh)[1]-F(x0,y0-hh)[1])/(2*hh)
    dFy_dx=(F(x0+hh,y0)[1]-F(x0-hh,y0)[1])/(2*hh); dFx_dy=(F(x0,y0+hh)[0]-F(x0,y0-hh)[0])/(2*hh)
    p(name,'div',round(dFx_dx+dFy_dy,6),'rot',round(dFy_dx-dFx_dy,6))
# relax 5x5
T=np.zeros((5,5)); T[0,1:4]=100
for k in range(50):
    U2=T.copy(); U2[1:4,1:4]=(T[0:3,1:4]+T[2:5,1:4]+T[1:4,0:3]+T[1:4,2:5])/4; T=U2
p('relax center',T[2,2].round(3))
# heat
T=np.full(11,20.0); T[0]=100; r=1e-4*0.25/0.01**2; t=0
while T[5]<50:
    U2=T.copy(); U2[1:10]=T[1:10]+r*(T[2:11]-2*T[1:10]+T[0:9]); U2[10]=T[10]+2*r*(T[9]-T[10]); T=U2; t+=0.25
p('heat',r,t,T.round(1))
N=9
for rr in [0.25,0.5,0.6]:
    Am=np.eye(N)*(1-2*rr)+np.eye(N,k=1)*rr+np.eye(N,k=-1)*rr; lam=np.linalg.eigvalsh(Am); p('eig',rr,lam.min().round(4),lam.max().round(4))
xg=np.arange(0,60,10); yg=np.arange(40,-10,-10); X,Y=np.meshgrid(xg,yg); p(100-0.01*X**2-0.02*Y**2)
for name,al in [('銅',1.2e-4),('アルミ',1.0e-4),('鉄',2.3e-5),('ステンレス',4e-6),('水',1.4e-7)]:
    tt=0.01/al; p(name,round(tt),'s',round(tt/60,1),'min',round(tt/3600,1),'h')
p('Al alpha',237/(2700*897))
p('立体角30',2*pi*(1-math.cos(math.radians(30))))
p('I circle d=0.04',pi*0.04**4/64)
p('Gauss int', (np.exp(-np.linspace(-10,10,200001)**2)).sum()*(20/200000))
