import numpy as np
from math import *
print('motor')
for Kp in [0,0.1,0.5,1,2,10]:
    p=-2*(1+10*Kp); print(Kp,p, 'tau',-1/p, 'zure%', 100/(1+10*Kp), 'final', 10*Kp/(1+10*Kp))
print('aircon')
for RK in [1,4,9,19]:
    print(RK, (35+RK*26)/(1+RK), 60/(1+RK))
print('arm s^2+2s+K')
for K in [0.5,1,2,4,10,17]:
    r=np.roots([1,2,K]); z=1/sqrt(K); 
    print(K,r, 'zeta',z, 'os', 100*exp(-pi*z/sqrt(1-z*z)) if z<1 else 0)
print('cubic (s+1)^3+K')
for K in [0,1,4,8,10,27]:
    r=np.roots([1,3,3,1+K]); print(K,np.round(r,4), 9>1+K)
    c=K**(1/3); print('   formula', -1-c, -1+c/2, c*sqrt(3)/2)
