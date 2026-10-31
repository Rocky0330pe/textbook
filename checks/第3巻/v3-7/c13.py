from decimal import Decimal as D
import math
def mean(a): return sum(a)/len(a)
def med(a):
    s=sorted(a); n=len(s)
    return s[n//2] if n%2 else (s[n//2-1]+s[n//2])/2
def quart(a):
    s=sorted(a); n=len(s); h=n//2
    lo=s[:h]; hi=s[h+1:] if n%2 else s[h:]
    return med(lo), med(s), med(hi)
def freq(a, start, w, k):
    return [sum(1 for x in a if start+w*i<=x<start+w*(i+1)) for i in range(k)]
def L(s): return [D(x) for x in s.split()]
P=L("14.37 14.29 14.24 14.12 14.21 14.17 14.33 14.15 14.22 14.19 14.16 13.95 14.18 14.23 14.16 14.27 14.07 14.20 14.44 14.05")
print('P n',len(P),'sum',sum(P),'mean',mean(P))
print('excess over 14.00', [x-D('14.00') for x in P], sum(x-D('14.00') for x in P))
for k in [1,2,3,4,5,10,15,20]: print(' run',k,sum(P[:k]),sum(P[:k])/k)
print(' freq',freq(P,D('13.9'),D('0.1'),6),' sorted',sorted(P))
print(' quart',quart(P))
s=math.sqrt(float(sum((x-mean(P))**2 for x in P)/len(P))); print(' sigma',s)
# class 2 (bottom-timing) freq only
print('---R reaction')
R=[16,14,18,15,20,15,17,35,13,20,15,18]
print(sorted(R), sum(R), mean(R), med(R), quart(R))
R2=[x for x in R if x!=35]; print(' w/o 35', sum(R2), sum(R2)/len(R2), med(R2))
q1,q2,q3=quart(R); iqr=q3-q1; print(' iqr',iqr,'fences',q1-1.5*iqr,q3+1.5*iqr)
for c in [13,15,18,35]: print('  t for',c,'cm', math.sqrt(c/100/5))
print('---Ex1'); A=L("8.3 8.1 8.4 8.2 8.5"); print(sum(A),mean(A), sum(x-8 for x in A))
B=L("12.6 12.4 12.9 12.5 12.6"); print(sum(B),mean(B), sum(x-12 for x in B))
print('---Ex2 rocket')
E=[23,31,27,35,29,18,26,33,28,24,30,21,27,38,25,29,22,32,26,36]
f=freq(E,15,5,5); print(len(E),f,[x/20 for x in f], [sum(f[:i+1]) for i in range(5)])
