import numpy as np
from scipy import integrate
s=lambda x,y:10+5*x+2*y
for nx,ny in [(4,2),(8,4),(16,8),(40,20),(400,200)]:
    dx,dy=2/nx,1/ny
    xs=np.arange(nx)*dx; ys=np.arange(ny)*dy
    X,Y=np.meshgrid(xs,ys)
    print(nx,ny, (s(X,Y)*dx*dy).sum(), (s(X+dx/2,Y+dy/2)*dx*dy).sum())
print(integrate.dblquad(lambda y,x:12+6*x+4*y,0,2,0,1)[0])
print(integrate.dblquad(lambda y,x:x**2*y,0,3,0,4)[0])
print(integrate.dblquad(lambda y,x:x*y,0,1,0,lambda x:x)[0])
print('tri', integrate.dblquad(lambda y,x:1,0,3,0,lambda x:2-2*x/3)[0], integrate.dblquad(lambda y,x:x,0,3,0,lambda x:2-2*x/3)[0],integrate.dblquad(lambda y,x:y,0,3,0,lambda x:2-2*x/3)[0])
R=0.02; print('I', integrate.dblquad(lambda y,x:y*y,-R,R,lambda x:-np.sqrt(R*R-x*x),lambda x:np.sqrt(R*R-x*x))[0], np.pi*0.04**4/64)
R=0.01; um=0.2; print('Q', integrate.quad(lambda r: um*(1-r*r/R/R)*2*np.pi*r,0,R)[0]*1e6)
print('V', integrate.quad(lambda z: np.pi*10*np.sqrt(50)*(100-z),0,100)[0])
# ellipse direct
print('V2', integrate.dblquad(lambda y,x: max(0,100-0.01*x*x-0.02*y*y),-100,100,lambda x:-np.sqrt(max(0,(100-0.01*x*x)/0.02)),lambda x:np.sqrt(max(0,(100-0.01*x*x)/0.02)))[0])
rho=7850;R=0.05;M=rho*4/3*np.pi*R**3
I=integrate.tplquad(lambda r,t,p: rho*r**4*np.sin(t)**3,0,2*np.pi,0,np.pi,0,R)[0]; print('sph',M,I,0.4*M*R*R)
print('G', integrate.quad(lambda x:np.exp(-x*x),-np.inf,np.inf)[0], np.sqrt(np.pi))
print('pipe', np.pi*(0.04**4-0.03**4)/64, np.pi*(0.06**4-0.04**4)/64, np.pi*(0.05**4-0.04**4)/64, np.pi*0.1**4/64, np.pi*0.06**4/64)
print('j7', integrate.quad(lambda z:50*np.pi*(40-z),0,40)[0], 'p8', integrate.quad(lambda z:50*np.pi*(60-z),0,60)[0])
print('p9', 0.4*7850*4/3*np.pi*0.1**3*0.01)
print('hemi', integrate.tplquad(lambda r,t,p: r**4*np.sin(t)**3,0,2*np.pi,0,np.pi/2,0,1)[0]/(2/3*np.pi))
print('p7', integrate.dblquad(lambda y,x:y,0,3,0,lambda x:x)[0])
print('j3', integrate.dblquad(lambda y,x:x*y,0,2,0,lambda x:x)[0])
print('j4', integrate.dblquad(lambda y,x:x,0,6,0,lambda x:3-x/2)[0]/9, integrate.dblquad(lambda y,x:y,0,6,0,lambda x:3-x/2)[0]/9)
print('p3', integrate.dblquad(lambda y,x:x,0,4,0,lambda x:3-0.75*x)[0]/6, integrate.dblquad(lambda y,x:y,0,4,0,lambda x:3-0.75*x)[0]/6)
