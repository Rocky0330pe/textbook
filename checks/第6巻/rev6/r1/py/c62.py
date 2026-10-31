import math
e=math.exp
def euler(T0,k,Ta,dt,tend):
    T=T0; n=round(tend/dt); out=[T]
    for i in range(n):
        T=T+(-k*(T-Ta))*dt; out.append(T)
    return out
print("6-0 table", [round(x,4) for x in euler(80,0.05,20,1,10)])
print("drops", [round(0.05*(x-20),4) for x in euler(80,0.05,20,1,5)])
print("true10", 20+60*e(-0.5))
for dt in [5,2,1,0.5,0.1,0.01]:
    v=euler(80,0.05,20,dt,10)[-1]; print("dt",dt,round(v,4),"err",round(20+60*e(-0.5)-v,4))
print("dt0.5 rows", [round(x,4) for x in euler(80,0.05,20,0.5,1.5)], euler(80,0.05,20,0.5,10)[-1], -0.05*(euler(80,0.05,20,0.5,10)[-1]-20))
print("true t", [round(20+60*e(-0.05*t),2) for t in range(11)])
print("0.95^10",0.95**10, 60*0.95**10)
# python outputs
T=80.0;t=0.0;dt=0.1
for i in range(100):
    T=T+(-0.05*(T-20))*dt; t=t+dt
print(t,T)
T=80.0;t=0.0;dt=0.001
for i in range(10000):
    T=T+(-0.05*(T-20))*dt; t=t+dt
print(t,T)
# RC
def rc(dt,tend,E=10,RC=2):
    V=0; out=[V]
    for i in range(round(tend/dt)):
        V=V+(E-V)/RC*dt; out.append(V)
    return out
print("RC 0.5", [round(x,4) for x in rc(0.5,6)])
print("RC0.1 2s", rc(0.1,2)[-1], "true", 10*(1-e(-1)))
# spring ordinary euler peaks
def spring(dt,tend,semi):
    x=0.1;v=0.0;xs=[x];ts=[0]
    for i in range(round(tend/dt)):
        a=-16*x
        if semi:
            v=v+a*dt; x=x+v*dt
        else:
            x,v=x+v*dt, v+a*dt
        xs.append(x); ts.append((i+1)*dt)
    return ts,xs
ts,xs=spring(0.02,5,False)
pk=[(round(ts[i],2),round(xs[i],4)) for i in range(1,len(xs)-1) if xs[i]>xs[i-1] and xs[i]>=xs[i+1]]
print("ord peaks",pk)
print("ord rows", [round(x,5) for x in xs[:4]])
# check figure data
fig={0.08:0.0962,0.8:-0.1135,1.6:0.1284,3.2:0.1631,4.72:0.2123}
for tt,val in fig.items(): print(tt, val, round(xs[round(tt/0.02)],4))
ts,xs=spring(0.02,5,True)
print("semi rows",[round(x,5) for x in xs[:4]])
for k in [50,100,150,200,250]: print(k*0.02, round(xs[k],4), round(0.1*math.cos(4*k*0.02),4))
# radius range semi-implicit
x=0.1;v=0;rs=[]
for i in range(2000):
    a=-16*x; v=v+a*0.02; x=x+v*0.02; rs.append(math.hypot(x,v/4))
print("semi radius range",min(rs),max(rs))
print("1.0032^79",1.0032**79, math.sqrt(1.0064)**79, math.sqrt(1.0064)**(math.pi/2/0.02))
print("1.005^63",1.005**63, math.sqrt(1.01)**(2*math.pi/0.1))
print("1.0198^31",1.0198**31, math.sqrt(1.04)**(2*math.pi/0.2))
# RK4
f=lambda T:-0.05*(T-20)
T=80
for i in range(10):
    k1=f(T);k2=f(T+k1/2);k3=f(T+k2/2);k4=f(T+k3); T=T+(k1+2*k2+2*k3+k4)/6
    if i==0: print("RK4 1",T, 20+60*e(-0.05))
print("RK4 10",T, T-(20+60*e(-0.5)))
# exercises
print(euler(70,0.04,20,1,3))
print(euler(90,0.1,25,0.5,1))
print(euler(60,0.1,20,1,2), 20+40*0.8187)
print(euler(75,0.1,15,1,2), 15+60*0.8187)
