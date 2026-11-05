# 電-13（長い電線を読む）の数値の確かめ。python3 calc_p4_13.py > calc_p4_13_out.txt
import math, cmath

eps0 = 8.85e-12          # 本文の丸め（Y-6）
eps0_codata = 8.8541878188e-12
mu0 = 4 * math.pi * 1e-7
c0 = 299792458.0
c0r = 3.00e8

def p(*a):
    print(*a)

p("== 例題1 同軸ケーブル a=0.45 mm, b=1.6 mm, εr=2.3")
a, b, er = 0.45e-3, 1.6e-3, 2.3
ln = math.log(b / a)
L1 = mu0 / (2 * math.pi) * ln
C1 = 2 * math.pi * eps0 * er / ln
Z0 = math.sqrt(L1 / C1)
c = 1 / math.sqrt(L1 * C1)
p("ln(b/a)=", ln, " L'=", L1, " C'=", C1, " Z0=", Z0, " c=", c, " c/c0=", c / c0)
p("  60/sqrt(er)*ln =", 60 / math.sqrt(er) * ln, " c0/sqrt(er)=", c0 / math.sqrt(er), c0r / math.sqrt(er))
p("  1/(2pi)*sqrt(mu0/eps0) =", math.sqrt(mu0 / eps0) / (2 * math.pi), " codata:", math.sqrt(mu0 / eps0_codata) / (2 * math.pi))
p("じぶん1 同じ寸法で εr=1.5")
er2 = 1.5
C2 = 2 * math.pi * eps0 * er2 / ln
p("  C'=", C2, " Z0=", math.sqrt(L1 / C2), " c=", 1 / math.sqrt(L1 * C2), " c/c0=", 1 / math.sqrt(L1 * C2) / c0)

p("== 例題2 75 Ω, εr=1.5 の b/a")
lnr = 75 * math.sqrt(1.5) / 60
p("  ln(b/a)=", lnr, " b/a=", math.exp(lnr))
p("じぶん2 (1) 50 Ω, εr=2.3:", math.exp(50 * math.sqrt(2.3) / 60), " (2) 50 Ω 空気:", math.exp(50 / 60))

p("== 例題3・4 反射")
def rv(zl, z0):
    return (zl - z0) / (zl + z0)
for z0_, zl in [(50, 75), (75, 50), (75, 300), (300, 75), (50, 25), (75, 100), (100, 120), (100, 100)]:
    r = rv(zl, z0_)
    p("  Z0=", z0_, " ZL=", zl, " rV=", r, " rV^2=", r * r, " 1+rV=", 1 + r, " SWR=", (1 + abs(r)) / (1 - abs(r)))

p("== 例題5 TDR 10 m")
cc = c0r / math.sqrt(2.3)
p("  c=", cc, " 往復 20 m:", 20 / cc * 1e9, "ns")
p("じぶん5 150 ns:", cc * 150e-9 / 2, "m")
p("基本3 0.40 μs, 2.0e8:", 2.0e8 * 0.40e-6 / 2, "m")
p("基本1 LAN 0.70c 100 m:", 100 / (0.70 * c0r) * 1e6, "μs")

p("== 例題6 波長")
p("  50 Hz, c0:", c0r / 50 / 1e3, "km;  60 Hz:", c0r / 60 / 1e3, "km")
p("  1 GHz, 2.0e8:", 2.0e8 / 1e9, " (c=1.98e8:", cc / 1e9, ")")
p("じぶん6 600 MHz, εr=1.5:", c0r / math.sqrt(1.5) / 600e6, " 5 m は", 5 / (c0r / math.sqrt(1.5) / 600e6), "波長")
p("基本4 2.4 GHz, 2.0e8:", 2.0e8 / 2.4e9)
p("はてな 470/710 MHz 空気:", c0r / 470e6, c0r / 710e6, " εr=1.5:", c0r / math.sqrt(1.5) / 470e6, c0r / math.sqrt(1.5) / 710e6)

p("== 例題7 四端子定数")
def mm(X, Y):
    return [[X[0][0] * Y[0][0] + X[0][1] * Y[1][0], X[0][0] * Y[0][1] + X[0][1] * Y[1][1]],
            [X[1][0] * Y[0][0] + X[1][1] * Y[1][0], X[1][0] * Y[0][1] + X[1][1] * Y[1][1]]]
def det(X):
    return X[0][0] * X[1][1] - X[0][1] * X[1][0]
def zin(F, zl):
    return (F[0][0] * zl + F[0][1]) / (F[1][0] * zl + F[1][1])
S = [[1, 2], [0, 1]]; P = [[1, 0], [0.5, 1]]
F = mm(S, P); p("  直列→並列", F, det(F), " Zin(2 Ω)=", zin(F, 2))
F2 = mm(P, S); p("  並列→直列", F2, det(F2), " Zin(2 Ω)=", zin(F2, 2))
F3 = mm([[1, 4], [0, 1]], [[1, 0], [0.25, 1]]); p("チャレンジ1", F3, det(F3), " Zin(4)=", zin(F3, 4))

p("== 例題8 短い配電線")
Vp = 6600 / math.sqrt(3)
for (R, X, I, pf) in [(0.5, 0.4, 100, 0.8), (0.5, 0.4, 100, 1.0), (0.5, 0.4, 200, 0.8), (0.6, 0.5, 150, 0.8)]:
    sn = math.sqrt(1 - pf * pf)
    dv = I * (R * pf + X * sn)
    Ic = I * complex(pf, -sn)
    Vs = Vp + complex(R, X) * Ic
    p("  R,X,I,pf=", R, X, I, pf, " 近似 ΔV=", dv, " 割合", dv / Vp * 100, "%  正しい|Vs|-Vr=", abs(Vs) - Vp, " 線間", math.sqrt(3) * dv)
p("  Vp=", Vp)

p("== 例題9 %Z")
In = 30e3 / 210
p("  In=", In, " Is(5%)=", In * 100 / 5, " Is(2.5%)=", In * 100 / 2.5)
Z = 0.05 * 210 / In
p("  Z=", Z, " 210/Z=", 210 / Z)

p("== 例題10 フェランチ")
for l in [300e3, 600e3, 1000e3, 1500e3]:
    bl = 2 * math.pi * 50 * l / c0r
    p("  l=", l / 1e3, "km  βl=", bl, " 1/cos=", 1 / math.cos(bl), " 1/cos(60 Hz)=", 1 / math.cos(2 * math.pi * 60 * l / c0r))
p("  λ/4 at 50 Hz:", c0r / 50 / 4 / 1e3, "km")
p("  架空線 L'=1.0 mH/km C'=0.011 μF/km: Z0=", math.sqrt(1.0e-6 / 11e-12), " c=", 1 / math.sqrt(1.0e-6 * 11e-12))

p("== 例題11 λ/4")
p("  sqrt(50*100)=", math.sqrt(5000), " sqrt(50*200)=", math.sqrt(50 * 200))
p("  100 MHz λ/4 in 1.98e8:", cc / 100e6 / 4, " in 2.0e8:", 2.0e8 / 100e6 / 4)
def lossless(Z0, bl):
    return [[math.cos(bl), 1j * Z0 * math.sin(bl)], [1j * math.sin(bl) / Z0, math.cos(bl)]]
Fq = lossless(70.71, math.pi / 2)
p("  Zin(100)=", zin(Fq, 100))
F8 = lossless(50, math.pi / 4)
p("チャレンジ4 λ/8 ショート Zin=", zin(F8, 0), " L at 100 MHz =", 50 / (2 * math.pi * 100e6) * 1e9, "nH")
p("  λ/8 at 100 MHz, 2.0e8:", 2.0e8 / 100e6 / 8)

p("== 例題12 損失のある線（7-11）")
for l in [1, 2]:
    ch, sh = math.cosh(l), math.sinh(l)
    p("  l=", l, " cosh=", ch, " sinh=", sh, " V2/V1(開放)=", 1 / ch, " I1/V1=", sh / ch, " det=", ch * ch - sh * sh)
p("  V(x)/V1 開放 l=1:", [round(math.cosh(1 - x) / math.cosh(1), 3) for x in [0, 0.25, 0.5, 0.75, 1.0]])
# n 個の箱
for n in [10, 100, 1000]:
    dx = 1 / n
    Bx = [[1 + dx * dx, dx], [dx, 1]]
    M = [[1, 0], [0, 1]]
    for _ in range(n):
        M = mm(M, Bx)
    p("  n=", n, [round(M[0][0], 3), round(M[0][1], 3), round(M[1][0], 3), round(M[1][1], 3)], " det=", round(det(M), 6))

p("== チャレンジ3 50 Ω 発泡 εr=1.5")
lr = 50 * math.sqrt(1.5) / 60
p("  ln=", lr, " b/a=", math.exp(lr), " b(a=0.5mm)=", 0.5 * math.exp(lr), " c=", c0r / math.sqrt(1.5))

p("== 2倍の図")
for k in [1, 2, 4]:
    p("  L' x", k, " Z0 x", math.sqrt(k), " c x", 1 / math.sqrt(k))
p("  Z0 vs b/a, εr=2.3 / 1.5:")
for r in [1.5, 2, 3, 3.56, 4, 4.62, 6, 8]:
    p("   ", r, 60 / math.sqrt(2.3) * math.log(r), 60 / math.sqrt(1.5) * math.log(r))

p("== ⑩ π形のモデル（先を開けた V2/V1）")
for l in [300e3, 600e3]:
    bl = 2 * math.pi * 50 * l / c0r
    p("  l=", l / 1e3, " βl=", bl, " (βl)^2/2=", bl * bl / 2, " π形 1/(1-(βl)^2/2)=", 1 / (1 - bl * bl / 2), " 正しい 1/cos=", 1 / math.cos(bl))
P2 = mm(mm([[1, 0], [0.25, 1]], [[1, 2], [0, 1]]), [[1, 0], [0.25, 1]])
p("  π形の行列の確かめ Z=2, Y=0.5:", P2, " 式:", 1 + 2 * 0.5 / 2, 0.5 * (1 + 2 * 0.5 / 4), " det=", det(P2))

p("== 時間図 50→75 の電圧")
p("  入射1 V, 先 1.2 V, 返り 0.2 V")
