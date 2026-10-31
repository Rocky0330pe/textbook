from math import *
g=9.8; e=0.8; h=1.0; t0=sqrt(2*h/g)
pts=[]
# fall
for i in range(13):
    t=t0*i/12; pts.append((t, h-0.5*g*t*t))
T=t0
for n in range(1,9):
    v=e**n*sqrt(2*g*h); fl=2*v/g; k=max(6,int(24*e**n))
    for i in range(1,k+1):
        t=fl*i/k; pts.append((T+t, v*t-0.5*g*t*t))
    T+=fl
print(" ".join("(%.3f,%.3f)"%(a,max(b,0)) for a,b in pts))
