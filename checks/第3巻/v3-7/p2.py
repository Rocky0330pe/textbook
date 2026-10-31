import math, statistics as st
from decimal import Decimal as D
P=[14.38,14.08,14.26,14.31,14.18, 14.09,14.22,14.15,14.29,14.21,
   14.34,14.24,13.96,14.19,14.27, 14.10,14.33,14.17,14.23,14.05,
   14.16,14.25,14.20,14.11,14.28, 14.02,14.19,14.42,14.14,14.18]
P=[D(str(x)) for x in P]
n=len(P); S=sum(P); m=S/n
print(n,S,m)
for k in [1,2,3,5,10,15,20,25,30]:
    print(k, sum(P[:k]), (sum(P[:k])/k))
dev=[x-m for x in P]; ss=sum(d*d for d in dev)
print('sumdev',sum(dev),'ss',ss,'var',ss/n,'sigma',math.sqrt(float(ss/n)))
s=math.sqrt(float(ss/n))
print('in m±s', sum(1 for x in P if float(m)-s<=float(x)<=float(m)+s), [float(x) for x in P if not(float(m)-s<=float(x)<=float(m)+s)])
bins=[D('13.9')+D('0.1')*i for i in range(7)]
fr=[sum(1 for x in P if bins[i]<=x<bins[i+1]) for i in range(6)]
print(fr)
print(sorted(P))
sp=sorted(P); print('median', (sp[14]+sp[15])/2, 'range', sp[-1]-sp[0])
print('mean abs dev', sum(abs(d) for d in dev)/n)
