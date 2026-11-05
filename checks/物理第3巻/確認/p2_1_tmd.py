# 修3-2 P2-1：デン・ハルトフの最適な減衰を Python で求め直す。python3 checks/物理第3巻/確認/p2_1_tmd.py
# 減衰比はビルの ωn で測る：ζa = c2/(2 m2 ωn)。同調 ωa/ωn = 1/(1+μ)。
import numpy as np
from math import sqrt
from scipy.optimize import minimize_scalar

m1, k1 = 1.0, 100.0
mu = 0.05; m2 = mu*m1; wn = sqrt(k1/m1)
f = 1/(1+mu); wa = f*wn; k2 = m2*wa**2
zDH = sqrt(3*mu/(8*(1+mu)**3))          # デン・ハルトフの式
zDH_wa = sqrt(3*mu/(8*(1+mu)))          # ωa で測る定義のときの式（参考）
print('ωa=%.4f k2=%.4f' % (wa, k2))
print('ζ(式, (1+μ)^3)=%.4f → ωn で c2=%.4f / ωa で c2=%.4f' % (zDH, 2*zDH*m2*wn, 2*zDH*m2*wa))
print('ζ(ωa の定義の式)=%.4f → c2=%.4f' % (zDH_wa, 2*zDH_wa*m2*wa))


def x1(w, c1, k2, c2):
    A = np.array([[k1+k2-m1*w*w+1j*w*(c1+c2), -(k2+1j*w*c2)],
                  [-(k2+1j*w*c2), k2-m2*w*w+1j*w*c2]])
    return np.linalg.solve(A, np.array([1.0, 0.0]))


ws = np.linspace(7, 13, 12001)


def peak(c1, k2, c2):
    return max(abs(x1(w, c1, k2, c2)[0]) for w in ws)


for c1 in [0.0, 0.2]:
    r = minimize_scalar(lambda c2: peak(c1, k2, c2), bounds=(0.08, 0.2), method='bounded', options={'xatol': 1e-5})
    c2best = r.x
    print('c1=%.1f: 山がいちばん低い c2=%.4f（ζ=c2/(2 m2 ωn)=%.4f）山=%.4f m（静たわみの %.3f 倍）'
          % (c1, c2best, c2best/(2*m2*wn), r.fun, r.fun/0.01))
    for c2 in [0.121, 0.127, 2*zDH*m2*wn]:
        pk = peak(c1, k2, c2)
        print('    c2=%.4f → 山 %.4f m（%.3f 倍）' % (c2, pk, pk/0.01))
print('sqrt(1+2/μ)=%.3f' % sqrt(1+2/mu))

# 本文の Python（c2=0.127）の出力
print('---- 本文のプログラム（k2=4.54, c2=0.127, c1=0.2）')
m1_, k1_, c1_ = 1.0, 100.0, 0.2
m2_, k2_, c2_ = 0.05, 4.54, 0.127
for w in [9.0, 10.0, 11.0]:
    A = np.array([[k1_+k2_-m1_*w**2+1j*w*(c1_+c2_), -(k2_+1j*w*c2_)],
                  [-(k2_+1j*w*c2_), k2_-m2_*w**2+1j*w*c2_]])
    X = np.linalg.solve(A, [1.0, 0.0])
    print(w, round(abs(X[0]), 4), round(abs(X[1]), 4))

# 例題9・じぶんでとこう9・章末5 の数（μ=0.05・0.02・0.03）
for mu_ in [0.05, 0.02, 0.03]:
    print('μ=%.2f f=%.4f ζ=%.4f sqrt(1+2/μ)=%.2f' % (mu_, 1/(1+mu_), sqrt(3*mu_/(8*(1+mu_)**3)), sqrt(1+2/mu_)))
