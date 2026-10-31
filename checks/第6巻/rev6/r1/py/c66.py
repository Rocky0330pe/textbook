import math
g, L = 9.8, 1.0
dt = 0.001
for deg in [10, 30, 60, 90, 120, 150]:
    th = math.radians(deg); om = 0.0; t = 0.0
    while True:
        a = -g / L * math.sin(th); om = om + a * dt; th2 = th + om * dt; t = t + dt
        if th > 0 and th2 <= 0: break
        th = th2
    print(deg, "度：周期", round(4 * t, 2), "秒")
# semi-implicit table dt=0.01
x=0.1;v=0;rows={}
E=[]
for i in range(0,200):
    rows[i]=(round(i*0.01,2),x,v,-16*x)
    E.append(0.5*0.5*v*v+0.5*8*x*x)
    a=-16*x; v=v+a*0.01; x=x+v*0.01
for i in [0,1,2,3,79,157]: print(i+2, rows[i], 0.1*math.cos(4*rows[i][0]))
print("E range",min(E),max(E))
# with 0.3 at t=0.39
x=0.1;v=0
for i in range(39):
    a=-16*x; v=v+a*0.01; x=x+v*0.01
print("t0.39",x,3*x)
# figure points 0.2 s
x=0.1;v=0;pts=[]
for i in range(601):
    if i%20==0: pts.append((round(i*0.01,1),round(x,4)))
    a=-16*x; v=v+a*0.01; x=x+v*0.01
print(pts)
# ordinary euler energy dt=0.05 one period
x=0.1;v=0
for i in range(31):
    x,v=x+v*0.05, v-16*x*0.05
print("E ord", 0.25*v*v+4*x*x)
x=0.1;v=0
for i in range(32):
    x,v=x+v*0.05, v-16*x*0.05
print("E ord32", 0.25*v*v+4*x*x)
print(2*math.pi/math.sqrt(9.8), 2*math.pi/math.sqrt(1.62), 2*math.pi*math.sqrt(0.1/9.8),2*math.pi*math.sqrt(0.05/9.8),2*math.pi*math.sqrt(0.2/9.8))
