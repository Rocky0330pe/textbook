# 力-16（tex/p1-16.tex）の数値の検算。g=9.8
from math import sqrt, pi, log
import numpy as np
g = 9.8
def p(label, *v): print(label, *[round(x, 5) if isinstance(x, float) else x for x in v])
# ② ばね3本
k=100; W=0.10*g
K=np.array([[2*k,-k,0],[-k,2*k,-k],[0,-k,k]],float); print("② u", np.linalg.solve(K,[W,W,W]))
# ③ 表計算（k=648000 の表）
m=1000; v0=55/3.6
x,v,a=0.0,v0,0.0
print("③ 表 t x v a")
for n in range(8):
    print(round(n*0.01,2), round(x,3), round(v,2), round(a))
    x,v = x+v*0.01, v+a*0.01
    a=-648000*x/1000
# ③ プログラム
kk=m*v0**2/0.6**2; p("k", kk)
for dt in [0.01,0.005,0.001,0.0001]:
    x,v,xmax,amax=0.0,v0,0.0,0.0
    while v>0:
        a=-kk*x/m; x=x+v*dt; v=v+a*dt; xmax=max(xmax,x); amax=max(amax,-a)
    print(dt, round(xmax,3), round(amax))
p("a_max 式", v0**2/0.6, "g倍", v0**2/0.6/g, "omega", v0/0.6, "1/4周期", pi/2*0.6/v0, "一定の力の時間", 1.2/v0, "一定 a", v0**2/1.2)
# ④ 両はし固定の棒
E=205e9; A=pi*0.01**2; EA=E*A; k1=EA/0.4; k2=EA/0.6; u=1e4/(k1+k2)
p("④ u mm", u*1000, "上", k1*u, "下", k2*u)
# ⑤ 太さの変わる棒（中点の断面積）
for n in [1,2,4,8]:
    s=sum((1/n)/(1+(i+0.5)/n) for i in range(n)); p(f"⑤ n={n}", s, "ずれ%", (s/log(2)-1)*100)
# ⑥ 管を輪に分ける（2通りの壁の扱い）
def ring(N, wall_half=True):
    R=1.0; h=R/N; mu=1.0; G=1.0  # G = Δp/L
    M=np.zeros((N,N)); b=np.zeros(N)
    for i in range(N):
        ri, ro = i*h, (i+1)*h
        b[i]=G*pi*(ro**2-ri**2)
        if i>0:
            c=mu*2*pi*ri/h; M[i,i]+=c; M[i,i-1]-=c
        if i<N-1:
            c=mu*2*pi*ro/h; M[i,i]+=c; M[i,i+1]-=c
        else:
            c=mu*2*pi*ro/(h/2 if wall_half else h); M[i,i]+=c
    uu=np.linalg.solve(M,b)
    Q=sum(uu[i]*pi*(((i+1)*h)**2-(i*h)**2) for i in range(N))
    return Q/(pi*R**4*G/(8*mu))
for N in [1,2,4,8]:
    p(f"⑥ N={N} 壁まで h/2", ring(N,True), "壁まで h", ring(N,False))
# ⑦
c=sqrt(205e9/7850); p("⑦ c", c, "dt", 0.005/c, "回数", 0.1/(0.005/c))
# 例1
F=0.30*g; K=np.array([[50,-30],[-30,30]],float); print("例1", np.linalg.solve(K,[0,F]))
# 例2
A=pi*0.01**2; ks=205e9*A/0.3; ka=69e9*A/0.4
K=np.array([[2*ks,-ks,0],[-ks,ks+ka,-ka],[0,-ka,ka]]); print("例2 ks ka", ks, ka, "u mm", np.linalg.solve(K,[0,0,20000])*1000)
# 例3 トラス（本文のプログラムそのまま）
r3 = 3 ** 0.5
P = [(0, 0), (2, 0), (1, r3)]; Mm = [(0, 2), (1, 2), (0, 1)]; EA = 2.05e8
K = np.zeros((6, 6))
for i, k_ in Mm:
    d = np.subtract(P[k_], P[i]); L = np.hypot(d[0], d[1]); c_, s_ = d / L
    t = np.array([[c_*c_, c_*s_], [c_*s_, s_*s_]]); ke = EA / L * np.block([[t, -t], [-t, t]])
    n = [2*i, 2*i+1, 2*k_, 2*k_+1]; K[np.ix_(n, n)] += ke
Fv = np.zeros(6); Fv[5] = -10e3; free = [2, 4, 5]; u = np.zeros(6)
u[free] = np.linalg.solve(K[np.ix_(free, free)], Fv[free])
print('変位（mm）', np.round(u * 1000, 4))
for i, k_ in Mm:
    d = np.subtract(P[k_], P[i]); L = np.hypot(d[0], d[1]); du = u[2*k_:2*k_+2] - u[2*i:2*i+2]
    N = EA / L * np.dot(d / L, du); print('ABC'[i] + 'ABC'[k_], round(N / 1000, 2), 'kN')
# 例4
kk=1000*15.28**2/0.36; p("例4 k", kk, "amax", kk*0.6/1000, "sqrt(m/k)", sqrt(1000/kk), "t", pi/2*sqrt(1000/kk))
p("力-10 例6", 1000*1.0**3/(3*205e9*1e-6))
