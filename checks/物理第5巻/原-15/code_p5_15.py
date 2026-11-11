#!/usr/bin/env python3
"""原-15 の本文の Python の囲み（⑦ 平板の1群拡散、⑧ 1点炉の動特性）と同じプログラム。出力を本文の実行結果と照らす。"""
import numpy as np

print('== ⑦ 平板の1群拡散（差分と、くり返し）')
D, Sa, nSf = 3.0, 0.05, 0.055    # 拡散係数 cm、Σa・νΣf（1/cm）
a, N = 76.95, 100                # 平板の厚さ cm、区切りの数
h = a / N
M = np.zeros((N-1, N-1))         # もれと吸収の行列（両はしで φ=0）
for i in range(N-1):
    M[i, i] = 2*D/h**2 + Sa
    if i > 0:   M[i, i-1] = -D/h**2
    if i < N-2: M[i, i+1] = -D/h**2
phi, k = np.ones(N-1), 1.0
for it in range(200):            # 生まれる中性子から、次の φ を作る
    new = np.linalg.solve(M, nSf * phi / k)
    k = k * new.sum() / phi.sum()
    phi = new
print(round(k, 4))
print((phi / phi.max())[[9, 24, 49, 74, 89]].round(3))
x = np.array([10, 25, 50, 75, 90]) * h
print('cos の値', np.cos(np.pi * (x - a / 2) / a).round(3), 'x', x.round(1))
for aa in (60.0, 100.0):
    hh = aa / N
    MM = np.zeros((N-1, N-1))
    for i in range(N-1):
        MM[i, i] = 2*D/hh**2 + Sa
        if i > 0: MM[i, i-1] = -D/hh**2
        if i < N-2: MM[i, i+1] = -D/hh**2
    ph, kk = np.ones(N-1), 1.0
    for it in range(300):
        nw = np.linalg.solve(MM, nSf * ph / kk)
        kk = kk * nw.sum() / ph.sum(); ph = nw
    print('厚さ', aa, 'k', round(kk, 4), '式', round(1.1 / (1 + 60 * (np.pi / aa) ** 2), 4))

print('== ⑧ 1点炉の動特性（RK4）')
rho, beta, lam, Lam = 0.001, 0.0065, 0.08, 1e-4
def f(y):                        # y = [n, C]
    n, C = y
    return np.array([(rho - beta) / Lam * n + lam * C,
                     beta / Lam * n - lam * C])
y = np.array([1.0, beta / (Lam * lam)])   # はじめはつり合い（n=1）
h = 1e-4                         # 1歩の時間（s）
for i in range(1, 600001):       # 60 秒まで
    k1 = f(y); k2 = f(y + h/2*k1)
    k3 = f(y + h/2*k2); k4 = f(y + h*k3)
    y = y + h/6*(k1 + 2*k2 + 2*k3 + k4)
    if i in (1000, 10000, 100000, 600000):
        print(round(i*h, 1), round(y[0], 3))
