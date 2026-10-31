import numpy as np, math, cmath
np.set_printoptions(precision=6, suppress=True)
A = np.array([[2,1],[1,2]])
x = np.array([1,0])
print("主役 A^n (1,0)")
for n in range(7):
    xn = np.linalg.matrix_power(A,n)@x
    print(n, xn, xn[1]/xn[0] if xn[0] else None, math.degrees(math.atan2(xn[1],xn[0])))
print("A^5", np.linalg.matrix_power(A,5), "A^3", np.linalg.matrix_power(A,3), "A^4", np.linalg.matrix_power(A,4))
print("A^4(3,1)", np.linalg.matrix_power(A,4)@np.array([3,1]), "A^4(1,3)", np.linalg.matrix_power(A,4)@np.array([1,3]))
print("A^3(2,0)", np.linalg.matrix_power(A,3)@np.array([2,0]))
print("A elementwise **2", A**2, "A@A", A@A)
M = np.array([[0.8,0.4],[0.2,0.6]])
for p0 in ([1,0],[0,1]):
    p = np.array(p0, float)
    out=[]
    for n in range(8):
        out.append(tuple(np.round(p,4))); p = M@p
    print("weather", p0, out)
print(np.linalg.eig(M))
M2 = np.array([[0.9,0.5],[0.1,0.5]])
p = np.array([0,1.]);
for n in range(5): print("w2",n,p); p=M2@p
print(np.linalg.eig(M2))
# rotation
def R(d):
    t=math.radians(d); return np.array([[math.cos(t),-math.sin(t)],[math.sin(t),math.cos(t)]])
p=np.array([1.,0])
for n in range(13):
    print("0.9R30", n, np.round(np.linalg.matrix_power(0.9*R(30),n)@p,4), 0.9**n)
print("eig 0.9R30", np.linalg.eigvals(0.9*R(30)), abs(np.linalg.eigvals(0.9*R(30))))
# 1x1
for a in (1.5,0.5,-0.5,-1.5):
    print("a",a,[round(a**n,4) for n in range(7)])
print("-0.5 x0=16", [16*(-0.5)**n for n in range(5)], "-1.5 x0=4",[4*(-1.5)**n for n in range(5)])
print("0.95^10", 0.95**10, 60*0.95**10+20)
# plant
for (r,c) in ((0.5,100),(0.6,50)):
    y=0; ys=[]
    for n in range(8):
        y=r*y+c; ys.append(round(y,4))
    print("plant",r,c,ys, c/(1-r))
# geometric partial sums
print([sum(0.5**k for k in range(n)) for n in range(1,8)])
# symmetric 0.6,0.2
B=np.array([[0.6,0.2],[0.2,0.6]]); print("B^10(1,0)", np.linalg.matrix_power(B,10)@np.array([1,0]), 0.8**10/2, 0.4**10/2)
C=np.array([[1.1,0.1],[0.1,1.1]]); print("C^10(1,0)", np.linalg.matrix_power(C,10)@np.array([1,0]), 1.2**10/2)
# water tank euler
Aw=np.array([[-0.1,0.1],[0.1,-0.1]])
for dt,n in ((1,10),(2,2),(0.5,4)):
    S=np.eye(2)+Aw*dt; x=np.array([20.,0])
    print("tank dt",dt,np.linalg.eigvals(S), np.linalg.matrix_power(S,n)@x, 10+10*math.exp(-0.2*dt*n), 10-10*math.exp(-0.2*dt*n))
S=np.eye(2)+Aw; x=np.array([20.,0])
for n in range(6): print(n, np.linalg.matrix_power(S,n)@x)
# spring euler
for w,dt in ((1,0.1),(1,0.01),(4,0.02),(2,0.1),(3,0.1),(1,0.2)):
    S=np.array([[1,dt],[-w*w*dt,1]])
    ev=np.linalg.eigvals(S)
    steps=2*math.pi/(w*dt)
    print("spring",w,dt,ev,abs(ev[0]),"det",np.linalg.det(S),"steps",steps,"per period",abs(ev[0])**steps, "round steps", abs(ev[0])**round(steps), (1+(w*dt)**2)**(math.pi/(w*dt)))
    Ss=np.array([[1-(w*dt)**2,dt],[-w*w*dt,1]])
    evs=np.linalg.eigvals(Ss); print("  sympl", Ss, evs, abs(evs), np.linalg.det(Ss))
# simulate ordinary euler w=1 dt=0.1 from (1,0) 63 steps
x=np.array([1.,0]); S=np.array([[1,0.1],[-0.1,1]])
pts=[x.copy()]
for n in range(63): x=S@x; pts.append(x.copy())
print("after 63", pts[-1], np.hypot(*pts[-1]))
print("after 1", pts[1], np.hypot(*pts[1]), math.degrees(math.atan(0.1)))
# cooling
for dt in (1,10,20,30,40,50):
    print("cool",dt,1-0.05*dt)
# e^{At} limit 1x1
for n in (1,10,100,1000,10000):
    print("lim", n, (1-0.5/n)**n, math.exp(-0.5))
# spring matrix power to one period
for n in (63,630,6283):
    S=np.array([[1,2*math.pi/n],[-2*math.pi/n,1]])
    print("e^{A 2pi}", n, np.linalg.matrix_power(S,n))
# fib
F=np.array([[1,1],[1,0]]); print(np.linalg.eigvals(F))
f=[1,1]
for i in range(12): f.append(f[-1]+f[-2])
print(f, [round(f[i+1]/f[i],4) for i in range(len(f)-1)])
print("sqrt1.01",math.sqrt(1.01), "sqrt1.0064", math.sqrt(1.0064), 1.0032**79, "sqrt1.04", math.sqrt(1.04), 1.0198**31, "sqrt1.09",math.sqrt(1.09))
print(np.linalg.eig(np.array([[1,0.1],[-0.1,1]])))
print(np.linalg.eig(np.array([[0.99,0.1],[-0.1,1]])))
print(abs(1+0.1j), abs(0.995+0.0998749j))
