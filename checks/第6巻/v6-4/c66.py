import math
m,k=0.5,8
w=math.sqrt(k/m); T=2*math.pi/w
print("omega",w,"T",T,"f",1/T)
# symplectic euler table
def sim(x,v,dt,n,c=0.0,m=0.5,k=8,normal=False):
    rows=[(0,x,v,(-k*x-c*v)/m)]
    t=0
    for i in range(n):
        a=(-k*x-c*v)/m
        if normal:
            x2=x+v*dt; v=v+a*dt; x=x2
        else:
            v=v+a*dt; x=x+v*dt
        t+=dt
        rows.append((round(t,4),x,v,(-k*x-c*v)/m))
    return rows
r=sim(0.1,0,0.05,40)
for row in r[:8]: print(["%.4f"%z for z in row])
for row in r: 
    pass
print("exact cos at 0.05..0.35", [round(0.1*math.cos(4*t),4) for t in [0.05,0.1,0.15,0.2,0.25,0.3,0.35]])
# zero crossing / period with symplectic
r=sim(0.1,0,0.001,4000)
prev=None
cr=[]
for (t,x,v,a) in r:
    if prev and prev[1]>0 and x<=0: cr.append(t)
    prev=(t,x,v,a)
print("down-crossings",cr[:3])
r3=sim(0.3,0,0.001,4000)
print("x0=0.3 ratio at some pts",[r3[i][1]/r[i][1] for i in [100,500,1000]])
# normal euler energy growth one period dt=0.05
rn=sim(0.1,0,0.05,int(round(T/0.05)),normal=True)
print("normal euler after",len(rn)-1,"steps x",rn[-1][1], "amp", math.hypot(rn[-1][1],rn[-1][2]/w))
rs=sim(0.1,0,0.05,int(round(T/0.05)))
print("sympl after", rs[-1][1], math.hypot(rs[-1][1],rs[-1][2]/w))
# energies
for name,rr in [("normal",rn),("sympl",rs)]:
    E=[0.5*m*v*v+0.5*k*x*x for (t,x,v,a) in rr]
    print(name,"E0",E[0],"Eend",E[-1])
# initial phase example
x0,v0=0.1,0.4
X=math.hypot(x0,v0/w); phi=math.atan2(-v0/w,x0)
print("X",X,"phi",phi,math.degrees(phi), "peak time", -phi/w)
x0,v0,w2=0.3,-0.6,2
print("jibun X",math.hypot(x0,v0/w2), math.degrees(math.atan2(-v0/w2,x0)))
# hanging spring
for (mm,kk) in [(0.2,20),(0.1,40)]:
    print("hang",mm,kk, mm*9.8/kk, 2*math.pi*math.sqrt(mm/kk), math.sqrt(kk/mm))
# experiment spring k=10
for mm in [0.05,0.1,0.2]:
    print("exp",mm, 2*math.pi*math.sqrt(mm/10), 10*2*math.pi*math.sqrt(mm/10), mm*9.8/10)
# example 1 jibun
print("ex1 j", math.sqrt(50/2), 2*math.pi/5, 2*math.pi/math.sqrt(8/2))
# skylab
k2=3000
for M in [10,70]: print("skylab",M,2*math.pi*math.sqrt(M/k2))
T1=0.96; print("mass from T", k2*T1**2/(4*math.pi**2))
# energy example
print("E",0.5*8*0.01, math.sqrt(2*(0.04-0.5*8*0.06**2)/0.5))
print("E j",0.5*50*0.04, math.sqrt(2*(1-0.5*50*0.12**2)/2))
# pendulum
g=9.8
print("2pi/sqrt g",2*math.pi/math.sqrt(g))
print("sec pendulum L", g*4/(4*math.pi**2), "moon T", 2*math.pi*math.sqrt(g/(math.pi**2)/1.62))
L=0.5; print("L0.5", 2*math.pi*math.sqrt(L/9.8), 2*math.pi*math.sqrt(L/1.62))
# LC
L,C=10e-3,1e-6
wn=1/math.sqrt(L*C); print("LC",wn,wn/2/math.pi,2*math.pi/wn)
L,C=1e-3,0.1e-6
wn=1/math.sqrt(L*C); print("LC j",wn,wn/2/math.pi,2*math.pi/wn)
L,C=10e-3,4e-6
wn=1/math.sqrt(L*C); print("LC 4C",wn,wn/2/math.pi,2*math.pi/wn)
