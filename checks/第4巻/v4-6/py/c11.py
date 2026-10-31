import math
r=math.radians; d=math.degrees
print("hatena", 60/3, 1.5*20, math.hypot(1.5,3), d(math.asin(1.5/3)), 3*math.cos(r(30)), 60/(3*math.cos(r(30))))
print("ex river", 80/4, 3*20, math.hypot(3,4), " jb", 120/5, 2*24, math.hypot(2,5))
print("aim ex", d(math.asin(2/4)), 4*math.cos(r(30)), 100/(4*math.cos(r(30))), " jb", 10*math.cos(r(30)), 200/(10*math.cos(r(30))))
for F,t in [(80,30),(80,120),(60,60),(60,135),(50,30)]:
    print("F",F,t, F*math.cos(r(t)), F*math.sin(r(t)))
for v in [(-5,12),(-7,24)]:
    print("ang",v, math.hypot(*v), d(math.atan(v[1]/v[0])), d(math.atan2(v[1],v[0])))
print("drone",(14-2)/4,(6-1)/4, math.hypot(3,1.25), " jb", 12/3, -9/3)
print("unit", (0.6*15,0.8*15), (5/13*26,-12/13*26))
print("2kg slope", 2*9.8*math.sin(r(30)), 2*9.8*math.cos(r(30)))
# equilibrium
import numpy as np
def eq(W,a1,a2):
    A=np.array([[-math.cos(r(a1)), math.cos(r(a2))],[math.sin(r(a1)), math.sin(r(a2))]])
    return np.linalg.solve(A,[0,W])
print("eq", eq(100,30,60), eq(200,60,30), eq(40,30,30))
d1=[146,150,153,156,158,162,164,166,169,176]; t=[8.5,8.6,8.9,8.2,7.8,8.2,8.2,8.8,8.1,7.7]
mx=sum(d1)/10; mt=sum(t)/10
dx=[x-mx for x in d1]; dt=[y-mt for y in t]
print(mx,mt,dx,[round(y,2) for y in dt])
nx=math.sqrt(sum(x*x for x in dx)); nt=math.sqrt(sum(y*y for y in dt))
dot=sum(a*b for a,b in zip(dx,dt))
print("norms",nx,nt, sum(y*y for y in dt),"dot",dot,"r",dot/nx/nt, "sigma",nx/math.sqrt(10), nt/math.sqrt(10))
print("plane", d(math.asin(10/70)), 70*math.cos(math.asin(10/70)))
print("scores", math.sqrt(25+25+100+25+25))
