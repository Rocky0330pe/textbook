import numpy as np
from scipy.linalg import expm
np.set_printoptions(precision=5, suppress=True)
# pendulum
A=np.array([[0,1],[4,0.]]);B=np.array([[0],[1.]])
print('pend eig',np.linalg.eigvals(A))
for t in [0.5,1,1.5,2]: print('nocontrol',t,(expm(A*t)@[0.01,0])[0], 0.01*np.cosh(2*t))
K=np.array([[8,4.]]);Acl=A-B@K
print('Acl',Acl,np.linalg.eigvals(Acl))
for t in [0.5,1,2,3]:
  x=expm(Acl*t)@[0.01,0]; print('closed',t,x, 0.01*(1+2*t)*np.exp(-2*t))
# u over time
for t in [0,0.25,0.5,1,2]:
  x=expm(Acl*t)@[0.01,0]; print('u',t,-(K@x), 'hand acc a=-l u', -2.45*(-(K@x)))
# other poles
for p in [(-1,-1),(-3,-3),(-1,-3),(-2,-3),(-4,-4)]:
  c=np.poly(p); print('poles',p,'k1=',c[2]+4,'k2=',c[1])
# discrete
for dt in [0.1,0.2,0.5,1.0,1.2]:
  Ad=np.eye(2)+Acl*dt; print('dt',dt,Ad,np.linalg.eigvals(Ad))
x=np.array([0.01,0.]);Ad=np.eye(2)+Acl*0.1
for k in range(31):
  if k in (0,1,2,3,5,10,20,30): print(k,x)
  x=Ad@x
x=np.array([0.01,0.]);Ad=np.eye(2)+Acl*1.2
for k in range(6): print('dt1.2',k,x); x=Ad@x
x=np.array([0.01,0.]);Ad=np.eye(2)+Acl*0.5
for k in range(4): print('dt0.5',k,x); x=Ad@x
# exact discretization
print('expm eig 0.1', np.linalg.eigvals(expm(Acl*0.1)), np.exp(-0.2))
# controllability
print('ctrb', np.hstack([B,A@B]), np.linalg.det(np.hstack([B,A@B])))
# car A
Aa=np.array([[0,1],[-2,-3.]]); print('carA eig',np.linalg.eigvals(Aa))
# spring 6-13
As=np.array([[0,1],[-16,-0.8]]); print('spring eig',np.linalg.eigvals(As))
# tank
Ah=np.array([[-0.1,0.1],[0.1,-0.1]]); print('tank eig',np.linalg.eig(Ah))
print('tank10',expm(Ah*10)@[20,0])
# RLC 10mH 1uF 20ohm state (vC,i)
L=10e-3;C=1e-6;R=20
Ar=np.array([[0,1/C],[-1/L,-R/L]]); print('RLC',Ar,np.linalg.eigvals(Ar))
# DC motor
Lm=1e-3;Rm=1;Kt=0.05;J=1e-4;b=1e-5
Am=np.array([[-b/J,Kt/J],[-Kt/Lm,-Rm/Lm]]);Bm=np.array([[0],[1/Lm]])
print('motor',Am,np.linalg.eigvals(Am), 'steady', -np.linalg.solve(Am,Bm).ravel())
# linearization error
for th in [0.05,0.1,0.2,0.3,0.5,1.0]: print('sin',th,np.sin(th),(th-np.sin(th))/np.sin(th)*100, np.degrees(th))
# pendulum physical: g/l=4 -> l
print('l',9.8/4)
