# 波-13 光の波：干渉・回折・偏光・散乱　数値の検算（組 波W7）
# 実行：python3 checks/物理第3巻/波-13/calc_p3_13.py > checks/物理第3巻/波-13/calc_p3_13_out.txt
from math import *
import numpy as np
from scipy.special import j1, jn_zeros
from scipy.optimize import brentq, minimize_scalar

c = 299792458.0
def deg(x): return degrees(x)
def p(*a): print(*a)

p("=== ① 光の波長と色 ===")
for lam in [380e-9, 450e-9, 550e-9, 700e-9, 780e-9]:
    p("λ=%.0f nm  f=%.3e Hz" % (lam*1e9, c/lam))
p("髪の毛 0.08 mm の中の 550 nm の数:", 0.08e-3/550e-9)
p("λ^-4 の比（700 nm を1）:")
for lam in [400, 450, 500, 550, 600, 650, 700]:
    p("  %d nm: %.2f" % (lam, (700/lam)**4))
p("λ 2倍で 1/16:", 2**-4)

p("\n=== 例題1 空の青 ===")
p("(700/450)^4 =", (700/450)**4)
p("(700/550)^4 =", (700/550)**4)
p("じぶんで (700/400)^4 =", (700/400)**4)
p("基本1 (600/400)^4 =", (600/400)**4)

p("\n=== ② ヤングの実験 ===")
d, L, lam = 0.20e-3, 1.0, 633e-9
dx = L*lam/d
p("例題2 Δx =", dx*1e3, "mm ; 3番めの明るい線", 3*dx*1e3, "mm ; 角", 3*dx/L, "rad")
p("  sinθ と tanθ のずれ（θ=0.01 rad）:", sin(0.0095), tan(0.0095), 0.0095)
# 表計算：x と経路差
p("  表計算（d=0.20 mm, L=1.0 m, 633 nm）")
for x_mm in [0, 0.8, 1.6, 2.4, 3.2, 4.0, 4.8]:
    x = x_mm*1e-3
    l1 = sqrt(L**2 + (x - d/2)**2); l2 = sqrt(L**2 + (x + d/2)**2)
    diff = l2 - l1
    approx = d*x/L
    ratio = diff/lam
    bright = cos(pi*diff/lam)**2
    p("   x=%.1f mm  経路差 %.1f nm（近似 %.1f nm）  ÷λ=%.3f  明るさ %.3f" % (x_mm, diff*1e9, approx*1e9, ratio, bright))
p("じぶんで（逆）: Δx=4.3 mm, d=0.25 mm, L=2.0 m → λ =", 4.3e-3*0.25e-3/2.0*1e9, "nm")
p("じぶんで（前）: 532 nm, d=0.25 mm, L=2.0 m → Δx =", 2.0*532e-9/0.25e-3*1e3, "mm")
p("基本2: 589 nm, d=0.50 mm, L=2.0 m → Δx =", 2.0*589e-9/0.50e-3*1e3, "mm")
p("基本3（逆）: Δx=2.7 mm, d=0.30 mm, L=1.5 m → λ =", 2.7e-3*0.30e-3/1.5*1e9, "nm")
p("baisuru: d=0.20→0.40 mm, Δx", L*lam/0.40e-3*1e3, "mm")

p("\n=== ③ 回折格子 ===")
d = 1e-3/1000
for lam in [400e-9, 550e-9, 700e-9]:
    p("例題3 1000本/mm λ=%.0f nm: sinθ=%.3f θ=%.2f°" % (lam*1e9, lam/d, deg(asin(lam/d))))
p("  2次 550: sin=", 2*550e-9/d)
p("じぶんで: 600本/mm, 20.7° → λ =", (1e-3/600)*sin(radians(20.7))*1e9, "nm")
d = 1e-3/500
for m in range(1, 5):
    s = m*650e-9/d
    p("基本4: 500本/mm 650 nm m=%d sin=%.3f %s" % (m, s, ("θ=%.1f°" % deg(asin(s))) if s <= 1 else "なし"))
# N 本のスリットの強さ（矢印の和）
def nslit(N, phi):
    cs = sum(cos(j*phi) for j in range(N)); sn = sum(sin(j*phi) for j in range(N))
    return (cs**2 + sn**2)/N**2
p("  Python の出力（N 本、位相差 phi［周］）")
for N in [2, 5, 20]:
    row = []
    for ph in [0, 0.05, 0.1, 0.25, 0.5, 1.0]:
        row.append("%.3f" % nslit(N, 2*pi*ph))
    p("   N=%d: %s" % (N, " ".join(row)))
# 主極大の半値のはば（位相で）
for N in [2, 5, 20]:
    f = lambda ph: nslit(N, 2*pi*ph) - 0.5
    h = brentq(f, 1e-6, 0.5/N + 1e-9) if N > 1 else None
    p("   N=%d 半分の強さになる位相差 %.4f 周（はば %.4f 周）、はじめて0は 1/N=%.4f 周" % (N, h, 2*h, 1/N))

p("\n=== 例題4 CD ===")
d = 1.6e-6
for m in [1, 2, 3]:
    s = m*650e-9/d
    if s <= 1:
        th = asin(s); p("CD m=%d sin=%.4f θ=%.2f° 0.30 m の壁で %.3f m" % (m, s, deg(th), 0.30*tan(th)))
    else:
        p("CD m=%d なし (sin=%.3f)" % (m, s))
d = 0.74e-6
for m in [1, 2]:
    s = m*650e-9/d
    if s <= 1:
        th = asin(s); p("DVD m=%d sin=%.4f θ=%.2f° 0.30 m の壁で %.3f m" % (m, s, deg(th), 0.30*tan(th)))
    else:
        p("DVD m=%d なし (sin=%.3f)" % (m, s))
p("BD 0.32 μm 405 nm: sin=", 405e-9/0.32e-6, "→ 1次", deg(asin(min(1, 405e-9/0.32e-6))) if 405e-9/0.32e-6 <= 1 else "なし")
p("CD 780 nm/1.6 μm sin=", 0.78/1.6, deg(asin(0.78/1.6)))

p("\n=== ④ 薄い膜 ===")
n, t = 1.33, 300e-9
D = 2*n*t
p("例題5 2nd =", D*1e9)
for m in range(0, 3): p("  強め合う m=%d λ=%.1f nm" % (m, D/(m+0.5)*1e9))
for m in range(1, 3): p("  弱め合う m=%d λ=%.1f nm" % (m, D/m*1e9))
D2 = 2*n*10e-9; p("  10 nm: 2nd=%.1f nm, 2nd/λ(550)=%.3f" % (D2*1e9, D2/550e-9))
D = 2*1.33*200e-9; p("じぶんで 200 nm: 2nd=%.1f, 弱め合う m=1 λ=%.1f, 強め合う %s" % (D*1e9, D*1e9, [round(D/(m+.5)*1e9,1) for m in range(3)]))
D = 2*1.45*250e-9; p("基本5 油 1.45 250 nm: 2nd=%.1f, 強め合う %s, 弱め合う %s" % (D*1e9, [round(D/(m+.5)*1e9,1) for m in range(4)], [round(D/m*1e9,1) for m in range(1,4)]))
p("例題6 MgF2 t = λ/(4n) =", 550/(4*1.38), "nm ; 次 3λ/4n =", 3*550/(4*1.38))
p("じぶんで 600 nm:", 600/(4*1.38), " 基本6 500 nm:", 500/(4*1.38))
R0 = ((1.52-1)/(1.52+1))**2
R1 = ((1*1.52 - 1.38**2)/(1*1.52 + 1.38**2))**2
p("ガラスの反射率 %.4f、MgF2 をつけたとき（設計の波長）%.4f、理想の膜の n=√1.52=%.3f" % (R0, R1, sqrt(1.52)))
# 膜をつけたときの反射率の波長による変化（垂直、膜の厚さ 99.6 nm）
def Rcoat(lam, n0=1.0, n1=1.38, ns=1.52, t=99.64e-9):
    r01 = (n0-n1)/(n0+n1); r12 = (n1-ns)/(n1+ns)
    dl = 4*pi*n1*t/lam
    num = r01**2 + r12**2 + 2*r01*r12*cos(dl)
    den = 1 + r01**2*r12**2 + 2*r01*r12*cos(dl)
    return num/den
for lam in [400, 450, 500, 550, 600, 650, 700]:
    p("  膜あり R(%d nm)=%.4f" % (lam, Rcoat(lam*1e-9)))
# 斜めの光の経路差 2nd cos r の確かめ（幾何で）
n, t, th1 = 1.33, 300e-9, radians(40)
r = asin(sin(th1)/n)
AB = t/cos(r)            # 膜の中の片道
AC = 2*t*tan(r)          # 入る点と出る点の間
AD = AC*sin(th1)         # 外の光が余分に進む
opd = 2*n*AB - AD
p("斜め40°: 幾何の光路差 %.3f nm、2nd cos r = %.3f nm" % (opd*1e9, 2*n*t*cos(r)*1e9))

p("\n=== 例題7 くさび ===")
L, D, lam = 0.10, None, 589e-9
dx = 0.50e-3
p("髪の毛 D = λL/(2Δx) =", lam*0.10/(2*dx)*1e6, "μm")
p("(1) 髪 59 μm の間かく Δx=λL/(2D) =", lam*0.10/(2*59e-6)*1e3, "mm")
p("じぶんで 紙 L=5.0 cm Δx=0.20 mm →", 589e-9*0.05/(2*0.20e-3)*1e6, "μm")
p("基本7 L=10 cm 600 nm D=0.030 mm → Δx =", 600e-9*0.10/(2*0.030e-3)*1e3, "mm")
p("例題7 の本数 10 cm の中に", 0.10/dx, "本")

p("\n=== 例題8 ニュートンリング ===")
r, m, lam = 2.4e-3, 10, 589e-9
p("R = r^2/(mλ) =", r**2/(m*lam), "m")
p("じぶんで R=1.0 m 4番めの暗い輪 r =", sqrt(4*589e-9*1.0)*1e3, "mm")
p("基本8 R=2.0 m 5番め r =", sqrt(5*589e-9*2.0)*1e3, "mm")
p("厚さ t=r^2/(2R)（r=2.4 mm, R=0.978）:", (2.4e-3)**2/(2*0.978)*1e6, "μm  2t/λ =", 2*(2.4e-3)**2/(2*0.978)/589e-9)
# 近似のずれ
R = 1.0; r = 5e-3
p("  t 厳密 %.6e 近似 %.6e" % (R - sqrt(R**2 - r**2), r**2/(2*R)))

p("\n=== ⑤ 回折と分解能 ===")
# 単スリット・円い穴の暗い所・明るい所
z = jn_zeros(1, 3)
p("J1 のゼロ:", z, "÷π:", z/pi)
f = lambda x: -(2*j1(x)/x)**2 if x != 0 else -1
for a, b in [(4.5, 6.5), (7.5, 9.5)]:
    res = minimize_scalar(f, bounds=(a, b), method='bounded')
    p("  円 明るい輪 x/π=%.3f 強さ %.4f" % (res.x/pi, -res.fun))
g = lambda x: -(sin(x)/x)**2
for a, b in [(3.5, 5.5), (6.5, 8.5)]:
    res = minimize_scalar(g, bounds=(a, b), method='bounded')
    p("  スリット 明るい所 x/π=%.3f 強さ %.4f" % (res.x/pi, -res.fun))
# 2つの点の像の和（レイリーの条件）
def airy(u):  # u = (sinθ)/(λ/D)
    x = pi*u
    return 1.0 if abs(x) < 1e-9 else (2*j1(x)/x)**2
for sep in [1.22, 0.8, 1.6]:
    mid = 2*airy(sep/2)
    p("  間 %.2f λ/D：まん中の強さ %.3f（山は約 %.3f）" % (sep, mid, airy(0) + airy(sep)))
th = 1.22*550e-9/3.0e-3
p("例題9 目 θ=%.3e rad = %.3f 分、1 mm を見分けられる距離 %.2f m" % (th, deg(th)*60, 1e-3/th))
p("  視力1.0 の輪の切れ目 1.5 mm を 5 m:", deg(1.5e-3/5)*60, "分")
p("  ひとみ 7 mm:", 1.22*550e-9/7e-3)
th = 1.22*550e-9/0.10
p("じぶんで 望遠レンズ 0.10 m θ=%.3e rad, 1 km で %.2f mm" % (th, th*1000*1e3))
th = 1.22*550e-9/8.2
p("すばる 8.2 m θ=%.3e rad = %.4f 秒；シーイング 0.5 秒との比 %.1f" % (th, deg(th)*3600, 0.5/(deg(th)*3600)))
th = 1.22*550e-9/2.4
p("ハッブル 2.4 m θ = %.4f 秒" % (deg(th)*3600))
th = 1.22*550e-9/3.0e-3
p("チャレンジ 車のライト 1.5 m:", 1.5/th, "m")
p("baisuru: D 3→6 mm", 1.22*550e-9/6e-3)
p("単スリット a=0.1 mm 633 nm 角", deg(asin(633e-9/0.1e-3)))

p("\n=== ⑥ 偏光 ===")
for th in [0, 30, 45, 60, 90]:
    p("cos^2 %d° = %.4f" % (th, cos(radians(th))**2))
p("例題10 (1) 自然光→1枚 0.5, 60°で 0.5*0.25 =", 0.5*0.25)
p("例題10 (2) 0°,45°,90°:", 0.5*cos(radians(45))**2*cos(radians(45))**2)
p("じぶんで 30°:", 0.5*cos(radians(30))**2, " 0°,30°,90°:", 0.5*cos(radians(30))**2*cos(radians(60))**2)
p("チャレンジ 0°,θ,90° = (1/8) sin^2 2θ ; θ=22.5°:", 0.5*cos(radians(22.5))**2*sin(radians(22.5))**2, (1/8)*sin(radians(45))**2)
for n in [1.33, 1.50, 2.42]:
    tb = atan(n); p("ブルースター n=%.2f θB=%.2f°  屈折角 %.2f°  和 %.2f°" % (n, deg(tb), deg(asin(sin(tb)/n)), deg(tb) + deg(asin(sin(tb)/n))))
p("チャレンジ 太陽の高さ 90-53.1 =", 90 - deg(atan(1.33)))
# フレネルの式で s・p の反射率（n=1.5）
def fres(th1, n):
    th2 = asin(sin(th1)/n)
    rs = (cos(th1) - n*cos(th2))/(cos(th1) + n*cos(th2))
    rp = (n*cos(th1) - cos(th2))/(n*cos(th1) + cos(th2))
    return rs**2, rp**2
for a in [0, 30, 45, 56.31, 70, 85]:
    Rs, Rp = fres(radians(a), 1.5)
    p("  n=1.5 入射 %.2f° Rs=%.4f Rp=%.4f" % (a, Rs, Rp))

p("\n=== ⑦ 干渉計 ===")
p("例題12 1000本 633 nm:", 1000*633e-9/2*1e3, "mm")
p("じぶんで 0.10 mm 532 nm:", 2*0.10e-3/532e-9, "本")
p("チャレンジ 空気 n-1=2.9e-4 L=5.0 cm 633 nm:", 2*2.9e-4*0.05/633e-9, "本")
p("LIGO 4 km × 1e-21 =", 4e3*1e-21, "m")

p("\n=== ⑧ 散乱 ===")
lam_n = 100e-9
for lam in [400e-9, 450e-9, 550e-9, 700e-9]:
    r = lam_n/lam
    p("λ=%.0f nm ω/ωn=%.3f  補正 1/(1-(ω/ωn)^2)^2=%.4f" % (lam*1e9, r, 1/(1 - r**2)**2))
p("補正こみの 450/700 比:", (700/450)**4*(1/(1-(100/450)**2)**2)/(1/(1-(100/700)**2)**2))
# 夕焼け：τ(λ)=0.097*(550/λ)^4
tau = lambda lam: 0.097*(550/lam)**4
for lam in [450, 550, 700]:
    p("τ(%d)=%.4f" % (lam, tau(lam)))
p("空気の量 X と残る割合")
for X in [1, 2, 10, 38]:
    row = [exp(-tau(l)*X) for l in [450, 550, 700]]
    p("  X=%2d: 青 %.4f 緑 %.4f 赤 %.4f  赤/青 %.1f" % (X, *row, row[2]/row[0]))
p("X=1/sin(高さ)：30°→", 1/sin(radians(30)), "  5.7°→", 1/sin(radians(5.7)))

p("\n=== 例題13 の表（夕焼け） ===")
for lam in [450, 550, 700]:
    t = tau(lam)
    p("λ=%d τ=%.4f  X=1 %.3f  X=2 %.3f  X=10 %.3f  X=38 %.5f" % (lam, t, exp(-t), exp(-2*t), exp(-10*t), exp(-38*t)))
p("地平線 赤/青 =", exp(-38*tau(700))/exp(-38*tau(450)))
X = log(2)/(tau(450) - tau(700))
p("チャレンジ 青が赤の半分になる X =", X, " 太陽の高さ（1/sin）", degrees(asin(1/X)))
p("チャレンジ（確かめ）X=3.86: 青", exp(-X*tau(450)), "赤", exp(-X*tau(700)), "比", exp(-X*tau(450))/exp(-X*tau(700)))

p("\n=== ⑤ 補足 ===")
p("ひとみ 3 mm で 450 nm と 700 nm:", 1.22*450e-9/3e-3, 1.22*700e-9/3e-3)
p("顕微鏡 0.61λ/NA（NA 0.95, 550 nm）=", 0.61*550e-9/0.95)

p("\n=== ⑥ 補足 ===")
p("水 1.33 の Rs Rp（53.06°）", fres(atan(1.33), 1.33))
p("自然光の平均 cos^2 = 1/2（数値）", np.mean(np.cos(np.linspace(0, 2*pi, 100001))**2))

p("\n=== 章末問題 ===")
p("基本1 (600/400)^4 =", (600/400)**4)
p("基本2 589 nm d=0.50 mm L=2.0 m Δx=", 2.0*589e-9/0.5e-3*1e3, "mm")
p("基本3 逆 Δx=2.7 mm d=0.30 mm L=1.5 m λ=", 2.7e-3*0.3e-3/1.5*1e9, "nm")
p("基本4 500本/mm 650 nm 何次まで: m ≤", 2e-6/650e-9)
p("基本5 油 250 nm n=1.45 2nt=", 2*1.45*250, " 強め合う m=1:", 2*1.45*250/1.5)
p("基本6 MgF2 500 nm t=", 500/(4*1.38))
p("基本7 くさび Δx=", 600e-9*0.10/(2*0.030e-3)*1e3, "mm")
p("基本8 ニュートン R=2.0 m 5番め r=", sqrt(5*589e-9*2.0)*1e3, "mm")
p("チャレンジ1 (1/8)sin^2 2θ 最大 θ=45° →", 1/8)
p("チャレンジ2 車のライト 1.5 m, ひとみ 3.0 mm, 550 nm →", 1.5/(1.22*550e-9/3e-3)/1e3, "km")
p("チャレンジ3 空気の屈折率: N=46, L=5.0 cm → n-1 =", 46*633e-9/(2*0.05))
p("チャレンジ4 X =", log(2)/(tau(450)-tau(700)))
