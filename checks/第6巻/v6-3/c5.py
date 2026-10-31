from math import *
g=9.8
print("free fall 1000m", sqrt(2*g*1000), sqrt(2*g*1000)*3.6)
# raindrop 2mm
r=0.001; m=1000*4/3*pi*r**3; print("drop m",m, m*g, "c", m*g/6.5**2, "CD", m*g/6.5**2/(0.5*1.2*pi*r*r))
# fog r=10um
r=1e-5; m=1000*4/3*pi*r**3; b=6*pi*1.8e-5*r; print("fog m",m,"b",b,"b/m",b/m,"vf",m*g/b,"tau",m/b)
r=5e-6; m=1000*4/3*pi*r**3; b=6*pi*1.8e-5*r; print("fog5 b/m",b/m,"vf",m*g/b,"tau",m/b)
print("fog810 vf", g/810, 1/810, 3/810)
print("fog3240", g/3240, 1/3240, 3/3240)
# skydiver
m=80;c=0.26; vt=sqrt(m*g/c); print("vt",vt, vt*3.6)
for t in (1,2,3,5,10): print(t, round(vt*tanh(g*t/vt),2))
print("95% time", atanh(0.95)*vt/g)
# parachute
print("chute", sqrt(784/30))
# euler skydiver dt=1 and 0.5
for dt in (1,0.5,0.1):
    v=0;t=0;rows=[]
    while t<10.0001:
        rows.append((round(t,2),round(v,2)))
        a=g-c/m*v*v; v=v+a*dt; t+=dt
    print(dt,[r for r in rows if abs(r[0]-round(r[0]))<1e-9])
# euler first steps dt=1
v=0; a=g-c/m*v*v; v1=v+a; a1=g-c/m*v1*v1; v2=v1+a1; print("steps",v1,a1,v2, c/m, c/m*v1*v1)
# shuttle: dv/dt = 9.8-0.2v^2, vt=7; euler dt=0.2
v=0
for k in range(3):
    a=9.8-0.2*v*v; print("shut", k, round(v,4), round(a,4)); v=v+a*0.2
print("shut exact", 7*tanh(9.8*0.4/7))
# coffee filters: quadratic, vt1, time to fall 2.0 m
def tfall(vt,h=2.0):
    # x = vt^2/g ln cosh(g t/vt)
    lo,hi=0,10
    for _ in range(100):
        mid=(lo+hi)/2
        x=vt**2/g*log(cosh(g*mid/vt))
        if x<h: lo=mid
        else: hi=mid
    return lo
for n in (1,2,4):
    vt=1.0*sqrt(n); T=tfall(vt); print("filter",n,vt,round(T,3), round(2.0/T,3))
# elevator
for mm,a in ((60,1),(60,-1),(50,1.5),(50,-1.5)): print("elev",mm,a, mm*(g+a), mm*(g+a)/g)
# RL relay analog
print("RL",12/400, 0.2/400, 30*(1-exp(-3)))
print("RLj",24/60,0.3/60,0.4*(1-exp(-3)))
# car
print("car", sqrt(1000/0.4), sqrt(1000/0.4)*3.6, "bike", sqrt(20/0.25), sqrt(20/0.25)*3.6)
print("car c", 0.5*1.2*0.3*2.2)
print("sqrt2",sqrt(2), "9 sheets", 3)
