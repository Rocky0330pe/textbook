# 第9巻 研究担当（R9）の検算。numpy・scipy だけを使う。
import numpy as np
from scipy import integrate, special, linalg, signal
np.set_printoptions(precision=5, suppress=True)
P = print
pi = np.pi

P("=== 9-1 方形波（4-9 と同じ高さ pi/4 の形） ===")
def sq_part(theta, N):  # sin t + sin3t/3 + ... の N 項
    return sum(np.sin((2*k+1)*theta)/(2*k+1) for k in range(N))
for N in [1, 2, 3, 4, 10, 100]:
    P("N=%d 項, 90度での値 %.5f" % (N, sq_part(pi/2, N)))
P("pi/4 =", pi/4)
# ギブズ：高さ pi/4 の形での山の高さ
t = np.linspace(1e-6, pi/2, 200001)
for N in [4, 10, 50, 200]:
    y = sq_part(t, N); i = y.argmax()
    P("N=%d 項: 山 %.5f（pi/4 の %.4f 倍）at t=%.5f rad" % (N, y[i], y[i]/(pi/4), t[i]))
Si_pi = special.sici(pi)[0]
P("Si(pi)=%.6f, 高さ1の方形波の山の極限 (2/pi)Si(pi)=%.6f, とび（2）に対する行きすぎ %.4f" % (Si_pi, 2/pi*Si_pi, (2/pi*Si_pi-1)/2))

P("=== 9-1 表計算で係数を見つける（方形波×sin nt の平均） ===")
M = 36
tt = (np.arange(M)+0.5)*2*pi/M
sq = np.sign(np.sin(tt))  # 高さ1
for n in range(1, 8):
    P("n=%d: 平均(f sin nt) = %.5f, 2倍 = %.5f, 4/(n pi) [奇数] = %.5f" % (n, np.mean(sq*np.sin(n*tt)), 2*np.mean(sq*np.sin(n*tt)), 4/(n*pi) if n%2 else 0))

P("=== のこぎり波 f(t)=t（-pi<t<pi） ===")
for n in range(1, 5):
    I = integrate.quad(lambda t: t*np.sin(n*t), -pi, pi)[0]
    P("n=%d: int t sin nt = %.6f, 2pi(-1)^(n+1)/n=%.6f, b_n = %.5f" % (n, I, 2*pi*(-1)**(n+1)/n, I/pi))
P("int_0^pi t sin t dt =", integrate.quad(lambda t: t*np.sin(t), 0, pi)[0])

P("=== 9-1 熱方程式：棒 L=0.1 m, alpha=1e-4。はじめ一様 100 度、両はし 0 度 ===")
L = 0.1; al = 1e-4; T0 = 100.0
def Tser(x, t, N=2001):
    s = 0.0
    for n in range(1, N+1, 2):
        s += 4*T0/(n*pi)*np.exp(-al*(n*pi/L)**2*t)*np.sin(n*pi*x/L)
    return s
for t in [0.5, 1, 2, 5, 7, 10, 20, 30]:
    one = 4*T0/pi*np.exp(-al*(pi/L)**2*t)
    P("t=%5.1f s: まん中 series %.3f, 1項だけ %.3f, 3項 %.3f" % (t, Tser(L/2, t), one, Tser(L/2, t, 5)))
from scipy.optimize import brentq
t50 = brentq(lambda t: Tser(L/2, t)-50, 1, 30)
P("まん中が50度になる時刻 %.3f s; 1項だけで %.3f s" % (t50, np.log(4/pi*T0/50)/(al*(pi/L)**2)))
P("alpha (pi/L)^2 = %.5f /s, 9倍 %.4f, 25倍 %.4f" % (al*(pi/L)**2, 9*al*(pi/L)**2, 25*al*(pi/L)**2))
# 表計算（8-13 と同じ dx=0.01, dt=0.25, r=0.25）
dx = 0.01; dt = 0.25; r = al*dt/dx**2
u = np.full(11, T0); u[0] = u[-1] = 0.0
tcross = None; tcur = 0.0
rec = {}
while tcur < 30-1e-9:
    un = u.copy(); un[1:-1] = u[1:-1] + r*(u[2:]-2*u[1:-1]+u[:-2]);
    if tcross is None and un[5] <= 50: tcross = tcur+dt
    u = un; tcur += dt
    for tc in [1, 2, 5, 7, 10, 20]:
        if abs(tcur-tc) < 1e-9: rec[tc] = u[5]
P("表計算 r=%.2f: まん中 %s, 50度を下回る最初の時刻 %.2f s" % (r, {k: round(v, 3) for k, v in rec.items()}, tcross))
# 細かい表計算
dx = 0.001; dt = 0.0025; u = np.full(101, T0); u[0] = u[-1] = 0; tcur = 0; tc2 = None
while tcur < 12:
    u[1:-1] = u[1:-1] + al*dt/dx**2*(u[2:]-2*u[1:-1]+u[:-2]); tcur += dt
    if tc2 is None and u[50] <= 50: tc2 = tcur
P("細かい表計算（dx=0.001）: 50度 %.3f s" % tc2)
P("8-13 の sin の形：alpha a^2 = %.5f, 半分になる時間 %.3f s" % (al*(pi/0.1)**2, np.log(2)/(al*(pi/0.1)**2)))

P("=== 9-1 弦（ギター）===")
Ls = 0.65; f1 = 110.0
c = 2*Ls*f1
P("A弦 110 Hz, L=0.65 m -> c = %.1f m/s, 倍音 %s" % (c, [f1*n for n in range(1, 6)]))
# まん中をつまんではなす（高さ h、三角形）：b_n = 8h/(n^2 pi^2) sin(n pi/2)
for n in range(1, 8):
    P("  まん中: n=%d b_n/h = %.4f ; 1/5 の所: %.4f" % (n, 8/(n*pi)**2*np.sin(n*pi/2), 2*np.sin(n*pi*0.2)/(n**2*pi**2*0.2*0.8)))

P("=== 9-2 直交性（表計算 12 点・36 点） ===")
for M in [12, 36]:
    tt = np.arange(M)*2*pi/M
    P("M=%d: sum sin t sin2t dt=%.2e, sum sin^2 t dt = %.5f (=pi), sum sin t cos t dt=%.2e" % (
        M, np.sum(np.sin(tt)*np.sin(2*tt))*2*pi/M, np.sum(np.sin(tt)**2)*2*pi/M, np.sum(np.sin(tt)*np.cos(tt))*2*pi/M))
P("ベクトル (sin) 12成分の内積: sin・sin2t =", np.dot(np.sin(np.arange(12)*pi/6), np.sin(2*np.arange(12)*pi/6)))
# 三角波 f(t)=|t|（-pi..pi）の a_n
for n in range(0, 6):
    a = integrate.quad(lambda t: abs(t)*np.cos(n*t), -pi, pi)[0]/pi
    P("|t|: a_%d = %.5f ; 式 -4/(pi n^2)（奇数）= %s" % (n, a, "%.5f" % (-4/(pi*n*n)) if n % 2 else "-"))
# sin^3 t = (3 sin t - sin 3t)/4、cos^2 t = (1+cos 2t)/2
P("sin^3: b1=%.4f b3=%.4f" % (integrate.quad(lambda t: np.sin(t)**3*np.sin(t), -pi, pi)[0]/pi, integrate.quad(lambda t: np.sin(t)**3*np.sin(3*t), -pi, pi)[0]/pi))
# パーセバル・ひずみ率
s = sum((4/(n*pi))**2/2 for n in range(1, 200001, 2))
P("方形波（高さ1）の実効値^2 = 1, 係数から %.6f; pi^2/8 = %.6f, 1+1/9+1/25+... = %.6f" % (s, pi**2/8, sum(1/n**2 for n in range(1, 200001, 2))))
P("方形波のひずみ率 THD = sqrt(pi^2/8-1) = %.4f" % np.sqrt(pi**2/8-1))
P("基本波の実効値 = (4/pi)/sqrt2 = %.4f" % (4/pi/np.sqrt(2)))
# 熱：はじめの温度が x（直線）で両はし0 → 半区間 sin 展開 b_n = 2/L int_0^L f sin
for n in range(1, 5):
    b = 2/L*integrate.quad(lambda x: 100*x/L*np.sin(n*pi*x/L), 0, L)[0]
    P("f=100x/L のとき b_%d = %.4f ; 式 200(-1)^(n+1)/(n pi) = %.4f" % (n, b, 200*(-1)**(n+1)/(n*pi)))
# 三角形の温度（まん中 100、はし 0）
for n in range(1, 6):
    b = 2/L*integrate.quad(lambda x: 100*(1-abs(2*x/L-1))*np.sin(n*pi*x/L), 0, L)[0]
    P("三角形 b_%d = %.4f ; 800/(n^2 pi^2) sin(n pi/2) = %.4f" % (n, b, 800/(n*pi)**2*np.sin(n*pi/2)))

P("=== 9-3 複素フーリエ係数 ===")
for n in [-3, -1, 1, 3, 2]:
    c = integrate.quad(lambda t: np.sign(np.sin(t))*np.cos(n*t), -pi, pi)[0]/(2*pi) - 1j*integrate.quad(lambda t: np.sign(np.sin(t))*np.sin(n*t), -pi, pi)[0]/(2*pi)
    P("方形波 c_%d = %s ; 2/(j n pi)=%s" % (n, np.round(c, 5), np.round(2/(1j*n*pi), 5) if n % 2 else 0))
for n in [1, 2, 3]:
    c = (integrate.quad(lambda t: t*np.cos(n*t), -pi, pi)[0] - 1j*integrate.quad(lambda t: t*np.sin(n*t), -pi, pi)[0])/(2*pi)
    P("のこぎり波 c_%d = %s ; j(-1)^n/n = %s" % (n, np.round(c, 5), np.round(1j*(-1)**n/n, 5)))
# RC フィルター（3-12：折れ点 100 Hz）に 50 Hz の方形波（高さ1）
fc = 100.0; tau = 1/(2*pi*fc); f0 = 50.0
P("RC: tau = %.6f s" % tau)
for n in [1, 3, 5, 7]:
    G = 1/(1+1j*2*pi*n*f0*tau)
    P("  n=%d (%d Hz): 入力振幅 %.4f, |G|=%.4f, 出力振幅 %.4f, おくれ %.1f 度" % (n, n*f0, 4/(n*pi), abs(G), 4/(n*pi)*abs(G), -np.degrees(np.angle(G))))
# 輪の熱：半径 R、周の長さ 2 pi R
R = 0.05
P("輪 R=0.05 m: e^{jn theta} の減り方 alpha n^2/R^2: n=1 %.4f /s, n=2 %.4f /s" % (al/R**2, 4*al/R**2))

P("=== 9-4 フーリエ変換 ===")
a = 1.0
for w in [0, 1, pi/2, pi, 2*pi]:
    F = integrate.quad(lambda t: np.cos(w*t), -a, a)[0]
    P("方形パルス(幅2): F(%.3f) = %.5f ; 2 sin(w)/w = %.5f" % (w, F, 2*np.sin(w)/w if w else 2))
for w in [0, 1, 2]:
    F = integrate.quad(lambda t: np.exp(-t**2/2)*np.cos(w*t), -np.inf, np.inf)[0]
    P("ガウス e^{-t^2/2}: F(%g) = %.5f ; sqrt(2pi) e^{-w^2/2} = %.5f" % (w, F, np.sqrt(2*pi)*np.exp(-w**2/2)))
for w in [0, 1, 2]:
    re = integrate.quad(lambda t: np.exp(-2*t)*np.cos(w*t), 0, np.inf)[0]; im = -integrate.quad(lambda t: np.exp(-2*t)*np.sin(w*t), 0, np.inf)[0]
    P("e^{-2t}（t>=0）: F(%g) = %.5f%+.5fj ; 1/(2+jw) = %s" % (w, re, im, np.round(1/(2+1j*w), 5)))
# ガウスの幅：sigma_t と sigma_w
for sg in [0.5, 1, 2]:
    P("e^{-t^2/(2 s^2)} の変換は e^{-s^2 w^2/2}：s=%.1f -> 周波数側の幅 1/s = %.2f" % (sg, 1/sg))
# DFT（サンプリング 8000 Hz, N=8000 → 1 Hz きざみ）
fs = 8000; N = 8000; tt = np.arange(N)/fs
x = np.sin(2*pi*440*tt) + 0.5*np.sin(2*pi*880*tt) + 0.25*np.sin(2*pi*1320*tt)
X = np.fft.rfft(x); f = np.fft.rfftfreq(N, 1/fs); amp = 2*abs(X)/N
idx = np.argsort(amp)[-3:]
P("FFT のピーク:", sorted([(f[i], round(amp[i], 4)) for i in idx]))
# エイリアシング
x7 = np.cos(2*pi*7000*np.arange(16)/fs); x1 = np.cos(2*pi*1000*np.arange(16)/fs)
P("7000 Hz を 8000 Hz でとると 1000 Hz と同じ点:", np.allclose(x7, x1))
# 車輪：毎秒24コマ、スポーク8本、1秒に2.75回転
rps = 2.75; spokes = 8; fps = 24
step = rps*360/fps  # 1コマで回る角
period = 360/spokes
app = (step + period/2) % period - period/2
P("車輪：1コマで %.2f 度回る。スポークは %.0f 度ごとなので、見かけは %.2f 度（負なら逆回り）" % (step, period, app))
# DFT 8点の手計算用
x8 = np.array([0, 1, 0, -1, 0, 1, 0, -1], float)
P("8点 DFT of sin(2pi*2k/8):", np.round(np.fft.fft(x8), 4))
x8b = np.array([1, 1, 1, 1, -1, -1, -1, -1], float)
P("8点 DFT of 方形波:", np.round(np.fft.fft(x8b), 4))
P("FFT の手間：N=1024 DFT N^2=%d, FFT N log2 N=%d, 比 %.0f 倍" % (1024**2, 1024*10, 1024**2/(1024*10)))

P("=== 9-5・9-6 ラプラス変換（数値積分で表を確かめる。s=2） ===")
s = 2.0
tab = {"1": (lambda t: 1.0, 1/s), "t": (lambda t: t, 1/s**2), "t^2": (lambda t: t*t, 2/s**3),
       "e^{-t}": (lambda t: np.exp(-t), 1/(s+1)), "e^{t}": (lambda t: np.exp(t), 1/(s-1)),
       "sin 3t": (lambda t: np.sin(3*t), 3/(s**2+9)), "cos 3t": (lambda t: np.cos(3*t), s/(s**2+9)),
       "e^{-t}sin2t": (lambda t: np.exp(-t)*np.sin(2*t), 2/((s+1)**2+4)), "t e^{-t}": (lambda t: t*np.exp(-t), 1/(s+1)**2)}
for k, (f, F) in tab.items():
    v = integrate.quad(lambda t: f(t)*np.exp(-s*t), 0, np.inf, limit=200)[0]
    P("L[%s](2) 数値 %.6f, 表 %.6f" % (k, v, F))
# 表計算の台形（dt=0.1, 0〜10）で L[1](s=2)
tt = np.arange(0, 10.0001, 0.1); P("台形 dt=0.1 で L[1](2) = %.5f, L[t](2) = %.5f" % (np.trapezoid(np.exp(-2*tt), tt), np.trapezoid(tt*np.exp(-2*tt), tt)))
# 冷めるお湯
P("お湯 T=20+60e^{-0.05t}: t=10 %.3f, t=20 %.3f; 2-18 オイラー 55.92 と比べる" % (20+60*np.exp(-0.5), 20+60*np.exp(-1)))
# t^n e^{-t}
P("t^3 e^{-t}: t=10 %.4f, t=20 %.6f" % (1000*np.exp(-10), 8000*np.exp(-20)))
# 最終値の定理
P("最終値の定理の例：1/(s(s+1)(s+2)) → s→0 で 1/2")

P("=== 9-7 微分方程式 ===")
def sim(num, den, t, x0=None):
    return signal.impulse((num, den), T=t)
t = np.linspace(0, 6, 7)
# 車A：x'' + 3x' + 2x = 0, x(0)=1, x'(0)=0 → X=(s+3)/((s+1)(s+2))
P("車A: X(s)=(s+3)/((s+1)(s+2)) 部分分数:", signal.residue([1, 3], [1, 3, 2]))
P("  x(1)= %.5f (2e^-1 - e^-2 = %.5f)" % (signal.impulse(([1, 3], [1, 3, 2]), T=[0, 1])[1][1], 2*np.exp(-1)-np.exp(-2)))
P("1/((s+1)(s+2)) の部分分数:", signal.residue([1], [1, 3, 2]))
# 車B
_, y = signal.impulse(([1, 2], [1, 2, 5]), T=[0, 1, 2])
P("車B: x(1),x(2) = %s ; e^-t(cos2t+0.5 sin2t) = %s" % (np.round(y[1:], 5), np.round([np.exp(-tt)*(np.cos(2*tt)+0.5*np.sin(2*tt)) for tt in [1, 2]], 5)))
# 強制振動 x''+2x'+5x=10cos t, x(0)=x'(0)=0
tt = np.linspace(0, 10, 2001)
_, y, _ = signal.lsim(([10], [1, 2, 5]), np.cos(tt), tt)
ex = 2*np.cos(tt)+np.sin(tt)+np.exp(-tt)*(-2*np.cos(2*tt)-1.5*np.sin(2*tt))
P("強制振動：数値と 2cos t + sin t + e^{-t}(-2cos2t - 1.5 sin2t) の差の最大 %.2e" % abs(y-ex).max())
P("  部分分数 10s/((s^2+1)(s^2+2s+5)):", signal.residue([10, 0], np.polymul([1, 0, 1], [1, 2, 5])))
# 共振 x''+4x=cos2t
_, y, _ = signal.lsim(([1], [1, 0, 4]), np.cos(2*tt), tt)
P("共振：数値と (t/4) sin2t の差の最大 %.2e" % abs(y-tt/4*np.sin(2*tt)).max())
# RC 回路 6-4：E=10 V, R=20k, C=100u → tau=2
P("RC ステップ：V=10(1-e^{-t/2})：t=2 %.3f, t=6 %.3f" % (10*(1-np.exp(-1)), 10*(1-np.exp(-3))))
P("  10/(s(2s+1)) の部分分数:", signal.residue([10], [2, 1, 0]))
# RLC：L=0.01, C=1e-6, R=20 → ステップ E=10 V のコンデンサー電圧
Lh, Cf, Rr = 0.01, 1e-6, 20.0
den = [Lh*Cf, Rr*Cf, 1]
P("RLC: 極", np.roots(den), "zeta=", Rr/2*np.sqrt(Cf/Lh))
tt = np.linspace(0, 0.003, 30001); _, y, _ = signal.lsim(([10], den), np.ones_like(tt), tt)
P("  ステップ10 V の最大 %.3f V at %.6f s（行きすぎ %.1f %%）" % (y.max(), tt[y.argmax()], (y.max()-10)/10*100))
P("  理論の行きすぎ exp(-pi z/sqrt(1-z^2)) = %.4f" % np.exp(-pi*0.1/np.sqrt(1-0.01)))
# 熱電対 ramp：tau=30, r=1/30
tau = 30; rr = 1/30
for tt_ in [30, 60, 150]:
    P("熱電対：t=%d 本当 %.3f, 計器 %.3f, 差 %.3f" % (tt_, 50+rr*tt_, 50+rr*(tt_-tau*(1-np.exp(-tt_/tau))), rr*tau*(1-np.exp(-tt_/tau))))
P("  r/(s^2(tau s+1)) の部分分数 (r=1,tau=30):", signal.residue([1], [30, 1, 0, 0]))
# 重解 1/(s+1)^2 → t e^{-t}; ばね臨界
P("重解の例 (s+3)/(s+1)^2 → e^{-t}+2t e^{-t}:", signal.residue([1, 3], [1, 2, 1]))
# オイラー法と比べる（車A, dt=0.1）
x, v = 1.0, 0.0
for k in range(10):
    x, v = x+0.1*v, v+0.1*(-3*v-2*x)
P("車A オイラー dt=0.1 で t=1: %.5f（本当 %.5f）" % (x, 2*np.exp(-1)-np.exp(-2)))

P("=== 9-8 伝達関数・ボード線図 ===")
for f in [10, 100, 1000, 10000]:
    G = 1/(1+1j*f/100)
    P("1次ローパス（100 Hz）: %5d Hz |G|=%.4f = %.2f dB, 2段 %.2f dB, 位相 %.1f 度" % (f, abs(G), 20*np.log10(abs(G)), 40*np.log10(abs(G)), np.degrees(np.angle(G))))
# 車：アクセル → 力 → 速さ m=1000, b=50
m, b = 1000.0, 50.0
P("車 G=1/(1000 s + 50): tau = %.0f s, 定常のゲイン %.3f (m/s)/N; 500 N で %.1f m/s = %.0f km/h" % (m/b, 1/b, 500/b, 500/b*3.6))
# ばね（6-13 の数）G = 1/(0.5 s^2 + 0.4 s + 8)
for w in [2, 4, 8]:
    G = 1/(0.5*(1j*w)**2+0.4*1j*w+8)
    P("6-13 ばね：w=%d |G|*0.8 = %.4f, おくれ %.1f 度" % (w, abs(G)*0.8, -np.degrees(np.angle(G))))
# 直列・フィードバック
P("フィードバック G/(1+G) with G=K/(s+1): 極 -(1+K)")
# モーター：G = 10/(0.5 s + 1)、P 制御
K, tau = 10.0, 0.5
for Kp in [0.1, 1, 10]:
    L0 = Kp*K
    P("モーター P制御 Kp=%g: 閉ループ極 %.1f, 時定数 %.4f s, 定常の割合 %.4f（ずれ %.1f %%）" % (Kp, -(1+L0)/tau, tau/(1+L0), L0/(1+L0), 100/(1+L0)))

P("=== 9-9 極と安定性 ===")
for z in [0.1, 0.3, 0.5, 0.7, 1.0]:
    P("zeta=%.1f: 行きすぎ %.1f %%" % (z, 100*np.exp(-pi*z/np.sqrt(1-z**2)) if z < 1 else 0))
for K in [1, 4, 8, 10]:
    r_ = np.roots([1, 3, 3, 1+K])
    P("(s+1)^3+K=0, K=%d: 極 %s" % (K, np.round(r_, 4)))
P("K=8: 虚軸上 ±j sqrt3 = ±%.4f" % np.sqrt(3))
# ロボットの腕の zeta（6-12:931）: 例として wn=10
# 3次の判定 a s^3+b s^2+c s+d：すべて正で bc > ad
P("3次の判定 s^3+3s^2+3s+(1+K)：3*3 > 1+K ⇔ K<8")
# 1次おくれ：tau=30 s の熱電対にステップ 50→60 度
for tt_ in [30, 60, 90, 150]:
    P("1次おくれ tau=30：t=%d で %.1f %%" % (tt_, 100*(1-np.exp(-tt_/30))))
# 2次おくれ ステップの山の時刻 pi/wd
wn, z = 4.0, 0.1
wd = wn*np.sqrt(1-z*z); P("6-13 ばね wn=4, z=0.1: wd=%.4f, 山の時刻 %.4f s" % (wd, pi/wd))

P("=== 9-10・9-11 状態方程式・e^{At} ===")
def expm_n(A, t, n):
    return np.linalg.matrix_power(np.eye(len(A))+A*t/n, n)
A = np.array([[0, 1], [-1, 0]], float)
for n in [63, 630, 6283]:
    P("ばね w=1, t=2pi, n=%d: (I+At/n)^n = %s" % (n, np.round(expm_n(A, 2*pi, n), 4).tolist()))
P("e^{A pi/2} =", np.round(linalg.expm(A*pi/2), 5).tolist())
H = np.array([[-0.1, 0.1], [0.1, -0.1]])
P("水そう H 固有値", np.linalg.eigvals(H), " e^{H*10} [20,0] =", linalg.expm(H*10)@[20, 0], " 式 10±10e^-2 =", 10+10*np.exp(-2), 10-10*np.exp(-2))
Aa = np.array([[0, 1], [-2, -3]], float)
t1 = 1.0
E = linalg.expm(Aa*t1)
F = np.array([[2*np.exp(-t1)-np.exp(-2*t1), np.exp(-t1)-np.exp(-2*t1)], [-2*np.exp(-t1)+2*np.exp(-2*t1), -np.exp(-t1)+2*np.exp(-2*t1)]])
P("車A e^{A} =", np.round(E, 5).tolist(), " 式と同じ:", np.allclose(E, F))
# 対角化で
w, V = np.linalg.eig(Aa); P("車A 固有値", w, "固有ベクトル（列）", np.round(V/V[0], 4).tolist())
# (sI - A)^{-1}
P("(sI-A)^{-1} の分母 s^2+3s+2")
M = np.array([[0, 1], [1, 0]], float); EM = linalg.expm(M)
P("送電線 e^{M} =", np.round(EM, 4).tolist(), " cosh1 %.4f sinh1 %.4f" % (np.cosh(1), np.sinh(1)))
for n in [10, 100, 1000]:
    box = np.array([[1, 1/n], [0, 1]])@np.array([[1, 0], [1/n, 1]])
    P("  箱 n=%d: %s" % (n, np.round(np.linalg.matrix_power(box, n), 3).tolist()))
# 熱の半離散：9点, alpha/dx^2 = 1
N = 9; K = -2*np.eye(N)+np.eye(N, k=1)+np.eye(N, k=-1)
lam = np.linalg.eigvalsh(K)
P("熱 dT/dt = K T（alpha/dx^2=1）の固有値：最小 %.4f, 最大 %.4f；連続の -alpha(pi/L)^2 = %.4f" % (lam.min(), lam.max(), -al*(pi/0.1)**2))
P("  -4 sin^2(m pi/20), m=1: %.4f" % (-4*np.sin(pi/20)**2))
for r in [0.25, 0.5, 0.6]:
    l2 = np.linalg.eigvalsh(np.eye(N)+r*K); P("  1歩の行列 r=%.2f: 固有値 %.4f〜%.4f" % (r, l2.min(), l2.max()))
w_, V_ = np.linalg.eigh(K); v1 = V_[:, -1]; v1 = v1/v1[4]
P("  いちばんゆっくりの固有ベクトル（まん中=1）:", np.round(v1, 4), " sin(m pi x) と比べる", np.round(np.sin(pi*np.arange(1, 10)/10)/np.sin(pi*0.5), 4))
# 一様100度の棒：e^{At} で
T0v = np.full(N, 100.0)
for tt_ in [5, 10]:
    P("  e^{Kt} で t=%d のまん中 %.3f（級数 %.3f）" % (tt_, (linalg.expm(K*tt_)@T0v)[4], Tser(0.05, tt_)))
# 倒立振子 theta'' = 4 theta + u, u = -k1 theta - k2 theta'
A_ip = np.array([[0, 1], [4, 0]], float); B_ip = np.array([[0], [1]], float)
Kf = np.array([[8, 4]], float)
P("倒立振子：A の固有値", np.linalg.eigvals(A_ip), "、u=-(8θ+4θ') で", np.linalg.eigvals(A_ip-B_ip@Kf))
tt = np.linspace(0, 3, 4)
for t_ in tt:
    x_ = linalg.expm((A_ip-B_ip@Kf)*t_)@[0.01, 0]
    P("  t=%.0f: θ=%.6f" % (t_, x_[0]))
P("  制御なし 2秒後 θ=%.4f（5-18：0.01 cosh 4 = %.4f）" % ((linalg.expm(A_ip*2)@[0.01, 0])[0], 0.01*np.cosh(4)))
# 可制御性行列
Cm = np.hstack([B_ip, A_ip@B_ip]); P("  可制御性行列の行列式", np.linalg.det(Cm))
# 離散：dt=0.1
Ad = np.eye(2)+(A_ip-B_ip@Kf)*0.1; P("  離散 dt=0.1: I+(A-BK)dt の固有値", np.linalg.eigvals(Ad), "大きさ", abs(np.linalg.eigvals(Ad)))
# 伝達関数 C(sI-A)^{-1}B（車A, B=[0,1], C=[1,0]）→ 1/(s^2+3s+2)
num, den = signal.ss2tf(Aa, np.array([[0], [1.]]), np.array([[1., 0]]), np.array([[0.]]))
P("車A の G(s):", np.round(num, 4), den)
# DC モーター（2状態）例
P("（モーター）電気 L=0.001 H, R=1 Ω, Kt=Ke=0.05, J=1e-4, b=1e-5")
Lm, Rm, Kt, J, bm = 0.001, 1.0, 0.05, 1e-4, 1e-5
Am = np.array([[-Rm/Lm, -Kt/Lm], [Kt/J, -bm/J]])
P("  固有値", np.linalg.eigvals(Am), " 定常の速さ/電圧", Kt/(Rm*bm+Kt*Kt), "rad/s/V")
