import numpy as np
from math import *
np.set_printoptions(precision=8)
def info(name,num,den):
    p=np.roots(den); z=np.roots(num) if len(num)>1 else []
    print(name,'poles',np.round(p,4),'zeros',np.round(z,4))
# ex1
info('1a',[1],np.polymul([1,2],[1,5]))
info('1b',[1],[1,2,17]); info('1c',[1],[1,0,16]); info('1d',[1],np.polymul([1,-1],[1,3]))
# ex2 G=2/(12s+1)
print('ex2', -1/12, 12, 36, 'final 2')
# ex3
for wn2,a in [(25,6),(16,4),(36,6)]:
    wn=sqrt(wn2); z=a/(2*wn); wd=wn*sqrt(1-z*z)
    print('2nd',wn2,a,'wn',wn,'z',z,'wd',wd,'os%',100*exp(-pi*z/sqrt(1-z*z)),'tp',pi/wd, np.roots([1,a,wn2]))
# ex4
info('ex4',[1,4],np.polymul(np.polymul([1,1],[1,-2]),[1,5]))
info('j4',[1,2],np.polymul(np.polymul([1,3],[1,1]),[1,6]))
info('p4',[1,1],np.polymul(np.polymul([1,2],[1,-1]),[1,3]))
# ex5 state
for A in [[[0,1],[-5,-2]],[[0,1],[-25,-6]],[[0,1],[-8,-4]]]:
    print('A',A,np.linalg.eigvals(np.array(A,float)))
# ex10
d=np.polymul(np.polymul([1,1],[1,2]),[1,-0.4,4]); print('ex10 den',d, np.roots(d))
d2=np.polymul([1,4,3],[1,1,4]); print('j10 den',d2,np.roots(d2))
d3=np.polymul([1,3,2],[1,0.2,9]); print('p10 cand', d3, np.roots(d3))
d4=np.polymul([1,4,4],[1,-0.2,1]); print('p10b',d4,np.roots(d4))
# arm jibun s^2+4s+K zeta .5 -> K 16
print(np.roots([1,4,16]), np.roots([1,6,36]))
# cubic j: (s+2)^3+K, K<64; p: (s+3)^3+K K<216
print(np.roots([1,6,12,8+64]), np.roots([1,9,27,27+216]))
print('4 stable?', 9>5, 'j K=27 for (s+2)^3', 72>8+27)
# motor/aircon problems
print('p6',-2*(1+4), 4/5, 'p7',(35+14*26)/15, 60/15)
# suspension
m,k,c=250,16000,2000
print('susp poles',np.roots([m,c,k]),'zero',-k/c, 'wn',sqrt(k/m),'z',c/(2*sqrt(m*k)), sqrt(k/m)/(2*pi))
from scipy import signal
t=np.linspace(0,2,20001)
for cc in [1000,2000,4000,8000]:
    sys=signal.lti([cc,k],[m,cc,k]); tt,y=signal.step(sys,T=t); i=np.argmax(y); 
    sys2=signal.lti([k],[m,cc,k]); tt,y2=signal.step(sys2,T=t)
    print(cc,'max',5*y[i],'at',tt[i],'nozero max',5*y2.max())
# ramp thermocouple tau=30 r=1/30
r=1/30; tau=30
for t in [30,60,90,150]:
    lag = r*t - r*(t - tau*(1-exp(-t/tau)))
    print('lag',t,lag)
# eigen car A
print(np.linalg.eigvals(np.array([[0,1],[-2,-3]],float)))
# pendulum P only s^2-4+K
print(np.roots([1,0,-4+8]))
