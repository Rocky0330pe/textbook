# 電-10 向きが変わる電気：例題・じぶんでとこう・章末問題・図の数を確かめる（組 電W3）
# 実行：python3 calc_p4_10.py > calc_p4_10_out.txt
import cmath, math
pi = math.pi
def p(*a): print(*a)
def deg(z): return math.degrees(cmath.phase(z))

p('== ① 50 Hz・60 Hz ==')
for f in (50, 60): p(f, 'T ms', 1000 / f, 'omega', 2 * pi * f)
p('101±6 V の範囲', 101 - 6, 101 + 6, '山', math.sqrt(2) * 95, math.sqrt(2) * 107)

p('== 例題1・2 実効値 ==')
for V in (100, 200, 101, 230): p(V, '山', math.sqrt(2) * V)
p('dryer 1200W 100V', 1200 / 100, 'peak', math.sqrt(2) * 12, 'R', 100 / 12)
p('jibun 800 W 100 V', 800 / 100, math.sqrt(2) * 8)
p('章末 1000 W', 10, math.sqrt(2) * 10)
p('②の図 1Ω に 1 A：平均電力', 1)

p('== 例題3・4 リアクタンス ==')
for L, f in ((10e-3, 50), (10e-3, 1592), (20e-3, 60), (0.1, 60), (0.1, 1000)):
    p('XL', L, f, 2 * pi * f * L)
for C, f in ((1e-6, 50), (1e-6, 1592), (2e-6, 60), (10e-6, 50), (10e-6, 1000)):
    p('XC', C, f, 1 / (2 * pi * f * C))
p('XL=XC の f（10 mH,1 μF）', 1 / (2 * pi * math.sqrt(10e-3 * 1e-6)))
p('100 V 50 Hz を 1 μF：電流', 100 / (1 / (2 * pi * 50 * 1e-6)))

p('== 例題5 RL ==')
for R, X, E in ((4, 3, 100), (6, 8, 100), (3, 4, 50)):
    Z = complex(R, X); I = E / Z
    p(R, X, '|Z|', abs(Z), '|I|', abs(I), '角', deg(I), 'VR', R * abs(I), 'VX', X * abs(I))
p('力率 4/5 =', 4 / 5)

p('== 例題6 RLC 直列 ==')
L, C, R = 10e-3, 1e-6, 20
f0 = 1 / (2 * pi * math.sqrt(L * C)); w0 = 2 * pi * f0
p('f0', f0, 'w0', w0, 'Q', w0 * L / R, '(1/R)sqrt(L/C)', math.sqrt(L / C) / R, 'zeta', R / 2 * math.sqrt(C / L))
for f in (500, 1000, 1500, f0, 1700, 2000, 3000):
    w = 2 * pi * f; Z = complex(R, w * L - 1 / (w * C))
    p('f', round(f, 1), '|Z|', round(abs(Z), 2), 'I mA', round(1000 / abs(Z), 2), '角', round(-deg(Z), 1))
p('共振で VL=VC=QE', w0 * L * (1 / R), 1 / (w0 * C) / R)
p('半値幅 Hz', f0 / (w0 * L / R))
# 半値の周波数（正確）
a = R / (2 * L)
w1 = -a + math.sqrt(a * a + w0 * w0); w2 = a + math.sqrt(a * a + w0 * w0)
p('正確な半値の f', w1 / 2 / pi, w2 / 2 / pi, '差', (w2 - w1) / 2 / pi)
for RR in (10, 20, 40):
    p('R', RR, 'Q', w0 * L / RR, 'peak mA', 1000 / RR, 'bandwidth Hz', f0 / (w0 * L / RR))
p('jibun: 50 mH, 0.2 μF, 50 Ω')
L2, C2, R2 = 50e-3, 0.2e-6, 50
f02 = 1 / (2 * pi * math.sqrt(L2 * C2)); p('f0', f02, 'Q', 2 * pi * f02 * L2 / R2, 'I at 2V', 2 / R2)

p('== 例題7 ラジオ ==')
L = 200e-6
for f in (1e6, 594e3, 531e3, 1602e3):
    p(f, 'C pF', 1 / ((2 * pi * f) ** 2 * L) * 1e12)
p('jibun: 954 kHz', 1 / ((2 * pi * 954e3) ** 2 * L) * 1e12)
L3 = 300e-6
p('チャレンジ 300 μH: 531, 1602 kHz', [1 / ((2 * pi * f) ** 2 * L3) * 1e12 for f in (531e3, 1602e3)])

p('== 例題8 Q と半値幅 ==')
p('Q=100 1MHz', 1e6 / 100)
p('jibun Q=50 594 kHz', 594e3 / 50)
Qn = 1e6 / 9e3; Rn = 2 * pi * 1e6 * 200e-6 / Qn
p('チャレンジ: 半値幅 9 kHz の Q', Qn, 'R', Rn, '切り捨て Q', math.floor(Qn))
p('200 μH,1 MHz で R=10 Ω の Q', 2 * pi * 1e6 * 200e-6 / 10)

p('== 例題9 RC ローパス ==')
R, C = 1e3, 0.1e-6
fc = 1 / (2 * pi * R * C); p('fc', fc)
for f in (100, fc, 10e3, 100e3):
    g = 1 / complex(1, 2 * pi * f * R * C); p(f, abs(g), 20 * math.log10(abs(g)), deg(g))
R, C = 10e3, 0.01e-6; p('章末 fc', 1 / (2 * pi * R * C))
R, C = 2.2e3, 0.047e-6; fc2 = 1 / (2 * pi * R * C); p('jibun fc 2.2k 0.047u', fc2)
g = 1 / complex(1, 2 * pi * 20e3 * R * C); p('jibun 20 kHz dB', 20 * math.log10(abs(g)))

p('== 例題10 並列共振 ==')
L, C, R = 10e-3, 1e-6, 20
w = 1 / math.sqrt(L * C)
Zl = complex(R, w * L); Zc = 1 / complex(0, w * C)
Zp = Zl * Zc / (Zl + Zc); p('w0 での Z', Zp, abs(Zp), 'L/(CR)', L / (C * R))
# 正確な並列共振（Z が実数になる ω）
wr = math.sqrt(1 / (L * C) - (R / L) ** 2); p('Z が実数になる f', wr / 2 / pi)
Zl = complex(R, wr * L); Zc = 1 / complex(0, wr * C); p('そこでの Z', Zl * Zc / (Zl + Zc))
p('jibun 200 μH, 127 pF, 10 Ω', 200e-6 / (127e-12 * 10))

p('== 例題11 マクスウェルブリッジ ==')
R2 = R3 = 1e3; C4 = 0.01e-6; R4 = 50e3
p('L', R2 * R3 * C4, 'Rx', R2 * R3 / R4)
# 1 kHz で確かめ：Z1 Z4 = Z2 Z3
w = 2 * pi * 1000; Z1 = complex(R2 * R3 / R4, w * R2 * R3 * C4); Z4 = 1 / complex(1 / R4, w * C4)
p('Z1 Z4', Z1 * Z4, 'Z2 Z3', R2 * R3)
p('jibun R2=500, R3=2k, C4=0.02u, R4=25k', 500 * 2e3 * 0.02e-6, 500 * 2e3 / 25e3)
p('チャレンジ R2=R3=2k, C4=0.05u, R4=100k', 2e3 * 2e3 * 0.05e-6, 2e3 * 2e3 / 100e3)

p('== 例題12 ひずんだ波 ==')
p('100+10', math.sqrt(100 ** 2 + 10 ** 2))
p('jibun 100 + 3次 20 + 5次 10', math.sqrt(100 ** 2 + 20 ** 2 + 10 ** 2))
p('章末 100 + 5次 20', math.sqrt(100 ** 2 + 20 ** 2))
# 数値で確かめ：1周期の2乗平均
N = 100000; s = 0
for k in range(N):
    t = k / N
    v = math.sqrt(2) * 100 * math.sin(2 * pi * t) + math.sqrt(2) * 10 * math.sin(2 * pi * 3 * t + 0.7)
    s += v * v
p('数値の実効値', math.sqrt(s / N))

p('== ⑥ フェーザ図（例題5） ==')
I = 100 / complex(4, 3); p('I', I, 'VR', 4 * I, 'VL', 3j * I, '和', 4 * I + 3j * I, '|VR|+|VL|', abs(4 * I) + abs(3j * I))

p('== 章末問題 ==')
p('基本4 1 mH 10 nF R=10', 1 / math.sqrt(1e-3 * 1e-8), 1 / (2 * pi * math.sqrt(1e-3 * 1e-8)),
  'Q', 1 / math.sqrt(1e-3 * 1e-8) * 1e-3 / 10, '半値幅', 1 / (2 * pi * math.sqrt(1e-11)) / (1 / math.sqrt(1e-11) * 1e-3 / 10))
w0 = 1 / math.sqrt(0.2 * 1e-6)
p('チャレンジ3 0.2 H 1 μF 40 Ω', w0, w0 / 2 / pi, 'Q', w0 * 0.2 / 40)
p('チャレンジ4 共振の VC', 0.05 / (1e4 * 1e-6), 'VR', 20 * 0.05)
p('π=3.14 での例題4', 1 / (2 * 3.14 * 50 * 1e-6), 100 / (1 / (2 * 3.14 * 50 * 1e-6)))
p('π=3.14 での例題3', 2 * 3.14 * 50 * 0.01, 2 * 3.14 * 1592 * 0.01, 100 / (2 * 3.14 * 50 * 0.01))

p('== ③ フェーザのたし算の例 ==')
V1 = 60; V2 = 80 * cmath.exp(1j * pi / 2); S = V1 + V2; p('60∠0 + 80∠90', abs(S), deg(S))
