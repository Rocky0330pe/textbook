import numpy as np
from scipy.integrate import quad
from scipy.fft import dct, idct
from scipy.integrate import solve_ivp
print('--- 9-12 CD/MP3')
print(44100*16*2, 44100*16*2*240/8, 1411.2/128, 128000*240/8/1e6, 1152/44100*1000)
print('--- DCT')
x=np.array([52,55,61,66,70,61,64,73],float)
X=dct(x,norm='ortho'); print(X.round(1))
print('energy0', X[0]**2/np.sum(X**2)*100, np.sum(x**2), np.sum(X**2))
for keep in [1,2,4]:
    Y=X.copy(); Y[keep:]=0; r=idct(Y,norm='ortho'); print(keep, r.round(1), np.abs(r-x).max().round(1))
C=dct(np.eye(8),norm='ortho',axis=0); print('orth', np.allclose(C@C.T,np.eye(8)))
print('--- noise')
for f in [100,500,1000]:
    th=360*f*1e-4; a=2*np.sin(np.radians(th)/2); print(f, th, round(a,4), round(20*np.log10(a),1))
print('--- MP3 threshold at bars')
thr=lambda f:0.15+0.13*np.exp(-((f-500)/700)**2)+0.1*np.exp(-((f-1000)/600)**2)
for f,a in [(440,1),(880,.5),(1320,.25),(1800,.08),(2900,.05)]: print(f,a,round(thr(f),4), 'above' if a>thr(f) else 'BELOW')
print('--- PID')
def P(t,y): T=y[0]; return [((35-T)-9*(T-26))/60]
def PI(t,y): T,I=y; e=T-26; return [((35-T)-9*e-0.15*I)/60, e]
tt=np.arange(0,61,2)
s1=solve_ivp(P,[0,60],[35],t_eval=tt,rtol=1e-10); s2=solve_ivp(PI,[0,60],[35,0],t_eval=tt,rtol=1e-10)
print(s1.y[0].round(3)[:6], s1.y[0][-1].round(3)); print(s2.y[0].round(3)[:6], s2.y[0][[10,15,20,30]].round(3))
print(np.roots([60,10,0.15]))
print('--- 9-13')
print(0.95**10, (1-0.5/1000)**1000, np.exp(-0.5), 20+60*0.95**10, 20+60*np.exp(-0.5))
print(2*np.exp(-1)-np.exp(-2), np.roots([1,2,5]))
print([round(np.sin(m*np.pi/10),3) for m in range(1,6)], -4*np.sin(np.pi/20)**2, 1e-4*(np.pi/0.1)**2)
print(10-10*np.exp(-1), 10/20000*1e3, 0.5*np.exp(-1))
print(0.3*np.cos(np.radians(30))+0.25*np.cos(np.radians(75)), 0.3*np.sin(np.radians(30))+0.25*np.sin(np.radians(75)))

for w in [0,1,2]:
    g=quad(lambda t: np.exp(-t**2/2)*np.cos(w*t),-np.inf,np.inf)[0]; print('gauss FT',w,g, np.sqrt(2*np.pi)*np.exp(-w**2/2))
    a=np.sqrt(np.pi/2); h=quad(lambda t: 1/np.cosh(a*t)*np.cos(w*t),-np.inf,np.inf)[0]; print('sech FT',w,h, np.sqrt(2*np.pi)/np.cosh(a*w))
print('apart (s+3)/((s+1)(s+2)) at s=0.7:', (0.7+3)/(1.7*2.7), 2/1.7-1/2.7)
# 9-0 pendulum
print(0.01*np.cosh(4), 0.01*np.cosh(2))
