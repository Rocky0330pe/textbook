# 原-8 ⑪ の囲みのプログラム（本文と同じもの）。python3 code_p5_08.py
import numpy as np
P, a = 3 * np.pi / 2, 0.5e-9                  # くしの強さ、くしの間かく
hbar, m, e = 1.0546e-34, 9.109e-31, 1.602e-19
qa = np.linspace(1e-6, 3.2 * np.pi, 200000)
F = np.cos(qa) + P * np.sin(qa) / qa          # 右辺の関数
E = (hbar * qa / a)**2 / (2 * m) / e          # その波のエネルギー（eV）
ok = np.abs(F) <= 1                           # 帯の中（波が進める）
edge = np.flatnonzero(np.diff(ok.astype(int)))
print(np.round(E[edge], 2))                   # 帯のはしのエネルギー
