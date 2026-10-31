from math import *
m,k,K=1,100,10
x1,x2,v1,v2=0.1,0.0,0.0,0.0
dt=0.01
for n in range(4):
    a1=(-(k+K)*x1+K*x2)/m; a2=(K*x1-(k+K)*x2)/m
    print(n, "t=%.2f"%(n*dt), "x1=%.6f x2=%.6f v1=%.5f v2=%.5f a1=%.4f a2=%.4f"%(x1,x2,v1,v2,a1,a2))
    v1+=a1*dt; v2+=a2*dt; x1+=v1*dt; x2+=v2*dt
# compare at t=3.29
def sim(dt,T):
    x1,x2,v1,v2=0.1,0.0,0.0,0.0
    for n in range(int(round(T/dt))):
        a1=(-(k+K)*x1+K*x2)/m; a2=(K*x1-(k+K)*x2)/m
        v1+=a1*dt; v2+=a2*dt; x1+=v1*dt; x2+=v2*dt
    return x1,x2
w1,w2=10,sqrt(120)
for T in [1.0,3.29,6.58]:
    ex=(0.05*(cos(w1*T)+cos(w2*T)),0.05*(cos(w1*T)-cos(w2*T)))
    print(T, sim(0.01,T), sim(0.001,T), ex)
# max of |x2| envelope etc
print("beat half", pi/(w2-w1), "full",2*pi/(w2-w1), "mean w",(w1+w2)/2)
# equal springs k=K=100
print(sqrt(300), 2*pi/sqrt(300))
