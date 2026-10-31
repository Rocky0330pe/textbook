import numpy as np
from scipy import integrate, special
E=np.exp
def Lnum(f,s,T=80): return integrate.quad(lambda u: f(u)*E(-s*u),0,T,limit=400)[0]
T=lambda t:20+60*E(-0.05*t)
print('T10,T20',T(10),T(20))
xs=[80.0]
for k in range(30): xs.append(xs[-1]-0.05*(xs[-1]-20))
print('euler',[round(xs[i],2) for i in (0,5,10,15,20,25,30)])
print('exact',[round(T(i),2) for i in (0,5,10,15,20,25,30)])
tt=np.arange(0,10.0001,0.1)
for name,f,ex in [('1',lambda u:np.ones_like(u),0.5),('t',lambda u:u,0.25),('t2',lambda u:u**2,0.25),('e-t',lambda u:E(-u),1/3),('sin3t',lambda u:np.sin(3*u),3/13),('cos3t',lambda u:np.cos(3*u),2/13),('e-tsin2t',lambda u:E(-u)*np.sin(2*u),2/13),('te-t',lambda u:u*E(-u),1/9)]:
    y=f(tt)*E(-2*tt); print(name,'trap',round(np.trapezoid(y,tt),5),'quad',round(Lnum(lambda u: f(np.array(u)),2),5),'exact',round(ex,5))
print('RC',[10-10*E(-k/2) for k in (2,6)])
print('pulse s=2',(1-E(-2))/2)
for e in (1,0.5,0.1,0.01,0.001): print('delta eps',e,(1-E(-e*2))/(e*2))
f=lambda t:0.5-E(-t)+0.5*E(-2*t); print('fv',[f(k) for k in (1,2,5,10)])
# check L of f = 1/(s(s+1)(s+2)) at s=1: 1/6
print(Lnum(f,1),1/6)
# 1/(1+t)
g=lambda u:1/(1+u)
print('L 1/(1+t) s=1 exact', E(1)*special.exp1(1))
for dt in (1,0.5,0.25,0.1):
    t2=np.arange(0,10.0001,dt); print(dt, np.trapezoid(g(t2)*E(-t2),t2))
g2=lambda u:1/(1+u)**2
print('L 1/(1+t)^2 s=1', Lnum(g2,1))
for dt in (1,0.5): t2=np.arange(0,10.0001,dt); print(dt,np.trapezoid(g2(t2)*E(-t2),t2))
