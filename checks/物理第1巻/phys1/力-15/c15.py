# 力-15 の数値（組 P1-8）。g=9.8、空気 20℃: rho=1.2（本文の見当。巻末 1.204）, mu=1.8e-5, nu=1.5e-5、水 nu=1.0e-6
import math
g = 9.8; rho_a = 1.2; mu_a = 1.8e-5; nu_a = 1.5e-5; nu_w = 1.0e-6; rho_w = 1000
def morrison(Re):
    return (24/Re + 2.6*(Re/5)/(1+(Re/5)**1.52) + 0.411*(Re/2.63e5)**-7.94/(1+(Re/2.63e5)**-8)
            + 0.25*(Re/1e6)/(1+Re/1e6))
print('=== 例題1 車の模型 1/10: 本物 100 km/h（27.8 m/s）, 長さ 4.5 m')
v = 100/3.6; Lr = 4.5; Re = v*Lr/nu_a
print('Re real=%.3e  model air v=%.1f m/s (%.0f km/h)  model water v=%.2f m/s' % (Re, v*10, v*10*3.6, v*10*nu_w/nu_a))
print(' speed of sound 340 -> Mach', v*10/340)
print('=== 例題2 船 1/25, 本物 10 m/s -> 模型', 10/math.sqrt(25), ' Fr=', 10/math.sqrt(g*100))
print('    本物の船 100 m -> 模型 4 m;  Re real', 10*100/nu_w, ' model', 2*4/nu_w)
print('=== 例題4 雨つぶ d=2mm C_D=0.6')
d = 2e-3; m = rho_w*math.pi*d**3/6; A = math.pi*d**2/4
vt = math.sqrt(2*m*g/(rho_a*0.6*A)); print('m=%.3e A=%.3e vt=%.3f Re=%.0f' % (m, A, vt, vt*d/nu_a))
print(' C_D(morrison at Re)=', morrison(vt*d/nu_a), ' 観測 6.49 m/s')
print(' simplified: vt=sqrt(4 rho_w g d/(3 rho_a C_D)) =', math.sqrt(4*rho_w*g*d/(3*rho_a*0.6)))
print('=== 例題5 霧つぶ r=10um, ストークス')
r = 10e-6; m = rho_w*4/3*math.pi*r**3
vt = m*g/(6*math.pi*mu_a*r); print('m=%.3e vt=%.4f m/s Re=%.4f' % (m, vt, rho_a*vt*2*r/mu_a))
print(' with buoyancy:', 2*r**2*(rho_w-rho_a)*g/(9*mu_a))
print('=== 例題6 車 C_D=0.3 A=2.2')
for kmh in (50, 100, 120):
    v = kmh/3.6; F = 0.5*rho_a*0.3*2.2*v**2
    print(kmh, 'km/h: v=%.3f F=%.1f N P=%.2f kW' % (v, F, F*v/1000))
print('=== 例題7 野球 d=73mm C_D=0.35 v=40')
d = 0.073; A = math.pi*d**2/4; F = 0.5*rho_a*0.35*A*40**2
print('A=%.4e F=%.3f weight=%.3f Re=%.3e' % (A, F, 0.145*g, 40*d/nu_a))
print('=== 例題8 電線 d=10mm v=10 St=0.2 ->', 0.2*10/0.01, 'Hz Re=', 10*0.01/nu_a)
print('    d=10mm v=5 ->', 0.2*5/0.01, '  d=30mm v=10 ->', 0.2*10/0.03)
print('=== 例題9 旅客機 70 t S=125 v=75')
CL = 2*70000*g/(rho_a*125*75**2); print('CL=%.3f' % CL, ' at 230 m/s cruise rho=0.38:', 2*70000*g/(0.38*125*230**2))
print('    v=60:', 2*70000*g/(rho_a*125*60**2))
print('=== 例題10 平板の境界層 air 10 m/s x=0.5, 1.0')
for x in (0.25, 0.5, 1.0):
    Re = 10*x/nu_a; print(x, 'Re=%.3e delta=%.2f mm' % (Re, 5*x/math.sqrt(Re)*1000))
print('=== 例題11 送風機 n 80%: Q', 0.8, ' H', 0.8**2, ' P', 0.8**3, ' n 50% P', 0.5**3)
print('=== 例題12 雨つぶ v=3 m/s (vt=6) の加速度 a=g(1-(v/vt)^2):', g*(1-(3/6)**2), ' 3/4 g')
print('=== 例題13 Π 定理の指数 (rho^a v^b d^c mu): F/(rho v^2 d^2) と Re')
import numpy as np
# 次元 [M, L, T] : rho (1,-3,0), v (0,1,-1), d (0,1,0); F (1,1,-2); mu (1,-1,-1)
Mx = np.array([[1,0,0],[-3,1,1],[0,-1,0]], float)
print(' F exps', np.linalg.solve(Mx, [1,1,-2]), ' mu exps', np.linalg.solve(Mx, [1,-1,-1]), ' dp exps', np.linalg.solve(Mx, [1,-1,-2]))
print(' det', np.linalg.det(Mx), ' inv', np.linalg.inv(Mx))
print('=== te: C_D-Re 表')
for Re in (0.1, 1, 10, 100, 1e3, 1e4, 1e5, 2e5, 3e5, 4e5, 1e6):
    print(' Re=%g C_D=%.3f stokes=%.3f' % (Re, morrison(Re), 24/Re))
print('=== te: 落ちる雨つぶのシミュレーション (オイラー法 dt=0.1, c/m)')
d = 2e-3; m = rho_w*math.pi*d**3/6; A = math.pi*d**2/4; c = 0.5*rho_a*0.6*A
v = 0; t = 0; dt = 0.1
print(' c/m=%.4f' % (c/m))
for i in range(12):
    v = v + (g - c/m*v**2)*dt; t += dt
    if i % 1 == 0: print('  %.1f %.3f' % (t, v))
print('=== te: コーヒーフィルター vt ∝ sqrt(m): 1,2,4枚 ->', [round(math.sqrt(n),3) for n in (1,2,4)])
# フィルター 1 枚: m=1.0 g, vt=1.0 m/s のとき C_D A = 2 m g/(rho vt^2)
m1 = 1.0e-3; print(' CdA for vt=1.0, m=1g:', 2*m1*g/(1.2*1.0**2))
# 下の 1 m を通る時間（2 m から落とす）を数値で
for n in (1,2,4):
    m = n*m1; CdA = 2*m1*g/1.2; c = 0.5*1.2*CdA; v=0; y=0; t=0; dt=1e-4; t1=None
    while y < 2.0:
        v += (g - c/m*v*v)*dt; y += v*dt; t += dt
        if t1 is None and y >= 1.0: t1 = t
    print('  n=%d vt=%.3f t_total=%.3f t_lower1m=%.3f' % (n, math.sqrt(2*m*g/(1.2*CdA)), t, t-t1))
print('=== 入試1 深い水の波の速さ v=C sqrt(g lambda), C=1/sqrt(2pi)=', 1/math.sqrt(2*math.pi), ' lambda=10 m ->', math.sqrt(9.8*10/(2*math.pi)))
print('    lambda 4倍 -> 2倍')
print('=== 入試2 vt, v=vt/2 a=3/4 g; time scale vt/g')
print('=== 2倍の図: v^2: drag 4x power 8x')
print('=== 送風機: 回転数 100% P=1 ->', [(n, round(n**3,3)) for n in (1.0, 0.9, 0.8, 0.7, 0.6, 0.5)])
print('=== ポンプの相似則：直径2倍、回転数同じ: Q x8, H x4, P x32')
print('=== 球の C_D の危機: Re 2e5..5e5 values', [(R, round(morrison(R),3)) for R in (1e5, 2e5, 2.5e5, 3e5, 3.5e5, 4e5, 5e5)])
print('=== ゴルフボール d=42.7mm, 70 m/s Re=', 70*0.0427/nu_a, ' 20 m/s', 20*0.0427/nu_a)
print('=== ストークスの式から b: 6 pi mu r for r=10 um', 6*math.pi*mu_a*r)
print('=== 振り子：l=1 m T=', 2*math.pi*math.sqrt(1/9.8), ' l=4 m', 2*math.pi*math.sqrt(4/9.8))
print('=== 例題1 jibun: 1/5 の模型, 本物 20 m/s 長さ 2 m (バイク) -> model air ', 20*5, ' water', 20*5/15)
print('=== 例題2 jibun: 1/16 模型, 本物 8 m/s ->', 8/4)
print('=== 例題6 jibun: 120 km/h 消費', 0.5*1.2*0.3*2.2*(120/3.6)**3/1000)
print('=== 例題4 jibun: 雹 d=10mm rho=900 C_D=0.5:', math.sqrt(4*900*9.8*0.01/(3*1.2*0.5)))
print('=== 例題5 jibun: 霧 r=5um ->', (1000*4/3*math.pi*(5e-6)**3)*9.8/(6*math.pi*mu_a*5e-6))
print('=== 例題7 jibun: サッカーボール d=0.22 m C_D=0.25 v=30 m/s; mass 0.43:', 0.5*1.2*0.25*math.pi*0.22**2/4*900, 0.43*9.8)
print('=== 例題8 jibun: 煙突 d=2 m 風 10 m/s ->', 0.2*10/2)
print('=== 例題9 jibun: 小型機 1 t S=16 m^2 v=30 ->', 2*1000*9.8/(1.2*16*30**2))
print('=== 例題10 jibun: x=0.3 m, 5 m/s ->', 5*0.3/math.sqrt(5*0.3/nu_a)*1000, 'Re', 5*0.3/nu_a)
print('=== 例題11 jibun: n 70% ->', 0.7**3, ' 90%', 0.9**3)
print('=== 例題12 jibun: vt=55 skydiver, v=27.5 a=', 9.8*0.75, ' v=44 ->', 9.8*(1-(44/55)**2))
print('=== 例題13 jibun: 落ちる時間? (dp exps above)')
