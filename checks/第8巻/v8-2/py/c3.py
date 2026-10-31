import numpy as np, math
h=lambda x,y:100-0.01*x*x-0.02*y*y
print("== mountain")
for d in [1,0.1,0.01,0.001]:
    a=-0.6*d-0.8*d; t=h(30+d,20+d)-83
    print(d,"approx %.6f actual %.6f err %.2e"%(a,t,t-a))
for dx,dy in [(1,1),(1,-1),(-1,1),(-1,-1),(0.5,-0.3),(2,1)]:
    print((dx,dy),"approx",-0.6*dx-0.8*dy,"actual %.4f"%(h(30+dx,20+dy)-83))
print("stairs", h(31,20)-83, h(31,21)-h(31,20), h(31,21)-83)
print("jibun1", -0.2*1-1.2*0.5, h(11,30.5)-h(10,30))
print("prob1 (20,-10) dx=-0.5 dy=1:", -0.4*-0.5+0.4*1, h(19.5,-9)-h(20,-10))
print("== x2y"); f=lambda x,y:x*x*y
print(12*0.01+4*(-0.02), f(2.01,2.98)-f(2,3))
g=lambda x,y:x*y**3; print("xy3", 8*0.02+12*0.01, g(1.02,2.01)-g(1,2))
g=lambda x,y:x**3*y; print("x3y at (1,2) dx=0.01 dy=0.03:", 3*1*2*0.01+1*0.03, g(1.01,2.03)-g(1,2))
print("== cylinder cm")
r,H=5.0,20.0; V=math.pi*r*r*H; dV=2*math.pi*r*H*0.05+math.pi*r*r*0.2
print(V,2*math.pi*r*H,math.pi*r*r,dV,dV/V, math.pi*5.05**2*20.2-V,(math.pi*5.05**2*20.2-V)/V, math.pi*4.95**2*19.8-V)
print("cone V=1/3 pi r^2 h: rel 2*2+1=5%;", (1.02**2*1.01-1)*100)
print("power", (12.12**2/5.88-24)/24*100, (11.88**2/6.12-24)/24*100)
print("rho m/V +0.5 -1:", (1.005/0.99-1)*100)
print("I=V/R 1%,1%:", (1.01/0.99-1)*100)
print("cyl r0.5% h2%:", (1.005**2*1.02-1)*100)
print("sqrt5",math.sqrt(5))
print("== chain")
H=lambda t:h(30-3*t,20-2*t)
for t in [0,5]: print(t,(H(t+1e-6)-H(t-1e-6))/2e-6)
H2=lambda t:h(10+2*t,30-3*t); print("jib",(H2(1e-6)-H2(-1e-6))/2e-6)
H3=lambda t:h(-20+4*t,10+t); print("prob x=-20+4t,y=10+t:",(H3(1e-6)-H3(-1e-6))/2e-6)
print("== robot")
L1,L2=0.30,0.25
def pos(t1,t2): return np.array([L1*math.cos(t1)+L2*math.cos(t1+t2), L1*math.sin(t1)+L2*math.sin(t1+t2)])
def J(t1,t2):
    s1,c1,s12,c12=math.sin(t1),math.cos(t1),math.sin(t1+t2),math.cos(t1+t2)
    return np.array([[-L1*s1-L2*s12,-L2*s12],[L1*c1+L2*c12,L2*c12]])
d=math.radians
for a,b in [(30,45),(0,90),(90,90),(60,30),(45,90),(30,10)]:
    Jm=J(d(a),d(b)); print((a,b),np.round(Jm,4),"det %.4f"%np.linalg.det(Jm), "L1L2sin %.4f"%(L1*L2*math.sin(d(b))), "pos",np.round(pos(d(a),d(b)),4))
p0=pos(d(30),d(45))
for dth in [(0.01,0.01),(0.02,-0.01),(0.1,0.1),(0.001,0.001)]:
    pred=J(d(30),d(45))@np.array(dth); act=pos(d(30)+dth[0],d(45)+dth[1])-p0
    print(dth,"pred",np.round(pred,5),"act",np.round(act,5))
# area check
e=0.01; t1,t2=d(30),d(45)
pts=[pos(t1,t2),pos(t1+e,t2),pos(t1+e,t2+e),pos(t1,t2+e)]
A=0.5*abs(sum(pts[i][0]*pts[(i+1)%4][1]-pts[(i+1)%4][0]*pts[i][1] for i in range(4)))
print("area",A, "det*e^2", np.linalg.det(J(t1,t2))*e*e)
# 7-2 check
print("J@(0.5,1.0)",J(d(30),d(45))@np.array([0.5,1.0]))
print("== polar"); print("tile r2 dr.1 dth.05 exact", 0.5*(2.1**2-4)*0.05, "approx",2*0.1*0.05)
print("ellipse tile r1 dr.1 dth.1: approx", 6*1*0.1*0.1, "exact", 6*0.5*(1.1**2-1)*0.1)
print("== gas")
n,Rg,Vv,T=1,8.31,0.0224,273
p=n*Rg*T/Vv; print("p",p,"dp/dT",n*Rg/Vv,"dp/dV",-n*Rg*T/Vv**2, "per L", -n*Rg*T/Vv**2*0.001)
print("full: dT=1,dV=0.0001:", n*Rg/Vv*1 - n*Rg*T/Vv**2*0.0001, "actual", n*Rg*274/(Vv+0.0001)-p)
print("dV/dT at p=101300:", n*Rg/101300, "m3/K ->", n*Rg/101300*1e3,"L/K")
print("== taylor", -1.4+0.5*(-0.02-0.04))
