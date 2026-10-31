import numpy as np, math
np.set_printoptions(precision=4, suppress=True)
d=math.radians
def R(t): t=d(t); return np.array([[math.cos(t),-math.sin(t)],[math.sin(t),math.cos(t)]])
print("== 7-1 shopping (3-6)"); A=np.array([[2,3],[2,1]]); p=np.array([120,60]); print(A@p)
print("== 7-3 AB!=BA"); S=np.diag([2,1]); R90=R(90).round(10); print(S@R90, R90@S, S@R90@[1,0], R90@S@[1,0])
print("R30R45", R(30)@R(45), R(75))
print("6-9 3+j rot60", R(60)@[3,1])
print("== ABCD"); Z=lambda r: np.array([[1,r],[0,1]]); Y=lambda g: np.array([[1,0],[g,1]])
M=Z(2)@Y(0.5); print(M, np.linalg.det(M), M@[1,0])
M2=Y(0.5)@Z(2); print("reverse", M2)
print("== 7-4 detJ"); J=np.array([[-0.391,-0.241],[0.325,0.065]]); print(np.linalg.det(J), 0.3*0.25*math.sin(d(45)))
th1,th2,L1,L2=d(30),d(45),0.30,0.25
Jx=np.array([[-L1*math.sin(th1)-L2*math.sin(th1+th2),-L2*math.sin(th1+th2)],[L1*math.cos(th1)+L2*math.cos(th1+th2),L2*math.cos(th1+th2)]])
print("J exact",Jx, Jx@[0.5,1.0], np.linalg.norm(Jx@[0.5,1.0]))
print("hand", L1*math.cos(th1)+L2*math.cos(th1+th2), L1*math.sin(th1)+L2*math.sin(th1+th2))
print("triple", np.linalg.det(np.array([[2,0,0],[0,3,0],[1,1,4]])))
C=np.array([[4,2],[2,4]]); print("3-6 circuit det",np.linalg.det(C), np.linalg.inv(C), np.linalg.solve(C,[9,6]))
D=np.array([[1,0,0],[-3,1,1],[0,-1,0]]); print("p1-15 det",np.linalg.det(D), np.linalg.inv(D))
print("== truss")
T=np.array([[0.5,0,1,1,0,0],[0.866,0,0,0,1,0],[0,-0.5,-1,0,0,0],[0,0.866,0,0,0,1],[-0.5,0.5,0,0,0,0],[-0.866,-0.866,0,0,0,0]])
print(np.linalg.solve(T,[0,0,0,0,0,10]), np.linalg.det(T))
print("== 力-16 K"); K=np.array([[200,-100,0],[-100,200,-100],[0,-100,100]]); print(np.linalg.solve(K,[0.98]*3))
print("== 3-16 LSQ sora")
x=np.array([0,1,2,3,4,5,6.]); y=np.array([0,1.6,2.9,4.6,5.9,7.6,8.9])
N=np.array([[sum(x*x),sum(x)],[sum(x),len(x)]]); r=np.array([sum(x*y),sum(y)]); print(N,r,np.linalg.solve(N,r))
print("through origin a=",sum(x*y)/sum(x*x))
print("== eig")
for M in [np.array([[2,1],[1,2]]), np.array([[-110,10],[10,-110.]]), np.array([[-0.1,0.1],[0.1,-0.1]]), np.array([[80,30],[30,-20.]]), np.array([[-200,100],[100,-200.]]), R(30)]:
    w,v=np.linalg.eig(M); print(M.tolist(), w, v.T)
print("== 7-10 Euler matrices, omega=1")
for dt in [0.1,0.01]:
    A=np.array([[0,1],[-1,0.]]); M=np.eye(2)+dt*A; w=np.linalg.eigvals(M); n=round(2*math.pi/dt)
    x=np.array([1,0.]); 
    for i in range(n): x=M@x
    print(dt, w, abs(w[0]), abs(w[0])**(2*math.pi/dt), np.hypot(*x))
    Ms=np.array([[1-dt*dt,dt],[-dt,1]]); print(" semi det",np.linalg.det(Ms), abs(np.linalg.eigvals(Ms)))
print("cooling 0.95^10*60+20", 20+60*0.95**10)
print("tank Euler dt=1", np.linalg.eigvals(np.eye(2)+1*np.array([[-0.1,0.1],[0.1,-0.1]])))
print("== 3D")
def Rx(a): a=d(a); c,s=math.cos(a),math.sin(a); return np.array([[1,0,0],[0,c,-s],[0,s,c]])
def Ry(a): a=d(a); c,s=math.cos(a),math.sin(a); return np.array([[c,0,s],[0,1,0],[-s,0,c]])
def Rz(a): a=d(a); c,s=math.cos(a),math.sin(a); return np.array([[c,-s,0],[s,c,0],[0,0,1]])
v=np.array([1,0,0]); print("RzRx v",(Rz(90)@Rx(90)@v).round(6),"RxRz v",(Rx(90)@Rz(90)@v).round(6))
print("det Rz Ry Rx", np.linalg.det(Rz(30)@Ry(20)@Rx(10)))
# gimbal lock: pitch 90 -> roll and yaw same effect
A=Rz(30)@Ry(90)@Rx(0); B=Rz(0)@Ry(90)@Rx(-30); print("gimbal", np.allclose(A,B))
# ropes
for t1,t2 in [(30,60),(30,30),(10,10),(5,5)]:
    M=np.array([[-math.cos(d(t1)),math.cos(d(t2))],[math.sin(d(t1)),math.sin(d(t2))]]); W=100 if (t1,t2)==(30,60) else 40
    print("ropes",t1,t2,np.linalg.det(M),-math.sin(d(t1+t2)),np.linalg.solve(M,[0,W]))
# Markov weather
P=np.array([[0.8,0.4],[0.2,0.6]]); w,vv=np.linalg.eig(P); print("markov",w,vv[:,0]/vv[:,0].sum(), np.linalg.matrix_power(P,10)@[1,0])
F=np.array([[1,1],[1,0]]); print("fib eig",np.linalg.eigvals(F), np.linalg.matrix_power(F,10))
A=np.array([[2,1],[1,2]]); print("A^5",np.linalg.matrix_power(A,5),(3**5+1)/2,(3**5-1)/2)
# state matrix from 3-10
for c,k in [(3,2),(2,5)]:
    print("state",c,k,np.linalg.eigvals(np.array([[0,1],[-k,-c]])))
print("spring 0.5kg 8N/m c=0.4", np.linalg.eigvals(np.array([[0,1],[-16,-0.8]])))
# homogeneous 3D: 2-link in plane via 4x4
def H(R,p): M=np.eye(4); M[:3,:3]=R; M[:3,3]=p; return M
T=H(Rz(30),[0,0,0])@H(np.eye(3),[0.30,0,0])@H(Rz(45),[0,0,0])@H(np.eye(3),[0.25,0,0])
print("4x4 hand",T[:3,3].round(4))
# geometric series S14
print("S14", sum(0.5**n for n in range(50)), 1/(1-0.5))
# least squares sora regression line value
