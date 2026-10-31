import numpy as np
pi=np.pi
N=600
# sphere flux of (x,y,z), R=2, numerically
def sphere_flux(F,R,top_only=False,N=400):
    th=(np.arange(N)+0.5)/N*(pi/2 if top_only else pi); ph=(np.arange(2*N)+0.5)/(2*N)*2*pi
    T,P=np.meshgrid(th,ph,indexing='ij'); dth=th[1]-th[0]; dph=ph[1]-ph[0]
    x=R*np.sin(T)*np.cos(P); y=R*np.sin(T)*np.sin(P); z=R*np.cos(T)
    n=np.array([x,y,z])/R; Fx,Fy,Fz=F(x,y,z)
    return np.sum((Fx*n[0]+Fy*n[1]+Fz*n[2])*R*R*np.sin(T))*dth*dph
print('G1 sphere', sphere_flux(lambda x,y,z:(x,y,z),2), 32*pi)
print('jibun sphere (2x,3y,z) R=1', sphere_flux(lambda x,y,z:(2*x,3*y,z),1), 8*pi)
print('G2 dome', sphere_flux(lambda x,y,z:(x,y,z+1),2,True), 20*pi)
# paraboloid flux z=1-x^2-y^2 of (x,y,z) upward: n dS = (2x,2y,1) dx dy
r=(np.arange(N)+0.5)/N; t=(np.arange(N)+0.5)/N*2*pi; R_,T_=np.meshgrid(r,t,indexing='ij')
x=R_*np.cos(T_); y=R_*np.sin(T_); z=1-x*x-y*y
print('parab', np.sum((x*2*x+y*2*y+z)*R_)*(1/N)*(2*pi/N), 1.5*pi)
# cube faces for (x^2,xy,-z) and (x^2,y^2,z^2)
print('cube (x2,y2,z2) div integral', 3.0)
# point charge in cube: flux through one face of cube side 2 centered at origin, unit charge -> fraction of 4pi
def face_frac(c,N=800):
    # face z=1, x,y in [-1,1], charge at c
    u=(np.arange(N)+0.5)/N*2-1; X,Y=np.meshgrid(u,u)
    dx=X-c[0]; dy=Y-c[1]; dz=1-c[2]; r3=(dx*dx+dy*dy+dz*dz)**1.5
    return np.sum(dz/r3)*(2/N)**2/(4*pi)
print('face center', face_frac((0,0,0)), 1/6)
# shifted charge: sum over 6 faces by symmetry transformations
def total(c):
    s=0
    for ax in range(3):
        for sgn in (1,-1):
            cc=[c[(ax+0)%3],c[(ax+1)%3],c[(ax+2)%3]]
            # map axis ax to z
            p=[c[(ax+1)%3],c[(ax+2)%3],sgn*c[ax]]
            s+=face_frac(p)
    return s
print('shift (0.5,0.3,-0.2)', total((0.5,0.3,-0.2)))
print('outside (2,0,0)', total((2.0,0.1,0.0)))
print('shift face fractions', [face_frac((0.3,0.2,0.5)), face_frac((0.3,0.2,-0.5))])
# constants
k=8.99e9; eps0=8.854e-12
print('Q/eps0', 1e-9/eps0, 'E at 0.1', k*1e-9/0.01, '4pikQ', 4*pi*k*1e-9)
GM=3.986e14; R=6.371e6; print('g earth', GM/R**2, GM/R**2/2)
GMm=4.905e12; Rm=1.737e6; print('g moon', GMm/Rm**2, GMm/Rm**2/2)
print('line charge', 2*k*1e-9/0.1, 2*k*2e-9/0.05, 1e-9/(2*pi*eps0*0.1))
# pond: source at (1.5,2.5) sink at (4.5,1.5), Q=4
def v(x,y):
    ax,ay=x-1.5,y-2.5; bx,by=x-4.5,y-1.5
    a2,b2=ax*ax+ay*ay,bx*bx+by*by; kk=4/(2*pi)
    return kk*(ax/a2-bx/b2), kk*(ay/a2-by/b2)
def circ_flux(cx,cy,r,N=20000):
    t=(np.arange(N)+0.5)/N*2*pi; x=cx+r*np.cos(t); y=cy+r*np.sin(t)
    vx,vy=v(x,y); return np.sum(vx*np.cos(t)+vy*np.sin(t))*r*2*pi/N
print('pond circle src r=.5', circ_flux(1.5,2.5,0.5), 'r=1', circ_flux(1.5,2.5,1.0), 'sink', circ_flux(4.5,1.5,0.7), 'big', circ_flux(3,2,3), 'none', circ_flux(3,3.5,0.4))
def rect_flux(N=20000):
    t=(np.arange(N)+0.5)/N
    s=0
    s+=np.sum(v(6,4*t)[0])*4/N - np.sum(v(0,4*t)[0])*4/N
    s+=np.sum(v(6*t,4)[1])*6/N - np.sum(v(6*t,0)[1])*6/N
    return s
print('pond rect', rect_flux())
print('src speed r=.5', 4/(2*pi*0.5), 'Q6 r1', 6/(2*pi))
# G6
print('G6', 18+6, 'jibun', 4+8)
# buoyancy
print('cube 0.1', 1000*9.8*0.1*0.01, 1000*9.8*0.001, 'sphere .1', 1000*9.8*4/3*pi*0.1**3)
print('cube 0.2', 1000*9.8*0.2*0.04, 'sphere .05', 1000*9.8*4/3*pi*0.05**3)
# Stokes
print('S1 circle r3', 18*pi, 'jibun rot5 sq2', 5*4, 'circle1', 5*pi)
# S5 hemisphere flux of rot=(0,0,2) radius1 and 2
print('S5 hemi R1', sphere_flux(lambda x,y,z:(0*x,0*y,2+0*z),1,True), 2*pi, 'R2', sphere_flux(lambda x,y,z:(0*x,0*y,2+0*z),2,True), 8*pi)
# S2 shoelace
def shoe(P):
    s=0
    for i in range(len(P)):
        x1,y1=P[i]; x2,y2=P[(i+1)%len(P)]; s+=x1*y2-x2*y1
    return s/2
print('tri', shoe([(0,0),(4,0),(4,3)]), 'quad', shoe([(0,0),(5,0),(5,2),(0,4)]))
print('ellipse', 6*pi, 4*pi)
# S3
def circ_line(F,cx,cy,r,N=20000):
    t=(np.arange(N)+0.5)/N*2*pi; x=cx+r*np.cos(t); y=cy+r*np.sin(t)
    Fx,Fy=F(x,y); return np.sum(-Fx*np.sin(t)+Fy*np.cos(t))*r*2*pi/N
irr=lambda x,y:(-y/(x*x+y*y), x/(x*x+y*y))
print('S3', circ_line(irr,0,0,2), circ_line(irr,3,0,1), circ_line(lambda x,y:(5*(-y)/(x*x+y*y),5*x/(x*x+y*y)),0,0,1))
# S4
mu0=4*pi*1e-7
print('S4', mu0*10/(2*pi*0.05), mu0*10*0.001/(2*pi*0.002**2), mu0*20/(2*pi*0.1), mu0*20*0.001/(2*pi*0.002**2))
# S6
print('S6', pi*0.05**2*0.4, pi*0.05**2*0.4/(2*pi*0.05), pi*0.1**2*0.2, pi*0.1**2*0.2/(2*pi*0.1))
