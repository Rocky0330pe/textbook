from fractions import Fraction as F
import math
class P:
    def __init__(s,c): 
        c=[F(v) for v in c]
        while len(c)>1 and c[-1]==0: c.pop()
        s.c=c
    def __add__(s,o):
        o=o if isinstance(o,P) else P([o]); n=max(len(s.c),len(o.c))
        return P([(s.c[i] if i<len(s.c) else 0)+(o.c[i] if i<len(o.c) else 0) for i in range(n)])
    __radd__=__add__
    def __neg__(s): return P([-v for v in s.c])
    def __sub__(s,o): return s+(-(o if isinstance(o,P) else P([o])))
    def __rsub__(s,o): return (-s)+o
    def __mul__(s,o):
        o=o if isinstance(o,P) else P([o]); r=[F(0)]*(len(s.c)+len(o.c)-1)
        for i,a in enumerate(s.c):
            for j,b in enumerate(o.c): r[i+j]+=a*b
        return P(r)
    __rmul__=__mul__
    def __pow__(s,n):
        r=P([1])
        for _ in range(n): r=r*s
        return r
    def __call__(s,v): return sum(c*F(v)**i if not isinstance(v,float) else float(c)*v**i for i,c in enumerate(s.c))
    def __eq__(s,o): o=o if isinstance(o,P) else P([o]); return s.c==o.c
    def __repr__(s):
        return ' + '.join(f'{c}x^{i}' for i,c in reversed(list(enumerate(s.c))) if c!=0) or '0'
X=P([0,1])
def roots2(a,b,c):
    D=b*b-4*a*c
    if D<0: return D,[]
    return D,sorted({(-b+s*math.sqrt(D))/(2*a) for s in (1,-1)})
