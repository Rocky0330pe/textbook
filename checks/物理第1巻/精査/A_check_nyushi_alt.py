# 力-1 入試にチャレンジ(1) の差しかえ案（計画書 B 力-1 ⑥の型）の検算
# 傾き α の斜面の下から、水平と角 θ の向きに v0 で投げ、斜面に落ちるまでの斜面にそった距離 L
import math
g=9.8
def L(v0,th,al):
    th=math.radians(th); al=math.radians(al)
    t=2*v0*math.sin(th-al)/(g*math.cos(al))
    x=v0*math.cos(th)*t
    return x/math.cos(al)
v0=10; al=30
best=max(((L(v0,th/100,al),th/100) for th in range(3001,9000)))
print("最大 L", best, "式 v0^2/(g(1+sinα))", v0**2/(g*(1+math.sin(math.radians(al)))), "角 45+α/2 =", 45+al/2)
