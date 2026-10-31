import numpy as np
from math import *
cd=44100*16*2; print('CD bit/s',cd, cd/1000, 'ratio',cd/128000)
print('4min CD MB',cd*240/8/1e6,'MP3 MB',128000*240/8/1e6)
print('frame ms',1152/44100*1000)
# DCT example row
x=np.array([52,55,61,66,70,61,64,73],float)
N=8
C=np.array([[ (sqrt(1/N) if k==0 else sqrt(2/N))*cos((2*m+1)*k*pi/(2*N)) for m in range(N)] for k in range(N)])
X=C@x; print('DCT',np.round(X,2)); print('orth',np.allclose(C@C.T,np.eye(8)))
for keep in [1,2,3,4]:
    Y=X.copy(); Y[keep:]=0; xr=C.T@Y; print(keep, np.round(xr,1), 'maxerr',round(np.max(abs(xr-x)),2), 'rms', round(np.sqrt(np.mean((xr-x)**2)),2))
# rounding quantization step 10
q=np.round(X/10)*10; print('q',q); xr=C.T@q; print(np.round(xr,1), np.max(abs(xr-x)))
print('energy frac', np.cumsum(X**2)/np.sum(X**2))
# noise cancel residual
for f in [100,500,1000,3000]:
    th=2*pi*f*0.1e-3; r=2*sin(th/2); print(f, round(degrees(th),1), round(r,3), round(20*log10(r),1))
# OFDM
print('symbol us',1/312500*1e6, 64/20e6*1e6)
# aircon P vs PI: 60 T' = (35-T) - (RKp*(T-26) + RKi*int(T-26))
dt=0.01; T=35; I=0; Tp=35
out={}
for k in range(int(60/dt)+1):
    t=k*dt
    if abs(t-round(t))<1e-9 and int(round(t)) in (0,5,10,15,20,30,40,50,60): out[int(round(t))]=(round(Tp,2),round(T,2))
    e=T-26; I+=e*dt
    T+= dt*((35-T)-(9*e+0.4*I))/60
    Tp+=dt*((35-Tp)-9*(Tp-26))/60
print(out)
print(np.roots([60,10,0.4]))
# max cooling power at t=0: P term 9*9=81 in units of RK (deg) 
