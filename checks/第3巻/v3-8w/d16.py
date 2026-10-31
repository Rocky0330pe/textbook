import numpy as np
from fractions import Fraction as F
def origin(x,y):
    x=np.array(x,float);y=np.array(y,float)
    P=(x*x).sum();Q=(x*y).sum();R=(y*y).sum();a=Q/P
    return dict(P=P,Q=Q,R=R,a=a,Smin=R-Q*Q/P,res=np.round(y-a*x,4))
def lin(x,y):
    x=np.array(x,float);y=np.array(y,float);n=len(x)
    mx,my=x.mean(),y.mean();dx=x-mx;dy=y-my
    sxy=(dx*dy).sum()/n;sxx=(dx*dx).sum()/n;a=sxy/sxx;b=my-a*mx
    return dict(mx=mx,my=my,Sdxdy=(dx*dy).sum(),Sdx2=(dx*dx).sum(),Sdy2=(dy*dy).sum(),sxy=sxy,sxx=sxx,a=a,b=b,res=np.round(y-(a*x+b),4))
def S(x,y,a,b=0): x=np.array(x,float);y=np.array(y,float);return ((y-a*x-b)**2).sum()
print('springB',origin([1,2,3],[22,39,60]), [S([1,2,3],[22,39,60],a) for a in [18,19,20,21,22]])
print('3-0',origin(range(7),[0,1.6,2.9,4.6,5.9,7.6,8.9]),[round(S(range(7),[0,1.6,2.9,4.6,5.9,7.6,8.9],a),4) for a in [1.45,1.5,1.55]])
print('3-0 lin',lin(range(7),[0,1.6,2.9,4.6,5.9,7.6,8.9]))
print('springC',lin([1,2,3,4,5],[14.0,15.9,18.1,20.1,21.9]))
print('r2',origin([1,2,3],[4,7,8]),[S([1,2,3],[4,7,8],a) for a in [2,2.5,3,3.5,4]])
print('j2',origin([1,2,3],[3,5,5]))
print('r1',[S([1,2,3],[3,4,7],a) for a in [2,2.5]], origin([1,2,3],[3,4,7]))
print('r3',origin([1,2,3,4],[2.2,3.9,6.0,8.0]))
print('j3',origin([1,2,3,4],[4.2,7.9,12.0,16.0]))
print('j4',lin([1,2,3,4,5],[5.1,6.7,7.9,9.7,11.1]))
rb_x=[5,10,15,20,25,30]; rb_y=[0.8,1.5,2.6,4.0,5.8,8.0]
print('rubber',lin(rb_x,rb_y))
p=[0,25,50,75,100]; o=[4.02,8.01,11.97,16.03,19.98]
print('calib',lin(p,o))
print('ex5',lin([1,2,3,4,5],[2.0,2.5,3.5,5.0,7.0]))
print('j5',lin([1,2,3,4,5],[3.1,4.8,7.2,8.8,11.1]))
print('rubber2',lin([5,10,15,20,25],[1.0,2.0,3.5,5.5,8.0]))
print('B2',origin([1,2,3],[5,9,11]))
print('B3',origin([1,2,3,4],[1.2,1.9,3.0,4.0]))
print('B4',lin([1,2,3,4,5],[2.1,2.8,4.2,4.8,6.1]))
print('B5',lin([1,2,3,4,5],[0.5,1.0,2.0,3.5,5.5]))
print('C2',lin([0,50,100],[4.0,12.1,19.9]))
print('young',origin([0.5,1.0,1.5,2.0],[101,199,302,398]))
T=[27,28,29,30,31,32,33,34,35,36]; P=[2410,2490,2560,2600,2700,2750,2830,2880,2990,3020]
print('power',lin(T,P), np.corrcoef(T,P)[0,1])
print('r1j',[S([1,2,3],[2,5,6],a) for a in [2,2.5]])
print('B1',[S([1,2,3],[1,3,4],a) for a in [1,1.5]])
