import math
from decimal import Decimal as D
P=[14.37,14.12,14.24,14.05,14.21, 14.17,14.29,14.15,14.22,14.19,
   14.33,13.95,14.18,14.23,14.16, 14.27,14.07,14.20,14.44,14.16]
P=[D(str(x)) for x in P]
n=len(P); S=sum(P); m=S/n
print(n,S,m)
for k in [1,2,3,4,5,10,15,20]:
    print(k, sum(P[:k]), (sum(P[:k])/k))
dev=[x-m for x in P]; ss=sum(d*d for d in dev)
s=math.sqrt(float(ss/n))
print('sumdev',sum(dev),'ss',ss,'var',ss/n,'sigma',s)
print('in m±s', sum(1 for x in P if float(m)-s<=float(x)<=float(m)+s), [float(x) for x in P if not(float(m)-s<=float(x)<=float(m)+s)])
print('in m±0.1', sum(1 for x in P if m-D('0.1')<=x<=m+D('0.1')))
bins=[D('13.9')+D('0.1')*i for i in range(7)]
fr=[sum(1 for x in P if bins[i]<=x<bins[i+1]) for i in range(6)]
print(fr)
sp=sorted(P); print(sp)
print('median', (sp[9]+sp[10])/2, 'range', sp[-1]-sp[0])
print('mean abs dev', sum(abs(d) for d in dev)/n)
print('devs', [str(d) for d in dev])
