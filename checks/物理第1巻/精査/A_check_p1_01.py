# 力-1（p1-01.tex）の数値の検算。g=9.8
import math
g=9.8
r=lambda x,n=3: round(x,n)
print("変位", math.hypot(480,280))
print("面積の幅", 2.25*4.555, 2.35*4.565, 2.3*4.56)
print("Δt表", [r(9.8+4.9*d,4) for d in (1,.5,.25,.125)])
print("停止距離 0.75v+v^2/14", [r(0.75*v+v*v/14,2) for v in (10,20,30)])
print("机 t", math.sqrt(1.25/4.9), "x", 2*math.sqrt(1.25/4.9))
for v0 in (5,10):
    print("45° v0",v0,"R",v0**2/g,"H",v0**2*0.5/(2*g))
for th in (30,45,60):
    t=math.radians(th); v0=10
    print(th,"R",r(v0**2*math.sin(2*t)/g),"H",r(v0**2*math.sin(t)**2/(2*g)),"T",r(2*v0*math.sin(t)/g))
# 表計算（オイラー、y は今の vy で進める）
vy=10*math.sin(math.pi/4); vx=10*math.cos(math.pi/4); x=y=0; t=0
rows=[]
for i in range(16):
    rows.append((r(t,1),r(vy),r(x),r(y),r(vx*t-4.9*t*t if False else 7.071*t-4.9*t*t)))
    y=y+vy*0.1; x=x+vx*0.1; vy=vy-g*0.1; t+=0.1
for k in (0,1,2,3,7,8,14,15): print("表",rows[k])
# プログラム
for dt in (0.1,0.01,0.001):
    t=x=y=0.0; vx,vy=10*math.cos(math.pi/4),10*math.sin(math.pi/4)
    while True:
        x+=vx*dt; y+=vy*dt; vy-=g*dt; t+=dt
        if y<0: break
    print("prog",dt,round(x,2))
# Δv の表
for dt in (1,.5,.1,.01):
    dth=15*dt/50; print("dv/dt",dt, 2*15*math.sin(dth/2)/dt)
print("ω 3000rpm", 2*math.pi*3000/60)
# 例題
print("ex1 a",20/40,"x",0.5*0.5*40**2, "jibun", 15/25, 0.5*0.6*25**2)
print("ex2", 20*0.75, 400/14, 15+400/14, "jibun", 15*0.75, 225/14, 15*0.75+225/14)
print("ex3", 4.9*4, 19.6, "jibun", 4.9*2.25, 9.8*1.5)
print("ex4", 14/9.8, 196/19.6, 28/9.8)
print("ex5 jibun", math.sqrt(0.8/4.9), 3*math.sqrt(0.8/4.9), "v_final", math.hypot(2,9.8*math.sqrt(1.25/4.9)))
print("ex6 jibun R", 64*math.sin(math.radians(60))/g, "H", 64*0.25/(2*g))
print("ex7", (6+10)*2/2, "jibun", (7+12)*1.5/2)
print("ex8", 225/50, 4.5/g, "jibun", 400/80, 5/g)
w=800*2*math.pi/60; print("ex9 ω",w,"v",0.25*w,"a",0.25*w*w,"a/g",0.25*w*w/g,"km/h",0.25*w*3.6)
w=1200*2*math.pi/60; print("ex9 jibun ω",w,"v",0.25*w,"a",0.25*w*w,"a/g",0.25*w*w/g)
print("ex10", math.hypot(3,4), math.degrees(math.atan(3/4)), "jibun", 100/50, math.hypot(1.5,2))
print("ex11", math.hypot(10,5), math.degrees(math.atan(2)), "jibun", math.degrees(math.atan(0.75)))
print("ex12", 100/g, "jibun", (15*math.cos(math.radians(30)))**2/g)
ta=math.tan(math.radians(30)); t=25*ta/4.9
print("ex13 t",t,"x",25*t,"L",25*t/math.cos(math.radians(30)),"y",4.9*t*t, "L公式", 2*625*ta/(g*math.cos(math.radians(30))))
t=15*ta/4.9; print("ex13 jibun t",t,"x",15*t,"L",15*t/math.cos(math.radians(30)))
print("ex14", 20-4.9, "jibun", 10*1.5-4.9*2.25)
print("rel", 0.5+0.5/(1+0.25), "GPS 38us*c km", 38e-6*2.998e8/1000)
print("緩和", 400/200, 60/20, 2/3)
print("自転 向心", (2*math.pi/86164)**2*6.378e6, "ISS", 3.986e14/(6.371e6+4e5)**2)
print("問題", 10/10, 0.5*1*100, 7.5+100/14, 4.9*9, 9.8*3, 19.6**2/19.6, 2*2*math.pi, 0.5*(4*math.pi)**2)
print("チャレンジ", 400*math.sin(math.radians(60))/g, 400*0.25/(2*g), (60+150)*20/2, 900/200, math.hypot(2,4.5), math.hypot(5,1.2), math.degrees(math.atan(5/1.2)))
print("月 6倍", 9.8/1.62, "歩道", 40/60+1.3)
