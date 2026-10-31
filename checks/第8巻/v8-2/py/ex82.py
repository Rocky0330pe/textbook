import sympy as sp
x,y,z,V,R=sp.symbols('x y z V R')
def show(f,vars_):
    print(f, [sp.simplify(sp.diff(f,v)) for v in vars_])
# ex2
show(3*x**2*y+2*y**3,[x,y]); show(x**3-4*x*y**2+5*y,[x,y])   # jibun
# ex4
show(sp.exp(-x)*sp.sin(y),[x,y]); show(sp.sin(2*x+3*y),[x,y])
show(sp.exp(-2*x)*sp.sin(y),[x,y]); show(sp.sin(3*x+y),[x,y])
# ex5 second partials
for f in [x**3*y**2, sp.exp(2*x)*sp.sin(y), x**2*y**4, sp.exp(3*x)*sp.sin(y), x**2*sp.exp(3*y)]:
    print(f, sp.diff(f,x,2), sp.diff(f,y,2), sp.diff(f,x,y), sp.diff(f,y,x))
# ex6 three var
f=x*y**2*z**3; g=[sp.diff(f,v) for v in (x,y,z)]; print(g,[gg.subs({x:1,y:2,z:1}) for gg in g])
f=x**2*y*z+z**2; g=[sp.diff(f,v) for v in (x,y,z)]; print(g,[gg.subs({x:1,y:3,z:2}) for gg in g])
# ex7 power
P=V**2/R; print(sp.diff(P,V).subs({V:12,R:6}), sp.diff(P,R).subs({V:12,R:6}), P.subs({V:12,R:6}))
print(sp.diff(P,V).subs({V:100,R:20}), sp.diff(P,R).subs({V:100,R:20}), P.subs({V:100,R:20}))
m,v=sp.symbols('m v'); K=m*v**2/2; print(sp.diff(K,m).subs({m:2,v:3}),sp.diff(K,v).subs({m:2,v:3}))
print(sp.diff(K,m).subs({m:1000,v:20}),sp.diff(K,v).subs({m:1000,v:20}))
# challenge mountain
h=60-sp.Rational(1,100)*x**2-sp.Rational(1,100)*x*y-sp.Rational(2,100)*y**2
print([sp.diff(h,v).subs({x:10,y:10}) for v in (x,y)], h.subs({x:10,y:10}))
# numeric check mixed partial table f=x^2 y at (1,2) step 0.1
f=lambda a,b:a**2*b
d=0.1; a,b=1,2
print("mixed", (f(a+d,b+d)-f(a+d,b)-f(a,b+d)+f(a,b))/d**2)
# main mountain different
hm=lambda a,b:100-0.01*a**2-0.02*b**2
print("ex3", [(-0.02*a,-0.04*b) for a,b in [(10,30),(-20,10),(-10,-20)]])
