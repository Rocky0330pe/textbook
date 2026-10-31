V=lambda x:x*(12-2*x)**2
for x in [1,1.5,1.9,2,2.1,2.5,3,4,5]: print(x,V(x))
f=lambda x:x**3-3*x
print([f(x) for x in [-2,-1.5,-1,-0.5,0,0.5,1,1.5,2,3]])
fp=lambda x:3*x*x-3
print([fp(x) for x in [-2,-1.5,-1,-0.5,0,0.5,1,2]])
# candidates for cubic in-range example
import itertools
for a,b in [(-1,4),(-2,3),(-3,2),(-4,5),(-3,4),(-2,4),(-1,3)]:
    g=lambda x:x**3-3*x
    print('x3-3x',a,b,[g(t) for t in (a,-1,1,b)])
for a,b in [(-1,4),(-1,5),(0,5),(-1,3),(0,4)]:
    g=lambda x:x**3-6*x*x+9*x
    print('x3-6x2+9x',a,b,[g(t) for t in (a,1,3,b)])
for a,b in [(-1,4),(-2,4),(-1,5),(-2,5),(-1,3)]:
    g=lambda x:2*x**3-3*x*x-12*x
    print('2x3-3x2-12x',a,b,[g(t) for t in (a,-1,2,b)])
for a,b in [(-1,4),(-2,4),(-1,5),(-3,3),(-2,3)]:
    g=lambda x:x**3-3*x*x-9*x
    print('x3-3x2-9x',a,b,[g(t) for t in (a,-1,3,b)])
