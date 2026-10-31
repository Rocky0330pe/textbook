from fractions import Fraction as F
from math import comb, factorial, sqrt
d={0:1}
for _ in range(10):
    nd={}
    for s,c in d.items():
        for k in range(1,7): nd[s+k]=nd.get(s+k,0)+c
    d=nd
tot=6**10
print('P30-40',sum(d[s] for s in range(30,41))/tot,'P25-45',sum(d[s] for s in range(25,46))/tot)
print('P35',d[35]/tot,'P20',d[20]/tot, 'P46', d[46]/tot)
v=sum((k-3.5)**2 for k in range(1,7))/6; print('var1',v,10*v,sqrt(10*v))
print('52!',float(factorial(52)))
print('10C8+',comb(10,8)+comb(10,9)+1, (56)/1024)
print('9+ of 10', (10+1)/1024)
print('sum dice',[(s,sum(1 for a in range(1,7) for b in range(1,7) if a+b==s)) for s in (5,9,7,10)])
