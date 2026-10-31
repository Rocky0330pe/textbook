import numpy as np
from scipy import integrate as I
pi=np.pi
print('net', 2*0.5*np.cos(np.radians([0,30,45,60,90])))
print('ex1', 1.5*0.4*np.cos(np.radians([0,60,90])), 'j1', 3*0.2*np.cos(np.radians(45)))
A=np.array([3,0,0]);B=np.array([0,6,0]);C=np.array([0,0,3])
c=np.cross(B-A,C-A)/2; print('tri',c,np.linalg.norm(c),c@[1,1,1])
A=np.array([4,0,0]);B=np.array([0,2,0]);C=np.array([0,0,2])
c=np.cross(B-A,C-A)/2; print('tri2',c,np.linalg.norm(c),c@[1,1,1])
# roof
for (a,b,ang,mm) in [(8,5,30,4),(10,6,45,5)]:
    real=a*b/np.cos(np.radians(ang)); print('roof',real, mm/1000*real*np.cos(np.radians(ang)))
print('window', I.dblquad(lambda z,x:1+0.5*z,0,1,0,2)[0], I.dblquad(lambda z,x:0.8+0.4*z,0,2,0,1.5)[0])
print('tiles', sum(0.5*1*(1+0.5*z) for z in [0.25,0.75,1.25,1.75]))
R=0.01;um=0.2; print('pipe', I.quad(lambda r: um*(1-r*r/R/R)*2*pi*r,0,R)[0])
R=0.02;um=0.1; print('pipe2', I.quad(lambda r: um*(1-r*r/R/R)*2*pi*r,0,R)[0])
print('sph', 2*4*pi*4, 32*pi, 3*4*pi*9,108*pi)
f=lambda r,t:(r*r+1)*r; print('parab',I.dblquad(f,0,2*pi,0,1)[0],1.5*pi)
f=lambda r,t:(4-r*r)*r; print('parab2',I.dblquad(f,0,2*pi,0,2)[0],8*pi)
Rr=2; print('hemi', I.dblquad(lambda th,ph: Rr*np.cos(th)**2*Rr**2*np.sin(th),0,2*pi,0,pi/2)[0], 16*pi/3)
print('cyl', I.dblquad(lambda th,z: np.cos(th)**2*1*1,0,2,0,2*pi)[0], 2*pi)
print('solid', [2*pi*(1-np.cos(np.radians(a))) for a in (30,60,90,180)], [ (1-np.cos(np.radians(a)))/2 for a in (30,60)])
print('river', 2*sum(d*v for d,v in zip([0.5,1,1.5,1,0.5],[0.4,0.8,1,0.8,0.4])), 2*sum(d*v for d,v in zip([0.6,1.2,0.6],[0.5,1,0.5])))
print('dome', 2*pi*100, 2*pi*100*0.2, 4*pi*9, 4*pi*9*0.15)
# cube face flux of r/r^3, side 2, face z=1
n=100; t=(np.arange(n)+0.5)/n*2-1; X,Y=np.meshgrid(t,t); 
print('face', ((1/(X**2+Y**2+1)**1.5)*(2/n)**2).sum(), 4*pi/6)
print('face exact', I.dblquad(lambda y,x: 1/(x*x+y*y+1)**1.5,-1,1,-1,1)[0])
# cube flux (xy,y^2,z)
print('cube2', 0.5+1+1, I.tplquad(lambda z,y,x:3*y+1,0,1,0,1,0,1)[0])
# solar
print('solar', 1000*1.6*0.2, 1000*1.6*0.2*np.cos(np.radians(60)))
