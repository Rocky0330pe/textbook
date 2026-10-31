import numpy as np
from scipy.integrate import quad
pi=np.pi
print("== 9-1 partial sums (4-9 form) at 90deg")
for N in [1,2,3,4,10,100,1000]:
    s=sum(np.sin((2*k+1)*pi/2)/(2*k+1) for k in range(N)); print(N,round(s,4))
print("pi/4",pi/4, "4/pi",4/pi)
# table at degrees for spreadsheet
for d in [0,15,30,45,60,75,90]:
    t=np.radians(d); a=np.sin(t); b=a+np.sin(3*t)/3; c=b+np.sin(5*t)/5; e=c+np.sin(7*t)/7
    print(d, round(a,4), round(b,4), round(c,4), round(e,4))
print("== Gibbs: peak of height-1 series with N odd terms")
t=np.linspace(1e-5,pi/2,200001)
for N in [1,2,4,10,50,200]:
    s=4/pi*sum(np.sin((2*k+1)*t)/(2*k+1) for k in range(N)); i=s.argmax(); print(N,round(s.max(),4),'at deg',round(np.degrees(t[i]),2))
from scipy.special import sici
print("limit",2/pi*sici(pi)[0])
print("== 36 point coeffs (midpoints) height1 square")
M=36; tk=(np.arange(M)+0.5)*2*pi/M; f=np.where(tk<pi,1,-1)
for n in range(1,7): print(n, round(2*np.mean(f*np.sin(n*tk)),4), round(np.mean(f*np.sin(n*tk)),4), 'true', round(4/(n*pi) if n%2 else 0,4))
print("== 12 point")
M=12; tk=(np.arange(M)+0.5)*2*pi/M; f=np.where(tk<pi,1,-1)
for n in [1,2,3]: print(n, round(2*np.mean(f*np.sin(n*tk)),4), 'sum',round(np.sum(f*np.sin(n*tk)),4))
print("== sawtooth t in (-pi,pi)")
for n in range(1,5): print(n, quad(lambda t:t*np.sin(n*t),-pi,pi)[0], 2*(-1)**(n+1)/n)
print("== sawtooth t in (0,2pi)")
print("a0",quad(lambda t:t,0,2*pi)[0]/pi)
for n in range(1,4): print(n, quad(lambda t:t*np.cos(n*t),0,2*pi)[0]/pi, quad(lambda t:t*np.sin(n*t),0,2*pi)[0]/pi)
print("== digital 0/1")
for n in range(1,5): print(n, quad(lambda t:np.sin(n*t),0,pi)[0]/pi, 2/(n*pi) if n%2 else 0)
print("== heat")
L=0.1; al=1e-4; k1=al*(pi/L)**2; print('k1',k1, 'k3',9*k1,'k5',25*k1)
def Tmid(t,N=200): return sum(400/(n*pi)*np.exp(-al*(n*pi/L)**2*t)*np.sin(n*pi/2) for n in range(1,2*N,2))
for t in [0.5,1,2,5,7,9.47,10,15,16.5,20,30,60]: print(t, round(Tmid(t),3), '1term', round(400/pi*np.exp(-k1*t),3))
print('t50', np.log((400/pi)/50)/k1, 't25', np.log((400/pi)/25)/k1, 't10',np.log((400/pi)/10)/k1)
print('10s terms', 400/pi*np.exp(-k1*10), -400/(3*pi)*np.exp(-9*k1*10), 400/(5*pi)*np.exp(-25*k1*10))
print('20s terms', 400/pi*np.exp(-k1*20), -400/(3*pi)*np.exp(-9*k1*20))
print('5s terms', 400/pi*np.exp(-k1*5), -400/(3*pi)*np.exp(-9*k1*5), 400/(5*pi)*np.exp(-25*k1*5))
from scipy.optimize import brentq
print('exact t50', brentq(lambda t:Tmid(t)-50,5,15))
print("== string")
L=0.65; f1=110; c=2*L*f1; print('c',c, [n*f1 for n in range(1,6)])
print('half length', c/(2*0.325))
print("== 50Hz square ±100")
print([round(400/(n*pi),2) for n in [1,3,5,7]], [round(4*10/(n*pi),3) for n in [1,3,5]])
print("== pi/4 check", sum((-1)**k/(2*k+1) for k in range(100000)))
