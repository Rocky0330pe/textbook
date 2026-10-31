import numpy as np
h=lambda x,y:100-0.01*x**2-0.02*y**2
print('ex1',h(30.5,19.7)-h(30,20))
print('j1',h(11,30.5)-h(10,30))
print('ex2',2.01**2*2.98-12, 'j2', 1.02*2.01**3-8)
L1,L2=0.30,0.25
def fk(t1,t2): return np.array([L1*np.cos(t1)+L2*np.cos(t1+t2), L1*np.sin(t1)+L2*np.sin(t1+t2)])
def J(t1,t2):
    s1,c1,s12,c12=np.sin(t1),np.cos(t1),np.sin(t1+t2),np.cos(t1+t2)
    return np.array([[-L1*s1-L2*s12,-L2*s12],[L1*c1+L2*c12,L2*c12]])
a,b=np.radians(30),np.radians(45)
print(J(a,b), np.linalg.det(J(a,b)))
print('real .01', fk(a+.01,b+.01)-fk(a,b))
print('ex7 real', fk(a+.02,b-.01)-fk(a,b), J(a,b)@[0.02,-0.01])
print('j8', J(a,b)@[0.01,0.02], fk(a+.01,b+.02)-fk(a,b))
# 4 corners area
P=[fk(a,b),fk(a+.01,b),fk(a+.01,b+.01),fk(a,b+.01)]
x=[p[0] for p in P]; y=[p[1] for p in P]
print('area', 0.5*abs(sum(x[i]*y[(i+1)%4]-x[(i+1)%4]*y[i] for i in range(4))))
print('ex6',J(0,np.pi/2),np.linalg.det(J(0,np.pi/2)), fk(0,np.pi/2))
print('j6',J(np.pi/2,np.pi/2),np.linalg.det(J(np.pi/2,np.pi/2)))
p6=J(np.radians(60),np.radians(30)); print('p6',p6,np.linalg.det(p6), p6@[.02,.04])
print('p1', h(19.5,-9)-h(20,-10))
print('p2', 1.01**3*2.03-2)
print('p3',1.005**2*1.02-1)
print('j3cone',1.02**2*1.01-1)
print('j9', 8.31*273/0.0224**2, 8.31/0.0224, 8.31/101300)
print('ex4', 12.12**2/5.88)
