#!/usr/bin/env python3
"""波-14（読みもの　波で情報を送る）の数値をすべて計算する。python3 checks/物理第3巻/波-14/calc_p3_14.py
そろえた値：光の速さ 3.00e8 m/s（波-12・波-8）、コア 1.48（波-12 ④）、CD 1411.2 kbit/s・MP3 128 kbit/s（9-12①・波-11）、
G.711 64 kbit/s（波-11）、通信路容量 C = B log2(1+S/N)（波-11 ⑩：3 kHz・30 dB → 29.9 kbit/s）、
Wi-Fi（IEEE 802.11a）20 MHz・64 点・312.5 kHz・52 本（48 本でデータ）・3.2 μs＋0.8 μs（9-12⑤）。
"""
import math

c = 3.00e8
print('== ⑤ アンテナ：波長と 1/4 波長')
for name, f in [('AM 531 kHz', 531e3), ('AM 1000 kHz', 1000e3), ('AM 1602 kHz', 1602e3), ('FM 76.1 MHz', 76.1e6),
                ('FM 80 MHz', 80e6), ('FM 94.9 MHz', 94.9e6), ('Wi-Fi 2.4 GHz', 2.4e9), ('Wi-Fi 2.45 GHz', 2.45e9), ('5 GHz', 5e9)]:
    lam = c / f
    print('%-14s λ = %.4g m  λ/2 = %.4g m  λ/4 = %.4g m' % (name, lam, lam / 2, lam / 4))

print('== ② AM のスペクトル')
fc, fm = 1000e3, 1e3
print('上下の側波 %.0f kHz と %.0f kHz、はば %.0f kHz' % ((fc - fm) / 1e3, (fc + fm) / 1e3, 2 * fm / 1e3))
print('9 kHz おきに 531〜1602 kHz：局の数 %d' % (round((1602 - 531) / 9) + 1))
print('AM で 4.5 kHz までの音をのせると、はば %.0f kHz' % (2 * 4.5))

print('== ③ ディジタル：1回の記号のビット数')
for M in (2, 4, 16, 64, 256):
    print('%3d 点 → %d ビット' % (M, int(math.log2(M))))

print('== ④ OFDM（IEEE 802.11a）')
B = 20e6; N = 64
df = B / N
Tu = 1 / df
Tg = 0.8e-6
Ts = Tu + Tg
print('間かく %.1f kHz、 1/間かく %.2f μs、 1記号 %.2f μs、 1秒に %.0f 記号' % (df / 1e3, Tu * 1e6, Ts * 1e6, 1 / Ts))
for name, bits, rate in [('BPSK 1/2', 1, 1 / 2), ('QPSK 3/4', 2, 3 / 4), ('16QAM 3/4', 4, 3 / 4), ('64QAM 2/3', 6, 2 / 3), ('64QAM 3/4', 6, 3 / 4)]:
    nb = 48 * bits
    nd = nb * rate
    print('%-10s 1記号 %3d ビット（そのうちデータ %5.1f）→ %.1f Mbit/s' % (name, nb, nd, nd / Ts / 1e6))
print('52本のはば %.2f MHz' % (52 * df / 1e6))
print('反射のおくれ 0.8 μs で電波が進む距離 %.0f m' % (c * Tg))

print('== ⑧ 通信路容量')
def C(Bw, snr_db):
    return Bw * math.log2(1 + 10 ** (snr_db / 10))
print('波-11 の確かめ 3 kHz・30 dB: %.1f kbit/s' % (C(3e3, 30) / 1e3))
for snr in (10, 20, 25, 30):
    print('20 MHz・%d dB: %.1f Mbit/s' % (snr, C(20e6, snr) / 1e6))
print('54/199.3 = %.2f' % (54 / (C(20e6, 30) / 1e6)))
print('16.25 MHz・30 dB: %.1f Mbit/s' % (C(16.25e6, 30) / 1e6))
print('64QAM 1記号 6 ビット ↔ log2(1+S/N)=6 となる S/N %.1f dB' % (10 * math.log10(2 ** 6 - 1)))

print('== 圧縮')
cd = 44100 * 16 * 2
print('CD %.1f kbit/s、 MP3 128 → %.1f 分の1、 電話 64 kbit/s は CD の %.1f 分の1' % (cd / 1e3, cd / 128e3, cd / 64e3))
print('4 分の曲 CD %.1f MB、 MP3 %.2f MB' % (cd * 240 / 8 / 1e6, 128e3 * 240 / 8 / 1e6))
print('電話 1 分 %.2f MB' % (64e3 * 60 / 8 / 1e6))

print('== 見本の計算1 アンテナ 2.4 GHz')
lam = c / 2.4e9
print('λ = %.3f m、 λ/4 = %.4f m = %.2f cm' % (lam, lam / 4, lam / 4 * 100))

print('== 見本の計算2 静止衛星')
h = 35786e3
t = 2 * h / c
print('地上→衛星→地上 %.4f s、 返事が届くまで %.3f s' % (t, 2 * t))
print('光ファイバで地球半周 20000 km（n=1.48）: %.3f s' % (20000e3 * 1.48 / c))
print('低い軌道 550 km の衛星（真上）: %.2f ms' % (2 * 550e3 / c * 1000))

print('== 見本の計算4 光ファイバ 0.2 dB/km')
a = 0.2
for L in (50, 100, 150, 200):
    dB = a * L
    print('%3d km → %.0f dB → %.4g 倍' % (L, dB, 10 ** (-dB / 10)))
print('1 mW → 100 km 後 %.3f mW' % (1 * 10 ** (-2)))
print('1550 nm の振動数 %.3e Hz' % (c / 1550e-9))
print('ガラスの中 1 km の時間 %.2f μs' % (1e3 * 1.48 / c * 1e6))
print('銅線（電話の線）とのちがいの例は書かない')

print('== 見本の計算5 GPS')
r = 20200e3
print('真上の衛星から %.1f ms' % (r / c * 1000))
for dt in (1e-6, 1e-7, 1e-8, 1e-9):
    print('時計のずれ %.0e s → %.2f m' % (dt, c * dt))
print('時計 1 日に 38 μs ずれると %.1f km' % (c * 38e-6 / 1e3))

print('== レーダー（往復）')
t = 100e-6
print('100 μs で返る → %.0f km' % (c * t / 2 / 1e3))
