import numpy as np, math
d=math.radians
def R(t): t=d(t); return np.array([[math.cos(t),-math.sin(t)],[math.sin(t),math.cos(t)]])
def Rx(t): t=d(t); c,s=math.cos(t),math.sin(t); return np.array([[1,0,0],[0,c,-s],[0,s,c]])
def Ry(t): t=d(t); c,s=math.cos(t),math.sin(t); return np.array([[c,0,s],[0,1,0],[-s,0,c]])
def Rz(t): t=d(t); c,s=math.cos(t),math.sin(t); return np.array([[c,-s,0],[s,c,0],[0,0,1]])
def A2(t,L): t=d(t); return np.array([[math.cos(t),-math.sin(t),L*math.cos(t)],[math.sin(t),math.cos(t),L*math.sin(t)],[0,0,1]])
out=[]
def chk(name,val): out.append((name,val))
# 7-6
chk('7-6 表1 B30/60/90/120',[np.round(R(a)@[4,4],2) for a in (30,60,90,120)])
chk('7-6 例1 (3,1)60',np.round(R(60)@[3,1],3)); chk('7-6 じ1 (4,2)30',np.round(R(30)@[4,2],3))
chk('7-6 例2 R30R45',np.round(R(30)@R(45),3)); chk('7-6 じ2 R20R40',np.round(R(20)@R(40),3))
chk('7-6 例7 手',np.round(R(30)@[.3,0]+R(75)@[.25,0],5)); chk('7-6 じ7',np.round(R(45)@[.3,0]+R(90)@[.25,0],5))
chk('7-6 例8(2)/じ8(2)/章末7',[np.round(R(30).T@[0,-9.8],2),np.round(R(20).T@[0,-19.6],2),np.round(R(45).T@[0,-9.8],2)])
chk('7-6 じ8(1)',np.round(R(60).T@[4,2],3)); chk('7-6 章末6',np.round(R(30)@[.4,0]+R(90)@[.3,0],5))
chk('7-6 章末2',np.round(R(15)@R(45),4)); chk('7-6 章末8 角',round(math.degrees(math.atan2(.96,.28)),1))
chk('7-6 チャレンジ2',np.round(R(30)@[.3,0]+R(75)@[.25,0]+R(0)@[.1,0],3))
# 7-7
chk('7-7 ①/② e_x',[np.round(Rz(90)@Rx(90)@[1,0,0],3),np.round(Rx(90)@Rz(90)@[1,0,0],3)])
chk('7-7 例1',[np.round(Rz(90)@[2,1,3],3),np.round(Ry(90)@[2,1,3],3)]); chk('7-7 じ1',[np.round(Rx(90)@[1,2,4],3),np.round(Ry(90)@[1,2,4],3)])
chk('7-7 章末1',[np.round(M@[3,1,2],3) for M in (Rz(90),Rx(90),Ry(90))])
Reu=lambda y,p,r: Rz(y)@Ry(p)@Rx(r)
chk('7-7 例3/じ3/章末3/チャ3 機首',[np.round(Reu(*a)[:,0],3) for a in ((60,-30,10),(30,-60,20),(90,-45,30),(45,-30,50))])
chk('7-7 ジンバル(30,0)vs(0,30)',np.allclose(Reu(30,-90,0),Reu(0,-90,30)))
chk('7-7 例6 T右列',np.round(A2(30,.3)@A2(45,.25),4)[:2,2]); chk('7-7 章末5',np.round(A2(90,.4)@A2(-90,.3),4)[:2,2])
chk('7-7 例7',np.round(Rz(30)@[8,0,-20]+[10,5,20],3)); chk('7-7 チャ2',np.round(Rz(90).T@(np.array([10,10,0])-[0,0,30]),3))
# 7-8
for M in ([[4,1],[2,3]],[[5,2],[2,2]],[[2,2],[2,5]],[[0,1],[-3,-4]],[[0,1],[-10,-2]],[[50,20],[20,20]],[[30,-20],[-20,0]],[[60,20],[20,30]],[[40,30],[30,-40]],[[7,2],[2,4]],[[80,30],[30,-20]],[[0,1],[-16,-0.8]]):
    chk('7-8 eig '+str(M),np.round(np.linalg.eigvals(np.array(M,float)),3))
chk('7-8 べき乗 章末4',[np.linalg.matrix_power(np.array([[5,1],[2,4]]),k)@[1,0] for k in (1,2,3)])
# 7-9
P=np.array([[1,1],[1,-2]]);A=np.array([[4,1],[2,3]]); chk('7-9 例2',np.round(np.linalg.inv(P)@A@P,6)); chk('7-9 PAP^-1',np.round(P@A@np.linalg.inv(P),4))
th=math.atan2(1,2); Rr=R(math.degrees(th)); s=np.array([[50,20],[20,20]]); chk('7-9 例4',np.round(Rr.T@s@Rr,6))
s=np.array([[80,30],[30,-20]]); chk('7-9 σ15.5',np.round(R(15.48)@np.diag([1,1])*0+R(15.48).T@s@R(15.48),2))
chk('7-9 A^3,A^4,A^5',[np.linalg.matrix_power(np.array([[2,1],[1,2]]),k) for k in (3,4,5)]); chk('7-9 (3 1;1 3)^5',np.linalg.matrix_power(np.array([[3,1],[1,3]]),5))
# 7-10
G=np.array([[1,.1],[-.1,1]]); x=np.array([1.,0]); r=[]
for k in range(63): x=G@x; r.append(np.hypot(*x))
chk('7-10 やってみよう x2..x4,BN4',(np.round(np.linalg.matrix_power(G,4)@[1,0],3),round(r[62],3)))
M=np.array([[.8,.4],[.2,.6]]); chk('7-10 天気',[np.round(np.linalg.matrix_power(M,k)@[1,0],3) for k in range(1,5)])
chk('7-10 1周倍率',[round((1+dt*dt)**(math.pi/dt),2) for dt in (.2,.1,.05,.01)])
chk('7-10 例8/じ8',[round(1.04**15.7,3),round(1.09**10.5,3)])
chk('7-10 例9 eig',np.round(np.linalg.eigvals(np.array([[.96,.1],[-.4,1]])),3)); chk('7-10 じ9 eig',np.round(np.linalg.eigvals(np.array([[.91,.1],[-.9,1]])),3))
chk('7-10 e^{-0.5}近似',[round((1-.5/n)**n,4) for n in (10,1000)])
# 7-11
for n in (10,100,1000):
    dx=1/n; chk('7-11 箱 n=%d'%n,np.round(np.linalg.matrix_power(np.array([[1+dx*dx,dx],[dx,1]]),n),3))
T=np.array([[0,0,1],[.5,0,0],[.5,1,0]]); chk('7-11 PageRank',np.round(np.linalg.eigvals(T),3))
for n,v in out: print(n,'=>',v if not isinstance(v,list) else [np.asarray(i).tolist() if hasattr(i,'tolist') else i for i in v])
