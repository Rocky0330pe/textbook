import math, cmath
e=math.e
print("hot water 10min", 20+60*math.exp(-0.5))
T=80
for i in range(10): T+= -0.05*(T-20)*1
print("euler dt1", T)
print("50C time", 20*math.log(2))
print("RC", 20e3*100e-6)
m,k=0.5,8; wn=math.sqrt(k/m); print("wn",wn,"T",2*math.pi/wn,"cc",2*math.sqrt(m*k))
c=0.4; z=c/(2*math.sqrt(m*k)); wd=wn*math.sqrt(1-z*z); al=c/(2*m)
print("zeta",z,"wd",wd,"alpha",al,"delta",al*2*math.pi/wd,"ratio",math.exp(-al*2*math.pi/wd), "2pi zeta", 2*math.pi*z)
L,C=10e-3,1e-6; print("RLC wn",1/math.sqrt(L*C),"f",1/(2*math.pi*math.sqrt(L*C)),"Rc",2*math.sqrt(L/C),"zeta R20",20/2*math.sqrt(C/L))
print("vt",math.sqrt(80*9.8/0.26))
for p in [(1,3,2),(1,2,5)]:
  a,b,cc=p; D=b*b-4*a*cc; print(p, (-b+cmath.sqrt(D))/(2*a),(-b-cmath.sqrt(D))/(2*a))
print("w1 w2",math.sqrt(100/1),math.sqrt(120/1))
print("tau pct",[round(math.exp(-n),4) for n in range(1,6)])
print("peak", wn*math.sqrt(1-2*z*z), "amp ratio", 1/(2*z*math.sqrt(1-z*z)), "Q",1/(2*z))
print("ln2",math.log(2),"ln10",math.log(10),"1/sqrt2",1/math.sqrt(2))
z1=3+4j; w=1-2j; print(z1+w,z1*w,z1/w, abs(z1), math.degrees(cmath.phase(-1-1j)), 5/(1+2j), (1+1j)**8)
print(cmath.exp(1j*math.pi/3), cmath.exp(1j*math.pi))
print("cosh1 sinh1",math.cosh(1),math.sinh(1), 50*(math.cosh(1)-1))
print("tank",[10+10*math.exp(-0.2*t) for t in (0,5)])
print("water p 10m", 101300+9800*10)
print("heat C 250g", 4.2*250)
print("phase lag w=2", math.degrees(math.atan2(0.4*2, 8-0.5*4)), "w=8", math.degrees(math.atan2(0.4*8,8-0.5*64)))
print("forced X", 10/(4+2j))
print("RL tau L/R e.g.")
print("sqrt(15.68)",math.sqrt(15.68), wn*math.sqrt(1-2*z*z))
