# 修3-2 P2-1：c2 を 0.127 N·s/m（ζa=c2/(2 m2 ωn)=0.127）にしたときの、波-3 の図6（つつみ）と図9（実線）の点。
# python3 checks/物理第3巻/確認/p2_1_fig.py > checks/物理第3巻/確認/p2_1_fig_out.txt
# 出力の点を tex/p3-03.tex の該当する \draw の行に入れる（図6 の実線、図9 の実線）。作り方は checks/物理第3巻/波-3/fig_p3_03.py と同じ。
import numpy as np
from math import sqrt, cos

m1, k1, c1 = 1.0, 100.0, 0.2
mu = 0.05; m2 = mu*m1; wn = 10.0
f_opt = 1/(1+mu); z_opt = sqrt(3*mu/(8*(1+mu)**3))
wa = f_opt*wn
k2o = m2*wa**2            # 4.535 → 本文 4.54
c2o = 2*z_opt*m2*wn       # 0.1273 → 本文 0.127（ビルの ωn で測る）
print('%% k2=%.4f c2=%.4f' % (k2o, c2o))
# 本文の数（4.54・0.127）で点を作る
k2t, c2t = 4.54, 0.127


def x1amp(w, k2, c2):
    A = np.array([[k1+k2-m1*w*w+1j*w*(c1+c2), -(k2+1j*w*c2)],
                  [-(k2+1j*w*c2), k2-m2*w*w+1j*w*c2]])
    return abs(np.linalg.solve(A, np.array([1.0, 0.0]))[0])


ws2 = np.concatenate([np.linspace(6, 8.6, 14), np.linspace(8.65, 11.6, 237), np.linspace(11.7, 14, 12)])
print('%%SEG OPT 0')
print(' '.join('(%.3f,%.4f)' % (w, x1amp(w, k2t, c2t)) for w in ws2))
wf = np.linspace(6, 14, 80001)
v = [x1amp(w, k2t, c2t) for w in wf]
print('%% 山 %.4f m（%.2f 倍） w=%.3f / w=10 で %.4f' % (max(v), max(v)/0.01, wf[int(np.argmax(v))], x1amp(10, k2t, c2t)))
# 2つの山（左右）
i0 = int(np.argmin(abs(wf-10)))
print('%% 左の山 %.4f（w=%.3f） 右の山 %.4f（w=%.3f）' % (max(v[:i0]), wf[int(np.argmax(v[:i0]))], max(v[i0:]), wf[i0+int(np.argmax(v[i0:]))]))


# 表計算（dt=0.01）でのつつみ
def simulate(m2, k2, c2, w=10.0, T=80.0, dt=0.01):
    x1 = v1 = x2 = v2 = 0.0; t = 0.0; h = []
    n = 0
    while t < T - 1e-9:
        F = cos(w*t)
        a1 = (F - k1*x1 - c1*v1 + k2*(x2-x1) + c2*(v2-v1))/m1
        a2 = (-k2*(x2-x1) - c2*(v2-v1))/m2 if m2 > 0 else 0.0
        v1 += a1*dt; v2 += a2*dt
        x1 += v1*dt; x2 += v2*dt
        n += 1; t = n*dt
        h.append((t, x1, x2))
    return h


h = simulate(m2, k2t, c2t)
env = ['(0,0)']
for t0 in range(2, 81, 2):
    a = max(abs(x[1]) for x in h if t0-0.63 <= x[0] <= t0)
    env.append('(%d,%.4f)' % (t0, a))
print('%% dt=0.01 つつみ 最適'); print(' '.join(env))
print('%%  重りのゆれ（最後の1周期） %.4f' % max(abs(x[2]) for x in h if 79.3 <= x[0] <= 80))
