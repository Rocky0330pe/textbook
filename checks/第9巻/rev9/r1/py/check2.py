import numpy as np
from scipy import integrate
pi=np.pi
q=lambda f,a,b: integrate.quad(f,a,b,limit=400)[0]
print("== 9-2 ==")
print('orth', [round(q(lambda t: g(t),0,2*pi),6) for g in [lambda t: np.sin(t)*np.sin(2*t), lambda t: np.sin(2*t)*np.sin(3*t), lambda t: np.cos(t)*np.cos(3*t), lambda t: np.sin(t)*np.cos(t), lambda t: np.sin(t)**2, lambda t: np.sin(3*t)**2, lambda t: np.cos(2*t)**2, lambda t: np.sin(2*t)*np.cos(2*t)]])
t=np.radians(np.arange(0,360,30)); print('12pt', round(np.sum(np.sin(t)*np.sin(2*t)),10), np.sum(np.sin(t)**2)*pi/6)
# doremi
T=0.02; f=lambda t: np.sin(2*pi*200*t)+0.6*np.sin(2*pi*250*t)+0.3*np.sin(2*pi*300*t)
print('mi', q(lambda t: f(t)*np.sin(2*pi*250*t),0,T)/q(lambda t: np.sin(2*pi*250*t)**2,0,T))
# triangle |t|
for n in range(0,6):
    print('tri', n, round(q(lambda t: abs(t)*np.cos(n*t),-pi,pi)/pi,4), round(q(lambda t:(pi-abs(t))*np.cos(n*t),-pi,pi)/pi,4), round(q(lambda t:(pi/2-abs(t))*np.cos(n*t),-pi,pi)/pi,4))
# even square
sq=lambda t: 1.0 if abs(((t+pi)%(2*pi))-pi)<pi/2 else -1.0
print('evensq', [round(q(lambda t: sq(t)*np.cos(n*t),-pi,pi)/pi,4) for n in range(6)], 4/pi)
pl=lambda t: 1.0 if abs(((t+pi)%(2*pi))-pi)<pi/2 else 0.0
print('pulse', [round(q(lambda t: pl(t)*np.cos(n*t),-pi,pi)/pi,4) for n in range(6)])
# half range
L=0.1
for lab,fx in [('lin',lambda x:100*x/L),('tri',lambda x: 200*x/L if x<L/2 else 200*(L-x)/L)]:
    print(lab,[round(2/L*q(lambda x: fx(x)*np.sin(n*pi*x/L),0,L),3) for n in [1,2,3,4,5]])
for p in [0.5,0.2]:
    fx=lambda x: x/p if x<p else (1-x)/(1-p)
    print('pluck',p,[round(abs(2*q(lambda x: fx(x)*np.sin(n*pi*x),0,1)),4) for n in range(1,8)])
# rectifier
hw=lambda t: max(np.sin(t),0)
print('hw mean', q(hw,0,2*pi)/(2*pi), 'a2', q(lambda t: hw(t)*np.cos(2*t),0,2*pi)/pi, 'a4',q(lambda t: hw(t)*np.cos(4*t),0,2*pi)/pi,'a6',q(lambda t: hw(t)*np.cos(6*t),0,2*pi)/pi,'b1',q(lambda t: hw(t)*np.sin(t),0,2*pi)/pi)
print('fw mean', q(lambda t: abs(np.sin(t)),0,2*pi)/(2*pi), 141/pi, 141*2/pi, 283/pi)
# data example
th=np.radians(np.arange(0,360,30)); fd=np.array([1,2,2.1,2,2.1,2,1,-1,-3.1,-4,-3.1,-1])
print('data b1', 2/12*np.sum(fd*np.sin(th)), 'a2', 2/12*np.sum(fd*np.cos(2*th)), 'b2', 2/12*np.sum(fd*np.sin(2*th)))
print('parseval', np.sum([(4/(n*pi))**2/2 for n in range(1,2000,2)]), pi**2/8, sum(1/n**2 for n in range(1,2000,2)), 8/pi**2, np.sqrt(pi**2/8-1))
print('tri thd', np.sqrt((pi**2/12-8/pi**2)/(8/pi**2)), pi**2/12)
print('01 thd', np.sqrt((0.25-2/pi**2)/(2/pi**2)))
print('p5', 8/pi,8/(3*pi),8/(5*pi), 'p4', 40/pi, 40/(2*pi))
print('jibun6', 20/pi,20/(3*pi),20/(5*pi))
print("== 9-3 ==")
print('square cn', [np.round(q(lambda t: np.cos(n*t)*(1 if t<pi else -1),0,2*pi)/(2*pi) - 1j*q(lambda t: np.sin(n*t)*(1 if t<pi else -1),0,2*pi)/(2*pi),4) for n in [1,3,5]])
print('saw cn', [np.round((q(lambda t: t*np.cos(n*t),-pi,pi)-1j*q(lambda t: t*np.sin(n*t),-pi,pi))/(2*pi),4) for n in [1,2,3]])
tau=1/(2*pi*100)
for f0 in [50,25,100]:
    w0=2*pi*f0
    print('rc',f0,[ (round(4/(n*pi),4), round(4/(n*pi)/abs(1+1j*n*w0*tau),4)) for n in [1,3,5,7]])
# ring
al=1e-4;R=0.05
def ring(th,t,N=4000):
    n=np.arange(1,2*N,2); return 50+np.sum(200/(n*pi)*np.exp(-al*n**2*t/R**2)*np.sin(n*th))
print('ring 90deg', [round(ring(pi/2,t),2) for t in [10,30,60]], 'ring 270', [round(ring(3*pi/2,t),2) for t in [10,30,60]])
from scipy.optimize import brentq
print('ring 60C', brentq(lambda t: ring(pi/2,t)-60,10,100), np.log(200/pi/10)/0.04, 'ring70', np.log(200/pi/20)/0.04, 'R10', np.log(2)/0.01, np.log(200/pi/10)/0.01)
print('pow', 2*4/pi**2, 2*4/pi**2/9, 2*4/pi**2/25)
print("== 9-4 ==")
F=lambda f,w,a,b: q(lambda t: f(t)*np.cos(w*t),a,b)-1j*q(lambda t: f(t)*np.sin(w*t),a,b)
print('pulse F(1)', F(lambda t:1,1,-1,1), 2*np.sin(1), 'mid8', sum(np.cos(-0.875+0.25*i)*0.25 for i in range(8)), 'mid20', sum(np.cos(-0.95+0.1*i)*0.1 for i in range(20)))
print('Tc', [ (T, 2*np.sin(2*pi/T)/(2*pi/T)/T) for T in [4,16]])
print('gauss', [F(lambda t: np.exp(-t*t/2),w,-40,40).real for w in [0,1,2]], np.sqrt(2*pi)*np.exp(-np.array([0,1,2])**2/2))
print('exp', F(lambda t: np.exp(-2*t),1,0,50), 1/(2+1j), F(lambda t: np.exp(-3*t),4,0,50))
print('dexp', [F(lambda t: np.exp(-2*abs(t)),w,-40,40).real for w in [0,2]], [F(lambda t: np.exp(-abs(t)),w,-40,40).real for w in [0,1,3]])
print('gauss8', [F(lambda t: np.exp(-t*t/8),w,-60,60).real for w in [0,0.5]], 'g2', [F(lambda t: np.exp(-2*t*t),w,-20,20).real for w in [0,2]], 'g18', F(lambda t: np.exp(-t*t/18),0,-80,80).real)
print('shift', F(lambda t:1,pi/2,1,3), -4/pi, F(lambda t:1,pi/2,0,2), F(lambda t:1,pi/2,2,4))
print('cosgauss', [F(lambda t: np.exp(-t*t/2)*np.cos(10*t),w,-20,20).real for w in [10,9]])
for a in [1,0.3]:
    w=np.linspace(0,20,200001); y=10/np.sqrt((a*a+100-w**2)**2+(2*a*w)**2); print('kane',a,w[np.argmax(y)],y.max())
x=np.array([1,0,-1,0,1,0,-1,0]); print('dft', np.round(np.fft.fft(x),3)); print(np.round(np.fft.fft([1,1,-1,-1,1,1,-1,-1]),3), np.round(np.fft.fft([2,0,-2,0,2,0,-2,0]),3))
print(np.round(abs(np.fft.fft(np.sin(2*pi*2*np.arange(8)/8))),3))
fs=8000;t=np.arange(fs)/fs; X=np.fft.rfft(np.sin(2*pi*440.5*t)); A=2*abs(X)/fs; print('leak', np.round(A[438:444],3))
print('wheel', 2.75*360/24, (2.75*360/24-45)*24)
