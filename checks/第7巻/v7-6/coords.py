import numpy as np, math
def fmt(pts): return ' '.join('(%.3f,%.3f)'%(a,b) for a,b in pts)
S=np.array([[1,0.1],[-0.1,1]]); x=np.array([1.,0]); pts=[x]
for n in range(63): x=S@x; pts.append(x)
print("euler63", fmt(pts))
T=np.array([[0.99,0.1],[-0.1,1]]); x=np.array([1.,0]); pts=[x]
for n in range(63): x=T@x; pts.append(x)
print("sympl63", fmt(pts))
def R(d):
    t=math.radians(d); return np.array([[math.cos(t),-math.sin(t)],[math.sin(t),math.cos(t)]])
x=np.array([1.,0]); pts=[x]
for n in range(12): x=0.9*R(30)@x; pts.append(x)
print("spiral", fmt(pts))
x=np.array([1.,0]); pts=[x]
for n in range(12): x=R(30)@x; pts.append(x)
print("circle", fmt(pts))
M=np.array([[0.8,0.4],[0.2,0.6]])
for p0 in ([1,0],[0,1]):
    p=np.array(p0,float); s=[]
    for n in range(9): s.append((n,p[0])); p=M@p
    print("weather",p0,fmt(s))
