import math
g,L=9.8,1.0
def rk4(th,om,dt,n):
    out=[(0,th,om)];t=0
    f=lambda th,om:(om,-g/L*math.sin(th))
    for i in range(n):
        k1=f(th,om);k2=f(th+k1[0]*dt/2,om+k1[1]*dt/2);k3=f(th+k2[0]*dt/2,om+k2[1]*dt/2);k4=f(th+k3[0]*dt,om+k3[1]*dt)
        th+= (k1[0]+2*k2[0]+2*k3[0]+k4[0])*dt/6; om+=(k1[1]+2*k2[1]+2*k3[1]+k4[1])*dt/6; t+=dt
        out.append((t,th,om))
    return out
T0=2*math.pi*math.sqrt(L/g)
for deg in [10,30,45,60,90,120,150,170]:
    th0=math.radians(deg)
    r=rk4(th0,0,0.0005,20000)
    # first time theta crosses 0 going down -> quarter period
    for i in range(1,len(r)):
        if r[i-1][1]>0 and r[i][1]<=0:
            t=r[i-1][0]+ (r[i-1][1])/(r[i-1][1]-r[i][1])*0.0005
            break
    print(deg, "T",4*t, "ratio", 4*t/T0)
# curves theta/theta0 for 10,90,150 sampled every 0.1 s to 4 s
for deg in [10,90,150]:
    r=rk4(math.radians(deg),0,0.001,4000)
    print(deg, " ".join("(%.1f,%.3f)"%(r[i][0],r[i][1]/math.radians(deg)) for i in range(0,4001,100)))
print("sin/theta", [(d, round(math.sin(math.radians(d))/math.radians(d),3)) for d in [10,30,60,90,120,150]])
