from math import *
# tilted squares
for a,b in [(1,1),(2,1),(3,1),(3,2),(4,3),(4,1)]:
    print('tilt',a,b,(a+b)**2, 4*a*b/2, (a+b)**2-2*a*b, a*a+b*b, sqrt(a*a+b*b))
# 60 / 120 deg third side for 3,4
print('60',sqrt(9+16-24*0.5),'120',sqrt(9+16+12))
# similarity proof 3-4-5
print('AH',9/5,'BH',16/5)
print('hatena',sqrt(34))
for a,b in [(5,12),(2,3),(8,15),(1,3),(9,12),(1,2)]: print('hyp',a,b,sqrt(a*a+b*b))
for c,a in [(13,5),(6,2),(25,7),(4,2),(17,8),(3,1)]: print('leg',c,a,c*c-a*a,sqrt(c*c-a*a))
print('sq6 diag',6*sqrt(2),'eq8 h',4*sqrt(3),'10diag',10*sqrt(2),'eq6',3*sqrt(3),'4diag',4*sqrt(2),'eq10',5*sqrt(3))
print('ruler',15*sqrt(2),10*sqrt(3))
for t in [(9,12,15),(4,5,6),(7,24,25),(5,6,8),(8,15,17),(6,7,9)]:
    a,b,c=t; print('conv',t,a*a+b*b,c*c)
def d(p,q): return sqrt((q[0]-p[0])**2+(q[1]-p[1])**2)
for p,q in [((1,2),(4,6)),((-1,3),(3,-5)),((2,1),(8,9)),((-4,1),(2,-3)),((0,0),(5,12)),((-3,4),(3,-4)),((-2,1),(3,-2))]:
    print('dist',p,q,(q[0]-p[0])**2+(q[1]-p[1])**2,d(p,q))
print('map',sqrt(1.2**2+0.5**2))
for x in range(6): print('circ',x,25-x*x,sqrt(25-x*x))
print('box',sqrt(9+16+144),sqrt(4+9+36),sqrt(16+16+49),sqrt(30**2+40**2+20**2))
print('ladder',sqrt(25-1.4**2),sqrt(6.5**2-2.5**2),sqrt(2.6**2-1))
for w,h in [(12,16),(18,24),(32,18)]:
    dd=sqrt(w*w+h*h); print('screen',w,h,dd,dd/2.54)
k=sqrt(16**2+9**2); print('tv',k, 50*16/k*2.54, 50*9/k*2.54)
print('quake',sqrt(10**2+24**2), sqrt(30**2+16**2), 26/7)
print('robot',sqrt(0.3**2+0.4**2))
# polygon pi doubling r=1
s=1.0;n=6
for i in range(6):
    print('poly',n,s,n*s/2)
    h=sqrt(1-(s/2)**2); s=sqrt((s/2)**2+(1-h)**2); n*=2
