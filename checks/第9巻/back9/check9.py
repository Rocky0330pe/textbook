# 巻末の数を Python で確かめる（組 B9）
import numpy as np
from math import *
from scipy.linalg import expm
from scipy.special import sici
ok=lambda n,v,t,d=3: print(('OK ' if abs(v-t)<0.5*10**-d+1e-12 else 'NG ')+n, round(v,d+2), t)
ok('2π',2*pi,6.2832,4); ok('4/π',4/pi,1.2732,4); ok('π/4',pi/4,0.7854,4); ok('π²/8',pi**2/8,1.2337,4)
ok('Gibbs',2/pi*sici(pi)[0],1.179); ok('1/√2',1/sqrt(2),0.707); ok('√2π',sqrt(2*pi),2.5066,4); ok('e^-1',exp(-1),0.3679,4)
for k,t in [(1,63.2),(2,86.5),(3,95.0),(5,99.3)]: ok(f'{k}τ',100*(1-exp(-k)),t,1)
for z,t in [(0.1,72.9),(0.3,37.2),(0.5,16.3),(0.7,4.6)]: ok(f'ζ={z}',100*exp(-pi*z/sqrt(1-z*z)),t,1)
ok('cosh1',cosh(1),1.543); ok('sinh1',sinh(1),1.175,3)
ok('4項',1-1/3+1/5-1/7,0.724); ok('ひずみ',100*sqrt(pi**2/8-1),48.3,1)
a=1e-4;L=0.1;k1=a*(pi/L)**2; ok('0.0987',k1,0.0987,4)
T=lambda t,x=0.05:sum(400/(n*pi)*exp(-a*(n*pi/L)**2*t)*sin(n*pi*x/L) for n in range(1,400,2))
ok('10s',T(10),47.45,2); ok('9.47',log(400/pi/50)/k1,9.47,2)
ok('c=2Lf',2*0.65*110,143,0)
ok('ring 0.04',a/0.05**2,0.04,3); ok('17.3',log(2)/0.04,17.3,1)
ok('RC 2s',10-10*exp(-1),6.321); ok('RC 6s',10-10*exp(-3),9.502); ok('τ100Hz',1/(2*pi*100)*1000,1.592)
ok('carA',2*exp(-1)-exp(-2),0.600); ok('carB',exp(-1)*(cos(2)+0.5*sin(2)),0.014)
X=0.8/abs(8-0.5*4+0.4*2j); ok('spring amp',X,0.132); ok('lag',degrees(atan2(0.8,6)),7.6,1)
# RLC
L_,C_,R_=10e-3,1e-6,20; wn=1/sqrt(L_*C_); z=R_/2*sqrt(C_/L_); ok('ζRLC',z,0.1,2); ok('17.29',10*(1+exp(-pi*z/sqrt(1-z*z))),17.29,2)
ok('cof',20+60*exp(-0.5),56.39,2); ok('tc60',1-exp(-2),0.865)
ok('motor pole',-(1+10*1)/0.5,-22,0); ok('ずれ',100/(1+10),9.1,1)
for K,Tt,tau in [(4,27.8,12),(9,26.9,6)]:
    ok(f'AC{K}',(35+K*26)/(1+K),Tt,1); ok(f'ACτ{K}',60/(1+K),tau,0)
m,k,c=250,16000,2000; wn=sqrt(k/m); ok('wn',wn,8,0); ok('ζs',c/(2*sqrt(m*k)),0.5,1); ok('wd',wn*sqrt(1-0.25),6.93,2)
from scipy import signal
t=np.linspace(0,3,30001); _,y,_=signal.lsim(([c,k],[m,c,k]),0.05*np.ones_like(t),t); ok('6.49',y.max()*100,6.49,2)
ok('0.2731',0.01*cosh(4),0.2731,4)
A=np.array([[-0.1,0.1],[0.1,-0.1]]); x=expm(A*10)@[20,0]; ok('11.353',x[0],11.353); ok('8.647',x[1],8.647)
Aw=np.array([[0,1],[-1,0]]); 
for n,v in [(63,1.3656),(630,1.0318),(6283,1.0031)]:
    M=np.linalg.matrix_power(np.eye(2)+Aw*2*pi/n,n); ok(f'n={n}',M[0,0],v,4)
ok('expm00',expm(np.array([[0,1],[-2,-3]]))[0,0],0.6004,4)
ok('95.5rpm',10*60/(2*pi),95.5,1); ok('314',100*pi,314,0); ok('-3.01',20*log10(1/sqrt(2)),-3.01,2)
