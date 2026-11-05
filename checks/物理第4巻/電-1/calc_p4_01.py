# 電-1（tex/p4-01.tex）の数をすべて計算して確かめる。組 電W1。
# 使い方: python3 calc_p4_01.py > calc_p4_01_out.txt
# 本文の丸め：k=8.99e9、eps0=8.85e-12、e=1.60e-19（Y-6）。CODATA 2022 の値も並べる。
import math
pi = math.pi
k = 8.99e9
eps0 = 8.85e-12
e = 1.60e-19
me = 9.11e-31
mp = 1.67e-27
G = 6.67e-11
g = 9.8
# CODATA 2022（physics.nist.gov で確かめた）
eps0_c = 8.8541878188e-12
e_c = 1.602176634e-19
k_c = 1 / (4 * pi * eps0_c)


def p(label, *v):
    print(label, ' '.join('%.6g' % x for x in v))


print('== 定数')
p('k=1/(4π ε0)（CODATA）', k_c)
p('1/(4π×8.85e-12)', 1 / (4 * pi * eps0))
p('1 C の電子の数', 1 / e_c)
p('スマホの電池 3000 mAh の電荷 C', 3.0 * 3600)

print('\n== 例題1・じぶんでとこう1')
F = k * 1 * 1 / 1 ** 2
p('1 C どうし 1 m の力 N', F)
p('その力で支えられる質量 kg（÷9.8）', F / g)
p('J1(1) 1 μC どうし 1 cm の力 N', k * 1e-6 * 1e-6 / 0.01 ** 2)
p('J1(2) +3 nC と −1 nC を触れさせると、それぞれ nC', (3 - 1) / 2)

print('\n== 例題2・じぶんでとこう2')
r = 5.29e-11
Fe = k * e * e / r ** 2
Fg = G * me * mp / r ** 2
p('水素 クーロン力 N・万有引力 N・比', Fe, Fg, Fe / Fg)
r = 1e-9
Fe = k * e * e / r ** 2
Fg = G * me * me / r ** 2
p('J2 電子どうし 1 nm：クーロン力 N・万有引力 N・比', Fe, Fg, Fe / Fg)

print('\n== 例題3（はてな？）・じぶんでとこう3')
Fhair = k * 2.0e-8 * 1.0e-10 / 0.05 ** 2
mhair = 1300 * pi * (40e-6) ** 2 * 0.10
p('髪1本の質量 kg・重さ N', mhair, mhair * g)
p('5 cm：電気の力 N・比', Fhair, Fhair / (mhair * g))
F10 = k * 2.0e-8 * 1.0e-10 / 0.10 ** 2
p('J3 10 cm：電気の力 N・比', F10, F10 / (mhair * g))
p('J3 力が重さと同じになる距離 m', math.sqrt(k * 2.0e-8 * 1.0e-10 / (mhair * g)))


def Efield(qs, x, y):
    Ex = Ey = 0.0
    for q, (a, b) in qs:
        dx, dy = x - a, y - b
        rr = math.hypot(dx, dy)
        Ex += k * q * dx / rr ** 3
        Ey += k * q * dy / rr ** 3
    return Ex, Ey


print('\n== 例題4・じぶんでとこう4')
p('1 つの電荷の電場の大きさ（0.0707 m）', k * 1e-6 / (0.05 ** 2 * 2))
p('例題4 +1 μC(0,0)・−1 μC(0.1,0)：(0.05,0.05) の Ex・Ey', *Efield([(1e-6, (0, 0)), (-1e-6, (0.1, 0))], 0.05, 0.05))
p('J4 +1 μC(0,0)・+1 μC(0.1,0)：(0.05,0.05) の Ex・Ey', *Efield([(1e-6, (0, 0)), (1e-6, (0.1, 0))], 0.05, 0.05))

print('\n== 例題5・じぶんでとこう5')
# +4q at 0, +q at 0.3：4/x^2 = 1/(0.3-x)^2 → 2(0.3-x)=x
x = 0.6 / 3
p('例題5 力が0の点（+4q から）m', x, 4 / x ** 2 - 1 / (0.3 - x) ** 2)
x = 0.4 / 4
p('J5 +q(0)・+9q(0.4)：+q から m', x, 1 / x ** 2 - 9 / (0.4 - x) ** 2)

print('\n== 例題6・じぶんでとこう6')
F1 = k * 1e-12 / 0.1 ** 2
p('正三角形：1組 N・合力 N', F1, 2 * F1 * math.cos(math.radians(30)))
Fd = k * 1e-12 / (0.1 ** 2 * 2)
tot = math.hypot(F1 + Fd / math.sqrt(2), F1 + Fd / math.sqrt(2))
p('J6 正方形：となり N・対角 N・合力 N', F1, Fd, tot)

print('\n== 例題7・じぶんでとこう7（8-5⑥ の表）')
for rr in (0.1, 0.2, 0.3, 0.5, 1.0):
    p('1 nC r=%.1f m の E N/C' % rr, k * 1e-9 / rr ** 2)
for rr in (0.1, 0.3):
    p('J7(1) 2 nC r=%.1f m の E' % rr, k * 2e-9 / rr ** 2)
p('J7(2) 1 nC で E=100 N/C になる r m', math.sqrt(k * 1e-9 / 100))

print('\n== 例題8・じぶんでとこう8（双極子）')


def Edip(z, d=0.01, q=1e-9):
    return k * q * (1 / (z - d / 2) ** 2 - 1 / (z + d / 2) ** 2)


for z in (0.1, 0.2):
    p('±1 nC・1 cm 軸上 z=%.1f：正確・近似 2kp/z^3' % z, Edip(z), 2 * k * 1e-11 / z ** 3)
p('比 0.1/0.2', Edip(0.1) / Edip(0.2))
for z in (0.1, 0.3):
    p('J8 ±2 nC・1 cm 軸上 z=%.1f：正確・近似' % z, Edip(z, q=2e-9), 2 * k * 2e-11 / z ** 3)
p('双極子の近似のずれ %（z=0.1, d=0.01）', (Edip(0.1) / (2 * k * 1e-11 / 0.1 ** 3) - 1) * 100)
p('水分子の双極子モーメント（参考 6.2e-30 C·m）・e×距離 m', 6.2e-30 / e)

print('\n== 例題9・じぶんでとこう9（線電荷）')
p('λ=1 nC/m・0.1 m', 2 * k * 1e-9 / 0.1, 1e-9 / (2 * pi * eps0 * 0.1))
p('J9 λ=2 nC/m・0.05 m と 0.2 m', 2 * k * 2e-9 / 0.05, 2 * k * 2e-9 / 0.2)
# 有限の長さ L の線（まん中の横 r）：E = 2kλ/r × (L/2)/sqrt(r^2+(L/2)^2)
lam, L, r = 1e-9, 1.0, 0.1
Efin = 2 * k * lam / r * (L / 2) / math.sqrt(r ** 2 + (L / 2) ** 2)
p('チャレンジ2 長さ 1 m の線・0.1 m：E・無限との比', Efin, Efin / (2 * k * lam / r))
# 数値積分で確かめる
n = 200000
s = 0.0
for i in range(n):
    xx = -L / 2 + (i + 0.5) * L / n
    s += k * lam * (L / n) * r / (r * r + xx * xx) ** 1.5
p('  数値積分', s)

print('\n== 例題10・じぶんでとこう10（円環）')
Q, a = 1e-8, 0.1
Ering = lambda z: k * Q * z / (z * z + a * a) ** 1.5
zm = a / math.sqrt(2)
p('いちばん強い z m・E N/C', zm, Ering(zm))
for z in (0.0, 0.05, 0.1, 0.2, 0.3, 1.0):
    p('  z=%.2f の E' % z, Ering(z))
p('J10 z=1 m：円環・点電荷とみた値', Ering(1.0), k * Q / 1.0 ** 2)
p('J10 z=0.2 m：円環', Ering(0.2))

print('\n== 例題11・じぶんでとこう11（平面）')
p('σ=1 μC/m2：σ/(2ε0)', 1e-6 / (2 * eps0))
p('J11 σ=5 μC/m2：1枚・2枚の間', 5e-6 / (2 * eps0), 5e-6 / eps0)
# 円板の軸上 E=σ/(2ε0)(1 − z/sqrt(z^2+R^2))
sig, R, z = 1e-6, 0.1, 0.01
Ed = sig / (2 * eps0) * (1 - z / math.sqrt(z * z + R * R))
p('チャレンジ3 円板 R=0.1・z=0.01：E・無限との比', Ed, Ed / (sig / (2 * eps0)))
for z in (0.001, 0.01, 0.05, 0.1, 0.3):
    p('  円板 z=%.3f の比' % z, 1 - z / math.sqrt(z * z + R * R))

print('\n== 例題12・じぶんでとこう12（電場の中の粒）')
acc = 2e-13 * 1e6 / 1e-10
t = 0.01 / 20
p('インク：加速度・時間・ずれ mm・重力との比', acc, t, 0.5 * acc * t * t * 1e3, acc / g)
p('  出口の横の速さ m/s・角 度', acc * t, math.degrees(math.atan(acc * t / 20)))
a_e = e * 1e4 / me
t = 0.02 / 1e7
p('J12 電子 E=1e4・2 cm・1e7 m/s：a・t・ずれ mm', a_e, t, 0.5 * a_e * t * t * 1e3)

print('\n== 章末問題')
p('基本1 +3 nC と −2 nC・3 cm：力 N', k * 3e-9 * 2e-9 / 0.03 ** 2)
p('基本1 触れて離す：それぞれ nC・力 N', 0.5, k * 0.5e-9 * 0.5e-9 / 0.03 ** 2)
E4 = k * 4e-9 / 0.2 ** 2
p('基本2 4 nC・0.2 m：E・電子の力 N', E4, e * E4)
x = 0.6 / 3
p('基本3 +q(0)・+4q(0.6)：+q から m', x, 1 / x ** 2 - 4 / (0.6 - x) ** 2)
p('基本4 +2 μC(0,0)・+2 μC(0.2,0)：(0.1,0.1)', *Efield([(2e-6, (0, 0)), (2e-6, (0.2, 0))], 0.1, 0.1))
a_e = e * 200 / me
t = 0.05 / 2e6
p('基本5 電子 E=200・5 cm・2e6：a・t・ずれ cm・a/g', a_e, t, 0.5 * a_e * t * t * 100, a_e / g)
p('基本6 陽子どうし 1e-15 m の力 N', k * e * e / 1e-30)
# チャレンジ1：双極子の垂直二等分線
q, d, r = 1e-9, 0.01, 0.1
Eperp = k * q * d / (r * r + d * d / 4) ** 1.5
p('チャレンジ1 垂直二等分線 0.1 m：正確・近似 kp/r^3', Eperp, k * q * d / r ** 3)
