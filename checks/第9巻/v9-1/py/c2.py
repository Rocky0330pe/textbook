import numpy as np, math
# (a) square wave sum table
for t in range(0,361,30):
    r=math.radians(t); v=[math.sin(n*r)/n for n in (1,3,5,7)]
    print(t, ["%.4f"%x for x in v], "%.4f"%sum(v), "%.4f"%(sum(v)*4/math.pi))
print([1/n for n in (1,3,5,7)])
# (b) multiply-average
ts=np.arange(5,360,10); f=np.where(ts<180,1,-1)
for n in (1,2,3,5):
    print(n, 2*np.mean(f*np.sin(np.radians(n*ts))))
# (c) laplace trapezoid
dt=0.1; t=np.arange(0,10+1e-9,dt); s=2
for name,fv in [("1",np.ones_like(t)),("t",t)]:
    d=fv*np.exp(-s*t); print(name, np.sum((d[:-1]+d[1:])/2*dt), len(t))
print(np.exp(-20))
