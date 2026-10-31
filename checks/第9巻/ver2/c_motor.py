#!/usr/bin/env python3
# 第9巻 Ver2（全巻の修正事項 No.13）：9-10 もっと知りたい「モーターの2つの状態」
# 回る速さの記号を ω → y に変えた（数は変えていない）ので、本文の数をもう一度確かめる。
#   状態 (y, i)、  J y' = 0.05 i - b y、  L i' = v - R i - 0.05 y
import numpy as np

L, R, J, b, k = 1e-3, 1.0, 1e-4, 1e-5, 0.05
A = np.array([[-b / J, k / J], [-k / L, -R / L]])
B = np.array([0.0, 1.0 / L])
print('A =', A)                      # 本文：1行め (-0.1, 500)、2行め (-50, -1000)
print('B =', B)                      # 本文：(0, 1000)
lam = np.linalg.eigvals(A)
print('固有値 =', np.sort(lam))       # 本文：約 -974 と -25.8
print('時定数 =', np.sort(-1 / lam))  # 本文：約 0.001 秒、約 0.04 秒
x_inf = -np.linalg.solve(A, B * 1.0)  # 1 V を加え続けたときの落ち着く状態
print('1 V で落ち着く速さ y =', x_inf[0], 'rad/s、', x_inf[0] * 60 / (2 * np.pi), '回/分')  # 本文：約19.9 rad/s、約190回転
assert abs(A[0, 0] + 0.1) < 1e-12 and abs(A[0, 1] - 500) < 1e-9 and abs(A[1, 0] + 50) < 1e-9 and abs(A[1, 1] + 1000) < 1e-9
assert abs(min(lam.real) + 974) < 1 and abs(max(lam.real) + 25.8) < 0.1
assert abs(x_inf[0] - 19.9) < 0.05 and abs(x_inf[0] * 60 / (2 * np.pi) - 190) < 1
print('OK')
