import numpy as np
from scipy import signal
np.set_printoptions(precision=4, suppress=True)
print("== 9-8 Euler car")
v=0.0; out={}
for k in range(101):
    a=(500-50*v)/1000; out[k]=(round(v,4),round(a,4),round(10*(1-np.exp(-0.05*k)),3)); v=v+a
for k in [0,1,2,3,4,5,10,20,40,60,100]: print(k,out[k])
print("== series step 20s")
sys=signal.lti([5000*0.1],np.polymul([0.5,1],[1000,50]))
t=np.linspace(0,40,4001); _,y=signal.step(sys,T=t); print(y[2000], 10*(1-np.exp(-1)))
print("== suspension")
m,k,c=250,16000,2000
for cc in [1000,2000,4000,8000]:
    sys=signal.lti([cc,k],[m,cc,k]); t=np.linspace(0,3,30001); _,y=signal.step(sys,T=t); i=np.argmax(y); print(cc, round(0.05*y[i]*100,2),"cm", round(t[i],3))
print("wn",np.sqrt(k/m), "zeta", c/(2*np.sqrt(k*m)), np.roots([m,c,k]))
print("== freq response 6-13 spring")
for w in [2,3,4,8]:
    G=1/(0.5*(1j*w)**2+0.4j*w+8); print(w, round(abs(G),4), round(0.8*abs(G),4), round(-np.degrees(np.angle(G)),1))
print("== bode")
for f in [10,100,300,1000,10000]:
    G=1/(1+1j*f/100); print(f, round(abs(G),4), round(20*np.log10(abs(G)),2), round(-np.degrees(np.angle(G)),1), round(40*np.log10(abs(G)),2), round(abs(G)**2,4))
print("== RC square wave 50Hz")
for n in [1,3,5,7]:
    G=1/(1+1j*n*50/100); print(n*50, round(4/(n*np.pi),4), round(abs(G),4), round(4/(n*np.pi)*abs(G),4))
print("== state space car A")
A=np.array([[0,1],[-2,-3]]);B=np.array([[0],[1]]);C=np.array([[1,0]])
print(signal.ss2tf(A,B,C,np.zeros((1,1))))
A=np.array([[0,1],[-6,-5]]); print(signal.ss2tf(A,B,C,np.zeros((1,1))))
print("== data", np.round(10*(1-np.exp(-2*np.array([0.25,0.5,1,1.5,2,3]))),3))
print(np.round(20+60*(1-np.exp(-np.array([10,20,30,60,90,150])/30)),1))
print("motor rpm", 10/(2*np.pi)*60, "tau speaker", 1/(2*np.pi*2000)*1e6, "tau100", 1/(2*np.pi*100)*1e3)
print("aircon", [ (rk, 35-9*rk/(1+rk), 60/(1+rk)) for rk in [1,4,9,19]])
print("j7", 8-8*np.exp(-1), "p5", 5-5*np.exp(-3), "-60dB", 3*-20.04)
