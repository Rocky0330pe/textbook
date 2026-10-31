import numpy as np
from math import *
np.set_printoptions(precision=3, suppress=True, linewidth=150)
print("== yattemiyou grid ==")
G=np.array([[10,10,10,10,10],[10,25,30,25,10],[10,30,70,30,10],[10,25,30,25,10],[10,10,10,10,10]],float)
D=np.zeros((3,3))
for i in range(1,4):
  for j in range(1,4):
    D[i-1,j-1]=(G[i-1,j]+G[i+1,j]+G[i,j-1]+G[i,j+1])/4-G[i,j]
print(D)
print("== mountain ==")
h=lambda x,y:100-0.01*x*x-0.02*y*y
for (x,y) in [(30,20),(0,0),(50,-30)]:
  av=(h(x+10,y)+h(x-10,y)+h(x,y+10)+h(x,y-10))/4
  print(x,y,h(x,y),av,av-h(x,y))
print("== valley z=0.03x^2+0.01y^2 step 10 ==")
v=lambda x,y:0.03*x*x+0.01*y*y
x,y=20,10
av=(v(x+10,y)+v(x-10,y)+v(x,y+10)+v(x,y-10))/4; print(v(x,y),av,av-v(x,y),(100/4)*0.08)
print("== plate jacobi 5x5 ==")
T=np.zeros((5,5)); T[0,:]=100; T[0,0]=T[0,4]=0
hist=[T[1:4,1:4].copy()]
for k in range(1,200):
  Tn=T.copy(); Tn[1:-1,1:-1]=0.25*(T[:-2,1:-1]+T[2:,1:-1]+T[1:-1,:-2]+T[1:-1,2:]); T=Tn
  hist.append(T[1:4,1:4].copy())
for k in [0,1,2,3,4,5,10,20,30,50]:
  print(k, hist[k].round(3).tolist())
# convergence: when center within 0.1 of 25
for k,hh in enumerate(hist):
  if abs(hh[1,1]-25)<0.05: print("center within .05 at",k); break
print("exact solve")
# solve linear
import itertools
n=3; idx=lambda i,j:i*3+j
A=np.zeros((9,9)); b=np.zeros(9)
for i in range(3):
  for j in range(3):
    A[idx(i,j),idx(i,j)]=4
    for di,dj in [(-1,0),(1,0),(0,-1),(0,1)]:
      ii,jj=i+di,j+dj
      if 0<=ii<3 and 0<=jj<3: A[idx(i,j),idx(ii,jj)]=-1
      elif ii<0: b[idx(i,j)]+=100
print(np.linalg.solve(A,b).reshape(3,3))
# superposition examples
def plate(top,right,bottom,left,N=5):
  T=np.zeros((N,N)); T[0,1:-1]=top; T[-1,1:-1]=bottom; T[1:-1,0]=left; T[1:-1,-1]=right
  for k in range(5000):
    Tn=T.copy(); Tn[1:-1,1:-1]=0.25*(T[:-2,1:-1]+T[2:,1:-1]+T[1:-1,:-2]+T[1:-1,2:]); T=Tn
  return T
print("top100 right60:",plate(100,60,0,0)[2,2], plate(100,60,0,0,9)[4,4])
print("top80 left40 bottom20 right0:",plate(80,0,20,40)[2,2])
print("all 100:",plate(100,100,100,100)[2,2])
print("== two-cell strip ==")
# A=(100+B)/4, B=A/4
A_=400/15; print(A_, A_/4)
# jibun: top 80, left 20, others 0, cells A upper, B lower in column; left neighbor 20 for both
# A=(80+20+0+B)/4 , B=(A+20+0+0)/4
M=np.array([[4,-1],[-1,4]]); print(np.linalg.solve(M,[100,20]))
M=np.array([[4,-1],[-1,4]]); print('top 60 others 0',np.linalg.solve(M,[60,0]))
print("== fin second difference ==")
th=lambda x:40*cosh(20*(0.05-x))/cosh(1)
for x in [0,0.01,0.02,0.03]: print(x, th(x))
d2=(th(0.02)-2*th(0.01)+th(0))/0.01**2; print("2nd diff",d2, "beta2 theta",400*th(0.01))
print("== spheres / cylinders ==")
phi=lambda r:20/r-100; print(phi(0.1),phi(0.2),phi(0.15))
cyl=lambda r:100-100*log(r/0.1)/log(2); print('cyl',cyl(0.15))
Tc=lambda r:80-60*log(r/0.05)/log(2); print('pipe ins',Tc(0.05),Tc(0.1),Tc(0.075))
# jibun sphere: inner 0.05 m at 60 V, outer 0.1 m at 0: phi=a/r+b: 60=20a+b, 0=10a+b -> a=6 b=-60; at .075 -> 80-60=20
a=6;b=-60; print('sph j',a/0.075+b)
print("== pipe flow laplacian ==")
R=0.01; um=0.2; print(-4*um/R**2, 1e-3*(-4*um/R**2))
print("== 4-nb kernel image ==")
