from fractions import Fraction as F
# 5-9 staircase for v=2t on [0,4]
for dt in [F(1),F(1,2),F(1,4),F(1,10),F(1,100)]:
    n=int(4/dt)
    lo=sum(2*k*dt*dt for k in range(n)); hi=sum(2*(k+1)*dt*dt for k in range(n))
    print('dt',dt,float(lo),float(hi),float(16-lo))
# tachograph hatena
pts=[(0,0),(0.5,40),(2,40),(2.5,0),(3,0),(3.5,60),(5.5,60),(6,0)]
s=0
for (a,b),(c,d) in zip(pts,pts[1:]):
    s+=(b+d)/2*(c-a); print(a,c,(b+d)/2*(c-a))
print('total',s)
# yattemiyou bicycle
pts=[(0,0),(2,2),(4,4),(6,4),(8,4),(10,2)]
cum=0
for (a,b),(c,d) in zip(pts,pts[1:]):
    ar=(b+d)/2*(c-a); cum+=ar; print(a,c,ar,cum)
