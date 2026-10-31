from poly import *
x=X;t=X;h=X
for k in range(5):
    tt=F(k,10); print('t',tt,'x',2*tt,'drop',5*tt**2, 'drop/x^2', (5*tt**2)/((2*tt)**2) if k else None)
for k in range(1,5):
    tt=F(k,10); y=5*tt**2; print(tt, tt**2, y, y/tt, y/tt**2)
print('mid', (1+4)/2, 1.5**2)
for a in [2,1,F(1,2),-1,F(-1,2)]:
    print(a,[a*xx**2 for xx in range(-2,3)])
print('rate',(5*(1+h)**2-5))
for hh in [1,F(1,2),F(1,10),F(1,100)]: print(hh, 10+5*hh)
print([5*k*k for k in range(5)], [5*(k+1)**2-5*k**2 for k in range(4)])
print([(xx-2)**2 for xx in range(-1,6)], [(xx-2)**2+1 for xx in range(-1,6)])
print((x-2)**2+1)
print([xx**2+6*xx+10 for xx in range(-5,0)])
print(-5*(t-2)**2+20, [20*k-5*k*k for k in range(5)])
print([20*tt-5*tt**2 for tt in [F(k,2) for k in range(9)]])
