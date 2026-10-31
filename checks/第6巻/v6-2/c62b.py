import math
# RC charge E=10, RC=2
def rc(E,tau,dt,tend):
    V=0; out=[(0,V,(E-V)/tau)]
    for i in range(round(tend/dt)):
        V=V+(E-V)/tau*dt; out.append(((i+1)*dt,V,(E-V)/tau))
    return out
for t,V,s in rc(10,2,0.5,6): print(t, round(V,4), round(s,4), round(10*(1-math.exp(-t/2)),4))
print([ (t,round(V,3)) for t,V,s in rc(10,2,0.1,10)][::10])
# jibun: E=6, R=10k, C=100u -> tau=1, dt=0.25
for t,V,s in rc(6,1,0.25,1): print("j",t, round(V,5), round(s,5), round(6*(1-math.exp(-t)),4))
# spring
m=0.5;k=8;w=math.sqrt(k/m)
def spring(dt,tend,mode,x0=0.1,v0=0):
    x=x0;v=v0;out=[(0,x,v)]
    for i in range(round(tend/dt)):
        a=-k/m*x
        if mode=='ord':
            x,v = x+v*dt, v+a*dt
        else:
            v=v+a*dt; x=x+v*dt
        out.append(((i+1)*dt,x,v))
    return out
for dt in [0.05,0.02,0.01]:
    for mode in ['ord','semi']:
        o=spring(dt,5,mode)
        # amplitude after 1 period: radius sqrt(x^2+(v/w)^2)
        n=round(2*math.pi/w/dt)
        r=lambda p: math.hypot(p[1],p[2]/w)
        print(dt,mode,"steps/period",n, "r after ~1 period",round(r(o[n]),5),"r end",round(r(o[-1]),4), "maxx", round(max(abs(p[1]) for p in o),4))
print("growth per period exact formula dt=.02", (1+(w*0.02)**2)**(math.pi/(w*0.02)))
print("growth per period dt=.05", (1+(w*0.05)**2)**(math.pi/(w*0.05)))
# table dt=0.05 first rows both methods
for mode in ['ord','semi']:
    o=spring(0.05,0.3,mode)
    for t,x,v in o: print(mode, round(t,2), round(x,5), round(v,5), round(-16*x,5), round(0.1*math.cos(4*t),5))
# energy
o=spring(0.02,5,'ord'); E=lambda p:0.5*m*p[2]**2+0.5*k*p[1]**2
print("E0",E(o[0]),"E end",E(o[-1]))
o=spring(0.02,5,'semi'); print("semi E end",E(o[-1]), min(E(p) for p in o), max(E(p) for p in o))
# jibun spring m=2,k=50, x0=0.2, dt=0.1 semi
x=0.2;v=0
for i in range(2):
    a=-25*x; v=v+a*0.1; x=x+v*0.1; print("js",i+1,a,v,x)
x=0.1;v=0
for i in range(2):
    a=-16*x; v=v+a*0.05; x=x+v*0.05; print("rs",i+1,a,v,x)
x=0.1;v=0
for i in range(2):
    a=-16*x; x,v=x+v*0.05, v+a*0.05; print("ro",i+1,a,v,x, x*x+(v/4)**2)
