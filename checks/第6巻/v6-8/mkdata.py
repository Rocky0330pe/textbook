from math import *
def rk4(f,y,dt,n,every=1):
    out=[(0.0,y[:])]; t=0
    for i in range(n):
        k1=f(y); k2=f([a+dt/2*b for a,b in zip(y,k1)]); k3=f([a+dt/2*b for a,b in zip(y,k2)]); k4=f([a+dt*b for a,b in zip(y,k3)])
        y=[a+dt/6*(p+2*q+2*r+s) for a,p,q,r,s in zip(y,k1,k2,k3,k4)]; t+=dt
        if (i+1)%every==0: out.append((t,y[:]))
    return out
L=lambda s:[10*(s[1]-s[0]), s[0]*(28-s[2])-s[1], s[0]*s[1]-8/3*s[2]]
tr=rk4(L,[1.0,1.0,1.0],0.005,6000,6)
xz=" ".join("(%.1f,%.1f)"%(p[1][0],p[1][2]) for p in tr if p[0]>1.0)
a=rk4(L,[1.0,1.0,1.0],0.005,6200,10)
b=rk4(L,[1.0,1.001,1.0],0.005,6200,10)
la=" ".join("(%.2f,%.1f)"%(p[0],p[1][0]) for p in a)
lb=" ".join("(%.2f,%.1f)"%(p[0],p[1][0]) for p in b)
LV=lambda s:[s[0]*(1-0.05*s[1]), s[1]*(-1+0.01*s[0])]
lv=rk4(LV,[60.0,20.0],0.01,2000,10)
lx=" ".join("(%.1f,%.1f)"%(p[0],p[1][0]) for p in lv)
ly=" ".join("(%.1f,%.1f)"%(p[0],p[1][1]) for p in lv)
R2=lambda s:[(10-2*s[0]+s[1])/2,(s[0]-s[1])/2]
rc=rk4(R2,[0.0,0.0],0.01,1630,20)
r2=" ".join("(%.1f,%.2f)"%(p[0],p[1][1]) for p in rc)
with open("kviodata.tex","w") as f:
    f.write("%% グラフの点（Python の RK4 で計算した。組 V6-8）\n")
    for name,val in [("kviolorenzxz",xz),("kviolorenza",la),("kviolorenzb",lb),("kviolvx",lx),("kviolvy",ly),("kviorctwo",r2)]:
        f.write("\\def\\%s{%s}\n"%(name,val))
print(len(xz), len(la), len(lx), len(r2))
for p in rc:
    if abs(p[0]-16)<1e-6 or abs(p[0]-8)<1e-6: print(p)
