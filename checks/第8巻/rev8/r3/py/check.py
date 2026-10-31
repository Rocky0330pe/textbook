import numpy as np, sympy as sp
from scipy import integrate
pi=np.pi
mu0=4*pi*1e-7; e0=8.854e-12
print('c =',1/np.sqrt(mu0*e0))
print('B 10A 5cm =',mu0*10/(2*pi*0.05))
k=1/(4*pi*e0); print('4πk == 1/ε0 :',np.isclose(4*pi*k,1/e0), ' 1/(4πε0)=',k)
print('Q/ε0 (1e-9, 8.85e-12)=',1e-9/8.85e-12)
G=6.674e-11; GM=3.986e14; R=6.371e6; print('g=',GM/R**2,' half depth', GM/R**2/2)
# symbolic identities
x,y,z,t=sp.symbols('x y z t',real=True)
A=[sp.Function(n)(x,y,z) for n in ('Ax','Ay','Az')]
def grad(f): return [sp.diff(f,v) for v in (x,y,z)]
def div(F): return sum(sp.diff(F[i],v) for i,v in enumerate((x,y,z)))
def rot(F): return [sp.diff(F[2],y)-sp.diff(F[1],z), sp.diff(F[0],z)-sp.diff(F[2],x), sp.diff(F[1],x)-sp.diff(F[0],y)]
def lap(f): return sum(sp.diff(f,v,2) for v in (x,y,z))
print('div rot =',sp.simplify(div(rot(A))))
rr=rot(rot(A)); gd=grad(div(A))
print('rot rot - (grad div - lap) =',[sp.simplify(rr[i]-(gd[i]-lap(A[i]))) for i in range(3)])
f=sp.Function('f')(x,y,z); print('rot grad =',[sp.simplify(c) for c in rot(grad(f))])
# plane EM wave
E0,kk,c=sp.symbols('E0 k c',positive=True); w=c*kk
Ev=[0,E0*sp.sin(kk*x-w*t),0]; Bv=[0,0,E0/c*sp.sin(kk*x-w*t)]
m0,ee=sp.symbols('mu0 eps0',positive=True)
print('divE',div(Ev),'divB',div(Bv))
print('rotE+dB/dt',[sp.simplify(rot(Ev)[i]+sp.diff(Bv[i],t)) for i in range(3)])
r4=[sp.simplify((rot(Bv)[i]-m0*ee*sp.diff(Ev[i],t)).subs(c,1/sp.sqrt(m0*ee))) for i in range(3)]
print('rotB - mu0 eps0 dE/dt (c=1/sqrt)',r4)
print('E x B direction', np.cross([0,1,0],[0,0,1]))
# six fields
fields={'ア':(x,y),'イ':(-x,-y),'ウ':(1,0),'エ':(-y,x),'オ':(y,0),'カ':(x,0)}
for kname,(fx,fy) in fields.items():
    fx=sp.sympify(fx); fy=sp.sympify(fy)
    print(kname,'div',sp.diff(fx,x)+sp.diff(fy,y),'rot',sp.diff(fy,x)-sp.diff(fx,y))
# windmill: rot(w x r)=2w
wx,wy,wz=sp.symbols('wx wy wz'); v=sp.Matrix([wx,wy,wz]).cross(sp.Matrix([x,y,z]))
print('rot(w x r)=',rot(list(v)))
# continuity of charge from Maxwell: div of (4)
# uniform sphere gravity div g
rho_s=sp.symbols('rho',positive=True); Gs=sp.symbols('G',positive=True)
gin=[-sp.Rational(4,3)*sp.pi*Gs*rho_s*v_ for v_ in (x,y,z)]
print('div g inside =',sp.simplify(div(gin)))
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
