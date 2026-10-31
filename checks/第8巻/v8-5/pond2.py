import numpy as np
from scipy.integrate import quad
Q=4.0
S=np.array([1.5,2.5]); K=np.array([4.5,1.5])
def v(x,y):
    p=np.array([x,y]); a=p-S; b=p-K
    return Q/(2*np.pi)*(a/(a@a) - b/(b@b))
def fx(x,y0,y1): return quad(lambda y: v(x,y)[0], y0,y1)[0]
def fy(y,x0,x1): return quad(lambda x: v(x,y)[1], x0,x1)[0]
# vertical edges: X[r][i] r = row from top (cell y from 3-4 down to 0-1), i = x 0..6
X=[[fx(i,3-r,4-r) for i in range(7)] for r in range(4)]
# horizontal edges: Y[r][i], r=0..4 lines y=4,3,2,1,0 ; i=cell x 0..5
Y=[[fy(4-r,i,i+1) for i in range(6)] for r in range(5)]
print("X (right-positive) rows top->bottom")
for r in X: print(' '.join('%6.2f'%a for a in r))
print("Y (up-positive) lines y=4..0")
for r in Y: print(' '.join('%6.2f'%a for a in r))
print("div map from rounded values")
Xr=np.round(np.array(X),2); Yr=np.round(np.array(Y),2)
for r in range(4):
    print(' '.join('%6.2f'%((Xr[r][i+1]-Xr[r][i])+(Yr[r][i]-Yr[r+1][i])) for i in range(6)))
print("div map exact")
for r in range(4):
    print(' '.join('%6.3f'%((X[r][i+1]-X[r][i])+(Y[r][i]-Y[r+1][i])) for i in range(6)))
# arrows: grid points 0..6 x 0..4 ; length compress: L = 0.55*|v|^0.5? compare with old
old={(0,0):(0.026,-0.251),(1,2):(-0.279,-0.403),(3,0):(0.316,0.024)}
for k,o in old.items():
    vv=v(*k); print(k, np.linalg.norm(vv), np.linalg.norm(o))
