# 力-2（p1-02.tex）の数値の検算。g=9.8
import math
g=9.8; d=math.radians
print("g=GM/R^2", 3.986e14/6.371e6**2, "ISS比", 1/(6.771/6.371)**2, 9.8/(6.771/6.371)**2)
print("1kg-1m", 6.674e-11, "月 0.1kg", 0.1*1.62)
print("sin60", 9.8*math.sin(d(60)), "atan0.2", math.degrees(math.atan(0.2)))
print("体重計", 60*10.8, 60*10.8/9.8, 60*11.8/9.8, "つり革", 0.83/9.8, math.degrees(math.atan(0.83/9.8)))
print("カーブ", math.sqrt(0.7*9.8*50), math.sqrt(0.7*9.8*50)*3.6)
v1=math.sqrt(9.8*6.371e6); print("第1宇宙", v1, 2*math.pi*6.371e6/v1, 2*math.pi*6.371e6/v1/60)
c=0.5*1.2*0.43; print("c",c); m=80; c=0.26; vt=math.sqrt(m*g/c); print("vt",vt)
for t in (1,2,3,5,10,15,20): print("tanh",t, vt*math.tanh(g*t/vt))
f=lambda v: g-c/m*v*v
ve=vr=0.0
for i in range(1,21):
    ve=ve+f(ve)
    k1=f(vr);k2=f(vr+k1/2);k3=f(vr+k2/2);k4=f(vr+k3)
    vr=vr+(k1+2*k2+2*k3+k4)/6
    if i in (1,2,3,4,5,10,15,20): print(i,"Euler",round(ve,3),"RK",round(vr,3),"exact",round(vt*math.tanh(g*i/vt),3), "a_e", round(f(ve),3))
print("ex1", 60*10.8, 648/9.8, 60*8.8, 528/9.8, "jibun", 50*10.6, 530/9.8, 50*9, 450/9.8)
print("ex2", 9.8*.5, 19.6*math.cos(d(30)), "jibun", 9.8*math.sin(d(20)), 19.6*math.cos(d(20)), 2*9.8*math.sin(d(20)))
N=294*math.cos(d(30)); print("ex3 N",N,"f",0.1*N,"a",(147-0.1*N)/30, "jibun", 9.8*(math.sin(d(25))-0.2*math.cos(d(25))), 0.2*294*math.cos(d(25)))
print("ex4", math.degrees(math.atan(.5)), math.degrees(math.atan(.3)))
a=200*9.8/2200; print("ex5", a, 1000*(9.8+a), "jibun", 200/1800*9.8, 2*1000*800/1800*9.8)
print("ex7", .4*9.8, .25*9.8, "ex8", math.sqrt(343), math.sqrt(343)*3.6, "jibun", math.sqrt(.4*9.8*50), math.sqrt(.4*9.8*50)*3.6)
print("ex9", 2*math.pi*math.sqrt(10*math.cos(d(30))/9.8), 1/math.cos(d(30)), "jibun", 2*math.pi*math.sqrt(5*math.cos(d(45))/9.8))
v=math.sqrt(9.8*6.37e6); print("ex10(1)", v, 2*math.pi*6.37e6/v)
v=math.sqrt(3.99e14/6.77e6); T=2*math.pi*6.77e6/v; print("ex10(2)", v, T, T/60, 86400/T)
v=math.sqrt(1.6*1.74e6); print("jibun(1)", v, 2*math.pi*1.74e6/v, 2*math.pi*1.74e6/v/3600)
v=math.sqrt(3.99e14/7.17e6); print("jibun(2)", v, 2*math.pi*7.17e6/v, 2*math.pi*7.17e6/v/60)
for GM in (3.99e14,3.986004418e14):
    r3=GM*86164**2/(4*math.pi**2); rr=r3**(1/3); print("静止衛星 GM",GM,"r3",r3,"r",rr,"h(6.378e6)",rr-6.378e6, "h(6.38e6)", rr-6.38e6, "v", 2*math.pi*rr/86164)
r3=3.99e14*43082**2/(4*math.pi**2); rr=r3**(1/3); print("GPS r", rr, rr-6.38e6)
mm=4/3*math.pi*1e-15*1000; b=6*math.pi*1.81e-5*1e-5; vf=mm*g/b
print("霧 m",mm,"b",b,"vf",vf,"Re(直径)",1.2*vf*2e-5/1.81e-5,"Re(半径)",1.2*vf*1e-5/1.81e-5,"tau",mm/b)
print("ex13 jibun", math.sqrt(60*9.8/.26), 9.8-0.26/60*9.8**2, 9.8+9.8-0.26/60*9.8**2)
print("問題", 40*11.3, 452/9.8, 40*8.3, 332/9.8, 9.8*math.sin(d(45)), 19.6*math.cos(d(45)), math.degrees(math.atan(.6)), math.sqrt(490), math.sqrt(490)*3.6)
print("チャレンジ", 9.8/5, 12/5*9.8, 9.8*(0.5-0.3*math.cos(d(30))), math.sqrt(10/(9.8*(0.5-0.3*math.cos(d(30))))), 2*math.pi*math.sqrt(0.25/9.8))
T=2*math.pi*math.sqrt(3.84e8**3/3.99e14); print("月", T, T/86400)
