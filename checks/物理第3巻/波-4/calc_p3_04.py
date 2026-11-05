# 波-4（tex/p3-04.tex）の数値の検算。python3 checks/物理第3巻/波-4/calc_p3_04.py
import numpy as np
from math import sqrt, pi, exp, log, atan, atan2, log10, cos, sin
def p(*a): print(*a)

p('==== 部屋のモデル（④・③）')
# 熱-11：章末問題3 の壁 U≈0.364、例題1 の複層ガラス U≈3.07
U_wall = 1/(0.11+0.15/1.6+0.10/0.04+0.04); U_win = 1/(0.11+0.003+0.17+0.003+0.04)
p('U_wall=%.4f U_win=%.4f' % (U_wall, U_win))
A_wall, A_win = 20.0, 2.0
UA = U_wall*A_wall + U_win*A_win
p('壁 %.2f W/K、窓 %.2f W/K、合計 %.2f W/K' % (U_wall*A_wall, U_win*A_win, UA))
vent = 20.0 - UA
p('すき間・換気の分（全体を 20 W/K にする）%.2f W/K → 換気量 %.1f m3/h' % (vent, vent/(1.2*1005)*3600))
R = 1/20.0; C = 72000.0
p('R=%.3f K/W, C=%.0f J/K, RC=%.0f s=%.0f 分' % (R, C, R*C, R*C/60))
air = 1.2*1005*2.4*10
p('空気（10 m2・高さ 2.4 m）の熱容量 %.0f J/K' % air)
Kp = 9/R; p('RKp=9 → Kp=%.0f W/K' % Kp)
th = (35 + 9*26)/10; p('落ち着く温度 %.2f、冷やす力 %.0f W、時定数 %.1f 分' % (th, Kp*(th-26), 60/10))

p('==== ③ 表計算（Δt=1 分）')
def room(Kp_=180.0, Ki=0.0, L=0, T=120, dt=1.0, Pmax=None, theta0=35.0, out=35.0, set_=26.0, Pextra=0.0):
    th = theta0; S = 0.0; hist = [th]*(L+1); rows = []
    for n in range(int(T/dt)+1):
        meas = hist[-(L+1)] if L > 0 else th
        e = meas - set_
        P = Kp_*e + Ki*S
        if Pmax is not None: P = min(max(P, 0.0), Pmax)
        rows.append((n*dt, th, e, S, P))
        th = th + dt*60/C*((out-th)/R - P + Pextra)
        S = S + e*dt
        hist.append(th)
    return rows
r = room()
for row in r[:4] + [r[6], r[12], r[30], r[60]]:
    p('  P だけ t=%3d θ=%.3f ε=%.3f P=%.1f' % (row[0], row[1], row[2], row[4]))
# PI：RKi=0.15/分 → Ki=3 W/(K・分)
r = room(Ki=3.0)
for row in r[:4] + [r[10], r[20], r[30], r[60], r[90], r[120]]:
    p('  PI t=%3d θ=%.3f ε=%.3f S=%.3f P=%.1f' % (row[0], row[1], row[2], row[3], row[4]))
# 厳密（9-12 の図の値）とくらべる
p('  9-12 の値 t=10:28.008 t=30:26.100 t=60:26.001')
# 積分を強くしすぎる RKi=2/分 → Ki=40
for Ki in [20.0, 40.0]:
    r = room(Ki=Ki, T=120)
    mn = min(x[1] for x in r); tmn = [x[0] for x in r if x[1] == mn][0]
    p('  積分強 Ki=%.0f（RKi=%.2f）最低 %.2f ℃ (t=%d)、t=60 %.2f t=120 %.2f' % (Ki, Ki*R, mn, tmn, r[60][1], r[120][1]))
# むだ時間
for L in [3, 5]:
    for kp in [180.0, 360.0, 720.0]:
        r = room(Kp_=kp, L=L, T=180)
        tail = [x[1] for x in r[120:]]
        p('  むだ時間 %d 分 RKp=%.0f：120〜180分の幅 %.3f〜%.3f' % (L, kp*R, min(tail), max(tail)))
# 限界の比例（むだ時間 L、1次おくれ 60 分）：位相 −ωL − atan(60ω) = −π
from scipy.optimize import brentq
for L in [3.0, 5.0]:
    f = lambda w: w*L + atan(60*w) - pi
    wu = brentq(f, 1e-4, 10)
    Ku = sqrt(1+(60*wu)**2)
    p('  L=%.0f 分：位相交差 ω=%.4f rad/分、限界 RKp=%.2f、周期 %.1f 分' % (L, wu, Ku, 2*pi/wu))

p('==== 図用（③）：P・PI・積分強・むだ時間（Δt=0.2 分）')
def coords(rows, step):
    return ' '.join('(%.1f,%.3f)' % (x[0], x[1]) for x in rows[::step])
print('%SEG P'); print(coords(room(dt=0.2, T=60), 10))
print('%SEG PI'); print(coords(room(Ki=3.0, dt=0.2, T=60), 10))
print('%SEG PIX'); print(coords(room(Ki=40.0, dt=0.2, T=60), 10))
print('%SEG DEAD9'); print(coords(room(Kp_=180.0, L=25, dt=0.2, T=120), 10))
print('%SEG DEAD18'); print(coords(room(Kp_=360.0, L=25, dt=0.2, T=120), 10))
for kp in [180.0, 300.0, 360.0]:
    r = room(Kp_=kp, L=25, dt=0.2, T=180); tail=[x[1] for x in r[600:]]
    p('  むだ時間5分 RKp=%.0f の 120〜180分 %.2f〜%.2f、最低 %.2f' % (kp*R, min(tail), max(tail), min(x[1] for x in r)))
r = room(Kp_=720.0, L=15, dt=0.2, T=120); tail=[x[1] for x in r[300:]]
p('  むだ時間3分(L=15 step×0.2) RKp=36 の 60〜120分 %.2f〜%.2f' % (min(tail), max(tail)))
r = room(Kp_=180.0, L=15, dt=0.2, T=120); tail=[x[1] for x in r[300:]]
p('  むだ時間3分 RKp=9 の 60〜120分 %.2f〜%.2f' % (min(tail), max(tail)))
r = room(Ki=40.0, dt=0.2, T=120)
mn = min(x[1] for x in r); p('  積分強（dt=0.2）最低 %.2f、t=60 %.3f' % (mn, r[300][1]))
r = room(Ki=3.0, dt=0.2, T=120); p('  PI（dt=0.2）t=10 %.3f t=30 %.3f t=60 %.3f' % (r[50][1], r[150][1], r[300][1]))

p('==== 例題1 エアコン P')
p('  26.9 ℃、ずれ 0.9 K、時定数 6 分、P=%.0f W、はじめ %.0f W' % (180*0.9, 180*9))
p('  RKp=4（じぶんで）：%.1f ℃、時定数 %.0f 分、Kp=%.0f W/K' % ((35+4*26)/5, 60/5, 4/R))

p('==== 例題2 缶コーヒーの保温ヒーター（熱-12 例題2：1000 J/K、1.2 K/W、20分）')
P = 40/1.2; p('  60℃ 保つ電力 %.1f W' % P)
for t in [20, 40, 60]:
    p('  t=%d 分 %.1f ℃ (%.1f %%)' % (t, 20+40*(1-exp(-t/20)), 100*(1-exp(-t/20))))
p('  じぶんで：お湯 840 J/K, 3.57 K/W, τ=%.0f 分、50℃ 保つ %.1f W' % (840*3.57/60, 30/3.57))
for t in [50, 150]:
    p('   t=%d 分 %.1f ℃' % (t, 20+30*(1-exp(-t/(840*3.57/60)))))

p('==== 例題3・4 2次おくれ')
for z in [0.5, 0.7, 0.71, 1/sqrt(2), 0.3]:
    p('  ζ=%.3f 行き過ぎ %.2f %%' % (z, 100*exp(-pi*z/sqrt(1-z*z))))
m, k, c = 250.0, 16000.0, 2000.0
wn = sqrt(k/m); z = c/(2*sqrt(k*m)); p('  サスペンション wn=%.1f f=%.3f ζ=%.2f 静たわみ(F=1000N) %.4f m' % (wn, wn/2/pi, z, 1000/k))
p('   行き過ぎ %.1f mm、ピーク時刻 %.3f s、整定 4/(ζwn)=%.2f s' % (1000/k*1000*exp(-pi*z/sqrt(1-z*z)), pi/(wn*sqrt(1-z*z)), 4/(z*wn)))
wn, z = 2.0, 0.5; p('  腕 K=4: ωn=2 ζ=0.5 整定 %.1f s、ピーク時刻 %.3f s' % (4/(z*wn), pi/(wn*sqrt(1-z*z))))
# 2% 整定の確かめ（数値）
import scipy.signal as sig
t = np.linspace(0, 10, 100001)
_, y = sig.step(([4.0], [1, 2, 4]), T=t)
idx = np.where(np.abs(y-1) > 0.02)[0][-1]
p('   数値の 2%% 整定 %.2f s、最大 %.4f' % (t[idx], y.max()))
p('  じぶんで K=2：ωn=%.3f ζ=%.3f 行き過ぎ %.1f%% 整定 %.1f s' % (sqrt(2), 1/sqrt(2), 100*exp(-pi/sqrt(1)), 4/1))

p('==== 例題5・6 モーター')
for Kp in [1, 0.1, 10, 4]:
    p('  Kp=%.1f 極 %.0f ずれ %.2f %%' % (Kp, -2*(1+10*Kp), 100/(1+10*Kp)))
p('  PI Kp=1 Ki=2：', np.roots([1, 22, 40]))
p('  PI Kp=1 Ki=5：', np.roots([0.5, 11, 50]))

p('==== 例題7 クルーズコントロール')
p('  τ=1000/50=%.0f s、500 N → %.0f m/s' % (1000/50, 500/50))
Kp = 450.0
for Fd in [0, 196]:
    V = (Kp*20 - Fd)/(50+Kp); p('  Kp=450 目標 20 m/s 坂の力 %d N → %.3f m/s' % (Fd, V))
p('  坂 2%%：1000×9.8×0.02 = %.0f N、時定数 %.1f s' % (1000*9.8*0.02, 1000/(50+Kp)))
p('  50 で割ると、Kp=450 でずれ %.1f %%' % (100*50/500))
p('  じぶんで Kp=950：%.2f m/s、坂で %.3f' % (950*20/1000, (950*20-196)/1000))

p('==== 例題8 ラウス')
def routh(c):
    c = [float(x) for x in c]; n = len(c)
    r1 = c[0::2]; r2 = c[1::2]
    w = (n+1)//2
    r1 += [0]*(w-len(r1)); r2 += [0]*(w-len(r2))
    T = [r1, r2]
    for i in range(n-2):
        a, b = T[-2], T[-1]
        if b[0] == 0:
            T.append([0.0]*w); break
        new = [(b[0]*a[j+1]-a[0]*b[j+1])/b[0] for j in range(w-1)] + [0]
        T.append(new)
    return [row[:w] for row in T]
for cs in [[1, 3, 3, 1+4], [1, 3, 3, 1+8], [1, 3, 3, 11], [1, 2.6, 4.8, 11.2, 8], [1, 5, 11, 19, 12], [1, 4, 6, 4, 1+3], [1, 4, 6, 4, 1+4], [1, 4, 6, 4, 1+6], [1, 3, 2, 2*3]]:
    T = routh(cs)
    col = [row[0] for row in T]
    ch = sum(1 for i in range(len(col)-1) if col[i]*col[i+1] < 0)
    p('  ', cs, '1列め', [round(x, 4) for x in col], '符号の変わる回数', ch, '極', np.round(np.roots(cs), 3))
p('  (s+1)^4+K：s1 の行 (16-4K)/5 → K<4。K=4 の極', np.round(np.roots([1, 4, 6, 4, 5]), 4))
p('  じぶんで (s+2)^4+16K：', 's^4+8s^3+24s^2+32s+16+16K')
T = routh([1, 8, 24, 32, 16+16*1]); p('   K=1 の1列め', [round(r[0], 3) for r in T])
# 条件：s1 行 = (20*32 - 8*(16+16K))/20 > 0 → 640 - 128 - 128K > 0 → K < 4
p('   K<4 の確かめ', np.round(np.roots([1, 8, 24, 32, 16+64]), 4))

p('==== 例題9 むだ時間')
p('  ω=0.5, L=2：%.1f°' % (-0.5*2*180/pi))
p('  じぶんで L=5 分, ω=0.1 rad/分：%.1f°' % (-0.5*180/pi))

p('==== 例題10 ゲイン余裕・位相余裕 G=2/(s(s+1)(s+2))')
G = lambda w: 2/(1j*w*(1j*w+1)*(1j*w+2))
wpc = sqrt(2); p('  位相交差 %.4f |G|=%.4f GM=%.2f dB' % (wpc, abs(G(wpc)), -20*log10(abs(G(wpc)))))
wgc = brentq(lambda w: abs(G(w))-1, 0.1, 2); ph = np.degrees(np.angle(G(wgc)))
ph = ph if ph < 0 else ph-360
p('  ゲイン交差 %.4f 位相 %.1f° PM=%.1f°' % (wgc, ph, 180+ph))
p('  ラウスで：s^3+3s^2+2s+2K、K<3 → 3倍 = %.2f dB' % (20*log10(3)))
G2 = lambda w: 1/(1j*w*(1j*w+1)*(1j*w+2))
wgc2 = brentq(lambda w: abs(G2(w))-1, 0.05, 2); ph2 = np.degrees(np.angle(G2(wgc2))); ph2 = ph2 if ph2 < 0 else ph2-360
p('  じぶんで 1/(s(s+1)(s+2)): |G(j√2)|=%.4f GM=%.2f dB、ゲイン交差 %.3f PM=%.1f' % (abs(G2(sqrt(2))), -20*log10(abs(G2(sqrt(2)))), wgc2, 180+ph2))
for w in [0.1, 0.3, 1, 1.414, 3, 10]:
    p('   ω=%.3f |G|dB=%.2f 位相=%.1f' % (w, 20*log10(abs(G(w))), -90-np.degrees(atan(w))-np.degrees(atan(w/2))))

p('==== 例題11 限界感度法')
Ku, Tu = 4.0, 10.0
p('  Kp=%.2f Ti=%.2f Td=%.3f' % (0.6*Ku, 0.5*Tu, 0.125*Tu))
p('  P だけ 0.5Ku=%.1f、PI 0.45Ku=%.2f Ti=Tu/1.2=%.2f' % (0.5*Ku, 0.45*Ku, Tu/1.2))
# (s+1)^3 + K の Ku=8、Tu=2π/√3
Ku, Tu = 8.0, 2*pi/sqrt(3)
p('  電気炉 Ku=8 Tu=%.3f 分 → Kp=%.1f Ti=%.3f Td=%.3f' % (Tu, 0.6*Ku, 0.5*Tu, 0.125*Tu))
# じぶんで：部屋＋むだ時間 3 分
for L in [3.0]:
    f = lambda w: w*L + atan(60*w) - pi
    wu = brentq(f, 1e-4, 10); Ku = sqrt(1+(60*wu)**2); Tu = 2*pi/wu
    p('  部屋 L=3：RKu=%.2f Tu=%.2f 分 → PID RKp=%.2f Ti=%.2f Td=%.3f' % (Ku, Tu, 0.6*Ku, 0.5*Tu, 0.125*Tu))

p('==== 例題12 倒立振子')
A = np.array([[0, 1], [4, 0]]); B = np.array([[0], [1]]); K = np.array([[8, 4]])
p('  A-BK の固有値', np.linalg.eigvals(A - B @ K))
for k1, k2 in [(8, 4), (13, 6), (20, 8)]:
    p('  k1=%d k2=%d 固有値' % (k1, k2), np.round(np.linalg.eigvals(A - B @ np.array([[k1, k2]])), 3))
p('  じぶんで：-3 の重解 k2=6, k1=9+4=13')
p('  θ(t)=0.01(1+2t)e^{-2t}: t=1 %.5f t=2 %.5f' % (0.01*3*exp(-2), 0.01*5*exp(-4)))

p('==== 章末問題')
p('基本1 RKp=19：%.2f ℃、時定数 %.1f 分' % ((35+19*26)/20, 60/20))
p('基本2 τ=5 分、t=5,10,15 → %.1f %.1f %.1f %%' % (100*(1-exp(-1)), 100*(1-exp(-2)), 100*(1-exp(-3))))
p('基本3 ζ=0.6 行き過ぎ %.1f%%、ωn=5 整定 %.2f s' % (100*exp(-pi*0.6/0.8), 4/(0.6*5)))
p('基本4 モーター Kp=4：極 %.0f ずれ %.2f%%' % (-2*41, 100/41))
p('基本5 むだ時間 0.5 s、ω=2：%.1f°' % (-1*180/pi))
p('基本6 Ku=2.5 Tu=4 s：Kp=%.2f Ti=%.1f Td=%.2f' % (1.5, 2.0, 0.5))
T = routh([1, 2, 3, 4, 5]); p('基本7 s^4+2s^3+3s^2+4s+5 1列め', [round(r[0], 3) for r in T], np.round(np.roots([1, 2, 3, 4, 5]), 3))
T = routh([2, 4, 3, 1]); p('基本8 2s^3+4s^2+3s+1', [round(r[0], 3) for r in T])
p('チャレンジ1 (s+1)^2(s+3)+K = s^3+5s^2+7s+3+K → 35>3+K → K<32')
p('   K=32 の極', np.round(np.roots([1, 5, 7, 35]), 4), ' 周期 %.3f' % (2*pi/sqrt(7)))
T = routh([1, 6, 11, 6+1]); p('チャレンジ2 s^4 ... 例：s^4+3s^3+5s^2+4s+K')
for Kk in [1, 2, 3]:
    T = routh([1, 3, 5, 4, Kk]); p('   K=%d 1列め' % Kk, [round(r[0], 4) for r in T], np.round(np.roots([1, 3, 5, 4, Kk]), 3))
# s1 行 = (b1*4 - 3*K)/b1、b1=(15-4)/3=11/3 → (44/3 - 3K)/(11/3) > 0 → K < 44/9
p('   条件 K<44/9=%.4f' % (44/9), np.round(np.roots([1, 3, 5, 4, 44/9]), 4))
p('チャレンジ3 2/(s(s+1)(s+2)) に 1.5 倍：GM %.2f dB' % (20*log10(3/1.5)))
p('チャレンジ4 クレーン（波-3 ⑨）ω=%.3f' % sqrt(9.8/20*1.5))
