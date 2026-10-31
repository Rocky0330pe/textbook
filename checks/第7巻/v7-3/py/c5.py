import numpy as np, math
from fractions import Fraction as F
inv=np.linalg.inv; sol=np.linalg.solve; det=np.linalg.det
def M(*r): return np.array(r,dtype=float)
A=M([2,1],[1,2]); print('Ainv',inv(A))
print('kudamono',sol(M([2,3],[2,1]),[420,300]))
C=M([4,2],[2,4])
for b in [(9,6),(12,0),(6,6),(0,12)]: print('circ',b,sol(C,b))
C2=M([3,2],[2,3])
for b in [(8,7),(5,0)]: print('circ2',b,sol(C2,b))
print('naname',sol(M([2,1],[1,3]),[5,5]))
K=M([-math.cos(math.radians(30)),math.cos(math.radians(60))],[math.sin(math.radians(30)),math.sin(math.radians(60))]); print('sign',sol(K,[0,100]),inv(K))
def J(t1,t2,L1=0.30,L2=0.25):
    t1,t2=math.radians(t1),math.radians(t2)
    x=L1*math.cos(t1)+L2*math.cos(t1+t2); y=L1*math.sin(t1)+L2*math.sin(t1+t2)
    return M([-y,-L2*math.sin(t1+t2)],[x,L2*math.cos(t1+t2)])
for t2 in [45,10]:
    j=J(30,t2); print('J',t2,j.round(4),det(j))
    for v in [(0.1,0),(0,0.1)]: print('  v',v,sol(j,v).round(3), (j@sol(j,v)).round(4))
# (AB)^-1
A1=M([2,1],[1,1]);B1=M([1,0],[2,1]); print('AB',A1@B1,inv(A1@B1),inv(B1)@inv(A1),inv(A1)@inv(B1))
A2=M([3,2],[1,1]);B2=M([1,1],[0,1]); print('AB2',A2@B2,inv(A2@B2),inv(B2)@inv(A2))
B=M([1,1],[0,1]); print('mainAB',A@B, inv(A@B)*3, inv(B)@inv(A)*3, inv(A)@inv(B)*3)
# sweeping
print(sol(M([1,1,1],[1,-1,0],[0,1,-1]),[9,1,1]))
print(sol(M([1,1,1],[2,1,-1],[1,-1,2]),[6,1,5]))
print(sol(M([1,2,1],[1,1,-1],[2,-1,1]),[8,0,3]))
print('inv3',inv(M([1,1,1],[1,-1,0],[0,1,-1]))*3)
print(inv(M([1,2],[3,7])), inv(M([1,3],[2,7])))
# springs
k=100;W=0.98; Ks=M([2*k,-k,0],[-k,2*k,-k],[0,-k,k]); print('spring',sol(Ks,[W,W,W]))
# truss
T=M([0.5,0,1,1,0,0],[0.866,0,0,0,1,0],[0,-0.5,-1,0,0,0],[0,0.866,0,0,0,1],[-0.5,0.5,0,0,0,0],[-0.866,-0.866,0,0,0,0])
print('truss',sol(T,[0,0,0,0,0,10]).round(3))
# ill-conditioned
print(sol(M([1,1],[1,1.001]),[2,2.001]),sol(M([1,1],[1,1.001]),[2,2.002]))
# LS
x=np.array([0,1,2,3,4,5,6.]);y=np.array([0,1.6,2.9,4.6,5.9,7.6,8.9])
A7=np.column_stack([x,np.ones(7)]); print('ATA',A7.T@A7,A7.T@y, sol(A7.T@A7,A7.T@y))
print(np.linalg.lstsq(A7,y,rcond=None)[0])
xs=np.array([1,2,3,4,5.]);ys=np.array([14.0,15.9,18.1,20.1,21.9]);A5=np.column_stack([xs,np.ones(5)]);print('C',A5.T@A5,A5.T@ys,sol(A5.T@A5,A5.T@ys))
A3=M([0,1],[1,1],[2,1]); b3=np.array([1,3,2.]); print('3pt',A3.T@A3,A3.T@b3,sol(A3.T@A3,A3.T@b3))
for a in [0.4,0.5,0.6]:
    print([round(sum((b3-(a*A3[:,0]+bb))**2),3) for bb in [1.4,1.5,1.6]])
for a in [1.4,1.5,1.6,1.7,1.8]: print(a, round((2-a)**2+(3-2*a)**2,3))
xs4=np.array([1,2,3,4.]);ys4=np.array([3,5,6,8.]);A4=np.column_stack([xs4,np.ones(4)]);print('4pt',A4.T@A4,A4.T@ys4,sol(A4.T@A4,A4.T@ys4))
