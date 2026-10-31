from fractions import Fraction as F
import random, itertools
def same(f,g,nv=1):
    for _ in range(20):
        v=[F(random.randint(-50,50),random.randint(1,7)) for _ in range(nv)]
        if f(*v)!=g(*v): return False
    return True
checks=[
 ('3a2b*2ab=6a3b2', lambda a,b:3*a**2*b*2*a*b, lambda a,b:6*a**3*b**2,2),
 ('-4x*5x2=-20x3', lambda x:-4*x*5*x**2, lambda x:-20*x**3,1),
 ('(2x)^2=4x2', lambda x:(2*x)**2, lambda x:4*x**2,1),
 ('2a*(-3ab)... ', lambda a,b:2*a*(-3*a*b), lambda a,b:-6*a**2*b,2),
 ('(-2x)^3', lambda x:(-2*x)**3, lambda x:-8*x**3,1),
 ('4xy*3x', lambda x,y:4*x*y*3*x, lambda x,y:12*x**2*y,2),
 ('(a+b)(c+d)', lambda a,b,c,d:(a+b)*(c+d), lambda a,b,c,d:a*c+a*d+b*c+b*d,4),
 ('(x+3)(y+2)', lambda x,y:(x+3)*(y+2), lambda x,y:x*y+2*x+3*y+6,2),
 ('(2x+1)(x-3)', lambda x:(2*x+1)*(x-3), lambda x:2*x**2-5*x-3,1),
 ('(a+4)(b+1)', lambda a,b:(a+4)*(b+1), lambda a,b:a*b+a+4*b+4,2),
 ('(3x-2)(x+4)', lambda x:(3*x-2)*(x+4), lambda x:3*x**2+10*x-8,1),
 ('(x+4)^2', lambda x:(x+4)**2, lambda x:x**2+8*x+16,1),
 ('(12-2x)^2', lambda x:(12-2*x)**2, lambda x:144-48*x+4*x**2,1),
 ('(x+5)(x-5)', lambda x:(x+5)*(x-5), lambda x:x**2-25,1),
 ('(x-3)(x+5)', lambda x:(x-3)*(x+5), lambda x:x**2+2*x-15,1),
 ('(x+6)^2', lambda x:(x+6)**2, lambda x:x**2+12*x+36,1),
 ('(10-2x)^2', lambda x:(10-2*x)**2, lambda x:100-40*x+4*x**2,1),
 ('(x+7)(x-7)', lambda x:(x+7)*(x-7), lambda x:x**2-49,1),
 ('(x+4)(x-6)', lambda x:(x+4)*(x-6), lambda x:x**2-2*x-24,1),
 ('(x+2)(x+5)', lambda x:(x+2)*(x+5), lambda x:x**2+7*x+10,1),
 ('(t+5)(t-3)', lambda x:(x+5)*(x-3), lambda x:x**2+2*x-15,1),
 ('(x-2)(x-6)', lambda x:(x-2)*(x-6), lambda x:x**2-8*x+12,1),
 ('(a+b)^3', lambda a,b:(a+b)**3, lambda a,b:a**3+3*a**2*b+3*a*b**2+b**3,2),
 ('(a-b)^2', lambda a,b:(a-b)**2, lambda a,b:a*a-2*a*b+b*b,2),
 ('(a+b+c)^2', lambda a,b,c:(a+b+c)**2, lambda a,b,c:a*a+b*b+c*c+2*a*b+2*b*c+2*c*a,3),
 ('12(x2-8x+12)', lambda x:12*x**2-96*x+144, lambda x:12*(x**2-8*x+12),1),
 ('6(x2+3x-4)', lambda x:6*x**2+18*x-24, lambda x:6*(x**2+3*x-4),1),
 ('5t(t-4)', lambda x:5*x**2-20*x, lambda x:5*x*(x-4),1),
 ('2x(x-4)', lambda x:2*x**2-8*x, lambda x:2*x*(x-4),1),
 ('3(x2-1)', lambda x:3*x**2-3, lambda x:3*(x**2-1),1),
 ('4(x2-1)', lambda x:4*x**2-4, lambda x:4*(x**2-1),1),
 ('x2+6x+10', lambda x:x*x+6*x+10, lambda x:(x+3)**2+1,1),
 ('x2+8x+20', lambda x:x*x+8*x+20, lambda x:(x+4)**2+4,1),
 ('x2+10x+30', lambda x:x*x+10*x+30, lambda x:(x+5)**2+5,1),
 ('x2+4x+7', lambda x:x*x+4*x+7, lambda x:(x+2)**2+3,1),
 ('x2-6x+5', lambda x:x*x-6*x+5, lambda x:(x-3)**2-4,1),
 ('x2+3x+1', lambda x:x*x+3*x+1, lambda x:(x+F(3,2))**2-F(5,4),1),
 ('x2+8x+10', lambda x:x*x+8*x+10, lambda x:(x+4)**2-6,1),
 ('x2-10x+30', lambda x:x*x-10*x+30, lambda x:(x-5)**2+5,1),
 ('x2+5x+2', lambda x:x*x+5*x+2, lambda x:(x+F(5,2))**2-F(17,4),1),
 ('2x2-8x+5', lambda x:2*x*x-8*x+5, lambda x:2*(x-2)**2-3,1),
 ('3x2+12x+7', lambda x:3*x*x+12*x+7, lambda x:3*(x+2)**2-5,1),
 ('20t-5t2', lambda t:20*t-5*t*t, lambda t:20-5*(t-2)**2,1),
 ('10t-5t2+1', lambda t:10*t-5*t*t+1, lambda t:-5*(t-1)**2+6,1),
 ('10t-5t2+2', lambda t:10*t-5*t*t+2, lambda t:-5*(t-1)**2+7,1),
 ('x2-4x+7', lambda x:x*x-4*x+7, lambda x:(x-2)**2+3,1),
 ('5x+1=3(x+1)+2(x-1)', lambda x:5*x+1, lambda x:3*(x+1)+2*(x-1),1),
 ('x+7=2(x+3)-(x-1)', lambda x:x+7, lambda x:2*(x+3)-(x-1),1),
 ('6x+4=4(x+2)+2(x-2)', lambda x:6*x+4, lambda x:4*(x+2)+2*(x-2),1),
 ('3x+1=2(x+1)+(x-1)', lambda x:3*x+1, lambda x:2*(x+1)+(x-1),1),
 ('7x+5=..', lambda x:7*x+5, lambda x:4*(x+2)+3*(x-1),1),
 ('3x+7=3(x+2)+1', lambda x:3*x+7, lambda x:3*(x+2)+1,1),
 ('4x+5=4(x+1)+1', lambda x:4*x+5, lambda x:4*(x+1)+1,1),
 ('pf', lambda x:(5*x+1)/((x-1)*(x+1)) if x*x!=1 else 0, lambda x:(F(3)/(x-1)+F(2)/(x+1)) if x*x!=1 else 0,1),
]
for name,f,g,n in checks: print(('OK ' if same(f,g,n) else 'NG ')+name)
print([20*T-5*T*T for T in [0,1,2,3,4]], [20*T-5*T*T for T in [1.9,2.1]])
print(13**2,100+30+30+9,10**2+3**2, 23*14, 200+80+30+12)
print(102**2, 98**2, 101*99, 103**2, 99**2, 52*48, 1.1**2, 1.2**2, 1+0.1**2)
print(11**3, [((X+1)**2, X*X+2*X+1) for X in [0,1,2,-1,F(1,2)]])
print('eq (x+1)^2=4 sols', [X for X in range(-10,11) if (X+1)**2==4])
print('x2+6x+10 table', [(X,X*X+6*X+10) for X in range(-6,1)])
print('sub at x=2 for 5x+1:', 5*2+1, 3*3+2*1)
