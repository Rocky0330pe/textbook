import math
r=math.radians; d=math.degrees
print("lift", 5*9.8, 5*9.8*2, 3*9.8, 3*9.8*1.5, 0.1*9.8)
print("pull", 40*5*math.cos(r(60)), 50*8*math.cos(r(30)))
for t in (0,30,60,90,120,180): print(t, round(math.cos(r(t)),3), round(10*2*math.cos(r(t)),2))
print("def", 12*math.cos(r(60)), 12*math.cos(r(120)), 24*math.cos(r(30)), 12*math.sqrt(3))
def dot(a,b): return sum(x*y for x,y in zip(a,b))
def ang(a,b): return d(math.acos(dot(a,b)/math.hypot(*a)/math.hypot(*b)))
for a,b in [((4,0),(3,3)),((2,1),(-1,2)),((1,math.sqrt(3)),(2,0)),((2,-1),(3,4)),((3,4),(-4,3)),((3,4),(5,-2)),((1,2),(3,1)),((1,1),(0,-1)),((2,-1),(-1,3)),((3,1),(-1,2))]:
    print(a,b,dot(a,b),ang(a,b))
# cos law check sample
a=(4,2); b=(1,3)
print("coslaw", (a[0]-b[0])**2+(a[1]-b[1])**2, 20+10-2*dot(a,b))
print("proj", dot((6,8),(0.8,0.6)), 5*dot((6,8),(0.8,0.6)), dot((10,5),(0.6,0.8)), 3*dot((10,5),(0.6,0.8)))
dx=(-2,-1,1,2); dy=(-15,5,-5,15)
print("corr", dot(dx,dy), math.sqrt(dot(dx,dx)), math.sqrt(dot(dy,dy)), dot(dx,dy)/math.sqrt(dot(dx,dx)*dot(dy,dy)))
x=(2,4,6,8); y=(9,7,8,4); mx=sum(x)/4; my=sum(y)/4
dx=[v-mx for v in x]; dy=[v-my for v in y]
print("jb corr", dx,dy,dot(dx,dy), dot(dx,dx), dot(dy,dy), dot(dx,dy)/math.sqrt(dot(dx,dx)*dot(dy,dy)), ang(dx,dy))
print("3-15", d(math.acos(-0.5364557)))
print("pt-line", abs(3*3+4*4-5)/5)
print("speedgun", 40*math.cos(r(10)), 40*math.cos(r(30)))
print("solar", 1000*1.6*0.2, 1000*1.6*0.2*math.cos(r(60)))
