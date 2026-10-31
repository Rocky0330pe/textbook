import numpy as np
from scipy.linalg import expm
np.set_printoptions(precision=5, suppress=True)
S=np.array([[0,1],[-1,0.]])
for n in [63,630,6283]:
    M=np.linalg.matrix_power(np.eye(2)+S*2*np.pi/n,n); print('spring',n,M)
for n in [10,1000]: print('cup',n,(1-0.5/n)**n)
print(np.exp(-0.5))
# series partial sums at t=pi/2
t=np.pi/2; P=np.eye(2); T=np.eye(2)
for k in range(1,13):
    T=T@(S*t)/k; P=P+T
    if k in (1,2,3,4,5,6,8,10,12): print('series',k,P.ravel())
print('expm',expm(S*t))
# car A
A=np.array([[0,1],[-2,-3.]]);print('carA t=1',expm(A))
t=1;print(2*np.exp(-t)-np.exp(-2*t), np.exp(-t)-np.exp(-2*t))
print('det',np.linalg.det(expm(A)),np.exp(-3))
# tank
H=np.array([[-0.1,0.1],[0.1,-0.1]]);print('tank',expm(H*10)@[20,0])
# car B
B=np.array([[0,1],[-5,-2.]]);print('carB',expm(B), np.exp(-1)*(np.cos(2)+0.5*np.sin(2)))
for t in [0.5,1,2]: print('carBx',t,np.exp(-t)*(np.cos(2*t)+0.5*np.sin(2*t)))
N=B+np.eye(2);print('N2',N@N)
B2=np.array([[0,1],[-10,-2.]]);N=B2+np.eye(2);print('N2b',N@N, expm(B2)[:,0], np.exp(-1)*(np.cos(3)+np.sin(3)/3))
# diag
print('diag', 3*np.exp(-1),4*np.exp(-2), 2*np.exp(-1), np.exp(-6))
# cart
# line
for l in [1,2,0.5]: print('line',l,np.cosh(l),np.sinh(l))
M=np.array([[0,1],[1,0.]]);print(expm(M))
# critical
C=np.array([[0,1],[-1,-2.]]);print('crit',expm(C), 2*np.exp(-1))
C2=np.array([[0,1],[-4,-4.]]);print('crit2',expm(C2), 0.01*3*np.exp(-2))
# example 7
A7=np.array([[0,1],[-6,-5.]]);t=1;print('A7',expm(A7*t),[3*np.exp(-2)-2*np.exp(-3),np.exp(-2)-np.exp(-3)])
A7j=np.array([[0,1],[-3,-4.]]);print('A7j',expm(A7j),[1.5*np.exp(-1)-0.5*np.exp(-3), 0.5*np.exp(-1)-0.5*np.exp(-3)])
# step input car A
for t in [1,2,5]: print('step',t,0.5-np.exp(-t)+0.5*np.exp(-2*t), np.exp(-t)-np.exp(-2*t))
for t in [1]: print('step6',1/6-0.5*np.exp(-2*t)+np.exp(-3*t)/3)
# 3-point heat
K3=np.array([[-2,1,0],[1,-2,1],[0,1,-2.]]);w,v=np.linalg.eigh(K3);print('K3',w,v)
for t in [0.5,1,2]: print('heat3',t,expm(K3*t)@[100,100,100])
a=(100+100/np.sqrt(2))/2; b=(100-100/np.sqrt(2))/2; print('a b',a,b)
for t in [1]: 
  l1=-2+np.sqrt(2); l3=-2-np.sqrt(2); print(a*np.exp(l1*t)+b*np.exp(l3*t), np.sqrt(2)*(a*np.exp(l1*t)-b*np.exp(l3*t)))
for t in [1]: print('heat3j',expm(K3*t)@[0,100,0])
# 9-point
K9=-2*np.eye(9)+np.eye(9,k=1)+np.eye(9,k=-1)
w,v=np.linalg.eigh(K9);print('K9 eig',w);print('slowest vec',v[:,-1]/v[4,-1])
print([np.sin(m*np.pi/10) for m in range(1,10)])
for t in [5,10]: print('heat9',t,(expm(K9*t)@(100*np.ones(9)))[4])
print('cont first eig', -(np.pi/0.1)**2*1e-4)
for r in [0.25,0.5,0.6]: e=np.linalg.eigvalsh(np.eye(9)+r*K9); print('euler',r,e.min(),e.max())
# e^{A+B}
X=np.array([[0,1],[0,0.]]);Y=np.array([[0,0],[1,0.]]);print('eAeB',expm(X)@expm(Y),expm(Y)@expm(X),expm(X+Y))
# discrete exact
Acl=np.array([[0,1],[-4,-4.]]);print('Ad exact',expm(Acl*0.1),np.linalg.eigvals(expm(Acl*0.1)))
# pendulum
P=np.array([[0,1],[4,0.]]);print(np.linalg.eigvals(P),np.linalg.eigvals(Acl))
