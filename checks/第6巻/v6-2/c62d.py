import math
f=lambda T:-0.05*(T-20)
T=80;rows=[]
for i in range(21):
    rows.append((i*0.5,T,f(T))); T=T+f(T)*0.5
for r in rows[:5]+rows[-1:]: print([round(x,4) for x in r])
# spring arrays
m=0.5;k=8;w=4
def spring(dt,tend,mode,x0=0.1,v0=0):
    x=x0;v=v0;out=[(0,x,v)]
    for i in range(round(tend/dt)):
        a=-16*x
        if mode=='ord': x,v=x+v*dt,v+a*dt
        else: v=v+a*dt; x=x+v*dt
        out.append(((i+1)*dt,x,v))
    return out
o=spring(0.02,5,'ord'); print("ord", " ".join("(%.2f,%.4f)"%(t,x) for t,x,v in o[::4]))
s=spring(0.02,5,'semi'); print("semi", " ".join("(%.2f,%.4f)"%(t,x) for t,x,v in s[::4]))
for dt in [0.05,0.02]:
    s=spring(dt,20,'semi'); rr=[math.hypot(x,v/4) for t,x,v in s]; print(dt,"semi r range",min(rr),max(rr))
# sheet rows ordinary dt=0.02
for t,x,v in spring(0.02,0.1,'ord'): print("o",round(t,2),round(x,5),round(v,4),round(-16*x,4))
for t,x,v in spring(0.02,0.1,'semi'): print("s",round(t,2),round(x,5),round(v,4),round(-16*x,4))
# ord at t=1.57, 3.14, 4.71 peaks
o=spring(0.02,5,'ord'); print("ord max", max(abs(x) for t,x,v in o))
print("ord radius per step", math.sqrt(1+0.08**2), (math.sqrt(1+0.08**2))**(2*math.pi/0.08))
print("w1 dt.1", math.sqrt(1.01), math.sqrt(1.01)**(2*math.pi/0.1))
# python R7
T=50.0;dt=0.5
for i in range(2): T=T+(-0.2*(T-30))*dt
print(T)
V=0.0;dt=0.5
for i in range(3): V=V+(10-V)/2*dt
print(V)
# problems
T=70
for i in range(3): T=T+(-0.04*(T-20)); print("p1",T)
for dt in [2,1]:
    T=50
    for i in range(round(2/dt)): T=T+(-0.2*(T-10))*dt
    print("p2",dt,T)
print("p2 exact",10+40*math.exp(-0.4), 10+40*0.670)
V=0
for i in range(2): V=V+(5-V)/2*0.5; print("p4",V)
print("p4 exact", 5*(1-math.exp(-0.5)))
x=0.05;v=0
for i in range(2):
    a=-16*x; v=v+a*0.1; x=x+v*0.1; print("p5",a,v,x)
T=80
for i in range(2): T=T+(-0.05*(T-20))*60; print("p7",T)
print("p8", math.sqrt(1+(5*0.04)**2), math.sqrt(1+(5*0.04)**2)**(2*math.pi/0.2))
print("R2 exact", 20+60*math.exp(-0.2), 20+60*0.8187, "j2",20+40*math.exp(-0.2))
print("R4 exact", 10*(1-math.exp(-0.5)), 10*(1-0.607))
