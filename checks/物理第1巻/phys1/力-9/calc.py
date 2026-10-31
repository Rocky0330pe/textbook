# 力-9 の数値（組 P1-5）
import numpy as np
from math import *
def mohr(sx,sy,t):
    c=(sx+sy)/2; a=(sx-sy)/2; R=hypot(a,t)
    tp=degrees(atan2(t,a))/2
    return c,R,c+R,c-R,tp
def mises(s1,s2): return sqrt(s1*s1-s1*s2+s2*s2)
def tresca(s1,s2): return max(abs(s1-s2),abs(s1),abs(s2))
def face(sx,sy,t,th):
    th=radians(th); c=cos(th); s=sin(th)
    sig=sx*c*c+sy*s*s+2*t*s*c
    tau=(sx-sy)*s*c - t*(c*c-s*s)   # せん断は n を右回りに90°回した向き
    return sig,tau
print("例題1 100MPa θ=30,45:", face(100,0,0,30), face(100,0,0,45))
print("じぶん1 80MPa θ=60:", face(80,0,0,60))
print("例題2 τ=40", mohr(0,0,40)); print("じぶん2 τ=25", mohr(0,0,25))
print("例題3", mohr(80,-20,30)); print("じぶん3", mohr(50,10,15))
for M in ([[80,30],[30,-20]],[[50,15],[15,10]]):
    w,v=np.linalg.eigh(np.array(M,float)); print("eig",w,v, [degrees(atan2(v[1,i],v[0,i])) for i in range(2)])
c,R,s1,s2,tp=mohr(80,-20,30)
print("例題5 mises", mises(s1,s2), 245/mises(s1,s2), sqrt(80**2-80*(-20)+400+3*900))
c,R,a1,a2,_=mohr(50,10,15); print("じぶん5", mises(a1,a2), 245/mises(a1,a2))
print("例題6 (1) tresca", tresca(s1,s2), 245/tresca(s1,s2), "(2) 60,40:", tresca(60,40), 245/60)
print("じぶん6 (1) 70,-30:", tresca(70,-30), 245/100, "(2) 90,50:", tresca(90,50), 245/90)
for s,t in ((60,40),(80,30),(100,50)):
    c,R,p1,p2,tp=mohr(s,0,t); print("軸 σ,τ",s,t,"主",p1,p2,"mises",mises(p1,p2),sqrt(s*s+3*t*t),"tresca",tresca(p1,p2),sqrt(s*s+4*t*t), 245/mises(p1,p2), 245/tresca(p1,p2), tp)
print("例題8 50,25", (50-25)/2, 50/2, mises(50,25)); print("じぶん8 40,20", 10, 20, mises(40,20))
print("例題9", 205e3*500e-6); print("じぶん9", 69e3*800e-6)
E=205e3; nu=0.3
def rosette(e0,e45,e90):
    ex,ey=e0,e90; g=2*e45-e0-e90
    c=(ex+ey)/2; a=(ex-ey)/2; R=hypot(a,g/2); e1=c+R; e2=c-R
    tp=degrees(atan2(g/2,a))/2
    k=E/(1-nu*nu)*1e-6
    return g,c,R,e1,e2,tp,k*(e1+nu*e2),k*(e2+nu*e1)
print("例題10", rosette(400,250,-100))
print("じぶん10", rosette(300,250,100))
print("例題11 bar 20x20 F20kN θ=30", 20000/400, face(50,0,0,30))
print("じぶん11 F16kN 20x20 θ=40", face(40,0,0,40))
print("例題12 G", 205/(2*1.3), "じぶん", 69/(2*1.33), "銅", 117/(2*1.34))
print("章末 基本1 120 θ30", face(120,0,0,30)); print("基本3", mohr(100,20,30)); print("チャレンジ6 eig", np.linalg.eigh(np.array([[40.,-30],[-30,-40]])))
print("入試 F=12kN S=200mm2 θ=?: σ=60", face(60,0,0,30), face(60,0,0,45))
print("表計算 80,-20,30")
for th in range(0,181,15):
    s,ta=face(80,-20,30,th); print(th, round(s,1), round(ta,1))
print("== 追加")
print("章末9 rosette 500,100,-200", rosette(500,100,-200))
print("章末10 glue σ30 θ45", face(30,0,0,45))
print("章末8 vessel 80,40", (80-40)/2, 80/2, mises(80,40))
print("章末11", tresca(120,80), 245/120)
print("入試 F12kN S200", 12000*cos(radians(30)), 12000*sin(radians(30)), 200/cos(radians(30)), face(60,0,0,30), face(60,0,0,45))
print("ゲージ 120Ω K2 500e-6", 120*2*500e-6)
print("例題1 力 F=? 棒 A=100mm2? σ=100 → F=10kN θ30", 10000*cos(radians(30)), 10000*sin(radians(30)), 100/cos(radians(30)))
print("じぶん1 A=50 σ80→F=4kN θ60", 4000*cos(radians(60)), 4000*sin(radians(60)), 50/cos(radians(60)))
print("章末1 120MPa A=50→6kN θ30", 6000*cos(radians(30)), 6000*sin(radians(30)))
# 3D Mohr example 8
