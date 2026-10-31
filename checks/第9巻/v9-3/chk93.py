import numpy as np
from scipy.integrate import quad
pi=np.pi
def cn(f,n,T=2*pi,a=0):
    w0=2*pi/T
    re=quad(lambda t: f(t)*np.cos(n*w0*t),a,a+T,limit=400,points=None)[0]
    im=quad(lambda t: -f(t)*np.sin(n*w0*t),a,a+T,limit=400)[0]
    return (re+1j*im)/T
sq=lambda t: 1.0 if (t%(2*pi))<pi else -1.0
print("square c_n")
for n in [-3,-1,0,1,2,3,5]: print(n, np.round(cn(sq,n),4), np.round(2/(1j*n*pi),4) if n%2 else 0)
saw=lambda t: ((t+pi)%(2*pi))-pi
print("saw c_n")
for n in [1,2,3,-1]: print(n, np.round(cn(saw,n,a=-pi),4), 1j*(-1)**n/n)
print("sin^3", [np.round(cn(lambda t: np.sin(t)**3,n),4) for n in [-3,-1,1,3]])
print("cos^3", [np.round(cn(lambda t: np.cos(t)**3,n),4) for n in [-3,-1,1,3]])
f2=lambda t: 1+2*np.cos(t)+4*np.sin(2*t)
print("f2", [np.round(cn(f2,n),4) for n in [-2,-1,0,1,2]])
# half wave / full wave averages
hw=lambda t: max(np.sin(t),0); fw=lambda t: abs(np.sin(t))
print("hw c0",cn(hw,0).real, 1/pi, "fw c0", cn(fw,0).real, 2/pi)
print("hw c1",np.round(cn(hw,1),4), "c2", np.round(cn(hw,2),4))
# Parseval
s=sum(abs(2/(n*pi))**2 for n in range(-5,6) if n%2)
print("parseval up to 5:", s)
s=sum(abs(2/(n*pi))**2 for n in range(-1,2) if n%2); print("n=±1:", s)
s=sum(abs(2/(n*pi))**2 for n in range(-3,4) if n%2); print("n=±3:", s)
# RC filter 100Hz, 50Hz square
tau=1/(2*pi*100)
for n in [1,3,5,7]:
    w=2*pi*50*n; G=1/(1+1j*w*tau); cin=2/(1j*n*pi)
    print(n,50*n,"amp in",2*abs(cin),"|G|",abs(G),"out",2*abs(cin*G),"deg",np.degrees(np.angle(G)), "cin", cin, "cout", cin*G)
print("tau ms",tau*1e3)
# ring
R=0.05; a=1e-4; k=a/R**2; print("alpha/R^2",k, "half n=1", np.log(2)/k, "n=2 rate",4*k, "n=3 rate", 9*k)
def ringT(th,t,N=2001):
    s=50
    for n in range(1,N,2): s+= 200/(n*pi)*np.exp(-k*n*n*t)*np.sin(n*th)
    return s
for t in [0.5,5,10,20,30,46.3,60,100]: print("t",t, ringT(pi/2,t), 50+200/pi*np.exp(-k*t))
print("time to 60:", np.log((200/pi)/10)/k)
from scipy.optimize import brentq
print("exact 60:", brentq(lambda t: ringT(pi/2,t)-60, 1,200))
print("200/pi",200/pi, "200/3pi",200/(3*pi))
# 9-4 numbers
