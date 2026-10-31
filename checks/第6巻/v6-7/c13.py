import math, cmath
import numpy as np
m,k,c,F0=0.5,8,0.4,0.8
def amp(w,m=m,k=k,c=c,F0=F0): return F0/math.hypot(k-m*w*w,c*w)
def ph(w,m=m,k=k,c=c): return math.degrees(math.atan2(c*w,k-m*w*w))
for w in [0,1,2,3,3.5,3.8,3.96,4,4.2,4.5,5,6,8,10]:
    print(w, round(amp(w),4), round(ph(w),1))
# semi-implicit euler sim to steady state
def sim(w,T=40,dt=0.001,c=c):
    x=v=0;xs=[];ts=[]
    n=int(T/dt)
    for i in range(n):
        t=i*dt
        a=(F0*math.cos(w*t)-c*v-k*x)/m
        v+=a*dt;x+=v*dt
        xs.append(x);ts.append((i+1)*dt)
    return np.array(ts),np.array(xs)
for w in [2,4,8]:
    ts,xs=sim(w)
    print('sim',w,'steady amp',round(np.abs(xs[ts>30]).max(),4),'max overall',round(np.abs(xs).max(),4))
# dt=0.01
for w in [2,4,8]:
    ts,xs=sim(w,dt=0.01)
    print('sim dt.01',w,round(np.abs(xs[ts>30]).max(),4))
# peaks
for z in [0.05,0.1,0.2,0.5]:
    r=math.sqrt(1-2*z*z); M=1/(2*z*math.sqrt(1-z*z)); print('zeta',z,round(r,4),round(M,3), 'Q',1/(2*z))
# examples
print(cmath.polar(10/(4+2j)), math.degrees(math.atan(0.5)))
print('ex3',20/(4+4j), 25/(3+4j), 20/(6+8j))
# reidai4
w=math.sqrt(92); print('r4',w, 10/math.sqrt((100-92)**2+16*92))
w=math.sqrt(56); print('j4',w, 8/math.sqrt((64-56)**2+16*56))
w=math.sqrt(23); print('p4',w, 5/math.sqrt((25-23)**2+4*23))
# m=0.5 k=8 c=0.8 F0=0.8
z=0.8/(2*2); print('ch7 z',z, 4*math.sqrt(1-2*z*z), 0.1/(2*z*math.sqrt(1-z*z)))
# RLC
L,C,R=0.01,1e-6,20
f0=1/(2*math.pi*math.sqrt(L*C)); print('f0',f0)
for f in [1000,1592,2000,1500,1700]:
    w=2*math.pi*f; Z=complex(R,w*L-1/(w*C)); print(f, abs(Z), 1/abs(Z)*1000,'mA')
print('C AM',1/((2*math.pi*1e6)**2*200e-6), 1/((2*math.pi*531e3)**2*200e-6),1/((2*math.pi*1602e3)**2*200e-6))
print('C 800k L250u',1/((2*math.pi*8e5)**2*250e-6))
print('C 600k L200u',1/((2*math.pi*6e5)**2*200e-6))
print('jibun LC',1/(2*math.pi*math.sqrt(0.05*0.2e-6)))
print('p5', 1/(2*math.pi*math.sqrt(0.02*0.5e-6)))
# half power bandwidth for zeta=0.1 m=0.5 k=8
ws=np.linspace(0.1,8,200000); A=np.array([amp(w) for w in ws]); Am=A.max()
idx=np.where(A>=Am/math.sqrt(2))[0]; print('bw',ws[idx[0]],ws[idx[-1]],ws[idx[-1]]-ws[idx[0]], 'Q=wn/bw',4/(ws[idx[-1]]-ws[idx[0]]))
# transmissibility
for r,z in [(2,0.1),(math.sqrt(2),0.1),(3,0.1),(1,0.1),(2,0.05)]:
    TR=math.sqrt(1+(2*z*r)**2)/math.sqrt((1-r*r)**2+(2*z*r)**2); print('TR',r,z,round(TR,3))
