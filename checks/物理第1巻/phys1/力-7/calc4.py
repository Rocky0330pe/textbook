from math import *
g=9.8; D=degrees; R=radians
print("P1", 14/0.35, 28)
a=g*sin(R(15))/1.4; t=sqrt(2*4/a); h=4*sin(R(15)); v=sqrt(2*g*h/1.4); print("P2 ball 15deg 4m a",a,"t",t,"v",v, "h",h, "check v=at",a*t)
print("P3", 0.2*cos(R(60))+0.15*cos(R(90)), 0.2*sin(R(60))+0.15*sin(R(90)))
print("P4", 1200*15/45, 0.8*45/15)
w=2*pi*1*40/20; print("P5", w, 0.33*w, 0.33*w*3.6, "wheel rpm", 60*2)
w=sqrt(0.3*g/0.15); print("P6", w, w*60/2/pi)
print("P7", 2*0.09*2000/60)
L1,L2=0.30,0.25; x,y=0.30,0.30
d=sqrt(x*x+y*y); c=(L1*L1+L2*L2-d*d)/(2*L1*L2); OEP=D(acos(c)); al=D(atan2(y,x)); cb=(L1*L1+d*d-L2*L2)/(2*L1*d); be=D(acos(cb))
print("P8 d",d,"cosOEP",c,"OEP",OEP,"th2",180-OEP,"alpha",al,"cosb",cb,"beta",be,"sol",al-be,180-OEP,al+be,-(180-OEP))
for t1,t2 in [(al-be,180-OEP),(al+be,-(180-OEP))]:
    print(L1*cos(R(t1))+L2*cos(R(t1+t2)), L1*sin(R(t1))+L2*sin(R(t1+t2)))
Om=2*pi/86164; a=2*Om*20*sin(R(35)); print("P9", a, a/g)
print("P10", 1.0*g*0.10/(0.02*50))
vt=sqrt(g*1.0*40/1.2); vs=sqrt(0.6*g*40); print("P11 tip",vt,vt*3.6,"slide",vs,vs*3.6)
print("P12 v",(-0.25,0.30), hypot(0.25,0.30))
cg=(16+16-25)/(2*4*4); print("P13", cg, D(acos(cg)), 180-D(acos(cg)))
print("P15 R=2r", D(acos(0.5)), "R=3r", D(acos(1/3)))
# P16 box w=0.10 H=0.30 mu=0.5 r=0.40
w_,H,mu,r=0.10,0.30,0.5,0.40
ws=sqrt(mu*g/r); wt=sqrt(g*w_/(H*r)); print("P16 slide",ws,ws*60/2/pi,"tip",wt,wt*60/2/pi, "w/H",w_/H)
