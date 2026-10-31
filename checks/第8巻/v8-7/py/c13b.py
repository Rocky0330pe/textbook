import numpy as np
from math import *
def rod(dx,dt,alpha=1e-4,L=0.1,right='ins',steps=100):
  n=int(round(L/dx))+1; T=np.full(n,20.0); T[0]=100; r=alpha*dt/dx/dx
  rows=[T.copy()]
  for k in range(steps):
    Tn=T.copy(); Tn[1:-1]=T[1:-1]+r*(T[2:]-2*T[1:-1]+T[:-2])
    if right=='ins': Tn[-1]=T[-1]+2*r*(T[-2]-T[-1])
    T=Tn; rows.append(T.copy())
  return rows
rows=rod(0.01,0.25,steps=400)
for t in [1,5,15.5,30,100]:
  print('t',t, ' '.join('%.1f'%v for v in rows[int(t/0.25)]))
rows=rod(0.01,0.25,right='fix',steps=4000)
print('fixed t=1000', rows[-1].round(1))
r6=rod(0.01,0.6,steps=12); r25=rod(0.01,0.25,steps=29)
print('r0.6 cell1', [round(x[1],2) for x in r6])
print('r0.6 at t=6s', r6[10].round(1))
print('r0.25 cell1 t', [round(r25[k][1],2) for k in range(0,29)])
# eigen
N=9
for r in [0.25,0.5,0.6]:
  A=np.eye(N)*(1-2*r)+np.eye(N,k=1)*r+np.eye(N,k=-1)*r
  lam=np.linalg.eigvalsh(A); print(r, lam.min().round(4), lam.max().round(4))
# examples
print('R1',50+0.2*(80-100+30),30+0.2*(50-60+20))
print('J1',60+0.3*(100-120+40),40+0.3*(60-80+30))
print('P1',60+0.25*(90-120+40),40+0.25*(60-80+30))
print('R2', 1.2e-4*0.1/0.005**2, 0.005**2/(2*1.2e-4))
print('J2', 4e-6*0.6/0.002**2, 0.002**2/(2*4e-6))
print('P2', 1e-4*1/0.02**2, 0.02**2/2e-4)
print('C9', 1e-4/(2*2.3e-5), 2.3e-5*3/1e-4, 1-4*2.3e-5*3/1e-4)
for a in [pi/0.1, 2*pi/0.1, 3*pi/0.1]: print('a',a, 1e-4*a*a, log(2)/(1e-4*a*a))
print('R7', 340/440, 2*pi/(340/440), 2*pi*440)
print('J7', 100/200, 2*pi/0.5, 2*pi*200)
print('P7', 340/1000, 2*pi/0.34, 2*pi*1000)
print('J8', 0.5+18*0.01)
print('C8', 0.5+3.6*(-0.2))
print('C10', 0.017/340)
r25=rod(0.01,0.25,steps=24); print('r.25 t6', r25[24].round(1))
r6=rod(0.01,0.6,steps=20); print('r.6 t12', r6[20].round(0)); print('r.6 t3', r6[5].round(1))
x=np.linspace(0,0.1,11)
print('sine t7', (10*np.sin(pi*x/0.1)*exp(-0.0987*7)).round(2))
