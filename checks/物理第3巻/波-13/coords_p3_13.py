# 波-13 のグラフの点（pgfplots の coordinates に写す）と、本文の Python の出力を作る（組 波W7）
# 実行：python3 checks/物理第3巻/波-13/coords_p3_13.py > checks/物理第3巻/波-13/coords_p3_13_out.txt
from math import *
from scipy.special import j1

def airy(u):
    x = pi*u
    return 1.0 if abs(x) < 1e-12 else (2*j1(x)/x)**2
def slit(u):
    x = pi*u
    return 1.0 if abs(x) < 1e-12 else (sin(x)/x)**2

def coords(f, a, b, n):
    pts = []
    for k in range(n+1):
        u = a + (b-a)*k/n
        pts.append("(%.3f,%.4f)" % (u, f(u)))
    return " ".join(pts)

print("% 円い穴（エアリー）u=sinθ/(λ/D)、0〜3.5")
print(coords(airy, 0, 3.5, 70))
print("% 単スリット u=sinθ/(λ/a)、0〜3.5")
print(coords(slit, 0, 3.5, 70))
print("% 2つの点の像（間 1.22）：左の像・右の像・和、u=-1.5〜2.72")
for name, f in [("左", lambda u: airy(u)), ("右", lambda u: airy(u-1.22)), ("和", lambda u: airy(u)+airy(u-1.22))]:
    print("%", name)
    print(coords(f, -1.5, 2.72, 84))
print("% 2つの点の像（間 0.80）：和")
print(coords(lambda u: airy(u)+airy(u-0.8), -1.5, 2.3, 76))
print("% 散乱の強さ（700 nm を1）：λn=100 nm のモデルと、λ^-4")
def model(lam):
    r = 100/lam
    return r**4/(1-r*r)**2
for lam in range(380, 781, 20):
    print("(%d,%.3f)" % (lam, model(lam)/model(700)), end=" ")
print()

print("% 直径 D と 2D（横軸は λ/D を単位にした sinθ、0〜2.5）")
print(coords(airy, 0, 2.5, 60))
print(coords(lambda u: airy(2*u), 0, 2.5, 100))

print("\n% 本文の Python（N 本のすきま）をそのまま動かした出力")
from math import cos, sin, pi
def akarusa(N, u):        # u：となりとの経路の差 ÷ 波長
    x = y = 0.0
    for p in range(N):    # p 番めのすきまの矢印（長さ1）
        x = x + cos(2 * pi * p * u)
        y = y + sin(2 * pi * p * u)
    return (x * x + y * y) / N**2    # まん中の明るさを1にする
us = [0, 0.05, 0.1, 0.25, 0.5, 1.0]
for N in [2, 5, 20]:
    print(N, [round(akarusa(N, u), 3) for u in us])
