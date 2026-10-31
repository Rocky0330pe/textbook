import numpy as np
from math import *
np.set_printoptions(suppress=True)
house=np.array([[0,0],[2,0],[2,2],[1,3],[0,2]]).T
Ms={'A':[[2,1],[1,2]],'S':[[2,0],[0,1]],'F':[[1,0],[0,-1]],'H':[[1,1],[0,1]],'R90':[[0,-1],[1,0]],'Fx':[[-1,0],[0,1]],'T2':[[1,0],[0,2]]}
for k,m in Ms.items(): print(k,(np.array(m)@house).T.tolist())
print('A(1,2)',np.array([[2,1],[1,2]])@[1,2])
# 7-2 reidai
print('r1',np.array([[3,-1],[2,4]])@[2,5],'j1',np.array([[2,-3],[1,5]])@[4,2])
print('r3',np.array([[3,-1],[1,2]])@[2,1],'j3',np.array([[1,4],[2,-1]])@[3,2])
print('r4',2*np.array([3,1])+3*np.array([-1,2]),'j4',3*np.array([1,4])-np.array([2,-1]))
print('r5',np.array([[1,1,1],[1,-1,0],[0,1,-1]])@[4,3,2],'j5',np.array([[2,0,1],[1,3,0],[0,1,4]])@[1,2,3])
L1,L2=0.30,0.25; t1,t2=radians(30),radians(45)
J=np.array([[-L1*sin(t1)-L2*sin(t1+t2),-L2*sin(t1+t2)],[L1*cos(t1)+L2*cos(t1+t2),L2*cos(t1+t2)]])
print('J',J); Jr=np.round(J,3); print('Jr',Jr)
for w in ([0.5,1.0],[1.0,-0.5],[1.0,0.5],[0.4,-0.6]):
  v=Jr@w; print('Jw',w,v,np.hypot(*v), J@w)
print('hand',L1*cos(t1)+L2*cos(t1+t2),L1*sin(t1)+L2*sin(t1+t2))
sig=np.array([[80,30],[30,-20]])
for n in ([1,0],[0,1],[0.6,0.8],[0.8,0.6]): print('sig',n,sig@n)
print('nanamekijun',np.array([[2,1],[1,3]])@[2,1], np.array([[2,1],[1,3]])@[3,-1])
print('wrong',np.array([[1,2],[3,4]])@[5,6], np.array([[1,3],[2,4]])@[5,6])
A=np.array([[2,1],[1,2]]);x=np.array([1,2]);print('A*x',A*x)
# linearity check
u=np.array([1,0]);v=np.array([1,1]);print('lin',A@(u+v),A@u+A@v, A@(3*v),3*(A@v))
# shear italic
print('tan12',tan(radians(12)))
