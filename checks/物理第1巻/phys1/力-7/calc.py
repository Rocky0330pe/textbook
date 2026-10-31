# 力-7 例題・じぶんでとこう・章末問題の数値（g=9.8）
from math import *
g=9.8
D=degrees; R=radians
print("== E1 自転車")
v=5.0; r=0.33; w=v/r; print("omega",w,"rev/s",w/2/pi,"rpm",w/2/pi*60,"top",2*v,"front",sqrt(2)*v)
print("jibun car 72km/h r=0.30"); v=20; r=0.30; w=v/r; print(w, w/2/pi*60, 2*v)
print("== E2 斜面 30deg L=2m h=1")
for name,k in [("球",0.4),("円柱",0.5),("輪",1.0),("すべる",0)]:
    a=g*sin(R(30))/(1+k); t=sqrt(2*2/a); vb=sqrt(2*g*1/(1+k)); print(name,"a",a,"t",t,"v",vb)
print("jibun 20deg L=3m")
h=3*sin(R(20))
for name,k in [("球",0.4),("円柱",0.5),("輪",1.0),("すべる",0)]:
    a=g*sin(R(20))/(1+k); t=sqrt(2*3/a); vb=sqrt(2*g*h/(1+k)); print(name,"a",a,"t",t,"v",vb, "h",h)
print("friction need ball 30deg mu>=", 2/7*tan(R(30)), "cyl", 1/3*tan(R(30)), "hoop", 0.5*tan(R(30)))
print("== E3 bowling v0=8 mu=0.20")
def bowl(v0,mu,k=0.4):
    # v = v0 - mu g t ; r w = (mu g / k) t  -> equal at t = v0/(mu g (1+1/k))
    t=v0/(mu*g*(1+1/k)); vf=v0-mu*g*t; s=v0*t-0.5*mu*g*t*t
    lost=1-(0.5*(1+k)*vf**2)/(0.5*v0**2)
    return t,vf,s,lost
print(bowl(8.0,0.20)); print("jibun",bowl(6.0,0.25)); print("cyl",bowl(1,1,0.5))
print("== E4 spool")
m=0.10; IG=1.0e-4; Rr=0.05; rr=0.02; F=0.30
IP=IG+m*Rr**2
for th in [0,75,80]:
    NP=F*(Rr*cos(R(th))-rr); al=NP/IP; a=Rr*al
    # friction: m a = F cos th + f  (f positive = +x)
    f=m*a-F*cos(R(th)); print(th,"IP",IP,"NP",NP,"alpha",al,"a",a,"f",f)
print("thc",D(acos(rr/Rr)))
print("jibun spool R=0.04 r=0.01? ")
m=0.20; IG=1.6e-4; Rr=0.04; rr=0.015; F=0.50
IP=IG+m*Rr**2
for th in [0,30]:
    NP=F*(Rr*cos(R(th))-rr); al=NP/IP; a=Rr*al; f=m*a-F*cos(R(th)); print(th,IP,NP,al,a,f)
print("thc",D(acos(rr/Rr)))
print("== E5 FK")
def fk(L1,L2,t1,t2):
    t1=R(t1);t2=R(t2); return L1*cos(t1)+L2*cos(t1+t2), L1*sin(t1)+L2*sin(t1+t2), (L1*cos(t1),L1*sin(t1))
print(fk(0.30,0.25,30,45)); print("jibun",fk(0.40,0.30,20,50))
print("== E6 IK")
def ik(L1,L2,x,y):
    d2=x*x+y*y; d=sqrt(d2)
    c2=(d2-L1*L1-L2*L2)/(2*L1*L2)
    cOEP=(L1*L1+L2*L2-d2)/(2*L1*L2)
    OEP=D(acos(cOEP)); al=D(atan2(y,x)); cb=(L1*L1+d2-L2*L2)/(2*L1*d); be=D(acos(cb))
    return dict(d=d,c2=c2,cOEP=cOEP,OEP=OEP,th2=180-OEP,alpha=al,cosb=cb,beta=be,sol1=(al-be,180-OEP),sol2=(al+be,-(180-OEP)))
s=ik(0.30,0.25,0.40,0.20); print(s); print(fk(0.3,0.25,*s['sol1'])[:2], fk(0.3,0.25,*s['sol2'])[:2])
s=ik(0.40,0.30,0.50,0.30); print("jibun",s); print(fk(0.4,0.3,*s['sol1'])[:2], fk(0.4,0.3,*s['sol2'])[:2])
print("== E8 jacobian")
def jac(L1,L2,t1,t2,w1,w2):
    t1=R(t1);t2=R(t2)
    J=[[-L1*sin(t1)-L2*sin(t1+t2), -L2*sin(t1+t2)],[L1*cos(t1)+L2*cos(t1+t2), L2*cos(t1+t2)]]
    vx=J[0][0]*w1+J[0][1]*w2; vy=J[1][0]*w1+J[1][1]*w2
    return J,(vx,vy),hypot(vx,vy), L1*L2*sin(t2)
print(jac(0.30,0.25,30,45,0.5,1.0)); print("jibun",jac(0.40,0.30,20,50,0.4,0.5))
print("== E9 piston r=0.04 l=0.14 3000rpm")
def pist(r,l,rpm):
    n=rpm/60; w=2*pi*n
    avg=2*(2*r)*n
    vmax=0; thm=0
    for i in range(36000):
        th=R(i/100)
        # x = r cos + sqrt(l^2 - r^2 sin^2)
        dx=-r*sin(th)-r*r*sin(th)*cos(th)/sqrt(l*l-r*r*sin(th)**2)
        if abs(dx*w)>vmax: vmax=abs(dx*w); thm=i/100
    x90=sqrt(l*l-r*r)
    return avg, vmax, thm, x90, (l+r+l-r)/2
print(pist(0.04,0.14,3000)); print("jibun",pist(0.035,0.12,6000))
for th in range(0,361,30):
    r=0.04;l=0.14; x=r*cos(R(th))+sqrt(l*l-r*r*sin(R(th))**2); print(th, round(x*1000,1), round((x-l)*1000,1), round(r*cos(R(th))*1000,1))
