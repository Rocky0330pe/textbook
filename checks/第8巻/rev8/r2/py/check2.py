import numpy as np
from scipy import integrate, linalg
h=1e-5
def div(F,p):
    p=np.array(p,float); s=0
    for i in range(len(p)):
        e=np.zeros(len(p)); e[i]=h
        s+=(F(*(p+e))[i]-F(*(p-e))[i])/(2*h)
    return s
def d(F,i,j,p):  # dF_i/dx_j
    p=np.array(p,float); e=np.zeros(len(p)); e[j]=h
    return (F(*(p+e))[i]-F(*(p-e))[i])/(2*h)
def rot3(F,p): return np.array([d(F,2,1,p)-d(F,1,2,p), d(F,0,2,p)-d(F,2,0,p), d(F,1,0,p)-d(F,0,1,p)])
print("== 8-9")
print("div(xz,2y,-z^2) at (1,0,1),(0,5,3):", div(lambda x,y,z:np.array([x*z,2*y,-z*z]),(1,0,1)), div(lambda x,y,z:np.array([x*z,2*y,-z*z]),(0,5,3)))
print("div(xy,yz,zx) at (1,2,3),(-2,0,1):", div(lambda x,y,z:np.array([x*y,y*z,z*x]),(1,2,3)), div(lambda x,y,z:np.array([x*y,y*z,z*x]),(-2,0,1)))
v=lambda x,y: 3*np.array([x,y])/(x*x+y*y)
print("3(x,y)/r^2 at (1,2): dvx/dx, dvy/dy:", d(v,0,0,(1,2)), d(v,1,1,(1,2)), div(v,(1,2)))
# small box flux of (x^2,xy,-z) about (2,0,0)
def boxflux(F,c,a):
    c=np.array(c,float); s=0
    for ax in range(3):
        o=[i for i in range(3) if i!=ax]
        for sg in (1,-1):
            def f(u,w):
                p=c.copy(); p[ax]+=sg*a/2; p[o[0]]+=u; p[o[1]]+=w
                return sg*F(*p)[ax]
            s+=integrate.dblquad(f,-a/2,a/2,-a/2,a/2)[0]
    return s/a**3
print("box (x^2,xy,-z)@(2,0,0):", boxflux(lambda x,y,z:np.array([x*x,x*y,-z]),(2,0,0),0.1), " (xy,y^2,z)@(2,1,0):", boxflux(lambda x,y,z:np.array([x*y,y*y,z]),(2,1,0),0.1))
print("hose", 1.2*3.0/0.6, 1.2*3e-4*60*1000, 0.8*2.5/0.4)
print("== 8-10")
rot2=lambda F,p: d(F,1,0,p)-d(F,0,1,p)
print("rot(3y,3x+2y)", rot2(lambda x,y:np.array([3*y,3*x+2*y]),(0.3,0.7)), " W:", 0-(-3*2*1-1))
print("rot(2xy+y^2,x^2+2xy)", rot2(lambda x,y:np.array([2*x*y+y*y,x*x+2*x*y]),(0.3,0.7)), " W:", 0+(1*2+1*4))
w=np.array([1,1,0.]); vel=lambda x,y,z: np.cross(w,[x,y,z])
print("rot(w x r) w=(1,1,0)", rot3(vel,(0.2,0.5,1)), vel(0,0,1), np.linalg.norm(2*w)/2)
print("B wire 20A 10cm", 4*np.pi*1e-7*20/(2*np.pi*0.1), "mu0 j", 4*np.pi*1e-7*20/(np.pi*0.002**2), np.cross([0,0,1],[0,-1,0]))
print("canal 0.5(1-y^2): rot at -0.6", rot2(lambda x,y:np.array([0.5*(1-y*y),0]),(0,-0.6)))
print("circ", (0.9+0.4-0.5-0)*0.4, (0.9+0.4-0.5)*0.4/0.16, (0.6-0.2-1.0-0.2)*0.2/0.04)
print("== 8-12")
lap=lambda f,p: sum((f(*(np.array(p)+e))-2*f(*p)+f(*(np.array(p)-e)))/1e-6 for e in 1e-3*np.eye(len(p)))
print("lap 5x^2-y^2+2z^2+xy", lap(lambda x,y,z:5*x*x-y*y+2*z*z+x*y,(0.3,0.2,0.1)), " r^3:", lap(lambda x,y,z:(x*x+y*y+z*z)**1.5,(0.3,0.4,1.2)), 12*np.sqrt(0.09+0.16+1.44), " 1/r^2:", lap(lambda x,y,z:1/(x*x+y*y+z*z),(0.3,0.4,1.2)), 2/(1.69)**2)
H=lambda x,y:100-0.01*x*x-0.02*y*y
print("mountain neighbours", H(40,20),H(20,20),H(30,30),H(30,10), (H(40,20)+H(20,20)+H(30,30)+H(30,10))/4-H(30,20))
# plate N x N Laplace: top 100 others 0 center
def plate(n,top,right,bottom,left):
    T=np.zeros((n+2,n+2)); T[0,:]=top; T[-1,:]=bottom; T[:,0]=left; T[:,-1]=right
    N=n*n; A=np.zeros((N,N)); b=np.zeros(N)
    idx=lambda i,j:(i-1)*n+(j-1)
    for i in range(1,n+1):
        for j in range(1,n+1):
            k=idx(i,j); A[k,k]=4
            for di,dj in ((1,0),(-1,0),(0,1),(0,-1)):
                ii,jj=i+di,j+dj
                if 1<=ii<=n and 1<=jj<=n: A[k,idx(ii,jj)]=-1
                else: b[k]+=T[ii,jj]
    x=linalg.solve(A,b); return x.reshape(n,n)
print("plate center 9x9 top100", plate(9,100,0,0,0)[4,4], " 3x3:", plate(3,100,0,0,0).round(3).tolist())
print("plate 100/60/0/0", plate(9,100,60,0,0)[4,4], " 100/100/40/0", plate(9,100,100,40,0)[4,4])
print("2 cells A,B", linalg.solve([[4,-1],[-1,4]],[100,0]), linalg.solve([[4,-1],[-1,4]],[40,20]), linalg.solve([[4,-1],[-1,4]],[100,20]))
print("sphere V", 20/0.15-100, 20/0.3-50, " insul", 80-60/np.log(2)*np.log(1.5), 90-60/np.log(2)*np.log(1.5))
print("== 8-13")
def step(T,r): Tn=T.copy(); Tn[1:-1]=T[1:-1]+r*(T[2:]-2*T[1:-1]+T[:-2]); return Tn
print("1 step", step(np.array([80,50,30,20.]),0.2), step(np.array([90,60,40,30.]),0.25))
# rod 0.1 m, alpha 1e-4, dx .01, dt .25 : left 100, right insulated, time to mid 50
T=np.full(11,20.); T[0]=100; t=0
while True:
    Tn=T.copy(); Tn[1:-1]=T[1:-1]+0.25*(T[2:]-2*T[1:-1]+T[:-2]); Tn[-1]=T[-1]+0.25*(2*T[-2]-2*T[-1]); T=Tn; t+=0.25
    if T[5]>=50: break
print("rod mid 50 at", t)
print("r", 1.2e-4*0.1/0.005**2, 0.005**2/(2*1.2e-4), 1e-4*1/0.02**2, 0.01**2/(2*2.3e-5), 2.3e-5*3/0.01**2)
# eigenvalues 9x9 step matrix
for r in (0.25,0.5,0.6):
    M=np.eye(9)+r*(np.diag(-2*np.ones(9))+np.diag(np.ones(8),1)+np.diag(np.ones(8),-1))
    ev=np.linalg.eigvalsh(M); print(" r",r,"eig min/max",ev.min().round(4),ev.max().round(4))
print("wave", 340/440, 2*np.pi/(340/440), 2*np.pi*440, " c", np.sqrt(1200**2/16), " DT/Dt", -1+7.2*0.5, 0.5+3.6*-0.2)
