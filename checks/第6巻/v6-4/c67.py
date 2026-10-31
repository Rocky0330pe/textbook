import math
def sim(x,v,dt,n,c,m=0.5,k=8):
    rows=[(0.0,x,v,(-k*x-c*v)/m)];t=0
    for i in range(n):
        a=(-k*x-c*v)/m; v=v+a*dt; x=x+v*dt; t+=dt
        rows.append((t,x,v,(-k*x-c*v)/m))
    return rows
def exact(t,c,m=0.5,k=8,x0=0.1):
    a=c/(2*m); wn=math.sqrt(k/m); z=c/(2*math.sqrt(m*k))
    if z<1:
        wd=wn*math.sqrt(1-z*z); return x0*math.exp(-a*t)*(math.cos(wd*t)+a/wd*math.sin(wd*t))
    if z==1: return x0*(1+wn*t)*math.exp(-wn*t)
    s1=-a+math.sqrt(a*a-wn*wn); s2=-a-math.sqrt(a*a-wn*wn)
    A=x0*(-s2)/(s1-s2); B=x0*s1/(s1-s2)
    return A*math.exp(s1*t)+B*math.exp(s2*t)
for c in [0.4,4]:
    r=sim(0.1,0,0.05,10,c)
    print("c",c)
    for row in r[:7]: print(" ".join("%.4f"%z for z in row), "exact %.4f"%exact(row[0],c))
# peaks from fine sim
for c in [0.4,1.0,2.0]:
    r=sim(0.1,0,0.0005,20000,c)
    pk=[(r[i][0],r[i][1]) for i in range(1,len(r)-1) if r[i][1]>r[i-1][1] and r[i][1]>=r[i+1][1]]
    pk=[(0,0.1)]+pk
    print("c",c,"peaks",[(round(t,3),round(x,5)) for t,x in pk[:5]], "ratios",[round(pk[i+1][1]/pk[i][1],4) for i in range(3)])
# exact peaks
for c in [0.4,1.0,2.0]:
    m,k=0.5,8;a=c/(2*m);wn=4;wd=math.sqrt(wn**2-a*a);Td=2*math.pi/wd
    print("c",c,"alpha",a,"wd",wd,"Td",Td,"ratio",math.exp(-a*Td),"delta",a*Td,"zeta",c/4, "2pi zeta",2*math.pi*c/4)
# overshoot vs c
for c in [1,2,3,3.5,3.8,3.9,4,4.2,5,6,10]:
    r=sim(0.1,0,0.0002,50000,c)
    mn=min(row[1] for row in r)
    # settle time to |x|<0.002 forever
    st=None
    for i in range(len(r)-1,-1,-1):
        if abs(r[i][1])>0.002: st=r[i][0]; break
    print("c",c,"min x %.6f"%mn,"settle(2%%) %.3f"%st)
# other m,k
for (m,k) in [(0.5,2),(2,8),(1,25)]:
    cc=2*math.sqrt(m*k)
    for c in [cc*0.9,cc,cc*1.1]:
        r=sim(0.1,0,0.0002,100000,c,m,k)
        mn=min(row[1] for row in r)
        print("m,k",m,k,"c %.2f"%c,"min %.6f"%mn)
# exact curves sample for graph
for c in [0.4,4,10]:
    print(c, " ".join("(%.2f,%.4f)"%(t/10, exact(t/10,c)) for t in range(0,61,1)))
