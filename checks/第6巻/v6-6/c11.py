import math
from math import cosh,sinh,tanh,exp,sqrt
for x in [0,0.5,1,1.5,2,3]:
    print(x, round(exp(x),4), round(exp(-x),4), round(cosh(x),4), round(sinh(x),4), round(tanh(x),4), round(cosh(x)**2-sinh(x)**2,6))
# skydiver
m=80; c=0.26; g=9.8
vt=sqrt(m*g/c); print('vt',vt)
for t in [1,2,3,5,8,10,15,20]:
    u=g*t/vt; print(t, round(u,4), round(tanh(u),4), round(vt*tanh(u),2))
print('atanh0.9', math.atanh(0.9), math.atanh(0.9)*vt/g, math.atanh(0.95)*vt/g, math.atanh(0.99)*vt/g)
# euler for skydiver dt=0.1 and 1
for dt in [1,0.1]:
    v=0;t=0;out={}
    while t<20+1e-9:
        out[round(t,3)]=v
        v=v+(g-c/m*v*v)*dt; t+=dt
    print(dt,[round(out[k],2) for k in [1,2,3,5,10]])
# catenary
def sag(a,L): return a*(cosh(L/2/a)-1)
print('a50 sag', sag(50,100), 50*(cosh(25/50)-1), 'parab', sag(50,100)*(25/50)**2)
print('a100', sag(100,100))
print('wire a625', sag(625,100), 100**2/(8*625))
