import numpy as np
from math import *
d=np.linalg.det
def M(*r): return np.array(r,dtype=float)
A=M([2,1],[1,2])
print('detA',d(A), repr(np.linalg.det(A)))
for m in [M([2,0],[0,1]),M([1,1],[0,1]),M([3,1],[1,2]),M([1,2],[2,4]),M([3,1],[2,2]),M([4,1],[2,3]),M([1,3],[2,1]),M([2,-1],[3,1]),M([0,2],[1,3])]:
    print(m.tolist(), round(d(m),6))
B=M([1,1],[0,1]); S=M([2,0],[0,1])
print('AB',(A@B).tolist(), d(A@B),'SA',(S@A).tolist(),d(S@A),'AS',(A@S).tolist(),d(A@S))
print('det2A',d(2*A),'det3B',d(3*B))
print('A+B', d(A+B), d(A)+d(B))
box=M([2,0,1],[0,3,1],[0,0,4]); print('box',repr(d(box)))
for m in [M([2,1,1],[1,3,2],[1,0,2]),M([1,2,1],[0,1,2],[3,0,1]),M([1,0,0],[-3,1,1],[0,-1,0]),M([1,1,1],[1,-1,0],[0,1,-1])]:
    print(m.tolist(), repr(d(m)))
# ropes
for t1,t2 in [(30,60),(30,30),(10,10),(5,5),(45,45),(20,20),(15,15),(1,1)]:
    a,b=radians(t1),radians(t2)
    K=M([-cos(a),cos(b)],[sin(a),sin(b)])
    W=100 if (t1,t2)==(30,60) else 40
    T=np.linalg.solve(K,[0,W])
    print('rope',t1,t2,'det',round(d(K),4),'-sin',round(-sin(a+b),4),'T',T.round(2))
# robot
L1,L2=0.30,0.25
def J(t1,t2,L1=0.30,L2=0.25):
    t1,t2=radians(t1),radians(t2)
    x=L1*cos(t1)+L2*cos(t1+t2); y=L1*sin(t1)+L2*sin(t1+t2)
    return M([-y,-L2*sin(t1+t2)],[x,L2*cos(t1+t2)]),(x,y)
for t2 in [45,90,10,0,180,30]:
    j,p=J(30,t2); print('J',t2,j.round(4).tolist(),'det',round(d(j),5),'L1L2sin',round(L1*L2*sin(radians(t2)),5),'p',np.round(p,4))
j,p=J(30,30,0.40,0.30); print('J4030',j.round(4).tolist(),d(j))
# ABCD
def ser(z): return np.array([[1,z],[0,1]],dtype=complex)
def sh(y): return np.array([[1,0],[y,1]],dtype=complex)
for P in [ser(2)@sh(0.5), sh(0.5)@ser(2), ser(3)@sh(1/6), ser(10)@sh(0.2), ser(10j)@sh(0.05j), ser(4j)@sh(0.125j)]:
    print('ABCD',np.round(P,4).tolist(), np.round(d(P),6))
