import numpy as np
from scipy.integrate import quad
pi=np.pi
I=lambda f,a,b: quad(f,a,b,limit=200)[0]
# spreadsheet 12 points
d=np.arange(0,360,30); t=np.radians(d)
s1=np.sin(t); s2=np.sin(2*t)
print(np.round(s1,4)); print(np.round(s2,4)); print(np.round(s1*s2,4)); print(np.round(s1*s1,4))
print('sums', (s1*s2).sum(), (s1*s1).sum(), (s1*s1).sum()*pi/6)
# hatena chord
f=lambda t: np.sin(2*pi*200*t)+0.6*np.sin(2*pi*250*t)+0.3*np.sin(2*pi*300*t)
T=0.02
print('mi', 2/T*I(lambda t:f(t)*np.sin(2*pi*250*t),0,T), 'do',2/T*I(lambda t:f(t)*np.sin(2*pi*200*t),0,T),'so',2/T*I(lambda t:f(t)*np.sin(2*pi*300*t),0,T))
print('fmax', max(abs(f(np.linspace(0,T,2001)))))
# A
print('sin3', [2/(2*pi)*I(lambda t:np.sin(t)**3*np.sin(n*t),0,2*pi) for n in [1,2,3]])
print('cos3', [1/pi*I(lambda t:np.cos(t)**3*np.cos(n*t),0,2*pi) for n in [1,2,3]])
# even square: 1 for |t|<pi/2, -1 otherwise
fe=lambda t: 1 if abs(((t+pi)%(2*pi))-pi)<pi/2 else -1
print('even sq a_n', [round(1/pi*I(lambda t:fe(t)*np.cos(n*t),-pi,pi),4) for n in range(0,6)], [4/(n*pi)*np.sin(n*pi/2) for n in range(1,6)])
fp=lambda t: 1 if abs(((t+pi)%(2*pi))-pi)<pi/2 else 0
print('pulse a_n', [round(1/pi*I(lambda t:fp(t)*np.cos(n*t),-pi,pi),4) for n in range(0,6)], [2/(n*pi)*np.sin(n*pi/2) for n in range(1,6)])
# triangle |t|
print('tri', 1/pi*I(abs,-pi,pi), [round(1/pi*I(lambda t:abs(t)*np.cos(n*t),-pi,pi),4) for n in range(1,6)], [-4/(pi*n**2) for n in [1,3,5]])
print('tri2 pi-|t|', [round(1/pi*I(lambda t:(pi-abs(t))*np.cos(n*t),-pi,pi),4) for n in range(0,6)])
# E linear 100x/L, L=0.1
L=0.1
print('lin', [round(2/L*I(lambda x:100*x/L*np.sin(n*pi*x/L),0,L),3) for n in range(1,5)], [200*(-1)**(n+1)/(n*pi) for n in range(1,5)])
print('lin50', [round(2/L*I(lambda x:50*x/L*np.sin(n*pi*x/L),0,L),3) for n in range(1,4)])
tri=lambda x: 100*x/(L/2) if x<L/2 else 100*(L-x)/(L/2)
print('tri temp', [round(2/L*I(lambda x:tri(x)*np.sin(n*pi*x/L),0,L,),3) for n in range(1,6)], [800/(n*n*pi*pi)*np.sin(n*pi/2) for n in range(1,6)])
# plucked string height h=1 cm at middle, L=0.65
Ls=0.65; h=1
trs=lambda x: h*x/(Ls/2) if x<Ls/2 else h*(Ls-x)/(Ls/2)
print('string', [round(2/Ls*I(lambda x:trs(x)*np.sin(n*pi*x/Ls),0,Ls),4) for n in range(1,6)], [8*h/(n*n*pi*pi)*np.sin(n*pi/2) for n in range(1,6)])
a=Ls/5
tr5=lambda x: h*x/a if x<a else h*(Ls-x)/(Ls-a)
print('pluck 1/5', [round(2/Ls*I(lambda x:tr5(x)*np.sin(n*pi*x/Ls),0,Ls),4) for n in range(1,11)])
print('formula', [2*h*Ls**2/(n*n*pi*pi*a*(Ls-a))*np.sin(n*pi*a/Ls) for n in range(1,6)])
# F: 50 Hz square
T=0.02; w0=2*pi/T
sq=lambda t: 1 if (t%T)<T/2 else -1
print('50Hz', [round(2/T*I(lambda t:sq(t)*np.sin(n*w0*t),0,T),4) for n in range(1,6)])
# G half-wave avg, full-wave
hw=lambda t: np.sin(t) if (t%(2*pi))<pi else 0
print('hw avg', 1/(2*pi)*I(hw,0,2*pi), 1/pi, 'fw', 1/(2*pi)*I(lambda t:abs(np.sin(t)),0,2*pi), 2/pi)
print('141V', 141/pi, 2*141/pi)
# H
print('hw a_n', [round(1/pi*I(lambda t:hw(t)*np.cos(n*t),0,2*pi),5) for n in range(0,6)], 'b_n',[round(1/pi*I(lambda t:hw(t)*np.sin(n*t),0,2*pi),5) for n in range(1,4)])
print(-2/(3*pi), -2/(15*pi))
# I: data f=3 sin t + cos 2t at 0,30,...
fd=3*np.sin(t)+np.cos(2*t)
print('data', np.round(fd,2))
fr=np.round(fd,2)
print('b1', 2/12*np.sum(fr*np.sin(t)), 'a2', 2/12*np.sum(fr*np.cos(2*t)), 'a1', 2/12*np.sum(fr*np.cos(t)),'b2',2/12*np.sum(fr*np.sin(2*t)))
print(np.round(fr*np.sin(t),4), np.round(np.sin(t),4))
print(np.round(fr*np.cos(2*t),4), np.round(np.cos(2*t),4))
# Parseval
print('sq', pi**2/8, np.sqrt(pi**2/8-1), 4/(pi*np.sqrt(2)), 'tri', np.sqrt(pi**4/96-1))
s=0
for n in [1,3,5,7,9]:
    s+=1/n**2; print(n, s)
print('N partial', sum(1/n**2 for n in range(1,2000,2)))
