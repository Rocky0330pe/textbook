import math
def colebrook(Re, e, n=60):
    lam=0.02
    for i in range(n):
        lam=(-2*math.log10(e/3.7+2.51/(Re*math.sqrt(lam))))**-2
    return lam
for e in (0, 1e-4, 1e-3, 1e-2):
    pts=[]
    x=3.6
    while x<=8.001:
        Re=10**x; pts.append('(%.2f,%.4f)'%(x, math.log10(colebrook(Re,e)))); x+=0.2
    print('eps',e,' '.join(pts))
print('ticks y', [(v, round(math.log10(v),4)) for v in (0.008,0.01,0.015,0.02,0.03,0.04,0.05,0.06,0.08,0.1)])
print('lam 64/Re at 2300', 64/2300, math.log10(64/2300))
print('points: ex1 Re 21136 lam', 0.3164/21136**0.25, math.log10(21136), math.log10(0.3164/21136**0.25))
print('ex5', math.log10(2e5), math.log10(0.01856))
