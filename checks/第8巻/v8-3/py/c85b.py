import numpy as np
# bar magnet: poles N at (-1,0) (+), S at (1,0) (-), 3D 1/r^2 fields in the plane
N=np.array([-1.0,0]); S=np.array([1.0,0])
def F(p):
    a=p-N; b=p-S
    return a/np.linalg.norm(a)**3 - b/np.linalg.norm(b)**3
def line(ang, h=0.02, nmax=3000, box=(-3.2,3.2,-2.2,2.2)):
    p=N+0.12*np.array([np.cos(ang),np.sin(ang)])
    pts=[p.copy()]
    for i in range(nmax):
        f=F(p); f/=np.linalg.norm(f)
        m=p+0.5*h*f; f2=F(m); f2/=np.linalg.norm(f2)
        p=p+h*f2
        pts.append(p.copy())
        if np.linalg.norm(p-S)<0.12: break
        if not(box[0]<p[0]<box[1] and box[2]<p[1]<box[3]): break
    return np.array(pts)
out=[]
for deg in [20,40,60,80,100,125,150,180,-20,-40,-60,-80,-100,-125,-150]:
    L=line(np.radians(deg))
    L=L[::8] if len(L)>16 else L
    out.append((deg,' -- '.join('(%.2f,%.2f)'%(x,y) for x,y in L)))
with open('dipole.txt','w') as f:
    for d,s in out: f.write('%%%d\n\\draw[kviiif stream] %s;\n'%(d,s))
print(len(out))
# pond arcs: circles through S(1.5,2.5) and K(4.5,1.5)
Sp=np.array([1.5,2.5]); Kp=np.array([4.5,1.5])
mid=(Sp+Kp)/2; d=Kp-Sp; nrm=np.array([-d[1],d[0]])/np.linalg.norm(d)
half=np.linalg.norm(d)/2
for t in [-2.5,-1.2,-0.5,0,0.5,1.2,2.5]:
    c=mid+t*nrm; r=np.hypot(half,t)
    print('t',t,'center',c.round(3),'r',round(r,3))
