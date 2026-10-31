import numpy as np, math
L1,L2=0.30,0.25
def fk(t):
    t1,t2=t
    return np.array([L1*math.cos(t1)+L2*math.cos(t1+t2), L1*math.sin(t1)+L2*math.sin(t1+t2)])
def J(t):
    t1,t2=t; x,y=fk(t)
    return np.array([[-y, -L2*math.sin(t1+t2)],[x, L2*math.cos(t1+t2)]])
t=np.radians([30,45]); target=np.array([0.20,0.45])
print("start", fk(t), J(t), np.linalg.det(J(t)))
for k in range(5):
    p=fk(t); d=target-p
    dt=np.linalg.solve(J(t),d)
    print(k, np.degrees(t).round(2), p.round(4), d.round(4), np.linalg.norm(d).round(5), np.degrees(dt).round(2))
    t=t+dt
print("final", np.degrees(t).round(3), fk(t))
# exact by cosine law
x,y=target; c2=(x*x+y*y-L1*L1-L2*L2)/(2*L1*L2); t2=math.acos(c2); t1=math.atan2(y,x)-math.atan2(L2*math.sin(t2),L1+L2*math.cos(t2))
print("exact", math.degrees(t1), math.degrees(t2))
