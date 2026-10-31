import math
d=math.radians; g=math.degrees
def p2c(r,t): return (round(r*math.cos(d(t)),4), round(r*math.sin(d(t)),4))
def c2p(x,y): 
    t=g(math.atan2(y,x)); t=t+360 if t<0 else t
    return (round(math.hypot(x,y),4), round(t,3), round(g(math.atan(y/x)),3) if x!=0 else None)
print(p2c(4,60),p2c(2,135),p2c(6,30),p2c(4,120))
for x,y in [(1,math.sqrt(3)),(-3,3),(-2,-2*math.sqrt(3)),(2,-2),(math.sqrt(3),1),(-1,1),(-3,-3*math.sqrt(3)),(3,-3)]: print((x,y),c2p(x,y))
# circular velocity
def vel(r,w,t): v=r*w; return v,(round(-v*math.sin(d(t)),4), round(v*math.cos(d(t)),4)), p2c(r,t)
print(vel(0.5,4,30), vel(2,3,120))
# numeric check with dt
r,w,t0=0.5,4,math.radians(30); dt=0.001
x0,y0=r*math.cos(t0),r*math.sin(t0); x1,y1=r*math.cos(t0+w*dt),r*math.sin(t0+w*dt)
print("num",(x1-x0)/dt,(y1-y0)/dt, x0,y0,x1,y1)
# cylinder
print(p2c(20,60), c2p(-6,8), p2c(10,150), c2p(5,-5))
def s2c(r,th,ph): return tuple(round(v,4) for v in (r*math.sin(d(th))*math.cos(d(ph)), r*math.sin(d(th))*math.sin(d(ph)), r*math.cos(d(th))))
def c2s(x,y,z):
    r=math.sqrt(x*x+y*y+z*z); th=g(math.acos(z/r)); ph=g(math.atan2(y,x)); return round(r,4),round(th,3),round(ph,3)
print(s2c(2,60,45), s2c(4,30,120), c2s(1,1,math.sqrt(2)), c2s(0,2,2*math.sqrt(3)))
print(s2c(6400,60,60), s2c(6400,45,90))
R=6370
print("tokyo", R*math.cos(d(35.7)), 2*math.pi*R*math.cos(d(35.7))/24, 2*math.pi*R*math.cos(d(35.7))/24/3.6)
print("sapporo", R*math.cos(d(43.1)), 2*math.pi*R*math.cos(d(43.1))/24, 2*math.pi*R*math.cos(d(43.1))/24/3.6)
print("equator", 2*math.pi*R/24)
# great circle
def u(lat,lon): return (math.cos(d(lat))*math.cos(d(lon)), math.cos(d(lat))*math.sin(d(lon)), math.sin(d(lat)))
def gc(a,b,R=6400):
    A=u(*a);B=u(*b); c=sum(p*q for p,q in zip(A,B)); ang=math.acos(c); return A,B,round(c,4),round(g(ang),3),round(ang,4),round(R*ang,1)
print(gc((30,0),(30,90)), 6400*math.cos(d(30))*math.pi/2)
print(gc((60,0),(60,180)), 6400*math.cos(d(60))*math.pi)
# spiral r=2θ
for th in [math.pi/2, math.pi, 3*math.pi/2, 2*math.pi]: r=2*th; print("spiral",round(th,4), round(r,4), p2c(r,g(th)))
for th in [math.pi/2, math.pi, 2*math.pi]: r=0.5*th; print("sp05",round(r,4), p2c(r,g(th)))
# ellipse r=3/(1+0.5cos)
for t in [0,60,90,120,180,240,270,300]:
    r=3/(1+0.5*math.cos(d(t))); print("ell",t,round(r,3),p2c(r,t))
