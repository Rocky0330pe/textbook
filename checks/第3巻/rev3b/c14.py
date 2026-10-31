import math
def ps(d):
    n=len(d); m=sum(d)/n; v=sum((x-m)**2 for x in d)/n; return m, v, math.sqrt(v)
pend=[14.37,14.29,14.24,14.12,14.21,14.17,14.33,14.15,14.22,14.19,14.16,13.95,14.18,14.23,14.16,14.27,14.07,14.20,14.44,14.05]
m,v,s=ps(pend); print('pend',m,sum((x-m)**2 for x in pend),v,s)
g=[sum(pend[i:i+4])/4 for i in range(0,20,4)]; print('groups',g, ps(g))
print('within +-s', sum(1 for x in pend if m-s<=x<=m+s), 'within 2s', sum(1 for x in pend if m-2*s<=x<=m+2*s))
for nm,d in [('j1',[63,58,61,66,57]),('j2',[26,14,20,22,18]),('P',[21,19,20,23,17]),('Q',[25,15,20,18,22]),('S',[21,23,22,24,20]),('T',[22,22,22,21,23]),('p6',[12,8,14,11,9,12]),('ex4',[51,46,53,49,54,50,44,51,49,53]),('j4',[19,22,17,21,23,19,17,22,21,19]),('p4',[31,24,33,28,35,30,22,34,31,32])]:
    print(nm, ps(d))
