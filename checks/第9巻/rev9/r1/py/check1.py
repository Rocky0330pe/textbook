import numpy as np
from scipy import integrate
pi=np.pi
print("== 9-0 ==")
for t in [0,0.25,0.5,0.75,1,1.25,1.5,1.75,2,2.25]:
    a=np.sin(2*pi*440*t/1000); b=0.5*np.sin(2*pi*880*t/1000); c=0.25*np.sin(2*pi*1320*t/1000)
    print(t, round(a,3), round(b,3), round(c,3), round(a+b+c,3))
fs=8000; t=np.arange(fs)/fs
x=np.sin(2*pi*440*t)+0.5*np.sin(2*pi*880*t)+0.25*np.sin(2*pi*1320*t)
X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/fs); A=2*abs(X)/len(x)
print(f[A>0.1], np.round(A[A>0.1],3))
print("hot water", 20+60*np.exp(-0.5))
T=80
for i in range(10): T=T-0.05*(T-20)
print("euler", T)
print("pend", 0.01*np.cosh(2), 0.01*np.cosh(4), (0.01+0.02*1)*np.exp(-2), (0.01+0.02*2)*np.exp(-4))
print("roots", np.roots([1,3,2]), np.roots([1,2,5]))
print("dots fig9-4", [round(np.sin(2*pi*440*tt/1000)+0.5*np.sin(2*pi*880*tt/1000)+0.25*np.sin(2*pi*1320*tt/1000),3) for tt in [0,0.125,0.25,0.375,0.5,0.625,0.75,0.875,1]])
print("== 9-1 ==")
th=np.radians(np.arange(0,181,30))
for n in [1,3,5,7]:
    print(n, np.round(np.sin(n*th)/n,4))
print(np.round(sum(np.sin(n*th)/n for n in [1,3,5,7]),4))
def s90(N): return sum((-1)**k/(2*k+1) for k in range(N))
print([round(s90(N),4) for N in [1,2,3,4,10,100,1000]], pi/4)
tt=np.linspace(1e-6,pi/2,2000001)
for N in [1,2,4,10,50,200]:
    y=4/pi*sum(np.sin((2*k+1)*tt)/(2*k+1) for k in range(N))
    i=np.argmax(y); print('gibbs',N, round(y[i],3), round(np.degrees(tt[i]),2))
# 36 points
a=np.radians(np.arange(5,360,10)); fv=np.where(np.degrees(a)<180,1,-1)
print('36pt', [round(2*np.mean(fv*np.sin(n*a)),4) for n in [1,3,5]])
a=np.radians(np.arange(15,360,30)); fv=np.where(np.degrees(a)<180,1,-1)
print('12pt', [round(2*np.mean(fv*np.sin(n*a)),4) for n in [1,3]])
fv2=np.where(np.degrees(a)<180,1,0); print('12pt 0/1', round(2*np.mean(fv2*np.sin(a)),4), 2/pi)
# heat
L=0.1; al=1e-4
def Tm(x,t,N=2000):
    n=np.arange(1,2*N,2); return np.sum(400/(n*pi)*np.exp(-al*(n*pi/L)**2*t)*np.sin(n*pi*x/L))
for t in [0.5,2,5,10,20,30]:
    print('heat',t, round(Tm(L/2,t),2), round(400/pi*np.exp(-al*(pi/L)**2*t),2))
k=al*(pi/L)**2; print('k',k, 9*k, 25*k, np.log(2)/k, np.log(2)/(9*k), np.log(2)/(25*k))
from scipy.optimize import brentq
print('t50 full', brentq(lambda t: Tm(L/2,t)-50, 5,15), 'one', np.log(400/pi/50)/k)
print('ex6', 400/pi*np.exp(-k*10), 400/(3*pi)*np.exp(-9*k*10))
print('jibun 20s',400/pi*np.exp(-k*20), 'p15', 400/pi*np.exp(-k*15), 400/(3*pi)*np.exp(-9*k*15))
print('t25', np.log(400/pi/25)/k, 't30', np.log(400/pi/30)/k)
print('ex1', 4/pi*(1-1/3+1/5), 4/pi*(0.5+1/3+0.1), 4/pi*(np.sin(pi/4)+np.sin(3*pi/4)/3+np.sin(5*pi/4)/5), 4/pi*(np.sin(pi/3)+np.sin(pi)/3+np.sin(5*pi/3)/5))
print('ex4', 10/pi, 10/(3*pi), 10/(5*pi), 6.6/pi, 6.6/(3*pi),6.6/(5*pi), 20/pi,20/(3*pi),20/(5*pi))
# 9-1 saw coefficients numeric
for n in [1,2,3]:
    print('saw', n, integrate.quad(lambda t: t*np.sin(n*t),-pi,pi)[0]/pi, 2*(-1)**(n+1)/n,
      'saw02pi', integrate.quad(lambda t: t*np.sin(n*t),0,2*pi)[0]/pi)
# example 9 graph partial sums
print([round(s90(N),4) for N in range(1,13)])
print('c guitar', 2*0.65*110, 2*0.65*82, 2*0.65*82/(2*0.325), 4*143/(1.3))
