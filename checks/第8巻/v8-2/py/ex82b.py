from chk import *
E,S,C=math.exp,math.sin,math.cos
check("3x2y+2y3",lambda x,y:3*x*x*y+2*y**3,[lambda x,y:6*x*y,lambda x,y:3*x*x+6*y*y])
check("x3-4xy2+5y",lambda x,y:x**3-4*x*y*y+5*y,[lambda x,y:3*x*x-4*y*y,lambda x,y:-8*x*y+5])
check("e-x sin y",lambda x,y:E(-x)*S(y),[lambda x,y:-E(-x)*S(y),lambda x,y:E(-x)*C(y)])
check("sin(2x+3y)",lambda x,y:S(2*x+3*y),[lambda x,y:2*C(2*x+3*y),lambda x,y:3*C(2*x+3*y)])
check("e-2x sin y",lambda x,y:E(-2*x)*S(y),[lambda x,y:-2*E(-2*x)*S(y),lambda x,y:E(-2*x)*C(y)])
check("sin(3x+y)",lambda x,y:S(3*x+y),[lambda x,y:3*C(3*x+y),lambda x,y:C(3*x+y)])
check("x3y2",lambda x,y:x**3*y*y,[lambda x,y:3*x*x*y*y,lambda x,y:2*x**3*y],second={(0,0):lambda x,y:6*x*y*y,(1,1):lambda x,y:2*x**3,(0,1):lambda x,y:6*x*x*y,(1,0):lambda x,y:6*x*x*y},n=2)
check("e2x sin y",lambda x,y:E(2*x)*S(y),[lambda x,y:2*E(2*x)*S(y),lambda x,y:E(2*x)*C(y)],second={(0,0):lambda x,y:4*E(2*x)*S(y),(1,1):lambda x,y:-E(2*x)*S(y),(0,1):lambda x,y:2*E(2*x)*C(y),(1,0):lambda x,y:2*E(2*x)*C(y)})
check("x2y4",lambda x,y:x*x*y**4,[lambda x,y:2*x*y**4,lambda x,y:4*x*x*y**3],second={(0,0):lambda x,y:2*y**4,(1,1):lambda x,y:12*x*x*y*y,(0,1):lambda x,y:8*x*y**3,(1,0):lambda x,y:8*x*y**3})
check("e3x cos y",lambda x,y:E(3*x)*C(y),[lambda x,y:3*E(3*x)*C(y),lambda x,y:-E(3*x)*S(y)],second={(0,0):lambda x,y:9*E(3*x)*C(y),(1,1):lambda x,y:-E(3*x)*C(y),(0,1):lambda x,y:-3*E(3*x)*S(y),(1,0):lambda x,y:-3*E(3*x)*S(y)})
check("x2 e3y",lambda x,y:x*x*E(3*y),[lambda x,y:2*x*E(3*y),lambda x,y:3*x*x*E(3*y)],second={(0,1):lambda x,y:6*x*E(3*y),(1,0):lambda x,y:6*x*E(3*y),(0,0):lambda x,y:2*E(3*y),(1,1):lambda x,y:9*x*x*E(3*y)})
check("xy2z3",lambda x,y,z:x*y*y*z**3,[lambda x,y,z:y*y*z**3,lambda x,y,z:2*x*y*z**3,lambda x,y,z:3*x*y*y*z*z],n=3)
check("x2yz+z2",lambda x,y,z:x*x*y*z+z*z,[lambda x,y,z:2*x*y*z,lambda x,y,z:x*x*z,lambda x,y,z:x*x*y+2*z],n=3)
print("xy2z3 at(1,2,1):",4,4,12, " x2yz+z2 at (1,3,2):",2*1*3*2,1*2,1*3+4)
V,R=12,6; print("P",V*V/R,2*V/R,-V*V/R/R); V,R=100,20; print("P",V*V/R,2*V/R,-V*V/R/R)
m,v=2,3; print("K",v*v/2,m*v); m,v=1000,20; print("K",v*v/2,m*v, m*v*v/2)
check("hill2",lambda x,y:60-0.01*x*x-0.01*x*y-0.02*y*y,[lambda x,y:-0.02*x-0.01*y,lambda x,y:-0.01*x-0.04*y])
print("hill2 at (10,10)",-0.02*10-0.01*10,-0.01*10-0.04*10, 60-1-1-2)
f=lambda a,b:a*a*b; d=0.1
print("mixed table x2y at (1,2) d=0.1", (f(1+d,2+d)-f(1+d,2)-f(1,2+d)+f(1,2))/d**2, "exact",2)
for d in [1,0.1,0.01]: print(d,(f(1+d,2+d)-f(1+d,2)-f(1,2+d)+f(1,2))/d**2)
# table for x2y around (1,2) step .1
for b in [2.1,2.0]: print([round(f(a,b),3) for a in [1.0,1.1]])
# castigliano
kA,kB,F1,F2=100,50,2,1
print("cast",(F1+F2)/kA,(F1+F2)/kA+F2/kB, (F1+F2)**2/(2*kA)+F2**2/(2*kB))
