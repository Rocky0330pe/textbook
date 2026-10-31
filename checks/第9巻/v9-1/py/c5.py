import numpy as np, math
ts=list(range(5,360,10))
for t in [5,15,25,175,185,355]:
    f=1 if t<180 else -1
    print(t,f,["%.4f"%(f*math.sin(math.radians(n*t))) for n in (1,3,5)])
dt=0.1; t=np.arange(0,10+1e-9,dt)
d=np.exp(-2*t)
for i in [0,1,2,3]: print(round(t[i],1), "%.4f"%d[i], "%.4f"%((d[i-1]+d[i])/2*dt) if i>0 else "")
print(t[-1], d[-1], (d[-2]+d[-1])/2*dt, np.sum((d[:-1]+d[1:])/2*dt))
print(1/2)
m = np.arange(8)
x = np.sin(2*np.pi*2*m/8)
np.set_printoptions(precision=3, suppress=True)
print(np.round(x,3))
print(np.round(np.fft.fft(x),3))
print(np.abs(np.fft.fft(x)).round(3))
