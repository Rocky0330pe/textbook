import numpy as np
from scipy import signal
m,k=250,16000
for c in [1000,2000,4000,8000]:
    t=np.linspace(0,20,200001)
    for num in ([c,k],[k]):
        sys=signal.lti(num,[m,c,k])
        tt,y=signal.step(sys,T=t)
        i=np.argmax(y); print(c, num, round(5*y.max(),4), 't=',round(tt[i],3), 'y(3s)=',round(5*y[np.searchsorted(tt,3)],4),'y(1)',round(5*y[np.searchsorted(tt,1)],4))
for K in [1,4,8,10]:
    print(K,np.roots([1,3,3,1+K]))
print(np.roots([1,2.6,4.8,11.2,8]))
print(np.roots([1,5,11,19,12]));print(np.roots([1,3.2,11.6,27.4,18]))
z=[0.1,0.3,0.5,0.7]
for zz in z: print(zz, np.degrees(np.arccos(zz)), np.exp(-np.pi*zz/np.sqrt(1-zz**2)), np.pi/(4*np.sqrt(1-zz**2)))
print(np.roots([1,2.4,16]), np.sqrt(58.24))
print(np.exp(-1.814), np.exp(-2.356), np.exp(20)/3)
