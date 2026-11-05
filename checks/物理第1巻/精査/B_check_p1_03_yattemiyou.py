# 力-3 やってみよう：同じばね・同じ縮みなら、2台の運動エネルギーの和は同じ。
# 同じ質量のとき各 6.0 cm（0.1 s）を基準に、Bの質量を n 倍にしたときの距離を求める。
from math import sqrt
dA0 = 6.0
for n in (1, 2, 3):
    # mA vA = n mA vB、 1/2 mA vA^2 + 1/2 n mA vB^2 = 2 * 1/2 mA v0^2
    vB = sqrt(2/(n*n + n)) ; vA = n*vB
    print(n, "A", round(dA0*vA, 2), "B", round(dA0*vB, 2), "本文の値でのエネルギー比",
          {1:(36+36)/72, 2:(64+2*16)/72, 3:(81+3*9)/72}[n])
