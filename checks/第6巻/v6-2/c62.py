import math
f=lambda T:-0.05*(T-20)
ex=lambda t:20+60*math.exp(-0.05*t)
def euler(dt,tend,T0=80):
    T=T0; n=round(tend/dt); out=[(0,T)]
    for i in range(n):
        T=T+f(T)*dt; out.append(((i+1)*dt,T))
    return out
print("dt=1 table")
for t,T in euler(1,10): print(t, round(T,4), round(f(T),4), round(ex(t),4))
for dt in [5,2,1,0.5,0.1,0.01,0.001]:
    T=euler(dt,10)[-1][1]; print(dt, round(T,4), round(ex(10)-T,4))
print("exact10",ex(10))
print("dt5 to 30", [(t,round(T,3)) for t,T in euler(5,30)])
print("dt2 to 20", [(t,round(T,3)) for t,T in euler(2,20)])
print("exact", [(t,round(ex(t),3)) for t in range(0,31,5)])
print("dt30", [(t,round(T,3)) for t,T in euler(30,180)])
print("dt50", [(t,round(T,3)) for t,T in euler(50,250)])
print("dt10", [(t,round(T,3)) for t,T in euler(10,60)])
print("dt0.5 2steps", euler(0.5,1))
# RK4
def rk4(dt,tend,T0=80):
    T=T0
    for i in range(round(tend/dt)):
        k1=f(T);k2=f(T+k1*dt/2);k3=f(T+k2*dt/2);k4=f(T+k3*dt)
        if i==0: print("k",k1,k2,k3,k4,(k1+2*k2+2*k3+k4)/6)
        T=T+(k1+2*k2+2*k3+k4)/6*dt
    return T
r=rk4(1,1); print("rk4 1step",r,ex(1))
r=rk4(1,10); print("rk4 10",r,ex(10),ex(10)-r)
r=rk4(2,10); print("rk4 dt2",r,ex(10)-r)
# example jibun cooling dT/dt=-0.1(T-25), T0=85
g=lambda T:-0.1*(T-25)
T=85
for i in range(3):
    print("j1",i,T,g(T)); T=T+g(T)
print("j1 end",T)
# reidai2: dt=2 vs 1 at t=4
print(euler(2,4), euler(1,4), ex(4))
