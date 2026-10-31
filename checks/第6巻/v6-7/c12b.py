import math
import numpy as np
def resp(z,wn,t):
    # x(0)=1, v(0)=0
    if z<1:
        a=z*wn; wd=wn*math.sqrt(1-z*z)
        return math.exp(-a*t)*(math.cos(wd*t)+a/wd*math.sin(wd*t))
    if z==1:
        return (1+wn*t)*math.exp(-wn*t)
    r=math.sqrt(z*z-1); s1=-wn*(z-r); s2=-wn*(z+r)
    A=-s2/(s1-s2); B=1-A
    return A*math.exp(s1*t)+B*math.exp(s2*t)
wn=4
for z in [0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0,1.5,2.0,2.5]:
    ts=np.arange(0,20,0.0005)
    xs=np.array([resp(z,wn,t) for t in ts])
    over=-xs.min()
    # settling: last time |x|>0.05
    idx=np.where(np.abs(xs)>0.05)[0][-1]
    print(z, 'overshoot %.3f'%over, 'settle5%% %.3f'%ts[idx+1])
# 1-step dt=0.001 semi implicit
def sim(m,c,k,x0,v0,dt,T):
    x,v=x0,v0; out=[(0,x)]
    for i in range(int(round(T/dt))):
        a=(-c*v-k*x)/m; v+=a*dt; x+=v*dt; out.append(((i+1)*dt,x))
    return out
o=sim(1,3,2,1,0,0.001,3); print([round(x,3) for t,x in o if round(t,3) in (0.5,1,2,3)])
