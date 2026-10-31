from poly import *
import math
x=X
def fac(b,c):  # x^2+bx+c -> (p,q) with p+q=b, pq=c
    for p in range(-50,51):
        q=b-p
        if p*q==c and p<=q: return (p,q)
def chk(expr, fact): print(expr==fact, expr)
print([20*t-5*t*t for t in [k/2 for k in range(9)]])
print('h=15', fac(-4,3), 'h=20', 16-4*4, 'h=25', 16-4*5)
# section examples
chk(x**2-4*x+3,(x-1)*(x-3)); chk(x**2+8*x+12,(x+2)*(x+6)); chk(x**2-8*x+12,(x-2)*(x-6)); chk(x**2+2*x-15,(x+5)*(x-3))
chk(3*x**2-3,3*(x+1)*(x-1)); chk(12*x**2-96*x+144,12*(x-2)*(x-6)); chk(3*x**2-12*x+9,3*(x-1)*(x-3))
for p in [(1,12),(2,6),(3,4),(-1,-12),(-2,-6),(-3,-4)]: print(p,sum(p))
for p in [(1,-15),(-1,15),(3,-5),(-3,5)]: print(p,sum(p))
# ex4 & j4
for b,c in [(7,12),(-8,12),(2,-15),(-2,-8),(6,8),(-5,6),(3,-10),(-1,-12)]: print('fac',b,c,fac(b,c))
# ex6
print(fac(-8,12), fac(2,-15), fac(-4,3), fac(1,-6), fac(2,-8), fac(-5,4))
# ex7
print(roots2(1,-4,1), roots2(1,-4,2), [20*t-5*t*t for t in roots2(1,-4,2)[1]], roots2(1,6,4), roots2(1,-4,1)[1])
print(2-math.sqrt(2), 2+math.sqrt(2), 2-math.sqrt(3), 2+math.sqrt(3), -3+math.sqrt(5), -3-math.sqrt(5))
# sqrt
print(math.sqrt(12), 2*math.sqrt(3), 1/math.sqrt(2), math.sqrt(2)/2, 6/math.sqrt(3), 2*math.sqrt(3), 4/math.sqrt(2), 2*math.sqrt(2), 1/math.sqrt(3), math.sqrt(3)/3)
# formula
print(roots2(2,3,-1), (-3+math.sqrt(17))/4, (-3-math.sqrt(17))/4)
print(roots2(1,-6,4), 3+math.sqrt(5), 3-math.sqrt(5))
print(roots2(3,5,1), (-5+math.sqrt(13))/6, roots2(1,-2,-2), 1+math.sqrt(3))
# D
for a,b,c in [(1,-4,3),(1,-4,4),(1,-4,5),(5,-10,6),(2,3,2),(1,6,9),(1,1,-1),(5,-20,18)]: print('D',a,b,c,b*b-4*a*c)
# sign
for xx in [0,2,4]: print(xx,(xx-1)*(xx-3))
print(-5*(x-1)*(x-3), -5*(x-1)*(x-4), 25*x-5*x**2-20)
# problems
print(fac(5,6),fac(-7,10),fac(1,-12),fac(-6,8),fac(1,-6), roots2(1,-2,-1), 1+math.sqrt(2), roots2(2,1,-2), (-1+math.sqrt(17))/4)
print(math.sqrt(20),2*math.sqrt(5),math.sqrt(45),3*math.sqrt(5),3/math.sqrt(3),math.sqrt(3))
for a,b,c in [(1,2,3),(4,-4,1),(1,-3,-1),(5,-20,21)]: print('pD',b*b-4*a*c)
print(fac(-6,5), fac(10,-600), 20+400/10, -5*(x-1)*(x-5), 30*x-5*x**2-25)
# braking
print(fac(10,-200), 10+100/10, 10*3600/1000)
print('char', fac(3,2), 4-20)
print('AC', 100*math.sqrt(2))
