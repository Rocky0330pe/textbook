import numpy as np
h=lambda x,y:100-0.01*x**2-0.02*y**2
# 8-0 / 8-1
print('8-0 table', [[h(x,y) for x in range(0,60,10)] for y in range(40,-10,-10)])
g=np.array([-0.6,-0.8]); top=np.array([-30,-20])/np.hypot(30,20)
print('8-0 grad angle',np.degrees(np.arctan2(*g[::-1]))%360, 'summit dir', np.degrees(np.arctan2(*top[::-1]))%360, 'slope toward summit', g@top)
print('8-1 ex1',h(40,10),h(10,40),'j1',h(50,20),h(20,50),'p1',h(30,40),h(40,30),'p7',h(60,10),h(10,60))
print('8-1 radii', [(c,np.sqrt((100-c)/0.01),np.sqrt((100-c)/0.02)) for c in (90,80,70,60,50,40)])
print('8-1 ex5', 30+10*4/7, np.sqrt(1300), 'p5',10+10/3, np.sqrt(200),'p9',28.0,np.sqrt(800))
a=np.pi*100*70.7107; print('motto', a/100, 10*a/100*550, 10*a/100*450, np.pi*100*70.7107*100/2)
print('p12', np.sqrt(4000),np.sqrt(1000))
# 8-2

def d(f,p,i,e=1e-5):
    p=list(p); q=list(p); p[i]+=e; q[i]-=e; return (f(*p)-f(*q))/(2*e)
def d2(f,p,i,j,e=1e-4):
    return d(lambda *u: d(f,u,i,1e-5),p,j,e)
import math
P=(1.3,0.7,1.1)
tests=[(lambda x,y,z:3*x**2*y+2*y**3, lambda x,y,z:(6*x*y,3*x**2+6*y**2)),
 (lambda x,y,z:x**3-4*x*y**2+5*y, lambda x,y,z:(3*x**2-4*y**2,-8*x*y+5)),
 (lambda x,y,z:2*x**3*y-5*x*y**2+y, lambda x,y,z:(6*x**2*y-5*y**2,2*x**3-10*x*y+1)),
 (lambda x,y,z:x*y**2*z**3, lambda x,y,z:(y**2*z**3,2*x*y*z**3,3*x*y**2*z**2)),
 (lambda x,y,z:x**2*y*z+z**2, lambda x,y,z:(2*x*y*z,x**2*z,x**2*y+2*z)),
 (lambda x,y,z:x**3*y*z**2, lambda x,y,z:(3*x**2*y*z**2,x**3*z**2,2*x**3*y*z))]
for f,ans in tests:
    A=ans(*P); print('8-2 ok', all(abs(d(f,P,i)-A[i])<1e-5 for i in range(len(A))))
print('8-2 vals', 2**2*1, 2*1*2*1, 3*1*4*1, '|', 2*1*3*2, 1*2, 1*3+4, '|', 3*1*1*4, 1*4, 2*1*1*2)
sec=[(lambda x,y,z:x**3*y**2,(6*P[0]*P[1]**2,2*P[0]**3,6*P[0]**2*P[1])),
 (lambda x,y,z:math.exp(2*x)*math.sin(y),(4*math.exp(2*P[0])*math.sin(P[1]),-math.exp(2*P[0])*math.sin(P[1]),2*math.exp(2*P[0])*math.cos(P[1]))),
 (lambda x,y,z:x**2*y**4,(2*P[1]**4,12*P[0]**2*P[1]**2,8*P[0]*P[1]**3)),
 (lambda x,y,z:math.exp(3*x)*math.cos(y),(9*math.exp(3*P[0])*math.cos(P[1]),-math.exp(3*P[0])*math.cos(P[1]),-3*math.exp(3*P[0])*math.sin(P[1]))),
 (lambda x,y,z:x**4*y**3,(12*P[0]**2*P[1]**3,6*P[0]**4*P[1],12*P[0]**3*P[1]**2)),
 (lambda x,y,z:x**2*math.exp(3*y),(2*math.exp(3*P[1]),9*P[0]**2*math.exp(3*P[1]),6*P[0]*math.exp(3*P[1])))]
for f,(fxx,fyy,fxy) in sec:
    print('8-2 2nd ok', abs(d2(f,P,0,0)-fxx)<1e-3*max(1,abs(fxx)), abs(d2(f,P,1,1)-fyy)<1e-3*max(1,abs(fyy)), abs(d2(f,P,0,1)-fxy)<1e-3*max(1,abs(fxy)))
hh=lambda x,y:60-0.01*x**2-0.01*x*y-0.02*y**2
print('8-2 p8', hh(10,10), d(lambda x,y:hh(x,y),(10,10),0), d(lambda x,y:hh(x,y),(10,10),1))
print('8-2 tab', [[round(h(xx,yy),2) for xx in (28,29,30,31,32)] for yy in (22,21,20,19,18)])
print('8-2 p10', 1030*9.8, 1030*9.8*5)
# 8-4
for P in [(20,10),(-10,15),(10,20),(20,-15),(-20,-10),(0,-25),(-30,10),(-30,-20)]:
    gr=np.array([-0.02*P[0],-0.04*P[1]]); L=np.hypot(*gr)
    print('8-4',P,gr,round(L,4),gr/L, np.degrees(np.arctan(L)))
print('8-4 NE', g@[0.7071,0.7071], 'tab E', [round(h(30+np.cos(np.radians(t)),20+np.sin(np.radians(t)))-83,3) for t in range(0,360,45)])
print('8-4 lag', 100-0.01*(100/3)**2-0.02*(50/3)**2)
print('8-4 q', -16*np.array([-300,-400]), np.hypot(4800,6400), -1.6*np.array([-60,80]), -0.6*np.array([-30,40]))
# 8-5
print('8-5', 8.99e9*1e-9/0.25, 8.99e9*2e-9/1, 8.99e9*3e-9/0.25*np.array([0.6,0.8]))
for r in (6371,6771,12742,42157): print('g',r, 9.82*(6371/r)**2)
c,s=np.cos(np.radians(30)),np.sin(np.radians(30)); R=np.array([[c,-s],[s,c]]); print('drone',R.T@[3,4], R.T@[5,0])
c,s=0.5,np.sin(np.radians(60)); R=np.array([[c,-s],[s,c]]); print('j6',R.T@[4,2])
