import numpy as np
from math import *
np.set_printoptions(precision=4, suppress=True)
print("== springs series k1=20 k2=30 m=0.30")
F=0.30*9.8; K=np.array([[50,-30],[-30,30.]]); u=np.linalg.solve(K,[0,F]); print(F,K,u, 20*u[0], 30*(u[1]-u[0]))
print("== stepped bar steel0.6 split 0.3+0.3, alu0.4, d20mm, 20kN")
A=pi*0.01**2; ks=205e9*A/0.3; ka=69e9*A/0.4; print("A",A,"ks",ks,"ka",ka)
K=np.array([[2*ks,-ks,0],[-ks,ks+ka,-ka],[0,-ka,ka]]); u=np.linalg.solve(K,[0,0,20e3]); print(u*1000)
print("steel 0.6 one elem", 20e3*0.6/(205e9*A)*1000, "alu", 20e3*0.4/(69e9*A)*1000)
print("== fixed-fixed bar P=10kN at 0.4 from top, L=1, steel A")
k1=205e9*A/0.4; k2=205e9*A/0.6; u=10e3/(k1+k2); print("u mm",u*1000,"R1",k1*u,"R2",k2*u)
print("== truss stiffness equilateral side2, EA=205e9*1e-3")
EA=205e9*1e-3; r3=sqrt(3)
P={'A':(0,0),'B':(2,0),'C':(1,r3)}; M=[('A','C'),('B','C'),('A','B')]
nd=list(P); Kg=np.zeros((6,6))
for i,k in M:
    d=np.subtract(P[k],P[i]); L=np.hypot(*d); c,s=d/L
    ke=EA/L*np.array([[c*c,c*s,-c*c,-c*s],[c*s,s*s,-c*s,-s*s],[-c*c,-c*s,c*c,c*s],[-c*s,-s*s,c*s,s*s]])
    idx=[2*nd.index(i),2*nd.index(i)+1,2*nd.index(k),2*nd.index(k)+1]
    Kg[np.ix_(idx,idx)]+=ke
free=[2,4,5]  # Bx, Cx, Cy  (A pin, B roller y fixed)
F=np.zeros(6); F[5]=-10e3
uf=np.linalg.solve(Kg[np.ix_(free,free)],F[free]); u=np.zeros(6); u[free]=uf
print("u mm", u*1000)
for i,k in M:
    d=np.subtract(P[k],P[i]); L=np.hypot(*d); e=d/L
    du=u[2*nd.index(k):2*nd.index(k)+2]-u[2*nd.index(i):2*nd.index(i)+2]
    print(i+k, EA/L*np.dot(e,du)/1000)
R=Kg@u; print("reactions kN", R/1000)
print("== tapered bar A(x)=A0(1+x/L): exact ln2")
ex=log(2)
for n in [1,2,4,8,16]:
    h=1/n; val=sum(h/(1+(i+0.5)*h) for i in range(n)); print(n, val, (val-ex)/ex*100)
print("== crash spring model")
m=1000; v0=55/3.6; d=0.6; k=m*v0**2/d**2; w=sqrt(k/m); print("v0",v0,"k",k,"w",w,"T stop",pi/2/w,"amax",k*d/m, k*d/m/9.8, "const", v0**2/(2*d))
def euler(dt,tend=0.08):
    x,v,t=0.0,v0,0.0; xmax=0; amax=0; rows=[]
    while t<tend-1e-12:
        a=-k*x/m
        rows.append((t,x,v,a))
        x,v=x+v*dt, v+a*dt; t+=dt
        if x>xmax: xmax=x
        amax=max(amax,abs(a))
    return xmax,amax,rows
for dt in [0.01,0.005,0.001,0.0001]:
    xm,am,rows=euler(dt); print("dt",dt,"xmax",xm,"amax",am)
xm,am,rows=euler(0.01,0.081)
for r in rows: print("%.2f %.3f %.2f %.0f"%r)
print("== wave speed / dt")
c=sqrt(205e9/7850); print("c",c,"dt for 5mm", 0.005/c, "steps 0.1s", 0.1/(0.005/c))
