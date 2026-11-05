# 組B の直し（第19回）：力-3 で変えた数・動かした問題の検算。python3 -I で動かす
import math
g = 9.8
# B-1 無限等比級数の部分和（e=0.8）
S = lambda n, e=0.8: sum(e ** k for k in range(n))
print('B-1 S10', round(S(10), 4), 'S20', round(S(20), 4))
# B-2 やってみよう：ばねのエネルギーが同じ、運動量の和0。1倍のとき 6.0 cm
for M in [1, 2, 3]:
    vB = 6.0 / math.sqrt((M + M * M) / 2)   # (1/2)m vA^2 + (1/2)M m vB^2 = m*6^2,  vA = M vB
    vA = M * vB
    print('B-2 Bが', M, '倍：A', round(vA, 2), 'B', round(vB, 2), '  A×1', round(vA, 2), 'B×M', round(M * vB, 2))
# B-3 表：7回め弾んだあとに着く時刻
t0 = math.sqrt(2 * 1.0 / g); t = t0
for n in range(1, 8):
    t += 2 * t0 * 0.8 ** n
print('B-3 7回め弾んだあと着く時刻', round(t, 3), ' 10回めに着く時刻（衝突）', round(t0 + sum(2 * t0 * 0.8 ** n for n in range(1, 10)), 3))
# B-11 じぶんでとこう（卵）
v = math.sqrt(2 * g * 1.25); print('B-11 v', round(v, 3), '床', round(0.060 * v / 0.0020), 'ふとん', round(0.060 * v / 0.050, 2))
# 章末 基本1（2問をまとめた）
print('基本1 (1)', 0.27 * 25 / 0.020, ' (2)', 0.15 * 20 / 0.010, 0.15 * 20 / 0.050)
# 章末 基本4（2問をまとめた）：1.6 m → 0.90 m
e = math.sqrt(0.90 / 1.6); t0 = math.sqrt(2 * 1.6 / g); T = t0 * (1 + e) / (1 - e)
print('基本4 e', round(e, 3), 't0', round(t0, 3), 'T', round(T, 2))
# 章末 基本8（もとの入試にチャレンジ2）：A 1.0 kg 6.0 m/s → B 1.0 kg（ばね 600 N/m で C 2.0 kg）
V = 1.0 * 6.0 / 3.0; Eb = 0.5 * 1.0 * 6.0 ** 2 - 0.5 * 3.0 * V ** 2; x = math.sqrt(2 * Eb / 600)
print('基本8 V', V, 'ばねのエネルギー', Eb, '縮み', round(x, 3))
# 章末 基本6・7（もとのチャレンジ）
m1, m2, v1, ee = 3.0, 1.0, 2.0, 0.60
v1p = (m1 * v1 - m2 * ee * v1) / (m1 + m2); v2p = v1p + ee * v1
print('基本6', v1p, v2p, '失われた', 0.5 * m1 * v1 ** 2 - 0.5 * m1 * v1p ** 2 - 0.5 * m2 * v2p ** 2)
print('基本7 ボート', -50 * 2.4 / 150)
# チャレンジ1（ロケット）
print('チャレンジ1', 2.0 * math.log(5), 2.0 * math.log(25))
# チャレンジ2（2段ロケット。⑥のもっと知りたいと同じ割り方、u=2.5 km/s、全体 50 t）
u = 2.5
one = u * math.log(50 / 5)
s1 = u * math.log(50 / 20); s2 = u * math.log(17 / 2)
print('チャレンジ2 1段', round(one, 2), '2段', round(s1, 2), round(s2, 2), '合計', round(s1 + s2, 2), ' ln2.5', round(math.log(2.5), 3), 'ln8.5', round(math.log(8.5), 3), 'ln10', round(math.log(10), 3))
# もっと知りたい（2段）の表の検算
print('motto', round(3 * math.log(10), 2), round(3 * math.log(100 / 40), 2), round(3 * math.log(34 / 4), 2), round(3 * math.log(2.5) + 3 * math.log(8.5), 2))
# 削った入試にチャレンジ1（記録）：台車 3.0 kg、物体 1.0 kg 4.0 m/s、μ'=0.50
V = 1.0 * 4.0 / 4.0; a1 = -0.5 * g; a2 = 0.5 * 1.0 * g / 3.0; tt = (4.0 - V) / (-a1)
print('（削った）入試1', V, round(tt, 3), 'すべる距離', round((0.5 * 1.0 * 16 - 0.5 * 4.0 * V ** 2) / (0.5 * 1.0 * g), 3))
