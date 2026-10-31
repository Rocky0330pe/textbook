from decimal import Decimal as D
import math
def L(s): return [D(x) for x in s.replace('、',' ').split()]
def st(name,a):
    n=len(a); m=sum(a)/n; dev=[x-m for x in a]; sq=[d*d for d in dev]; var=sum(sq)/n
    print(name,'n',n,'sum',sum(a),'mean',m,'dev',[str(d) for d in dev],'sumdev',sum(dev),'sq',[str(q) for q in sq],'sumsq',sum(sq),'var',var,'sd',math.sqrt(var),'absmean',sum(abs(d) for d in dev)/n,'range',max(a)-min(a),'var(n-1)',sum(sq)/(n-1),'sd(n-1)',math.sqrt(sum(sq)/(n-1)))
    return m, math.sqrt(var)
st('A',L("501 497 503 500 498 501")); st('B',L("502 506 496 500 494 502"))
m,s=st('P',L("14.37 14.29 14.24 14.12 14.21 14.17 14.33 14.15 14.22 14.19 14.16 13.95 14.18 14.23 14.16 14.27 14.07 14.20 14.44 14.05"))
P=L("14.37 14.29 14.24 14.12 14.21 14.17 14.33 14.15 14.22 14.19 14.16 13.95 14.18 14.23 14.16 14.27 14.07 14.20 14.44 14.05")
for k in (1,2): 
    lo,hi=D('14.20')-k*D('0.11'),D('14.20')+k*D('0.11'); print(k,'sigma band',lo,hi,sum(1 for x in P if lo<=x<=hi),[str(x) for x in P if not lo<=x<=hi])
print('first rows', [(str(x),str(x-D('14.20')),str((x-D('14.20'))**2)) for x in P[:4]], str(P[-1]-D('14.20')), str((P[-1]-D('14.20'))**2))
g=[sum(P[i:i+4])/4 for i in range(0,20,4)]; st('groups4',g)
print('sigma/sqrt20', s/math.sqrt(20), 0.108/math.sqrt(20))
st('R1',L("42 45 40 44 39")); st('J1',L("63 58 61 66 57"))
st('R2',L("51 47 50 53 49")); st('J2',L("26 14 20 22 18"))
st('R3x',L("6 8 7 9 5")); st('R3y',L("3 10 7 11 4")); st('J3p',L("21 19 20 23 17")); st('J3q',L("25 15 20 18 22"))
R4=L("51 46 53 49 54 50 44 51 49 53"); m,s=st('R4',R4); print(' in', sum(1 for x in R4 if 47<=x<=53))
J4=L("19 22 17 21 23 19 17 22 21 19"); m,s=st('J4',J4); print(' in', sum(1 for x in J4 if 18<=x<=22))
st('R5',L("4.7 5.1 5.0 5.3 4.9")); st('R5mm',L("47 51 50 53 49")); st('R5add',L("5.0 5.4 5.3 5.6 5.2")); st('R5mm+3',L("50 54 53 56 52"))
st('Aplus25',L("526 522 528 525 523 526")); st('AinL',L("0.501 0.497 0.503 0.500 0.498 0.501"))
print('R6', 0.12/2, 0.12/6, (0.12/0.02)**2, 'J6', 0.5/5, 0.5/10, (0.5/0.25)**2)
print('1/sqrt2',1/math.sqrt(2))
print('geiger', math.sqrt(100), math.sqrt(1000), math.sqrt(1000)/10, 10/math.sqrt(10))
