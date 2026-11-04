# 組B の直し（第19回）：力-4 で動かした章末問題とこたえの検算。python3 -I で動かす
import math
g = 9.8
# B-20 F=(y,x) の1周の仕事は -0.0 と表示される
N = 100; W = 0.0
for i in range(N):
    t0, t1 = 2 * math.pi * i / N, 2 * math.pi * (i + 1) / N
    x0, y0, x1, y1 = math.cos(t0), math.sin(t0), math.cos(t1), math.sin(t1)
    xm, ym = (x0 + x1) / 2, (y0 + y1) / 2
    W += ym * (x1 - x0) + xm * (y1 - y0)
print('B-20 (y,x) の1周', round(W, 4), W)
# 基本
print('基本1', math.sqrt(2 * g * 40))
print('基本2', 25 * g * 0.342, 25 * g * 0.342 * 5.0)
print('基本3', 0.060 * math.sqrt(300 / 0.030))
print('基本4', 15 ** 2 / (2 * 0.50 * g))
print('基本5 (1)', 500 * g * 0.80, '(2)', 60 * g * 0.06 * 5.0)
Q = 0.120 / 60; print('基本6 (1)', 1000 * Q * g * 8.0, 1000 * Q * g * 8.0 / 0.70, '(2)', 0.80 * 1000 * 5.0 * g * 40)
for th, t in [(45, 1.0), (20, 0.364)]:
    dx = 3.0 / t; v = math.sqrt(2 * (g * 3.0 - 0.20 * g * dx)); print('基本7', th, round(v, 2))
# 基本8（もとの入試にチャレンジ2）：k=100, m=1.0, x0=0.20, μ=μ'=0.20
k, m, mu = 100.0, 1.0, 0.20; d = 2 * mu * m * g / k; x = 0.20; n = 0; path = 0
while True:
    a = abs(x) - d
    if a <= 0: break
    nx = -math.copysign(a, x); path += abs(x) + abs(nx); x = nx; n += 1
    if k * abs(x) <= mu * m * g: break
print('基本8 d', d, '止まる位置', round(x, 4), '回数', n, '道のり', round(path, 3), ' エネルギー÷摩擦力', round((0.5 * k * 0.2 ** 2 - 0.5 * k * x ** 2) / (mu * m * g), 3))
# チャレンジ1（ループと半球）
print('チャレンジ1 (1)', 2.5 * 6.0, '倍', 6, '(2)', 0.90 * 2 / 3, math.sqrt(2 * g * 0.90 / 3))
# チャレンジ2（もとの入試にチャレンジ1）：中心の軸を水平にした円筒の内側、いちばん下で v0^2=3gr
# いちばん下で N-mg=m v0^2/r → N=4mg。角 φ（いちばん下から）で N=m v^2/r + m g cos φ, v^2=v0^2-2gr(1-cosφ)
# N=0 → 3gr-2gr+2gr cosφ + gr cosφ=0 → cosφ=-1/3 → 高さ r(1-cosφ)=4r/3、v^2=gr/3
c = -1 / 3; print('チャレンジ2 高さ/r', 1 - c, 'v^2/(gr)', 3 - 2 * (1 - c))
print('チャレンジ3 火星', math.sqrt(2 * 4.283e13 / 3.390e6))
print('チャレンジ4 (2xy,x^2) U=-x^2 y, 仕事', 0 - (-1))
