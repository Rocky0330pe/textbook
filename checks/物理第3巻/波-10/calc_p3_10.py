#!/usr/bin/env python3
"""波-10 見えない中を調べる：超音波と振動の計測 の数値の検算（組 波W5）。
python3 checks/物理第3巻/波-10/calc_p3_10.py
"""
import math

pi = math.pi
log10 = math.log10


def p(label, *vals):
    print(label, ':', ', '.join(f'{v:.6g}' for v in vals))


c_air, c_w, c_sea, c_st, c_body = 343.0, 1480.0, 1500.0, 5900.0, 1540.0
rho_air, rho_w, rho_st = 1.204, 998.0, 7850.0
Z_air = rho_air * c_air
Z_w = rho_w * c_w
Z_st = rho_st * c_st
Z_body = 1.63e6
p('Z 空気・水・鋼・体', Z_air, Z_w, Z_st, Z_body)

print('== ① こだま')
p('コウモリ 6.0 ms → m', c_air * 6.0e-3 / 2)
p('コウモリ 100 kHz・40 kHz の波長 mm', c_air / 100e3 * 1e3, c_air / 40e3 * 1e3)
p('jibun コウモリ 2.0 ms → m', c_air * 2.0e-3 / 2)
p('問1 4.0 ms → m', c_air * 4.0e-3 / 2)
p('駐車センサー 2.9 ms → m', c_air * 2.9e-3 / 2)
p('jibun 駐車 0.30 m の往復時間 ms', 2 * 0.30 / c_air * 1e3)
p('問 1.75 ms → m', c_air * 1.75e-3 / 2)
p('両耳 15 mm（間かく）の時間差 μs（真横）', 0.015 / c_air * 1e6)
p('コウモリ 1 m 先の虫が 1 m/s で近づく Δf (40 kHz)', 2 * 1 * 40e3 / c_air)

print('== ② 波長と減衰')
for f in (1e6, 2e6, 3.5e6, 5e6, 7.5e6, 10e6, 15e6):
    lam = c_body / f * 1e3
    depth = 60 / (2 * 0.5 * f / 1e6)
    p(f'体 {f/1e6} MHz の波長 mm・60 dB で届く深さ cm', lam, depth)
p('例題 5 MHz の波長 mm', c_body / 5e6 * 1e3)
p('5 MHz 往復 20 cm（深さ 10 cm）の減衰 dB', 0.5 * 5 * 20)
p('jibun 3.5 MHz 深さ 8 cm', 0.5 * 3.5 * 16, c_body / 3.5e6 * 1e3)
p('鋼 5 MHz の波長 mm', c_st / 5e6 * 1e3)
p('jibun 鋼 2 MHz 波長', c_st / 2e6 * 1e3)
p('50 dB は強さ何分の1', 10 ** (-5))

print('== ③ 探傷')
p('20 μs → mm', c_st * 20e-6 / 2 * 1e3)
p('板厚 100 mm の底面エコー μs', 2 * 0.100 / c_st * 1e6)
p('jibun 25 μs → mm、底 50 mm の時間', c_st * 25e-6 / 2 * 1e3, 2 * 0.05 / c_st * 1e6)
p('問 12 μs → mm', c_st * 12e-6 / 2 * 1e3)


def r(z1, z2):
    return (z2 - z1) / (z2 + z1)


rws = r(Z_w, Z_st)
p('水→鋼 r, r², 1−r²', rws, rws ** 2, 1 - rws ** 2)
p('鋼→空気 r', r(Z_st, Z_air))
p('鋼→水 r', r(Z_st, Z_w))
p('jibun 体→空気 r, ゼリー(1.5e6)→体 r', r(Z_body, Z_air), r(1.5e6, Z_body))
p('jibun 油(1.3e6?)→鋼', r(1.3e6, Z_st))

print('== ④ 厚さ計・ソナー')
p('鋼 10 mm の往復 μs', 2 * 0.010 / c_st * 1e6)
p("3.1 μs → mm", c_st * 3.1e-6 / 2 * 1e3)
p('jibun 鋼管 6.0 mm の往復、1.8 μs → mm', 2 * 0.006 / c_st * 1e6, c_st * 1.8e-6 / 2 * 1e3)
p('ソナー 0.2 s → m', c_sea * 0.2 / 2)
p('jibun 0.06 s', c_sea * 0.06 / 2)
p('問 0.08 s', c_sea * 0.08 / 2)
p('魚 200 kHz 1.0 m/s 近づく Δf', 2 * 1.0 * 200e3 / c_sea)
p('jibun 50 kHz 0.5 m/s 遠ざかる', 2 * 0.5 * 50e3 / c_sea)
p('ソナー 50 kHz の波長 mm, 200 kHz', c_sea / 50e3 * 1e3, c_sea / 200e3 * 1e3)
p('水深 4000 m のエコー時間', 2 * 4000 / c_sea)

print('== 水浸の探傷（チャレンジ）')
tw = 2 * 0.030 / c_w
tsteel = 2 * 0.020 / c_st
p('水 30 mm の往復 μs, 鋼 20 mm の往復 μs, 合計', tw * 1e6, tsteel * 1e6, (tw + tsteel) * 1e6)
T1 = 1 - rws ** 2
p('強さの透過 1−r², 2回', T1, T1 ** 2, 10 * log10(T1 ** 2))
# 底面（鋼→空気）で全部はね返る
p('表面エコーの強さ r²（dB）', rws ** 2, 10 * log10(rws ** 2))

print('== ⑤ 圧電')
p('400 pC/N × 10 N nC', 400e-12 * 10 * 1e9)
p('jibun 2.3 pC/N（水晶）× 10 N pC', 2.3 * 10)
p('問 250 pC/N × 20 N', 250e-12 * 20 * 1e9)
p('水晶時計 2^15', 2 ** 15)

print('== ⑥ 変位・速度・加速度')
w = 2 * pi * 10
p('10 Hz・1 mm: v mm/s, a m/s²', 1e-3 * w * 1e3, 1e-3 * w * w)
w = 2 * pi * 20
p('20 Hz・1 mm: v, a', 1e-3 * w * 1e3, 1e-3 * w * w)
w = 2 * pi * 25
p('問 25 Hz・0.2 mm: v mm/s, a m/s²', 0.2e-3 * w * 1e3, 0.2e-3 * w * w)
w = 2 * pi * 50
p('jibun 50 Hz・0.1 mm', 0.1e-3 * w * 1e3, 0.1e-3 * w * w)
w = 2 * pi * 1
p('ビル 1 Hz で加速度 0.1 m/s² の変位 mm', 0.1 / w ** 2 * 1e3)
p('1 G のときの 1 kHz の変位 μm', 9.8 / (2 * pi * 1000) ** 2 * 1e6)


def H(rr, z):
    return 1 / math.sqrt((1 - rr * rr) ** 2 + (2 * z * rr) ** 2)


print('== ⑦ センサー')
for z in (0.1, 0.4, 0.6, 0.65, 0.7, 1.0):
    p(f'ζ={z}: H(0.1),H(0.2),H(0.3),H(0.5),H(1)', H(0.1, z), H(0.2, z), H(0.3, z), H(0.5, z), H(1.0, z))
p('例題 ζ=0.7: 0.2, 0.5', H(0.2, 0.7), H(0.5, 0.7))
p('jibun ζ=0.1: 0.2, 0.5', H(0.2, 0.1), H(0.5, 0.1))
# 変位計 r²H
for z in (0.1, 0.7):
    for rr in (2, 3, 5, 10):
        p(f'変位計 ζ={z} ω/ωn={rr}: r²H', rr * rr * H(rr, z))
p('jibun 変位計 ζ=0.7, f_n=1 Hz, 3 Hz', 9 * H(3, 0.7))
# 誤差 5 % 以内の上限（ζ=0.7）: H>=0.95
lo, hi = 0.0, 1.0
for _ in range(60):
    mid = (lo + hi) / 2
    if H(mid, 0.7) >= 0.95:
        lo = mid
    else:
        hi = mid
p('ζ=0.7 で H≧0.95 になる上限 ω/ωn', lo)
p('その点の H', H(lo, 0.7))
for rr in (0.55, 0.6, 0.62, 0.65):
    p(f'ζ=0.7 H({rr})', H(rr, 0.7))
# ζ=0.1 で H≦1.05 の上限
lo, hi = 0.0, 0.9
for _ in range(60):
    mid = (lo + hi) / 2
    if H(mid, 0.1) <= 1.05:
        lo = mid
    else:
        hi = mid
p('ζ=0.1 で H≦1.05 の上限', lo)
p('加速度計 f_n=30 kHz の z の大きさ（1 G）nm', 9.8 / (2 * pi * 30e3) ** 2 * 1e9)
p('ζ=1/√2 の H の式 1/√(1+r^4)', 1 / math.sqrt(1 + 0.5 ** 4))

print('== ⑧ 回転機械')
fr = 1800 / 60
p('1800 rpm Hz, 2x', fr, 2 * fr)
p('1500 rpm Hz, 2x', 1500 / 60, 2 * 1500 / 60)
n, dD = 9, 0.2
p('BPFO 9 玉・0.2・30 Hz', n / 2 * fr * (1 - dD))
p('BPFI 同', n / 2 * fr * (1 + dD))
p('jibun 8 玉 0.25 25 Hz BPFO/BPFI', 8 / 2 * 25 * 0.75, 8 / 2 * 25 * 1.25)
p('チャレンジ 7 玉 d/D=0.3 3000 rpm BPFO BPFI', 7 / 2 * 50 * 0.7, 7 / 2 * 50 * 1.3)
p('BPFO+BPFI = n fr', n / 2 * fr * 0.8 + n / 2 * fr * 1.2, n * fr)

print('== ⑨ たたく')
# 減衰振動の例：25 Hz、ζ=0.02
p('25 Hz の周期 ms', 1000 / 25)

print('== ⑩ ひずみゲージ')
p('120 Ω・K=2・200 με の ΔR Ω', 120 * 2 * 200e-6)
p('jibun 350 Ω・K=2・50 με', 350 * 2 * 50e-6)
p('ΔR/R', 2 * 200e-6)
# 片持ちはり：鋼 E=205 GPa、ひずみ 200 με → 応力 MPa
p('応力 E ε MPa', 205e3 * 200e-6)
