from math import *
def rk4(f,y,dt,n,every=1):
    out=[(0.0,y[:])]
    t=0
    for i in range(n):
        k1=f(y); k2=f([a+dt/2*b for a,b in zip(y,k1)]); k3=f([a+dt/2*b for a,b in zip(y,k2)]); k4=f([a+dt*b for a,b in zip(y,k3)])
        y=[a+dt/6*(p+2*q+2*r+s) for a,p,q,r,s in zip(y,k1,k2,k3,k4)]
        t+=dt
        if (i+1)%every==0: out.append((t,y[:]))
    return out
L=lambda s:[10*(s[1]-s[0]), s[0]*(28-s[2])-s[1], s[0]*s[1]-8/3*s[2]]
tr=rk4(L,[1.0,1.0,1.0],0.005,8000,4)
pts=[(p[1][0],p[1][2]) for p in tr if p[0]>1.0]
s=" ".join("(%.1f,%.1f)"%p for p in pts)
open("lorenz_xz.txt","w").write(s)
print(len(pts), min(p[0] for p in pts), max(p[0] for p in pts), min(p[1] for p in pts), max(p[1] for p in pts))
# divergence: x(t)
a=rk4(L,[1.0,1.0,1.0],0.005,6000,10)
b=rk4(L,[1.0,1.001,1.0],0.005,6000,10)
sa=" ".join("(%.2f,%.1f)"%(p[0],p[1][0]) for p in a)
sb=" ".join("(%.2f,%.1f)"%(p[0],p[1][0]) for p in b)
open("lorenz_a.txt","w").write(sa); open("lorenz_b.txt","w").write(sb)
for (ta,ya),(tb,yb) in zip(a,b):
    if abs(ya[0]-yb[0])>1: print("diverge at",ta); break
# LV
LV=lambda s:[s[0]*(1-0.05*s[1]), s[1]*(-1+0.01*s[0])]
lv=rk4(LV,[60.0,20.0],0.01,2000,10)
open("lv_x.txt","w").write(" ".join("(%.1f,%.1f)"%(p[0],p[1][0]) for p in lv))
open("lv_y.txt","w").write(" ".join("(%.1f,%.1f)"%(p[0],p[1][1]) for p in lv))
print("LV x range", min(p[1][0] for p in lv), max(p[1][0] for p in lv), "y", min(p[1][1] for p in lv), max(p[1][1] for p in lv))
# period estimate
xs=[(p[0],p[1][0]) for p in lv]
peaks=[xs[i][0] for i in range(1,len(xs)-1) if xs[i][1]>xs[i-1][1] and xs[i][1]>xs[i+1][1]]
print("LV x peaks", peaks)
# 2-stage RC tau=2
R2=lambda s:[(10-2*s[0]+s[1])/2,(s[0]-s[1])/2]
rc=rk4(R2,[0.0,0.0],0.01,1600,20)
open("rc2.txt","w").write(" ".join("(%.1f,%.2f)"%(p[0],p[1][1]) for p in rc))
for p in rc:
    if abs(p[0]-2)<1e-6 or abs(p[0]-4)<1e-6 or abs(p[0]-10)<1e-6 or abs(p[0]-16)<1e-6: print("rc2",p[0],[round(v,3) for v in p[1]], "single",10*(1-exp(-p[0]/2)))
