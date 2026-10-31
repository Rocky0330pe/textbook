import random, math
from fractions import Fraction as F
from math import comb
# coin simulation
r=random.Random(12); h=0; pts=[]
for n in range(1,1001):
    h+= r.random()<0.5
    if n in (10,20,50,100,200,500,1000): pts.append((n,h,round(h/n,3)))
print('coin',pts)
# dice distributions
def conv(k):
    d={0:1}
    for _ in range(k):
        nd={}
        for s,c in d.items():
            for f in range(1,7): nd[s+f]=nd.get(s+f,0)+c
        d=nd
    return d
for k in (1,2,3,10):
    d=conv(k); tot=6**k
    print(k, tot, {s:c for s,c in sorted(d.items())} if k<=3 else '')
d=conv(10); tot=6**10; mu=35; sig=math.sqrt(10*35/12); print('sig10',sig)
p1=sum(c for s,c in d.items() if abs(s-mu)<=sig)/tot; p2=sum(c for s,c in d.items() if abs(s-mu)<=2*sig)/tot
print('10dice within1',p1,'within2',p2, [s for s in d if abs(s-mu)<=sig][:1],max(s for s in d if abs(s-mu)<=sig))
print('10 dice probs', [(s,round(d[s]/tot,4)) for s in range(20,51)])
# coins 20
for n in (10,20,100):
    mu=n/2; sg=math.sqrt(n)/2
    p1=sum(comb(n,k) for k in range(n+1) if abs(k-mu)<=sg)/2**n
    p2=sum(comb(n,k) for k in range(n+1) if abs(k-mu)<=2*sg)/2**n
    print('coins',n,sg,p1,p2)
print([comb(10,k) for k in range(11)])
print('P>=9 of 10', F(comb(10,9)+comb(10,10),1024), (comb(10,9)+1)/1024)
print('52!', float(math.factorial(52)))
print('two dice sum7', F(6,36), 'sum>=10',F(6,36))
