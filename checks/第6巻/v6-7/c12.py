import numpy as np, math
e=math.exp
f1=lambda t:2*e(-t)-e(-2*t)
f2=lambda t:e(-t)*(math.cos(2*t)+0.5*math.sin(2*t))
for t in [0,0.5,1,1.5,2,3,4]:
    print(t, round(f1(t),4), round(f2(t),4), round(2*e(-t),4), round(-e(-2*t),4))
# spreadsheet semi-implicit Euler dt=0.01
def sim(m,c,k,x0,v0,dt,T,F=lambda t:0):
    x,v=x0,v0; out={0:(x,v)}; n=int(round(T/dt))
    for i in range(n):
        t=i*dt
        a=(F(t)-c*v-k*x)/m
        v=v+a*dt; x=x+v*dt
        out[round((i+1)*dt,6)]=(x,v)
    return out
for (c,k) in [(3,2),(2,5)]:
    o=sim(1,c,k,1,0,0.01,4)
    print('sim',c,k,[round(o[t][0],3) for t in [0.5,1,2,3]])
    o=sim(1,c,k,1,0,0.1,4)
    print('sim dt.1',c,k,[round(o[round(t,6)][0],3) for t in [0.5,1,2,3]])
# first-step plug e^-t at t=0.5
t=0.5;print('plug',e(-t),-3*e(-t),2*e(-t))
# double root
for eps in [0.5,0.1,0.01]:
    print(eps,(e((-2+eps)*1)-e((-2-eps)*1))/(2*eps))
print('te-2t at1',1*e(-2))
# (1+2t)e^-2t
for t in [0,0.5,1,2,3]: print(t,round((1+2*t)*e(-2*t),4))
# m=0.5 k=8
for c in [0.4,4,10]:
    m,k=0.5,8
    D=c*c-4*m*k
    print('c',c,'D',D,'zeta',c/(2*math.sqrt(m*k)))
r=np.roots([1,20,16]);print(r)
# c=0.4: x=e^{-0.4t}(0.1cos wd t + B sin)
wd=math.sqrt(16-0.16);print('wd',wd,'B',0.04/wd,'Td',2*math.pi/wd,'logdec',0.4*2*math.pi/wd,e(-0.4*2*math.pi/wd))
s1,s2=-10+math.sqrt(84),-10-math.sqrt(84)
A=0.1*(-s2)/(s1-s2);B=0.1-A
print('c10',s1,s2,A,B, A*s1+B*s2)
