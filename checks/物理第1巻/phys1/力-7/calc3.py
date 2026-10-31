from math import *
D=degrees; R=radians
L1,L2=0.30,0.25
print("FK table th2=45")
for t1 in range(0,91,15):
    x=L1*cos(R(t1))+L2*cos(R(t1+45)); y=L1*sin(R(t1))+L2*sin(R(t1+45)); print(t1,45,"%.3f %.3f"%(x,y))
print("FK table th1=30 th2 varies")
for t2 in range(0,181,30):
    x=L1*cos(R(30))+L2*cos(R(30+t2)); y=L1*sin(R(30))+L2*sin(R(30+t2)); print(30,t2,"%.3f %.3f"%(x,y))
print("IK line x=0.40")
for i in range(7):
    x=0.40; y=0.05*i
    d=sqrt(x*x+y*y); c=(L1**2+L2**2-d*d)/(2*L1*L2); t2=180-D(acos(c)); al=D(atan2(y,x)); b=(L1**2+d*d-L2**2)/(2*L1*d); t1=al-D(acos(b))
    print(round(y,2), round(t1,1), round(t2,1), "check", round(L1*cos(R(t1))+L2*cos(R(t1+t2)),4), round(L1*sin(R(t1))+L2*sin(R(t1+t2)),4))
print("4bar upper branch")
a,b,c,d=2,5,4,6
def fb(phi):
    Ax,Ay=a*cos(R(phi)),a*sin(R(phi)); ex,ey=Ax-d,Ay; e=hypot(ex,ey); angA=D(atan2(ey,ex))%360
    cg=(c*c+e*e-b*b)/(2*c*e); gam=D(acos(cg)); psi=(angA-gam)%360
    return e,angA,gam,psi
for phi in range(0,360,30):
    e,angA,gam,psi=fb(phi); print(phi,"e %.2f angA %.1f gam %.1f psi %.1f"%(e,angA,gam,psi), "B=(%.2f,%.2f)"%(d+c*cos(R(psi)),c*sin(R(psi))))
ps=[fb(p/10)[3] for p in range(3600)]
i1=ps.index(min(ps)); i2=ps.index(max(ps)); print("min",min(ps),i1/10,"max",max(ps),i2/10,"swing",max(ps)-min(ps))
