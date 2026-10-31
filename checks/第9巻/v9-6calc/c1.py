import numpy as np
from math import *
# thermometer tau=30, 20->80
for t in [0,10,20,30,40,60,90,120,150]:
    print(t, round(80-60*exp(-t/30),2), round(1-exp(-t/30),4))
# euler dt=5 for thermometer
T=20; dt=5
for k in range(0,31):
    t=k*dt
    if t in (0,5,10,15,20,25,30,60,90,120,150): print('E',t,round(T,2))
    T=T+(80-T)/30*dt
# zeta overshoot
for z in [0.1,0.2,0.3,0.5,0.6,0.7,1/sqrt(2),1]:
    if z<1: print('z',z, round(100*exp(-pi*z/sqrt(1-z*z)),2))
# second order wn=4 step responses
def step2(z,wn,t):
    if z<1:
        wd=wn*sqrt(1-z*z); s=z*wn
        return 1-exp(-s*t)*(cos(wd*t)+s/wd*sin(wd*t))
    elif z==1:
        return 1-exp(-wn*t)*(1+wn*t)
    else:
        r=np.roots([1,2*z*wn,wn*wn]); p1,p2=r
        return 1+ (p2*exp(p1*t)-p1*exp(p2*t))/(p1-p2)
for z in [0,0.3,1.5]:
    print('zeta',z,[round(step2(z,4,t),3) for t in np.arange(0,3.01,0.25)])
    print(np.roots([1,2*z*4,16]))
z=0.3; wn=4; print('wd',wn*sqrt(1-z*z), 'tp',pi/(wn*sqrt(1-z*z)), 'peak', step2(z,4,pi/(wn*sqrt(1-z*z))))
