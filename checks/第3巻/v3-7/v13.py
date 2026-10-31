from decimal import Decimal as D
def L(s): return [D(x) for x in s.replace('、',' ').split()]
def mean(a): return sum(a)/len(a)
def med(a):
    s=sorted(a); n=len(s)
    return s[n//2] if n%2 else (s[n//2-1]+s[n//2])/2
def quart(a):
    s=sorted(a); n=len(s); h=n//2
    lo=s[:h]; hi=s[h+1:] if n%2 else s[h:]
    return med(lo), med(s), med(hi)
def mode(a):
    from collections import Counter
    c=Counter(a); m=max(c.values()); return [k for k,v in c.items() if v==m]
def freq(a,start,w,k): return [sum(1 for x in a if start+w*i<=x<start+w*(i+1)) for i in range(k)]
def fences(a):
    q1,q2,q3=quart(a); i=q3-q1; return q1,q3,i,q1-D('1.5')*i,q3+D('1.5')*i,[x for x in a if x<q1-D('1.5')*i or x>q3+D('1.5')*i]
def summ(name,a):
    print(name,'sorted',[str(x) for x in sorted(a)],'sum',sum(a),'mean',mean(a),'med',med(a),'mode',mode(a),'range',max(a)-min(a),'quart',quart(a),'fence',fences(a))
P=L("14.37 14.29 14.24 14.12 14.21 14.17 14.33 14.15 14.22 14.19 14.16 13.95 14.18 14.23 14.16 14.27 14.07 14.20 14.44 14.05")
summ('P',P); print(freq(P,D('13.9'),D('0.1'),6))
print('class-mean', sum(D(x)*f for x,f in zip(['13.95','14.05','14.15','14.25','14.35','14.45'],[1,2,7,7,2,1])))
R=L("16 14 18 15 20 15 17 35 13 20 15 18"); summ('R',R)
R2=[x for x in R if x!=35]; print(' sans', sum(R2), mean(R2), med(R2))
E=L("23 31 27 35 29 18 26 33 28 24 30 21 27 38 25 29 22 32 26 36"); print('rocket',freq(E,15,5,5))
J=L("7.2 9.5 8.1 5.4 10.3 8.8 6.6 9.0 7.9 11.2 8.4 6.0 9.7 7.5 8.0 12.4 9.1 10.9 8.6 10.0"); print('plane',len(J),freq(J,4,2,5))
print('water', mean(L("24.6 24.4 24.9 24.5 24.6")), 'spring', mean(L("8.3 8.1 8.4 8.2 8.5")))
for nm,f in [('cookie',[2,6,11,14,5,2]),('bolt',[1,5,12,15,6,1]),('egg',[3,7,13,10,5,2])]:
    c=[sum(f[:i+1]) for i in range(len(f))]; print(nm,sum(f),c)
print('19/40',19/40,'18/40',18/40)
X=L("17 14 18 15 34 16 15 18 15"); summ('R4',X); print(' sans', sum(X)-34, (sum(X)-34)/8)
Y=L("22 25 21 24 22 41 23 22 25"); summ('J4',Y); print(' sans', sum(Y)-41, (sum(Y)-41)/8)
summ('R5',L("12 8 14 10 7 17 8 12 11 5 9"))
summ('J5',L("21 16 25 19 18 23 30 20 17 22 24"))
summ('R6',L("24.6 24.8 24.5 24.7 26.9 24.6 24.4 24.7"))
summ('J6',L("30.1 29.9 30.0 30.2 30.0 29.1 30.1 30.2"))
summ('Q1',L("14.23 14.18 14.25 14.16 14.18"))
H=L("18 22 15 27 20 24 13 19 21 25 17 23 20 29 16 22 19 26 21 18"); print('hand',len(H),freq(H,10,5,4))
summ('Q3',L("18 16 21 17 16 28 19 16 20"))
summ('Q4',L("28 31 25 30 27 33 29 26 32 30 24"))
summ('Q5',L("52 50 51 49 50 58 51 50"))
V=L("1.52 1.51 1.53 1.50 1.52 0.96 1.54"); summ('Q7',V); print(' sans', sum(V)-D('0.96'), (sum(V)-D('0.96'))/6)
summ('Q9',L("99.8 100.1 100.0 99.9 100.2 100.0 99.7 100.1 100.0 99.9 100.3 100.0"))
print('sensor', mean(L("24.6 24.7 31.2 24.5 24.6")), med(L("24.6 24.7 31.2 24.5 24.6")))
