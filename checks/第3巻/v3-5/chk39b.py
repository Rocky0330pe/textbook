from poly import *
x=X
def vertex(p):  # ax^2+bx+c
    c,b,a=(p.c+[0,0,0])[:3]; xv=-b/(2*a); return (xv, p(xv))
# ex1/j1/prob1
a=F(12,4); print('ex1',a,a*25,a*1); a=F(18,9); print('j1',a,a*16,a*4); a=F(27,9); print('p1',a,a*4)
print('ex2',[F(1,2)*v*v for v in range(-2,3)],[F(-1,2)*v*v for v in range(-2,3)])
print('j2',[F(1,4)*v*v for v in range(-2,3)],[-2*v*v for v in range(-2,3)])
print('p2',[F(1,4)*v*v for v in range(-2,3)],[-v*v for v in range(-2,3)])
f=lambda a,p,q: (a*q*q-a*p*p)/(q-p)
print('ex3',f(2,1,3), 2*(1+x)**2-2, 'j3', f(3,2,4), 3*(2+x)**2-12, 'p3', f(4,1,3), 4*(1+x)**2-4)
print('ex5', vertex(x**2-4*x+7), vertex(-5*x**2+30*x), 'j5', vertex(x**2+2*x-3), vertex(-5*x**2+10*x))
print('p5', vertex(x**2-6*x+5), vertex(-5*x**2+40*x))
h=lambda t: -5*(t-2)**2+20; print('ex6-3',h(0),h(3),h(2))
h=lambda t: -5*(t-1)**2+5; print('j6-3',h(0),h(1),h(F(3,2)))
print('j6', 2*1,2*4, 2*9*1, 2*1)
h=lambda t:30*t-5*t*t; print('ch1',vertex(30*x-5*x**2),h(1),h(3),h(4))
print('ex7', F(1,5)*F(25,4), 'j7', F(1,20)*16, 5*F(4,10)**2)
print('ch3', F(10,100)*900)
print('ch-av', (45-20)/1, 5*(2+x)**2-20, 20+5*0.1)
print('ex4 check', (0-3)**2+2, -2*(0+1)**2+4)
