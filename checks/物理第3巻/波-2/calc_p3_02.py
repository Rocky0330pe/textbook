# 波-2　ゆすり方で変わるゆれ：強制振動と共振 の数値の検算（組 波W1）
# 実行：python3 checks/物理第3巻/波-2/calc_p3_02.py > checks/物理第3巻/波-2/calc_p3_02_out.txt
from math import pi, sqrt, atan2, degrees, log, log10, exp, cos, sin
import numpy as np

def amp(r, z):  # 倍率 |X|/(F0/k)
    return 1/sqrt((1-r*r)**2 + (2*z*r)**2)
def phase(r, z):  # おくれ（度）
    return degrees(atan2(2*z*r, 1-r*r))
def TR(r, z):
    return sqrt(1+(2*z*r)**2)/sqrt((1-r*r)**2+(2*z*r)**2)

m, k, c, F0 = 0.5, 8.0, 0.4, 0.8
wn = sqrt(k/m); z = c/(2*sqrt(m*k))
print('== 6-13 のばね：ω_n=%.3f ζ=%.3f F0/k=%.3f' % (wn, z, F0/k))
print(' 最大の倍率 1/(2ζ√(1-ζ²)) = %.4f、山の ω=%.4f' % (1/(2*z*sqrt(1-z*z)), wn*sqrt(1-2*z*z)))
print(' ω=ω_n での倍率 1/(2ζ)=%.3f、振幅 %.3f m' % (1/(2*z), F0/k/(2*z)))
# 半値幅（数値で）
ws = np.linspace(2, 6, 400001)
A = np.array([amp(w/wn, z) for w in ws[::100]])
wsr = ws[::100]
Amax = A.max(); idx = np.where(A >= Amax/sqrt(2))[0]
w1, w2 = wsr[idx[0]], wsr[idx[-1]]
print(' 半値幅：%.4f〜%.4f、はば %.4f（2ζω_n=%.3f）、Q=ω_n/はば=%.3f（1/(2ζ)=%.1f）' % (w1, w2, w2-w1, 2*z*wn, wn/(w2-w1), 1/(2*z)))
print(' 6-13 の表との照合：', [(w, round(F0/k*amp(w/wn, z), 3)) for w in (1, 2, 3, 3.5, 3.8, 4, 4.2, 4.5, 5, 6, 8)])
print(' 位相：', [(w, round(phase(w/wn, z), 1)) for w in (1, 2, 3, 3.5, 4, 4.5, 5, 6, 8)])
# 共振の振幅をエネルギーで：1周に失う π c ω X² ＝ 力がする仕事 π F0 X
print(' エネルギーで：X=F0/(cω_n)=%.3f' % (F0/(c*wn)))

print('== ③ 表計算（6-13②と同じ：Δt=0.01、速度を先に）で、ω ごとの落ち着いた振幅（30〜40 s の最大）')
def sim(w, T=40.0, dt=0.001):
    x = v = 0.0; t = 0.0; mx = 0.0; xs = []
    n = int(T/dt)
    for i in range(n):
        a = (F0*cos(w*t) - c*v - k*x)/m
        v += a*dt; x += v*dt; t += dt
        if t > 30: mx = max(mx, abs(x))
        if i % int(0.1/dt) == 0: xs.append((round(t, 2), x))
    return mx, xs
for w in (1, 2, 3, 3.5, 3.8, 4, 4.2, 4.5, 5, 6, 8):
    mx, _ = sim(w)
    print('  ω=%.1f 表計算 %.3f  式 %.3f' % (w, mx, F0/k*amp(w/wn, z)))
# ゆすり始めの図の点（ω=4、0〜20 s、0.5 s ごと）
_, xs = sim(4.0, T=20.0, dt=0.001)
print(' ω=4 のゆれ（0.5 s ごと）：', [(t, round(x, 3)) for t, x in xs if abs(t*2 - round(t*2)) < 1e-6][:41])
_, xs = sim(3.0, T=20.0, dt=0.001)
print(' ω=3 のゆれ（0.5 s ごと）：', [(t, round(x, 3)) for t, x in xs if abs(t*2 - round(t*2)) < 1e-6][:41])

print('== 2倍の図：ζ を 0.05・0.1・0.2 にした山の高さ')
for zz in (0.05, 0.1, 0.2, 0.5):
    print('  ζ=%.2f 山 %.3f 山の r %.4f  2ζω_n=%.3f' % (zz, 1/(2*zz*sqrt(1-zz*zz)) if zz < 0.7 else 1, sqrt(1-2*zz*zz), 2*zz*wn))

print('== 例題3 洗濯機 40 kg・50 kN/m')
M, K = 40, 50e3
wn3 = sqrt(K/M); f3 = wn3/2/pi
print(' ω_n=%.3f f_n=%.3f Hz = 毎分 %.1f 回転' % (wn3, f3, f3*60))
print(' 静たわみ %.4f m' % (M*9.8/K))

print('== 例題4 ポンプ 1500 rpm、床への力 1/10（ζ=0）')
f = 1500/60; r = sqrt(11); fn = f/r; xst = 9.8/(2*pi*fn)**2
print(' r=%.4f f_n=%.3f 静たわみ=%.5f m' % (r, fn, xst))
print(' じぶん 1800 rpm で 1/8：r=%.4f f_n=%.3f x_st=%.5f' % (3, 30/3, 9.8/(2*pi*10)**2))

print('== 例題5 伝達率')
for zz in (0, 0.1, 0.3):
    print('  ζ=%.1f r=√2 %.3f  r=2 %.3f  r=3 %.3f  r=1 %s' % (zz, TR(sqrt(2), zz), TR(2, zz), TR(3, zz), ('%.2f' % TR(1, zz)) if zz else '∞'))
print('  じぶん r=4：ζ=0 %.4f ζ=0.2 %.4f' % (TR(4, 0), TR(4, 0.2)))

print('== 例題6 不つり合い 1 g・0.1 m・3000 rpm：F=%.3f N' % (0.001*0.1*(3000/60*2*pi)**2))
print('  じぶん 2 g・0.05 m・6000 rpm：F=%.3f N' % (0.002*0.05*(6000/60*2*pi)**2))

print('== 例題7 洗濯機の片寄り 0.5 kg・0.25 m、本体 40 kg、ζ=0.1')
mee = 0.5*0.25; M = 40.0; zeta = 0.1
for rpm in (200, 300, 338, 400, 600, 800):
    w = rpm/60*2*pi; r = w/wn3
    X = mee/M*r*r*amp(r, zeta)
    print('  毎分%d回転 r=%.3f 振幅 %.2f mm' % (rpm, r, X*1000))
print('  r→大で m_e e/M = %.2f mm' % (mee/M*1000))
print('  共振 r=1：%.2f mm' % (mee/M/(2*zeta)*1000))
print('  800回転の力 m_e e ω² = %.0f N' % (mee*(800/60*2*pi)**2))

print('== 例題8 危険速度 d=20 mm、L=0.8 m、5 kg')
E = 205e9; d = 0.020; L = 0.8; I = pi*d**4/64
kk = 48*E*I/L**3; wc = sqrt(kk/5)
print(' I=%.4g k=%.4g ω_c=%.3f 毎分 %.0f 回転' % (I, kk, wc, wc*60/2/pi))
d = 0.025; I = pi*d**4/64; kk = 48*E*I/0.8**3; wc = sqrt(kk/5)
print(' じぶん d=25 mm：I=%.4g k=%.4g ω_c=%.3f 毎分 %.0f 回転' % (I, kk, wc, wc*60/2/pi))
d = 0.020; I = pi*d**4/64; kk = 48*E*I/1.0**3; wc = sqrt(kk/8)
print(' 章末 d=20 mm、L=1.0、8 kg：k=%.4g ω_c=%.3f 毎分 %.0f 回転' % (kk, wc, wc*60/2/pi))

print('== 例題9 うねり 10 m・f_n=1.5 Hz：v=%.1f m/s = %.0f km/h' % (15, 15*3.6))
print('  じぶん 6 m・1.2 Hz：v=%.1f m/s = %.1f km/h' % (7.2, 7.2*3.6))
print('  車のゆれの大きさ（ζ=0.3、r=1）=%.2f 倍' % TR(1, 0.3))

print('== 例題10 ボード線図 ζ=0.1')
for r in (0.1, 0.5, 1, 2, 10):
    a = amp(r, 0.1)
    print('  r=%.1f 倍率 %.4f  %.2f dB  おくれ %.1f 度' % (r, a, 20*log10(a), phase(r, 0.1)))
print('  じぶん ζ=0.2：', [(r, round(20*log10(amp(r, 0.2)), 2), round(phase(r, 0.2), 1)) for r in (0.1, 1, 10)])
# ボード線図の点（ζ=0.1, 0.3）
for zz in (0.05, 0.1, 0.3, 0.7):
    print('  bode ζ=%.2f' % zz, ' '.join('(%.3f,%.2f)' % (lg, 20*log10(amp(10**lg, zz))) for lg in np.arange(-1, 1.001, 0.1)))

print('== 例題11 音さ 440 Hz、10 s で振幅 1/10 → Q')
w = 2*pi*440; zeta = log(10)/(w*10); print('  ζ=%.3g Q=%.0f' % (zeta, 1/(2*zeta)))
w = 2*pi*1000; zeta = log(10)/(w*2.0); print('  じぶん 1000 Hz、2.0 s で 1/10：Q=%.0f' % (1/(2*zeta)))
print('  6-13 のばね Q=5 → 1/10 になる回数 ln10/(2πζ)=%.2f 回' % (log(10)/(2*pi*0.1)))

print('== 例題12 煙突 d=1 m、10 m/s、St=0.2 → f=%.2f Hz；f_n=1.5 Hz なら v=%.2f m/s' % (0.2*10/1, 1.5*1/0.2))
print('  じぶん d=0.5 m、f_n=3.0 Hz → v=%.2f m/s' % (3.0*0.5/0.2))
print('  章末 d=2.0 m、f_n=0.80 Hz → v=%.2f m/s、10 m/s では %.2f Hz' % (0.8*2/0.2, 0.2*10/2))

print('== Q とエネルギー：2π×たくわえ/1周の損失 = k/(cω_n) = %.3f' % (k/(c*wn)))
print('== 章末')
print(' 洗濯機 50 kg・80 kN/m：f=%.3f 毎分 %.0f' % (sqrt(80e3/50)/2/pi, sqrt(80e3/50)/2/pi*60))
print(' ζ=0.05 の最大倍率 %.2f、Q=%.0f' % (1/(2*0.05*sqrt(1-0.0025)), 10))
print(' 不つり合い 5 g・0.2 m・1800 rpm：%.2f N' % (0.005*0.2*(30*2*pi)**2))
print(' 1200 rpm モーター、力を 1/5（ζ=0）：r=%.4f f_n=%.3f x_st=%.5f' % (sqrt(6), 20/sqrt(6), 9.8/(2*pi*20/sqrt(6))**2))
print(' ボード ζ=0.05 r=1：%.2f dB' % (20*log10(amp(1, 0.05))))
print(' 道 8 m・f_n 1.25 Hz → %.1f m/s = %.0f km/h' % (8*1.25, 8*1.25*3.6))
# 基礎の励振：r=√2 で 1、r=3 で（ζ=0.3）
print(' 車 ζ=0.3：r=1 %.3f、r=3 %.3f' % (TR(1, 0.3), TR(3, 0.3)))
print(' 章末 洗濯機 60 kg・60 kN/m：f=%.3f 毎分 %.0f' % (sqrt(60e3/60)/2/pi, sqrt(60e3/60)/2/pi*60))
print(' 例題2 じぶん m=1,k=100,c=1,F0=2：ζ=%.3f X=%.3f たくわえ %.3f 損失 %.4f Q=%.2f' % (1/(2*10), 2/(1*10), 0.5*100*0.04, pi*1*10*0.04, 2*pi*2/(pi*1*10*0.04)))
print(' 例題2 6-13：たくわえ %.3f 損失 %.4f Q=%.3f' % (0.5*8*0.25, pi*0.4*4*0.25, 2*pi*1/(pi*0.4*4*0.25)))
print(' 例題1 じぶん m=1,k=100,c=1：ζ=%.3f 山 %.3f Q≈%.0f はば≈%.2f' % (0.05, 1/(2*0.05*sqrt(1-0.0025)), 10, 2*0.05*10))
print(' 章末 ζ=0.05, ω_n=4：山 %.2f Q=%.0f はば %.2f' % (1/(2*0.05*sqrt(1-0.0025)), 10, 2*0.05*4))
print(' 例題11 1/Q decay per cycle Q=5: %.3f, Q=1000: %.4f' % (exp(-pi/5), exp(-pi/1000)))
print(' 例題12 じぶん d=0.5、f_n=2.4：v=%.2f' % (2.4*0.5/0.2))
