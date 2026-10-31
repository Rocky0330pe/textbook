import math as M
# 1 cooling
f=lambda T:-0.05*(T-20)
print("exact10",20+60*M.exp(-0.5))
for dt in [2,1,0.5,0.1,0.01]:
    T=80.0;n=round(10/dt)
    for i in range(n): T+=f(T)*dt
    print("euler dt",dt,round(T,3),"err",round(20+60*M.exp(-0.5)-T,3))
# RK4 dt=1
T=80.0
for i in range(10):
    k1=f(T);k2=f(T+k1/2);k3=f(T+k2/2);k4=f(T+k3);T+=(k1+2*k2+2*k3+k4)/6
print("rk4 dt1",T)
# 2 skydiver
m,c,g=80,0.26,9.8; vt=M.sqrt(m*g/c); print("vt",vt)
print([round(vt*M.tanh(g*t/vt),2) for t in [1,2,3,5,10]])
# 3 3-10 examples
for t in [0,0.5,1,2,3]:
    print(t, round(2*M.exp(-t)-M.exp(-2*t),4), round(M.exp(-t)*(M.cos(2*t)+0.5*M.sin(2*t)),4), round((1+t)*M.exp(-M.sqrt(2)*t)*1,4))
print("zeta1",3/(2*M.sqrt(2)),"zeta2",2/(2*M.sqrt(5)),"cc for k=2",2*M.sqrt(2))
# critical with k=2,m=1: s=-sqrt2 double; x=(1+sqrt2 t)e^{-sqrt2 t}
# 4 raindrop
print("free fall 1000m",M.sqrt(2*9.8*1000), "2000m",M.sqrt(2*9.8*2000))
# 5 stokes fog
r=1e-5;mu=1.81e-5;print("stokes v",2*r*r*1000*9.8/(9*mu))
# RC
print("RC",10e3*100e-6,"RL",0.1/10)
print("LC AM C pF",1/(4*M.pi**2*1e6**2*200e-6)*1e12)
print("pendulum 1m",2*M.pi*M.sqrt(1/9.8))
print("elev",60*(9.8+1),60*(9.8+1)/9.8)
# explicit euler oscillator growth
for dt in [0.1,0.01]:
    x,v=1.0,0.0
    for i in range(round(2*M.pi/dt)):
        x,v=x+v*dt,v-x*dt
    print("explicit euler 1 period dt",dt,"amp",M.hypot(x,v))
    x,v=1.0,0.0
    for i in range(round(2*M.pi/dt)):
        v=v-x*dt; x=x+v*dt
    print("semi-implicit amp",M.hypot(x,v), x,v)
# resonance
for z in [0.05,0.1,0.2,0.5]:
    print("zeta",z,"peak w/wn",M.sqrt(1-2*z*z),"amp ratio",1/(2*z*M.sqrt(1-z*z)),"Q~",1/(2*z))
