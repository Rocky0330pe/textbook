# 電-11（tex/p4-11.tex）の数の検算。組 電W6。
# python3 calc_p4_11.py > calc_p4_11_out.txt
import cmath, math

r3 = math.sqrt(3)
def pr(*a):
    print(*a)

def pqs(V, I, pf):
    S = V * I
    P = S * pf
    Q = S * math.sqrt(1 - pf ** 2)
    return P, Q, S

pr('== 例題1・じぶん1')
pr('100 V 10 A pf0.8 P Q S', pqs(100, 10, 0.8))
pr('200 V 5 A pf0.6 P Q S', pqs(200, 5, 0.6))

pr('== 例題2 RL（電-10 例題5 と同じ R=4・X=3）・じぶん2')
for R, X, V in [(4, 3, 100), (6, 8, 100)]:
    Z = math.hypot(R, X); I = V / Z; pf = R / Z
    pr(R, X, 'Z', Z, 'I', I, 'I^2R', I * I * R, 'VIcos', V * I * pf, 'pf', pf, 'phi deg', math.degrees(math.atan2(X, R)), 'Q=I^2X', I * I * X)

pr('== 例題3・4 モーター 2 kW pf0.7 200 V 50 Hz')
def corr(P, pf, V, f, pf2=1.0):
    I1 = P / (V * pf)
    Q1 = P * math.tan(math.acos(pf))
    Q2 = P * math.tan(math.acos(pf2))
    Qc = Q1 - Q2
    C = Qc / (2 * math.pi * f * V ** 2)
    I2 = P / (V * pf2)
    Ic = Qc / V
    return dict(I1=I1, S1=P / pf, Q1=Q1, Qc=Qc, C_uF=C * 1e6, I2=I2, Ic=Ic, loss_ratio=(I2 / I1) ** 2)
pr(corr(2000, 0.7, 200, 50))
pr('じぶん3・4 1.5 kW pf0.75 100 V 60 Hz', corr(1500, 0.75, 100, 60))

pr('== 例題5 送電 100 MW・10 Ω')
for V, pf in [(100e3, 1.0), (100e3, 0.9), (500e3, 1.0), (275e3, 1.0)]:
    I = 100e6 / (V * pf); L = I * I * 10
    pr(V, pf, 'I', I, 'loss MW', L / 1e6, '%', L / 100e6 * 100)
pr('pf0.9 ratio I', 1 / 0.9, 'loss', 1 / 0.81)

pr('== 例題6 変圧器 50 kVA pf0.8・じぶん 30 kVA pf0.85')
pr(50 * 0.8, 50 * 1.0, 30 * 0.85)

pr('== 例題7 単相3線式 例 1500 W・1000 W（100 V）・じぶん 1200 W・300 W')
for a, b in [(1500, 1000), (1200, 300), (1000, 1000)]:
    Ia, Ib = a / 100, b / 100
    pr(a, b, 'Ia', Ia, 'Ib', Ib, 'neutral', abs(Ia - Ib))
pr('中性線が切れたとき（1500 W と 500 W の抵抗が 200 V に直列）')
Ra = 100 ** 2 / 1500; Rb = 100 ** 2 / 500
I = 200 / (Ra + Rb)
pr('Ra', Ra, 'Rb', Rb, 'I', I, 'Va', I * Ra, 'Vb', I * Rb)

pr('== 例題8 Y の相電圧・じぶん')
pr(200 / r3, 400 / r3)

pr('== 例題9 Δ→Y・じぶん')
for R in [30, 60]:
    Ry = R / 3; Ip = 200 / R; Iline_d = r3 * Ip; Iline_y = 200 / r3 / Ry
    pr(R, 'Ry', Ry, 'Δ相電流', Ip, '線電流Δ', Iline_d, '線電流Y', Iline_y, 'P', 3 * Ip ** 2 * R)

pr('== 例題10 三相電力・じぶん')
pr(r3 * 200 * 10 * 0.85, r3 * 400 * 20 * 0.9)

pr('== 例題11 三相の瞬時電力 相 100 V・10 A・pf0.85（じぶん pf0.5）')
for pf in [0.85, 0.5]:
    phi = math.acos(pf)
    tot = []; single = []
    for k in range(0, 361, 30):
        th = math.radians(k)
        s = 0
        for m in range(3):
            sh = m * 2 * math.pi / 3
            v = 100 * math.sqrt(2) * math.sin(th - sh)
            i = 10 * math.sqrt(2) * math.sin(th - sh - phi)
            s += v * i
            if m == 0:
                single.append(round(v * i, 1))
        tot.append(round(s, 3))
    pr(pf, 'three', tot)
    pr(pf, 'single a', single, 'avg', 1000 * pf, 'min', 1000 * pf - 1000, 'max', 1000 * pf + 1000)

pr('== 例題12 銅の量（同じ電力・同じ線間電圧・同じ損失）')
# 単相2線：R1、三相3線：R3。損失 2(P/V)^2 R1 = 3(P/√3V)^2 R3 → R3 = 2R1
P, V, R1 = 1.0, 1.0, 1.0
R3 = 2 * (P / V) ** 2 * R1 / (3 * (P / (r3 * V)) ** 2)
pr('R3/R1', R3, 'copper ratio', (3 / R3) / (2 / R1))
# じぶん：同じ銅の量で損失の比
R3b = 1.5 * R1
pr('同じ銅の量の損失比', 3 * (P / (r3 * V)) ** 2 * R3b / (2 * (P / V) ** 2 * R1))

pr('== 例題13 回転磁界の速さ')
for f, poles in [(50, 2), (50, 4), (60, 2), (60, 6)]:
    pr(f, poles, 120 * f / poles)

pr('== ⑨ 回転磁界の大きさ（3/2）')
for k in range(0, 361, 30):
    th = math.radians(k)
    B = 0
    for m in range(3):
        ang = m * 2 * math.pi / 3
        B += math.cos(th - ang) * cmath.exp(1j * ang)
    pr(k, round(abs(B), 6), round(math.degrees(cmath.phase(B)), 3))

pr('== 章末 基本')
pr('1', pqs(200, 15, 0.8))
pr('2', 100 / math.hypot(8, 6), (100 / 10) ** 2 * 8, 8 / 10, (100 / 10) ** 2 * 6)
pr('3', corr(4000, 0.8, 200, 50))
pr('4', (66 / 154) ** 2)
pr('5', 100 * 5 * 0.6 * 2 / 1000, 'kWh')
pr('6 line A', 10 + 10, 'line B', 6 + 10, 'N', 10 - 6)
pr('== 章末 チャレンジ')
pr('7 Δ 20Ω', 200 / 20, r3 * 200 / 20, 3 * 200 ** 2 / 20, 'Y', 200 / r3 / 20, 3 * (200 / r3) ** 2 / 20)
I1 = 30000 / (r3 * 200 * 0.75); I2 = 30000 / (r3 * 200 * 0.95)
Q1 = 30 * math.tan(math.acos(0.75)); Q2 = 30 * math.tan(math.acos(0.95))
pr('8', I1, Q1, Q2, Q1 - Q2, I2, (I2 / I1) ** 2)
pr('9 B0=0.01 →', 1.5 * 0.01)
In = 10 + 10 * cmath.exp(-2j * math.pi / 3) + 4 * cmath.exp(2j * math.pi / 3)
pr('10 neutral', In, abs(In))

pr('== 図：力率と電流・損失（同じ有効電力）')
for pf in [1.0, 0.9, 0.8, 0.7, 0.6, 0.5]:
    pr(pf, 1 / pf, 1 / pf ** 2)
