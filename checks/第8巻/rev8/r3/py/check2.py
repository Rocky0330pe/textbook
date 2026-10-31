import numpy as np
from scipy import integrate
pi=np.pi
mu0=4*pi*1e-7; e0=8.854e-12
print('c =',1/np.sqrt(mu0*e0))
print('B 10A 5cm =',mu0*10/(2*pi*0.05))
k=1/(4*pi*e0); print('4πk == 1/ε0 :',np.isclose(4*pi*k,1/e0), ' 1/(4πε0)=',k)
print('Q/ε0 (1e-9, 8.85e-12)=',1e-9/8.85e-12)
G=6.674e-11; GM=3.986e14; R=6.371e6; print('g=',GM/R**2,' half depth', GM/R**2/2)

h_=1e-3
def A(p): x,y,z=p; return np.array([np.sin(x*y)+z**3, np.cos(y*z)*x, np.exp(0.3*x)*y*z])
def d(F,p,i):
    e=np.zeros(3);e[i]=h_; return (F(p+e)-F(p-e))/(2*h_)
def rot(F): return lambda p: np.array([d(F,p,1)[2]-d(F,p,2)[1], d(F,p,2)[0]-d(F,p,0)[2], d(F,p,0)[1]-d(F,p,1)[0]])
def div(F): return lambda p: sum(d(F,p,i)[i] for i in range(3))
def grad(f): return lambda p: np.array([(f(p+e)-f(p-e))/(2*h_) for e in np.eye(3)*h_])
def lapv(F,p): return sum((F(p+e)-2*F(p)+F(p-e))/h_**2 for e in np.eye(3)*h_)
p0=np.array([0.3,-0.7,0.5])
print('div rot A =',div(rot(A))(p0))
print('rot rot A =',rot(rot(A))(p0),' grad div A - lap A =',grad(div(A))(p0)-lapv(A,p0))
f=lambda p: np.sin(p[0])*p[1]**2+p[2]*p[0]
print('rot grad f =',rot(grad(f))(p0))
# plane wave in vacuum
c0=1/np.sqrt(mu0*e0); kk=2.0; w=c0*kk; E0=1.0
def Ef(t): return lambda p: np.array([0,E0*np.sin(kk*p[0]-w*t),0])
def Bf(t): return lambda p: np.array([0,0,E0/c0*np.sin(kk*p[0]-w*t)])
t0=1e-9; dt=1e-13
dBdt=(Bf(t0+dt)(p0)-Bf(t0-dt)(p0))/(2*dt); dEdt=(Ef(t0+dt)(p0)-Ef(t0-dt)(p0))/(2*dt)
print('rotE + dB/dt =',rot(Ef(t0))(p0)+dBdt)
print('rotB - mu0 e0 dE/dt =',rot(Bf(t0))(p0)-mu0*e0*dEdt, '(scale', np.abs(rot(Bf(t0))(p0)).max(),')')
print('E x B =',np.cross([0,1,0],[0,0,1]))
for nm,F in {'ア':lambda p:np.array([p[0],p[1],0]),'イ':lambda p:np.array([-p[0],-p[1],0]),'ウ':lambda p:np.array([1,0,0.]),'エ':lambda p:np.array([-p[1],p[0],0]),'オ':lambda p:np.array([p[1],0,0]),'カ':lambda p:np.array([p[0],0,0])}.items():
    print(nm,'div',round(div(F)(p0),6),'rot_z',round(rot(F)(p0)[2],6))
wv=np.array([0.2,-0.5,1.1]); print('rot(w x r)/w =',rot(lambda p:np.cross(wv,p))(p0)/wv)
GMR=1.0; print('div g inside uniform (should be -3GM/R^3=-4πGρ):',div(lambda p:-GMR*p)(p0))
# back map example
print('map ex',integrate.dblquad(lambda yy,xx:10+5*xx+2*yy,0,2,0,1)[0], '8-6 ex1 board(12+6x+4y)=',integrate.dblquad(lambda yy,xx:12+6*xx+4*yy,0,2,0,1)[0])
# solid angle 30deg
print('Ω30=',2*pi*(1-np.cos(pi/6)))
# mountain
h=lambda X,Y:100-0.01*X**2-0.02*Y**2
print('h(30,20)=',h(30,20),' dh',h(31,21)-h(30,20),' vol',0.5*pi*100*np.sqrt(5000)*100,' work',50*9.8*(100-83))
L1,L2=0.3,0.25; t1,t2=np.radians(30),np.radians(45)
J=np.array([[-L1*np.sin(t1)-L2*np.sin(t1+t2),-L2*np.sin(t1+t2)],[L1*np.cos(t1)+L2*np.cos(t1+t2),L2*np.cos(t1+t2)]]); print('J',J.round(4),'det',np.linalg.det(J).round(4))
# tiles 4x2 lower-left
s=sum((10+5*(i*0.5)+2*(j*0.5))*0.25 for i in range(4) for j in range(2)); print('lower-left tiles',s)
print('pipe Q mL/s',pi*0.01**2*0.2/2*1e6)
for nm,a in [('Cu',1.2e-4),('Al',1e-4),('Fe',2.3e-5),('SUS',4e-6),('water',1.4e-7)]: print(nm,0.01/a,'s')
for r in [0.25,0.5,0.6]:
    N=9;A_=np.eye(N)*(1-2*r)+np.eye(N,k=1)*r+np.eye(N,k=-1)*r; l=np.linalg.eigvalsh(A_); print(r,l.min().round(4),l.max().round(4))
X,Y=np.meshgrid(np.arange(0,60,10),np.arange(40,-10,-10)); print(100-0.01*X**2-0.02*Y**2)
# rod sim
T=np.full(11,20.0);T[0]=100;tt=0
while True:
    Tn=T.copy();Tn[1:10]=T[1:10]+0.25*(T[0:9]-2*T[1:10]+T[2:11]);Tn[10]=T[10]+0.25*(2*T[9]-2*T[10]);T=Tn;tt+=0.25
    if T[5]>50: print('rod mid>50 at',tt,T[5]);break
# Laplace 5x5
U=np.zeros((5,5));U[0,:]=100
for _ in range(2000): U[1:4,1:4]=0.25*(U[0:3,1:4]+U[2:5,1:4]+U[1:4,0:3]+U[1:4,2:5])
print('center',U[2,2])
# NS hydrostatic: v=0 -> 0=-grad p + rho g
print('hose: A v = A/2 * 2v ok')
print('IH check skipped; ε0 μ0 c^2 =',mu0*e0*(2.998e8)**2)
