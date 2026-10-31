from math import *
g=9.8; D=degrees; R=radians
print("== E10 4-bar a=2 b=5 c=4 d=6 (cm)")
def fourbar(a,b,c,d,phi):
    Ax,Ay=a*cos(R(phi)),a*sin(R(phi))
    ex,ey=Ax-d,Ay; e=hypot(ex,ey)
    angA=D(atan2(ey,ex))   # B0->A direction
    cg=(c*c+e*e-b*b)/(2*c*e); gam=D(acos(cg))
    psi=angA-gam   # choose branch with B above? check
    Bx,By=d+c*cos(R(psi)),c*sin(R(psi))
    psi2=angA+gam; Bx2,By2=d+c*cos(R(psi2)),c*sin(R(psi2))
    return e,angA,cg,gam,psi,(Bx,By),psi2,(Bx2,By2)
for phi in range(0,360,30):
    e,angA,cg,gam,psi,B,psi2,B2=fourbar(2,5,4,6,phi)
    print(phi, "e=%.3f angA=%.2f cos=%.4f gam=%.2f psi=%.2f B=(%.2f,%.2f) psi2=%.2f B2=(%.2f,%.2f)"%(e,angA,cg,gam,psi,*B,psi2,*B2))
# swing range on branch psi2 (upper)
ps=[fourbar(2,5,4,6,p/10)[6] for p in range(3600)]
print("psi2 range",min(ps),max(ps), max(ps)-min(ps))
print("grashof s+l",2+6,"p+q",5+4)
print("== E11 gears")
print(3000*20/60, 0.5*60/20, 0.5*2*pi*3000/60)
print("2stage", 3000*20/60*15/45, 0.5*3*3)
print("eta .95", 0.5*3*0.95)
print("jibun 1800rpm 0.2Nm 12->48, 15->45:", 1800*12/48, 1800*12/48*15/45, 0.2*4, 0.2*12)
print("== E12 bicycle chain front44 rear16 60rpm r=0.33")
for fr,re,rpm,r in [(44,16,60,0.33),(48,12,80,0.33),(44,22,60,0.33)]:
    w=2*pi*rpm/60*fr/re; v=r*w; print(fr,re,rpm,"wheel rpm",rpm*fr/re,"omega",w,"v",v,"km/h",v*3.6)
print("belt d0.1 1500rpm -> d0.3", 1500*0.1/0.3, pi*0.1*1500/60)
print("== E13 turntable")
for r,mu in [(0.20,0.40),(0.10,0.50)]:
    w=sqrt(mu*g/r); print(r,mu,w,w/2/pi*60)
print("washing 800rpm r=0.25", (800*2*pi/60), 0.25*(800*2*pi/60)**2, 0.25*(800*2*pi/60)**2/g)
print("1g water", 0.001*0.25*(800*2*pi/60)**2)
print("== E14 truck")
for h,b,Rr,mu in [(1.5,1.0,50,0.7),(0.55,0.75,50,0.7)]:
    vt=sqrt(g*b*Rr/h); vs=sqrt(mu*g*Rr); print(h,b,Rr,"tip",vt,vt*3.6,"slide",vs,vs*3.6)
print("== E15 coriolis")
Om=2*pi/86164; print("Omega",Om)
for v,lat in [(100,35),(50,45),(30,35),(30,30)]:
    a=2*Om*v*sin(R(lat)); print(v,lat,a,a/g)
a=2*Om*30*sin(R(35)); print("ball 30m/s 2s dev", 0.5*a*4)
print("foucault period tokyo 35.7", 86164/sin(R(35.7))/3600, "paris 48.85", 86164/sin(R(48.85))/3600)
print("== E16 precession")
for m,d,I,w in [(2.0,0.20,0.10,30),(2.0,0.20,0.10,60),(1.5,0.15,0.05,40)]:
    Om=m*g*d/(I*w); print(m,d,I,w,Om, 2*pi/Om)
print("== IK jibun check & stage-me numbers")
