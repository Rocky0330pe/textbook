import math
def sim(x,v,dt,n,c,m=0.5,k=8):
    rows=[(0.0,x,v,(-k*x-c*v)/m)];t=0
    for i in range(n):
        a=(-k*x-c*v)/m; v=v+a*dt; x=x+v*dt; t+=dt
        rows.append((t,x,v,(-k*x-c*v)/m))
    return rows
for c in [0,0.4]:
    r=sim(0.1,0,0.01,700,c)
    print("c",c)
    for i in list(range(0,6))+[39,40,78,79,80,157,158,316]:
        t,x,v,a=r[i]
        ex = 0.1*math.cos(4*t) if c==0 else None
        print("%.2f  x=%.5f v=%.5f a=%.5f"%(t,x,v,a), ex)
    # graph points every 0.1
    print(" ".join("(%.1f,%.4f)"%(r[i][0],r[i][1]) for i in range(0,601,10)))
    E=[0.5*0.5*v*v+0.5*8*x*x for (t,x,v,a) in r]
    print("E every 0.25", [ (round(r[i][0],2),round(E[i],5)) for i in range(0,601,25)])
