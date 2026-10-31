import math
m,k=0.5,8
def sim(c,dt=0.01,T=7,semi=True,x0=0.1):
    x=x0;v=0;out=[(0,x,v,(-k*x-c*v)/m)]
    for i in range(round(T/dt)):
        a=(-k*x-c*v)/m
        if semi: v=v+a*dt; x=x+v*dt
        else: x,v=x+v*dt, v+a*dt
        out.append(((i+1)*dt,x,v,(-k*x-c*v)/m))
    return out
o=sim(0.4)
for r in [0,1,2,3,78,79,157]: print(r+2,[round(z,5) for z in o[r]])
# exact solution helpers
def exact(c,t):
    wn=4; z=c/(2*math.sqrt(m*k)); a=c/(2*m)
    if z<1:
        wd=wn*math.sqrt(1-z*z); return 0.1*math.exp(-a*t)*(math.cos(wd*t)+a/wd*math.sin(wd*t))
    if abs(z-1)<1e-12: return 0.1*(1+a*t)*math.exp(-a*t)
    r=math.sqrt(a*a-wn*wn); s1=-a+r; s2=-a-r
    A=0.1*s2/(s2-s1); B=0.1-A
    return A*math.exp(s1*t)+B*math.exp(s2*t)
for c in [0.4,1,2,3,3.5,4,5,10]:
    ts=[i*0.0005 for i in range(int(30/0.0005))]
    xs=[exact(c,t) for t in ts]
    ov=-min(xs)/0.1
    last=max([t for t,x in zip(ts,xs) if abs(x)>=0.002])
    print("c",c,"overshoot %.4f"%ov,"settle",round(last,3))
print("c=10 at 6s",exact(10,6),"at2",exact(10,2))
# peaks of c=0.4
wd=4*math.sqrt(1-0.01); Td=2*math.pi/wd; print("Td",Td,[round(0.1*math.exp(-0.4*n*Td),4) for n in range(5)], math.log(1/math.exp(-0.4*Td)))
print("c=2 Td",2*math.pi/(4*math.sqrt(1-0.25)))
for z in [0.05,0.1,0.25,0.5]: print(z,2*math.pi*z/math.sqrt(1-z*z))
# energy samples semi-implicit c=0.4 every 0.25
o=sim(0.4,0.01,6)
print([ (round(t,2),round(0.25*v*v+4*x*x,5)) for (t,x,v,a) in o if abs(t/0.25-round(t/0.25))<1e-6])
# ordinary euler c=0.4 dt=0.1 peaks
o=sim(0.4,0.1,8,semi=False)
xs=[r[1] for r in o]
print("ord peaks",[round(xs[i],3) for i in range(1,len(xs)-1) if xs[i]>=xs[i-1] and xs[i]>=xs[i+1]])
# alpha table from envelope with c values
for c in [0.2,1,2]: print(c, c/(2*m))
