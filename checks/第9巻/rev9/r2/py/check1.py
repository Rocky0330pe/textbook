import numpy as np
from scipy import signal, integrate
np.set_printoptions(precision=5, suppress=True)
def trap(f, s, dt, T=10):
    t=np.arange(0,T+dt/2,dt); y=f(t)*np.exp(-s*t); return dt*(y.sum()-(y[0]+y[-1])/2)
print("== 9-5/9-6 trapezoid")
for name,f in [("1",lambda t:np.ones_like(t)),("t",lambda t:t),("e-t",lambda t:np.exp(-t)),("sin3t",lambda t:np.sin(3*t))]:
    print(name, round(trap(f,2,0.1),5), round(trap(f,2,0.01),5))
t=np.array([0,0.1,0.2,0.3]); print("sheet rows", np.round(np.exp(-2*t),4), np.round(t*np.exp(-2*t),4), np.round(np.exp(-3*t),4), np.round(np.sin(3*t)*np.exp(-2*t),4))
print("9-5 trapezoid col E3..", np.round([(np.exp(-2*a)+np.exp(-2*(a+0.1)))/2*0.1 for a in [0,0.1,0.2]],4))
print("e^-20", np.exp(-20))
# oyu euler 1-min
T=80; pts=[T]
for k in range(30): T=T-0.05*(T-20); pts.append(T)
print("oyu euler", np.round(pts[::5],2), "exact10", 20+60*np.exp(-0.5))
print("== eps pulse", [round((1-np.exp(-2*e))/(2*e),3) for e in [1,0.1,0.01,0.001]])
print("pulse s=2", (1-np.exp(-2))/2, "ex7", 3*(1-np.exp(-4))/2, 3*(1-0.0183)/2)
f=lambda t:1/(1+t)
print("1/(1+t) s=1", round(trap(f,1,0.1),4), round(trap(f,1,0.01),4), integrate.quad(lambda t:f(t)*np.exp(-t),0,np.inf)[0])
g=lambda t:1/(1+t)**2
print("1/(1+t)^2 s=1", round(trap(g,1,0.1),4), round(trap(g,1,0.01),4), integrate.quad(lambda t:g(t)*np.exp(-t),0,np.inf)[0])
print("1/(1+t) s=2", round(trap(f,2,0.1),4), round(trap(f,2,0.01),4), integrate.quad(lambda t:f(t)*np.exp(-2*t),0,np.inf)[0])
print("sheet 1/(1+t)", np.round([f(0.1),np.exp(-0.1),f(0.1)*np.exp(-0.1),f(0.2)*np.exp(-0.2), f(10)],4))
print("FVT ex", 0.5-np.exp(-5)+0.5*np.exp(-10), 0.5-np.exp(-10)+0.5*np.exp(-20))
# quad table 9-6
s=2
rows=[(lambda t:t**3,6/s**4),(lambda t:np.exp(-t)*np.sin(2*t),2/((s+1)**2+4)),(lambda t:t*np.sin(2*t),4*s/(s**2+4)**2),(lambda t:(t>=1)*np.exp(-(t-1)),np.exp(-s)/(s+1))]
for fn,F in rows: print(round(integrate.quad(lambda t:fn(t)*np.exp(-s*t),0,50,limit=200)[0],5), round(F,5))
print("t sin2t s=2", 8/64)
