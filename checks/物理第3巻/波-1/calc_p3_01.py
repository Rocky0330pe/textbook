# 波-1　ばねとおもりで考える：1自由度の振動 の数値の検算（組 波W1）
# 実行：python3 checks/物理第3巻/波-1/calc_p3_01.py > checks/物理第3巻/波-1/calc_p3_01_out.txt
from math import pi, sqrt, sin, cos, log, radians, exp
from scipy.special import ellipk
import numpy as np

g = 9.8
def T_pend(l, gg=g): return 2*pi*sqrt(l/gg)
def ratio_big(th0deg):
    k = sin(radians(th0deg)/2)
    return 2/pi*ellipk(k*k)   # scipy の ellipk(m) は m=k^2

print('== やってみよう（ふりこ）')
for l in (0.25, 1.0):
    print(' l=%.2f T=%.3f  10往復=%.2f' % (l, T_pend(l), 10*T_pend(l)))
print(' 1 m 30度の10往復 %.2f' % (10*T_pend(1)*ratio_big(30)))
print(' 1 m 10度の10往復 %.2f' % (10*T_pend(1)*ratio_big(10)))

print('== ③ 大きなふれの周期の比（楕円積分）と近似 1+θ²/16')
for d in (5, 10, 20, 30, 45, 60, 90, 120, 150):
    th = radians(d)
    print(' %3d度 比=%.4f  1+θ²/16=%.4f  1+θ²/16+11θ⁴/3072=%.4f  sinθ/θ=%.3f' % (d, ratio_big(d), 1+th**2/16, 1+th**2/16+11*th**4/3072, sin(th)/th))
print(' l=1 m: 10度 %.3f s, 90度 %.3f s' % (T_pend(1)*ratio_big(10), T_pend(1)*ratio_big(90)))

print('== ③ 2倍の図')
for l in (0.25, 0.5, 1, 2, 4):
    print(' l=%.2f T=%.3f  月 %.3f' % (l, T_pend(l), T_pend(l, 1.62)))
print(' 月/地球 = %.3f' % sqrt(9.8/1.62))
print(' 2π/√9.8 = %.4f' % (2*pi/sqrt(9.8)))

print('== 例題1 ブランコ l=2.0：T=%.3f  月 %.3f ； じぶん l=2.5：%.3f' % (T_pend(2.0), T_pend(2.0, 1.62), T_pend(2.5)))
print('== 例題2 g をはかる：l=0.800、20往復 35.9 s')
T = 35.9/20; print(' T=%.4f g=%.3f' % (T, 4*pi**2*0.8/T**2))
print(' ずれ：時間 ±0.2 s → g の範囲', 4*pi**2*0.8/(36.1/20)**2, 4*pi**2*0.8/(35.7/20)**2)
T = 22.0/10; print(' じぶん l=1.20、10往復 22.0：T=%.3f g=%.3f' % (T, 4*pi**2*1.2/T**2))
T = 30.1/15; print(' 章末 l=1.000、15往復 30.1：T=%.4f g=%.3f' % (T, 4*pi**2*1.0/T**2))
print(' 秒ふりこ l=%.4f' % (g*4/(4*pi**2)))

print('== 例題3 ばね 200 N/m・0.5 kg・A=0.10')
k, m, A = 200, 0.5, 0.10
w = sqrt(k/m); print(' ω=%.3f T=%.4f f=%.3f vmax=%.3f amax=%.2f E=%.3f v(x=0.06)=%.3f' % (w, 2*pi/w, w/2/pi, A*w, A*w*w, 0.5*k*A*A, w*sqrt(A*A-0.06**2)))
k, m, A = 800, 2.0, 0.05
w = sqrt(k/m); print(' じぶん 800・2.0・0.05: ω=%.3f T=%.4f vmax=%.3f amax=%.2f E=%.3f v(x=0.03)=%.3f' % (w, 2*pi/w, A*w, A*w*w, 0.5*k*A*A, w*sqrt(A*A-0.03**2)))
k, m, A = 50, 0.5, 0.08
w = sqrt(k/m); print(' 章末 50・0.5・0.08: ω=%.3f T=%.4f vmax=%.3f E=%.4f v(x=0.048)=%.3f' % (w, 2*pi/w, A*w, 0.5*k*A*A, w*sqrt(A*A-0.048**2)))

print('== 例題4 つるしたばね 10 mm：f=%.3f T=%.4f；じぶん 40 mm：f=%.3f；章末 25 mm：f=%.3f T=%.3f' % (
    sqrt(g/0.010)/2/pi, 2*pi*sqrt(0.010/g), sqrt(g/0.040)/2/pi, sqrt(g/0.025)/2/pi, 2*pi*sqrt(0.025/g)))
print(' 6-6 の 0.2 kg・20 N/m：x_st=%.4f T=%.4f' % (0.2*9.8/20, 2*pi*sqrt(0.2/20)))

print('== 例題5 車 300 kg・30 kN/m：ω=%.3f f=%.3f 静たわみ=%.4f；じぶん 400・25k：ω=%.3f f=%.3f x_st=%.4f' % (
    sqrt(30000/300), sqrt(30000/300)/2/pi, 300*9.8/30000, sqrt(25000/400), sqrt(25000/400)/2/pi, 400*9.8/25000))

print('== 例題6 直列・並列 100・300 N/m、1 kg')
ks = 1/(1/100+1/300); kp = 400
print(' 直列 %.2f ω=%.3f T=%.3f ; 並列 %.1f ω=%.3f T=%.3f' % (ks, sqrt(ks), 2*pi/sqrt(ks), kp, sqrt(kp), 2*pi/sqrt(kp)))
ks = 1/(1/200+1/200); kp = 400
print(' じぶん 200・200、2 kg：直列 %.1f ω=%.3f ; 並列 %.1f ω=%.3f' % (ks, sqrt(ks/2), kp, sqrt(kp/2)))
ks = 1/(1/60+1/40); kp = 100
print(' 章末 60・40、0.50 kg：直列 %.1f ω=%.3f T=%.3f; 並列 %.1f ω=%.3f T=%.3f' % (ks, sqrt(ks/0.5), 2*pi/sqrt(ks/0.5), kp, sqrt(kp/0.5), 2*pi/sqrt(kp/0.5)))

print('== 例題7 片持ちはり（力-10 例題6）＋100 kg')
E, I, L = 205e9, 1.0e-6, 1.0
k = 3*E*I/L**3; w = sqrt(k/100)
print(' k=%.4g ω=%.3f f=%.3f  静たわみ=%.5f' % (k, w, w/2/pi, 100*9.8/k))
print(' 静たわみから f=%.3f' % (sqrt(9.8/(100*9.8/k))/2/pi))
E, I, L = 205e9, 2.0e-6, 2.0
k = 48*E*I/L**3; w = sqrt(k/200)
print(' じぶん 単純支持 2.0 m・I=2e-6・200 kg：k=%.4g ω=%.3f f=%.3f' % (k, w, w/2/pi))
# はりの質量（レイリー）：片持ちはりの先 33/140
for mb in (7.85*1.0*0.01,):
    pass

print('== 例題8 大きなふれ：l=2.0、60度 T=%.3f ；じぶん l=1.0、90度 T=%.3f；章末 l=2.0、30度 %.3f' % (
    T_pend(2.0)*ratio_big(60), T_pend(1.0)*ratio_big(90), T_pend(2.0)*ratio_big(30)))

print('== 例題9 棒のふりこ')
for l in (1.0, 0.60):
    print(' l=%.2f はしで支える T=%.3f （糸 %.3f、同じ T の糸の長さ %.3f）' % (l, 2*pi*sqrt(2*l/(3*g)), T_pend(l), 2*l/3))
# チャレンジ：1.2 m の棒を、はしから 0.30 m で支える
l, a = 1.2, 0.30; d = l/2 - a
Iz = l**2/12 + d**2
print(' 章末 l=1.2、はしから0.30：d=%.2f I/m=%.4f T=%.3f' % (d, Iz, 2*pi*sqrt(Iz/(g*d))))
for d in (0.05, 0.1, 0.2, 0.3, 0.346, 0.4, 0.5, 0.6):
    print('   d=%.3f T=%.3f' % (d, 2*pi*sqrt((l**2/12+d**2)/(g*d))))

print('== 例題10 対数減衰率')
d = log(10/8); print(' 10→8：δ=%.4f ζ=%.4f ζ≈δ/2π=%.4f' % (d, d/sqrt(4*pi**2+d*d), d/2/pi))
d = log(20/8)/5; print(' じぶん 20→5回あと8.0：δ=%.4f ζ=%.4f' % (d, d/sqrt(4*pi**2+d*d)))
d = log(12/9); print(' 章末 12→9：δ=%.4f ζ=%.4f' % (d, d/sqrt(4*pi**2+d*d)))
# 山の記録の図（ζ=0.0355, ω_n 任意）
zeta = log(1.25)/sqrt(4*pi**2+log(1.25)**2)
print(' 山の並び', [round(10*0.8**n, 2) for n in range(8)])

print('== 例題11 ねじり振動')
G = 79e9
for (dd, LL, J) in ((0.010, 0.5, 0.02), (0.012, 0.6, 0.05)):
    Ip = pi*dd**4/32; kt = G*Ip/LL; w = sqrt(kt/J)
    print(' d=%.3f L=%.2f J=%.3f: Ip=%.4g kt=%.4g ω=%.3f f=%.3f' % (dd, LL, J, Ip, kt, w, w/2/pi))
# チャレンジ：針金で G をはかる d=1.0 mm, L=0.50 m, 円板 I=2.0e-3、周期 T=?
dd, LL, J = 1.0e-3, 0.50, 2.0e-3
Ip = pi*dd**4/32; kt = G*Ip/LL; T = 2*pi*sqrt(J/kt)
print(' 針金 d=1mm L=0.5 J=2e-3: kt=%.4g T=%.4f' % (kt, T))
Tm = 7.1; kt_m = 4*pi**2*J/Tm**2; Gm = kt_m*LL/Ip
print(' 測った T=7.1 → kt=%.4g G=%.4g' % (kt_m, Gm))

print('== 例題12 ばねの質量（レイリー）')
print(' 200 N/m, 0.5 kg, ばね0.15：%.3f（なし %.3f）  比 %.4f' % (sqrt(200/(0.5+0.05)), sqrt(200/0.5), sqrt(0.5/0.55)))
print(' じぶん 50 N/m, 0.20 kg, ばね0.15：%.3f（なし %.3f）' % (sqrt(50/(0.2+0.05)), sqrt(50/0.2)))
# 確かめ：ばねを10個のおもりの列に分けた固有値
def chain(k, m, ms, n=200):
    kk = k*n; mm = ms/n
    N = n
    K = np.zeros((N, N)); M = np.zeros(N)
    for i in range(N):
        K[i, i] += kk
        if i+1 < N:
            K[i, i] += kk; K[i, i+1] -= kk; K[i+1, i] -= kk
        M[i] = mm
    M[-1] = mm/2 + m
    Mi = np.diag(1/np.sqrt(M))
    ev = np.linalg.eigvalsh(Mi@K@Mi)
    return sqrt(ev[0])
print(' 細かく分けた計算（200 個）：%.3f' % chain(200, 0.5, 0.15))

print('== 例題13 クレーンの吊り荷 20 m：T=%.3f；じぶん 30 m：%.3f；15 m：%.3f' % (T_pend(20), T_pend(30), T_pend(15)))

print('== ⑩ U字管 L=0.40 m：T=%.3f' % (2*pi*sqrt(0.40/(2*g))))
print('== ⑩ RLC 10 mH・1 μF・20 Ω：ω=%.1f ζ=%.3f ；ばね 0.5・8・0.4：ω=%.1f ζ=%.3f' % (
    1/sqrt(0.01*1e-6), 20/2*sqrt(1e-6/0.01), sqrt(8/0.5), 0.4/(2*sqrt(0.5*8))))

print('== チャレンジ 車 300 kg・30 kN/m・c=3000')
m, k, c = 300, 30000, 3000
z = c/(2*sqrt(m*k)); d = 2*pi*z/sqrt(1-z*z)
print(' ζ=%.3f δ=%.3f 次の山 %.4f  ω_d=%.3f f_d=%.3f' % (z, d, exp(-d), sqrt(k/m)*sqrt(1-z*z), sqrt(k/m)*sqrt(1-z*z)/2/pi))

print('== ⑪ オイラー法・速度を先・RK（200 N/m、0.5 kg、A=0.1、dt=0.01、10周期）')
k, m = 200, 0.5; w = sqrt(k/m); dt = 0.01; n = int(round(10*2*pi/w/dt))
def energy(x, v): return 0.5*m*v*v + 0.5*k*x*x
def run(method):
    x, v = 0.1, 0.0; out = []
    for i in range(n+1):
        if i % int(round(2*pi/w/dt)) == 0 or i == n:
            out.append((round(i*dt, 3), energy(x, v)))
        a = -k/m*x
        if method == 'euler':
            x, v = x + v*dt, v + a*dt
        elif method == 'sym':
            v = v + a*dt; x = x + v*dt
        else:
            f = lambda X, V: (V, -k/m*X)
            k1 = f(x, v); k2 = f(x+k1[0]*dt/2, v+k1[1]*dt/2); k3 = f(x+k2[0]*dt/2, v+k2[1]*dt/2); k4 = f(x+k3[0]*dt, v+k3[1]*dt)
            x, v = x + dt*(k1[0]+2*k2[0]+2*k3[0]+k4[0])/6, v + dt*(k1[1]+2*k2[1]+2*k3[1]+k4[1])/6
    return out
print(' n=%d' % n)
for meth in ('euler', 'sym', 'rk'):
    print(' ', meth, [(t, round(E, 4)) for t, E in run(meth)])
# オイラー法の1歩の倍率
print(' オイラー法：1歩で (1+(ωdt)^2) 倍 = %.4f、10周期（%d 歩）で %.3f 倍' % (1+(w*dt)**2, n, (1+(w*dt)**2)**n))

print('== ⑦ 減衰比の表（δ＝2πζ/√(1−ζ²)、10回あと e^{-10δ}）')
for z in (0.01, 0.02, 0.05, 0.1):
    d = 2*pi*z/sqrt(1-z*z); print(' ζ=%.2f δ=%.4f e^-10δ=%.4f' % (z, d, exp(-10*d)))
print(' ω_d/ω_n (ζ=0.1) = %.4f' % sqrt(1-0.01))
print('== ④ はりの長さ2倍 → f 比 %.3f、厚さ2倍 → %.3f' % (sqrt(1/8), sqrt(8)))
print('== ⑤ 静たわみと f：1 mm %.2f、10 mm %.2f、40 mm %.2f、100 mm %.2f' % tuple(sqrt(9.8/x)/2/pi for x in (0.001, 0.01, 0.04, 0.1)))
print('== ⑪ ルンゲ・クッタ（dt=0.005、315歩）のエネルギー')
k, m = 200, 0.5; dt = 0.005; x, v = 0.1, 0.0
f = lambda X, V: (V, -k/m*X)
for i in range(315):
    k1 = f(x, v); k2 = f(x+k1[0]*dt/2, v+k1[1]*dt/2); k3 = f(x+k2[0]*dt/2, v+k2[1]*dt/2); k4 = f(x+k3[0]*dt, v+k3[1]*dt)
    x, v = x+dt*(k1[0]+2*k2[0]+2*k3[0]+k4[0])/6, v+dt*(k1[1]+2*k2[1]+2*k3[1]+k4[1])/6
print(' E=%.7f' % (0.5*m*v*v+0.5*k*x*x))
x, v = 0.1, 0.0; Es = []
for i in range(315):
    v += -k/m*x*dt; x += v*dt; Es.append(0.5*m*v*v+0.5*k*x*x)
print(' 速度を先：最小 %.3f 最大 %.3f' % (min(Es), max(Es)))
print(' 1.01^63 = %.3f' % (1.01**63))
print('== 例題1 月の比 %.3f、例題8 2.838×1.0732=%.3f' % (sqrt(9.8/1.62), 2.838*1.0732))
