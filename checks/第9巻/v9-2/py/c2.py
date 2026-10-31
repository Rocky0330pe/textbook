import numpy as np
T=np.full(11,100.0); T[0]=T[-1]=0
t=0; r=0.25
while True:
    Tn=T.copy(); Tn[1:-1]=T[1:-1]+r*(T[2:]-2*T[1:-1]+T[:-2]); T=Tn; t+=0.25
    if abs(t-10)<1e-9: print('10s',T[5])
    if T[5]<50 and 'done' not in globals(): print('cross',t,T[5]); done=1
    if t>12: break
# 36 pt rows
for d in [5,15,25,35,45,175,185,195,355]:
    th=np.radians(d); f=1 if d<180 else -1
    print(d,f, round(f*np.sin(th),4), round(f*np.sin(2*th),4), round(f*np.sin(3*th),4))
