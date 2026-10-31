import numpy as np
from math import *
np.set_printoptions(precision=2, suppress=True, linewidth=160)
def rod(dx,dt,alpha=1e-4,L=0.1,right='ins',steps=None,verbose=False):
  n=int(round(L/dx))+1; T=np.full(n,20.0); T[0]=100; r=alpha*dt/dx/dx; mid=n//2
  rows=[T.copy()]; t=0; k=0
  while (steps is None and T[mid]<50) or (steps is not None and k<steps):
    Tn=T.copy(); Tn[1:-1]=T[1:-1]+r*(T[2:]-2*T[1:-1]+T[:-2])
    if right=='ins': Tn[-1]=T[-1]+2*r*(T[-2]-T[-1])
    T=Tn; t+=dt; k+=1; rows.append(T.copy())
  return t,r,rows
t,r,rows=rod(0.01,0.25)
print('time to 50 (ins)',t,r, len(rows)-1)
for k in [0,1,2,3,4,8,20,40,60,61,62]:
  print(k, k*0.25, rows[k])
t2,_,_=rod(0.01,0.25,right='fix'); print('fixed20',t2)
print('fine',rod(0.001,0.002)[0], rod(0.0005,0.0005)[0])
# exact-ish half-time for mid
# long time
_,_,rr=rod(0.01,0.25,steps=4000); print('t=1000s',rr[-1])
_,_,rr=rod(0.01,0.25,steps=400); print('t=100s',rr[-1])
_,_,rr=rod(0.01,0.25,steps=120); print('t=30s',rr[-1])
_,_,rr=rod(0.01,0.25,steps=240); print('t=60s',rr[-1])
print('== r=0.6 ==')
_,r6,rr=rod(0.01,0.6,steps=200)
for k in [0,1,2,3,4,5,6,10,20,50,100,200]: print(k, rr[k][:6])
print('== r=0.5 ==')
_,r5,rr=rod(0.01,0.5,steps=60)
for k in [0,1,2,3,4,5]: print(k, rr[k][:6])
print('== eigen 9 interior ==')
N=9
for r_ in [0.25,0.5,0.6]:
  A=np.eye(N)*(1-2*r_)+np.eye(N,k=1)*r_+np.eye(N,k=-1)*r_
  ev=np.linalg.eigvalsh(A); print(r_, ev.round(4))
N=3
for r_ in [0.25,0.5,0.6]:
  A=np.eye(N)*(1-2*r_)+np.eye(N,k=1)*r_+np.eye(N,k=-1)*r_
  print('N3',r_, np.linalg.eigvalsh(A).round(4))
print('zigzag factor', [(r_,1-4*r_) for r_ in [0.1,0.25,0.3,0.4,0.5,0.6,0.7]])
# zigzag demo with r=0.6: start zigzag +1,-1
z=np.array([0,1,-1,1,-1,1,-1,1,-1,1,0.0])
print('== sine decay ==')
alpha=1e-4; L=0.1; a=pi/L; print('a',a,'rate',alpha*a*a,'half',log(2)/(alpha*a*a))
a3=3*pi/L; print('3x rate', alpha*a3*a3, log(2)/(alpha*a3*a3))
a2=2*pi/L; print('2x', alpha*a2*a2, log(2)/(alpha*a2*a2))
# spreadsheet sine check: 11 nodes, ends 0, initial 10 sin(pi x/L)
x=np.linspace(0,L,11); T=10*np.sin(pi*x/L); dt=0.25; r=alpha*dt/0.01**2
for k in range(28): T[1:-1]=T[1:-1]+r*(T[2:]-2*T[1:-1]+T[:-2])
print('after 7 s mid',T[5], 'exact', 10*exp(-alpha*a*a*7))
T=10*np.sin(pi*x/L)
hist=[]
for k in range(1,41):
  T[1:-1]=T[1:-1]+r*(T[2:]-2*T[1:-1]+T[:-2]); hist.append(T[5])
print('mid at t=1..10s', [round(hist[4*i-1],3) for i in range(1,11)])
print('exact', [round(10*exp(-alpha*a*a*i),3) for i in range(1,11)])
# per-step factor for sine mode
print('sine mode factor', 1-4*r*sin(pi/20)**2, exp(-alpha*a*a*0.25))
print('== alpha table ==')
for nm,k,rho,c in [('Al',237,2700,897),('Cu',398,8960,385),('Fe',80,7870,449),('SUS304',16,7900,500),('water',0.6,1000,4180),('air',0.026,1.2,1005),('glass',1.0,2500,840)]:
  print(nm, k/(rho*c))
print('== wave ==')
# s=1 table: pulse at rest
n=13; y0=np.zeros(n); y0[5]=2; y0[6]=4; y0[7]=2
y1=y0.copy(); y1[1:-1]=0.5*(y0[2:]+y0[:-2])
rows=[y0,y1]
for k in range(5):
  yp,yc=rows[-2],rows[-1]; yn=np.zeros(n); yn[1:-1]=yc[2:]+yc[:-2]-yp[1:-1]; rows.append(yn)
for k,rw in enumerate(rows): print(k,rw)
print('dt max', 0.01/100)
# guitar-ish: F=100N mu=0.01 -> c=100
print('c', sqrt(100/0.01))
# sound 440
c=340;f=440; lam=c/f; print('lam',lam,'k',2*pi/lam,'w',2*pi*f)
print('== material derivative ==')
print(-1+2*3600/1000*0.5)
# nozzle
print('nozzle a', 2*10)
