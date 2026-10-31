import math
d=math.degrees; r=math.radians
def mag(*v): return math.hypot(*v)
print("hatena 40E 30N:", mag(40,30), d(math.atan2(30,40)))
print("ex1 12E 5N:", mag(12,5), d(math.atan2(5,12)))
print("jb1 15E 8N:", mag(15,8), d(math.atan2(8,15)))
def res(a,b,th): return math.sqrt(a*a+b*b+2*a*b*math.cos(r(th)))
print("ex2 3,5,60:", res(3,5,60), "jb 7,8,60:", res(7,8,60))
print("equal 10,10,60:",res(10,10,60), 10*math.sqrt(3)," 120:",res(10,10,120), " 6,6,60:",res(6,6,60),6*math.sqrt(3))
print("90deg turn 10:", 10*math.sqrt(2), " 15:",15*math.sqrt(2))
print("rain: car 8 E, rain 6 down:", mag(8,6), d(math.atan2(8,6)))
# crane slings
for th in (0,60,90,120,150):
    print("sling",th, 1/(2*math.cos(r(th/2))))
print("plane:", mag(250,50), d(math.atan2(50,250)))
