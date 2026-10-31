import numpy as np
d=np.radians
np.set_printoptions(precision=4, suppress=True)
def Rx(a): a=d(a); c,s=np.cos(a),np.sin(a); return np.array([[1,0,0],[0,c,-s],[0,s,c]])
def Ry(a): a=d(a); c,s=np.cos(a),np.sin(a); return np.array([[c,0,s],[0,1,0],[-s,0,c]])
def Rz(a): a=d(a); c,s=np.cos(a),np.sin(a); return np.array([[c,-s,0],[s,c,0],[0,0,1]])
def E(psi,th,phi): return Rz(psi)@Ry(th)@Rx(phi)
p=np.array([2,1,3])
print("Rz90 p",Rz(90)@p,"Ry90 p",Ry(90)@p,"Rx90 p",Rx(90)@p)
q=np.array([1,2,4])
print("Rx90 q",Rx(90)@q,"Ry90 q",Ry(90)@q,"Rz90 q",Rz(90)@q)
ex=np.array([1,0,0]); ey=np.array([0,1,0]); ez=np.array([0,0,1])
print("RzRx ex",Rz(90)@Rx(90)@ex,"RxRz ex",Rx(90)@Rz(90)@ex)
print("RzRx ez",Rz(90)@Rx(90)@ez,"RxRz ez",Rx(90)@Rz(90)@ez)
print("RzRx",Rz(90)@Rx(90)); print("RxRz",Rx(90)@Rz(90))
print("RzRy",Rz(90)@Ry(90)); print("RyRz",Ry(90)@Rz(90))
print("RxRy",Rx(90)@Ry(90)); print("RyRx",Ry(90)@Rx(90))
for M,n in [(Rz(90)@Ry(90),'RzRy'),(Ry(90)@Rz(90),'RyRz'),(Rx(90)@Ry(90),'RxRy'),(Ry(90)@Rx(90),'RyRx')]:
    print(n,"ex",M@ex,"ey",M@ey,"ez",M@ez)
print("nose yaw30",E(30,0,0)@ex)
print("nose 60,-30,10",E(60,-30,10)@ex, E(60,-30,10))
print("nose 30,-60",E(30,-60,0)@ex)
print("wing (ey) 60,-30,10",E(60,-30,10)@ey,"up",E(60,-30,10)@ez)
print("gimbal", E(30,90,0)); print(E(0,90,-30)); print(E(45,90,15)); print(E(30,90,0)-E(45,90,15))
print("gimbal check minus", E(0,-90,30), E(30,-90,0))
print("det",np.linalg.det(E(60,-30,10)))
R=E(60,-30,10); print("RtR",R.T@R)
# intrinsic vs extrinsic check
# body-axis: yaw about z, then pitch about new y, then roll about new x
psi,th,phi=60,-30,10
R1=Rz(psi); ynew=R1@ey
def rot(axis,a):
    a=d(a); k=axis/np.linalg.norm(axis); K=np.array([[0,-k[2],k[1]],[k[2],0,-k[0]],[-k[1],k[0],0]])
    return np.eye(3)+np.sin(a)*K+(1-np.cos(a))*K@K
R2=rot(ynew,th)@R1; xnew=R2@ex
R3=rot(xnew,phi)@R2
print("intrinsic==", np.allclose(R3,E(psi,th,phi)))
def A(t,L): t=d(t); c,s=np.cos(t),np.sin(t); return np.array([[c,-s,L*c],[s,c,L*s],[0,0,1]])
print("A30",A(30,0.30),"A45",A(45,0.25)); print("T",A(30,0.30)@A(45,0.25))
print("T 60,-30",A(60,0.30)@A(-30,0.25))
a30=np.round(A(30,0.30),3); a45=np.round(A(45,0.25),3); print("rounded T",a30@a45)
def T3(t,L):
    M=np.eye(4); M[:3,:3]=Rz(t); M[:3,3]=[L*np.cos(d(t)),L*np.sin(d(t)),0]; return M
Tb=np.eye(4); Tb[2,3]=0.10
print("4x4",T3(30,0.30)@T3(45,0.25)@[0,0,0,1], (Tb@T3(30,0.30)@T3(45,0.25))@[0,0,0,1])
# drone camera
def H(R,p): M=np.eye(4); M[:3,:3]=R; M[:3,3]=p; return M
print("drone",H(Rz(30),[10,5,20])@[8,0,-20,1])
print("drone2",H(Rz(90),[0,0,30])@[10,5,-30,1])
print("drone inv",np.linalg.inv(H(Rz(30),[10,5,20]))@[16.928,9,0,1])
print("Rz30^T (6.928,4,-20)",Rz(30).T@[6.928,4,-20])
# translate
print("trans",np.array([[1,0,3],[0,1,2],[0,0,1]])@[1,1,1], np.array([[1,0,3],[0,1,2],[0,0,1]])@[1,1,0])
# euler full formula check
psi,th,phi=d(60),d(-30),d(10)
cps,sps,cth,sth,cph,sph=np.cos(psi),np.sin(psi),np.cos(th),np.sin(th),np.cos(phi),np.sin(phi)
F=np.array([[cps*cth, cps*sth*sph-sps*cph, cps*sth*cph+sps*sph],[sps*cth, sps*sth*sph+cps*cph, sps*sth*cph-cps*sph],[-sth,cth*sph,cth*cph]])
print("formula ok",np.allclose(F,E(60,-30,10)))
