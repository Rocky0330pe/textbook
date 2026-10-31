import numpy as np
from scipy.integrate import quad
Q=4.0
S=np.array([1.5,2.5]); K=np.array([4.5,1.5])
def v(x,y):
    p=np.array([x,y])
    a=p-S; b=p-K
    return Q/(2*np.pi)*(a/(a@a) - b/(b@b))
# arrows at grid points compare with data
print(v(1,2), v(0,0), v(3,0))
# flux through edges of cell [1,2]x[2,3]
def fx(x,y0,y1): return quad(lambda y: v(x,y)[0], y0,y1)[0]
def fy(y,x0,x1): return quad(lambda x: v(x,y)[1], x0,x1)[0]
R=fx(2,2,3); L=fx(1,2,3); T=fy(3,1,2); B=fy(2,1,2)
print('R',R,'L',L,'T',T,'B',B,'net',R-L+T-B)
# all cells
for j in range(3,-1,-1):
    row=[]
    for i in range(6):
        if (i,j) in [(1,2),(4,1)]:
            row.append('*')
            continue
        n=fx(i+1,j,j+1)-fx(i,j,j+1)+fy(j+1,i,i+1)-fy(j,i,i+1)
        row.append('%.3f'%n)
    print(row)
# outer boundary
tot=fx(6,0,4)-fx(0,0,4)+fy(4,0,6)-fy(0,0,6)
print('outer',tot)
