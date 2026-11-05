# 電-5 回路を行列で解く：例題・じぶんでとこう・章末問題・図の数を確かめる（組 電W3）
# 実行：python3 calc_p4_05.py > calc_p4_05_out.txt
import numpy as np
def p(*a): print(*a)
def par(a, b): return a * b / (a + b)

p('== 例題1 鳥 ==')
r = 0.5e-3 * 0.05; V = 200 * r
p('足の間の抵抗', r, '電圧 V', V, '鳥の電流 A', V / 1000, '割合', r / (r + 1000))
r = 0.2e-3 * 0.10; V = 300 * r
p('jibun: 抵抗', r, '電圧', V, '電流', V / 2000)

p('== 例題2 分流 ==')
for I, R1, R2 in [(12, 1, 3), (6, 2, 4), (8, 2, 6)]:
    p(I, R1, R2, '->', I * R2 / (R1 + R2), I * R1 / (R1 + R2))

p('== 例題3 電池 ==')
def bat(E, r, R, n=2):
    s = n * E / (n * r + R); pa = E / (r / n + R); one = E / (r + R)
    return s, pa, one, s * s * R, pa * pa * R, one * one * R
p('1.5,0.5,5', bat(1.5, 0.5, 5))
p('jibun 1.5,0.3,3', bat(1.5, 0.3, 3))
p('章末 3本 1.5,0.2,4.4', bat(1.5, 0.2, 4.4, 3))
p('図 1本・直列・並列（1.5 V, 0.5 Ω）')
for R in (0.5, 1, 2, 5, 10, 20):
    p(R, [round(v, 3) for v in bat(1.5, 0.5, R)[:3]])

p('== 網目 3-6 ==')
A = np.array([[4, 2], [2, 4]])
for e in ([9, 6], [12, 3], [8, 7]):
    x = np.linalg.solve(A, e); p(e, x, 'middle', x.sum())

p('== 例題5 はしご ==')
R = np.array([[3, -2, 0], [-2, 9, -4], [0, -4, 9]]); x = np.linalg.solve(R, [10, 0, 0])
p(x, '節点A', 10 - 1 * x[0], '節点B', 4 * (x[1] - x[2]), 5 * x[2])
p('R2 の電流', x[0] - x[1], 'R4 の電流', x[1] - x[2])
R = np.array([[2, -1, 0], [-1, 3, -1], [0, -1, 2]]); x = np.linalg.solve(R, [10, 0, 0]); p('jibun all 1ohm', x)
R = np.array([[4, -2, 0], [-2, 6, -2], [0, -2, 4]]); x = np.linalg.solve(R, [10, 0, 0]); p('challenge all 2ohm', x)
G = np.array([[1 / 1 + 1 / 2 + 1 / 3, -1 / 3], [-1 / 3, 1 / 3 + 1 / 4 + 1 / 5]])
ph = np.linalg.solve(G, [10 / 1, 0]); p('はしごを節点で', ph)

p('== 例題6 節点 ==')
for E1, E2 in [(9, 6), (12, 3), (8, 7)]:
    phi = (E1 / 2 + E2 / 2) / (3 / 2)
    p(E1, E2, 'phi', phi, 'left', (E1 - phi) / 2, 'right', (E2 - phi) / 2, 'mid', phi / 2)

p('== 例題7 重ね合わせ ==')
for E1, E2 in [(9, 6), (12, 3)]:
    a = E1 / (2 + par(2, 2)); b = E2 / (2 + par(2, 2))
    p(E1, E2, 'E1だけ: 左', a, '中', a / 2, '右(逆)', a / 2, ' E2だけ: 右', b, '中', b / 2, '左(逆)', b / 2,
      ' 合計 左', a - b / 2, '右', b - a / 2, '中', a / 2 + b / 2)

p('== 例題8 テブナン ==')
for E1, E2, R1, R2, Rm in [(9, 6, 2, 2, 2), (10, 4, 2, 2, 6)]:
    Eth = (E1 / R1 + E2 / R2) / (1 / R1 + 1 / R2); Rth = par(R1, R2)
    p(E1, E2, 'Eth', Eth, 'Rth', Rth, 'I', Eth / (Rth + Rm), 'Rm=4:', Eth / (Rth + 4), 'Rm=0.5:', Eth / (Rth + 0.5),
      'Isc', Eth / Rth)
Eth = 7; Rth = 1; p('challenge max P', Eth ** 2 / (4 * Rth))

p('== 例題9 ブリッジ ==')
p('R4=', 200 * 150 / 100, 'jibun R2=', 120 * 500 / 240, '章末 R3=', 200 * 450 / 300)

p('== 例題10 ひずみゲージ ==')
for dR in (0.12, 0.048):
    E = 5; R = 120; approx = E * dR / (4 * R); exact = E * dR / (2 * (2 * R + dR))
    p(dR, '近似', approx, '正確', exact, '差 %', (approx - exact) / exact * 100)
p('dR=', 120 * 2 * 500e-6, 120 * 2 * 200e-6)

p('== チャレンジ：つり合わないブリッジ ==')
E = 10; R1 = R2 = R3 = 100; R4 = 110; Rg = 50
pc = E * R2 / (R1 + R2); pd = E * R4 / (R3 + R4); Eth = pd - pc; Rth = par(R1, R2) + par(R3, R4)
p('phiC', pc, 'phiD', pd, 'Eth', Eth, 'Rth', Rth, 'I mA', Eth / (Rth + Rg) * 1e3)
G = np.array([[1 / R1 + 1 / R2 + 1 / Rg, -1 / Rg], [-1 / Rg, 1 / R3 + 1 / R4 + 1 / Rg]])
c, d = np.linalg.solve(G, [E / R1, E / R3]); p('直接（節点）', c, d, (d - c) / Rg * 1e3)

p('== 例題11・12 電流計・電圧計 ==')
p('分流器', 10 * 0.01 / (1 - 0.01), 'jibun', 5 * 0.02 / (2 - 0.02), '章末', 0.9 * 0.1 / (1 - 0.1))
p('倍率器', (100 / 1 - 1) * 1000, 'jibun', (300 / 3 - 1) * 2000, '章末', (15 / 3 - 1) * 3000)
p('電圧計の誤差: 10k+10k に 10V、10kの電圧計', 10 * par(10e3, 10e3) / (10e3 + par(10e3, 10e3)),
  ' 10Mの電圧計', 10 * par(10e3, 10e6) / (10e3 + par(10e3, 10e6)))

p('== 例題13 最大電力 ==')
def Pw(E, r, R):
    I = E / (r + R); return I * I * R, R / (r + R), I
p('12,0.5,0.5', Pw(12, 0.5, 0.5), 'R=1', Pw(12, 0.5, 1), 'R=0.25', Pw(12, 0.5, 0.25))
p('jibun 1.5,0.25', Pw(1.5, 0.25, 0.25), '章末 6,2', Pw(6, 2, 2))
for x in (0.25, 0.5, 1, 2, 3, 4, 6):
    p('P/Pmax x=', x, round(4 * x / (1 + x) ** 2, 3), '効率', round(x / (1 + x), 3))

p('== 例題14 コンデンサー ==')
for E, Ra, Rb, C in [(12, 4, 2, 10e-6), (9, 2, 1, 20e-6), (6, 1e3, 2e3, 5e-6)]:
    V = E * Rb / (Ra + Rb); p(E, Ra, Rb, 'V', V, 'Q', C * V, 'I', E / (Ra + Rb))

p('== はしごの入口の抵抗（すべて 1 Ω） ==')
r = 2.0; out = [r]
for k in range(7):
    r = 1 + r / (1 + r); out.append(round(r, 5))
p(out, (1 + 5 ** .5) / 2)
