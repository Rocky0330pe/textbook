import numpy as np
c=np.cos(np.radians(30)); s=0.5
T=np.array([[0.5,0,1,1,0,0],[0.866,0,0,0,1,0],[0,-0.5,-1,0,0,0],[0,0.866,0,0,0,1],[-0.5,0.5,0,0,0,0],[-0.866,-0.866,0,0,0,0]])
print('truss',np.linalg.solve(T,[0,0,0,0,0,10]).round(3))
k=100;K=np.array([[2*k,-k,0],[-k,2*k,-k],[0,-k,k]]);F=np.array([0.98]*3)
u=np.linalg.solve(K,F);print(u);print(K@u)
A=np.array([[4,2],[2,4]]);b=np.array([9,6]);print(np.linalg.inv(A));print(np.linalg.inv(A)@b);print(np.linalg.solve(A,b))
# 3 points S table
pts=[(0,1),(1,3),(2,2)]
for a in (0.4,0.5,0.6):
  print(a,[round(sum((y-(a*x+bb))**2 for x,y in pts),2) for bb in (1.4,1.5,1.6)])
x=np.array([0,1,2,3,4,5,6]);y=np.array([0,1.6,2.9,4.6,5.9,7.6,8.9])
A=np.column_stack([x,np.ones(7)]);print(A.T@A);print(A.T@y);print(np.linalg.solve(A.T@A,A.T@y));print(np.linalg.lstsq(A,y,rcond=None)[0])
# robot
def J(t1,t2,L1=0.3,L2=0.25):
  t1,t2=np.radians(t1),np.radians(t2)
  x=L1*np.cos(t1)+L2*np.cos(t1+t2);y=L1*np.sin(t1)+L2*np.sin(t1+t2)
  return np.array([[-y,-L2*np.sin(t1+t2)],[x,L2*np.cos(t1+t2)]])
J45=J(30,45);print('J45',J45.round(4),np.linalg.det(J45))
print('v',J45@[0.5,1.0])
print('th for (0.1,0)',np.linalg.solve(J45,[0.1,0]),'(0,0.1)',np.linalg.solve(J45,[0,0.1]))
J10=J(30,10);print('J10',J10.round(4),np.linalg.det(J10));print(np.linalg.solve(J10,[0.1,0]),np.linalg.solve(J10,[0,0.1]))
# rounded J10 det 0.0130
Jr=np.array([[-0.3107,-0.1607],[0.4513,0.1915]]);print(np.linalg.det(Jr), np.linalg.solve(Jr,[0.1,0]))
print('basic6 7-2',J45@[1.0,-0.5])
