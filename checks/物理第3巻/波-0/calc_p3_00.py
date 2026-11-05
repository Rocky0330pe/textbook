#!/usr/bin/env python3
"""波-0（序章）の数値をすべて計算する。python3 checks/物理第3巻/波-0/calc_p3_00.py
本文の章の値にそろえた：音速 340 m/s（波-9 例題1）・343 m/s（20 ℃）、光速 3.00e8 m/s（波-12）、
光ファイバのコア 1.48（波-12 ④）、30階の固有周期 0.1×階数（波-1 の桁の感覚）、A弦 110 Hz・0.65 m・143 m/s（9-1、波-6 ③）、
ブランコ 2.0 m → 2.8 s（波-1 例題1）、P波 約7 km/s・S波 約4 km/s（気象庁）。
"""
import math

c_air = 340.0      # 中学理科とくらべる例題の音速（波-9）
c_air20 = 343.0
c_light = 3.00e8

print('== 例題1 雷 3.0 s')
t = 3.0
d = c_air * t
print('距離 d = %.0f m = %.2f km' % (d, d / 1000))
print('光の時間 %.2e s' % (d / c_light))
print('6 s なら %.2f km、 9 s なら %.2f km' % (c_air * 6 / 1000, c_air * 9 / 1000))
print('音速 343 なら %.0f m（ちがい %.1f %%）' % (c_air20 * t, (c_air20 - c_air) / c_air * 100))

print('== 例題2 30階のビル')
N = 30
T = 0.1 * N
f = 1 / T
print('T = %.1f s, f = %.3f Hz' % (T, f))
print('10階 T=%.1f s f=%.1f Hz、 60階 T=%.1f s' % (0.1 * 10, 1 / (0.1 * 10), 0.1 * 60))
l = 2.0; g = 9.8
print('ブランコ 2.0 m T = %.2f s' % (2 * math.pi * math.sqrt(l / g)))
print('1分間の往復の回数 %.0f 回' % (60 / T))

print('== 例題3 光ファイバ 400 km')
n = 1.48
v = c_light / n
L = 400e3
tf = L / v
print('v = %.3e m/s, t = %.3e s = %.2f ms' % (v, tf, tf * 1000))
print('空気中の電波（真空と同じとみる） %.2f ms' % (L / c_light * 1000))
print('音（343）なら %.0f s = %.1f 分' % (L / c_air20, L / c_air20 / 60))
print('n=1.5 なら %.2f ms' % (L / (c_light / 1.5) * 1000))

print('== ② c = f λ')
for fq in (110, 220, 440, 1000):
    print('%4d Hz の音（343 m/s）の波長 %.2f m' % (fq, c_air20 / fq))
print('周期 T（440 Hz） = %.2e s' % (1 / 440))

print('== 2倍にすると：弦（9-1・波-6 ③）')
c_str = 143.0
for Ls in (0.65, 0.325, 0.65 * 2 / 3, 0.65 * 3 / 4):
    print('L = %.3f m → f = c/(2L) = %.1f Hz' % (Ls, c_str / (2 * Ls)))
print('c = 2 L f = %.1f m/s' % (2 * 0.65 * 110))

print('== 振動数のものさし')
items = {
    '30階のビル': 1 / 3.0, 'ブランコ 2.0 m': 1 / (2 * math.pi * math.sqrt(2.0 / 9.8)),
    'A弦': 110, 'おんさ': 440, '聞こえる下限': 20, '聞こえる上限': 20e3,
    '超音波検査（下）': 2.5e6, '超音波検査（上）': 10e6, 'AM 531 kHz': 531e3, 'AM 1602 kHz': 1602e3,
    'FM 76.1 MHz': 76.1e6, 'FM 94.9 MHz': 94.9e6, 'Wi-Fi 2.4 GHz': 2.4e9,
    '光ファイバ 1550 nm': c_light / 1550e-9, '赤 780 nm': c_light / 780e-9, '紫 380 nm': c_light / 380e-9,
    '緑 550 nm': c_light / 550e-9,
}
for k, v in items.items():
    print('%-16s %.3e Hz   log10 = %.2f' % (k, v, math.log10(v)))
print('FM 80 MHz の波長 %.2f m、 AM 1000 kHz の波長 %.0f m、 2.4 GHz の波長 %.3f m' % (c_light / 80e6, c_light / 1e6, c_light / 2.4e9))

print('== 地震の P 波・S 波（気象庁：約7・約4 km/s）')
vp, vs = 7.0, 4.0
D = 100.0
print('100 km 先：P %.1f s、S %.1f s、差 %.1f s' % (D / vp, D / vs, D / vs - D / vp))
print('差 1 s あたり %.1f km' % (1 / (1 / vs - 1 / vp)))
print('== もっと知りたい：初期微動（P 7 km/s・S 4 km/s）')
for dt in (1, 10):
    print('差 %d s → 震源まで %.1f km' % (dt, dt * 28 / 3))
print('100 km で差 %.2f s' % (100 / 4 - 100 / 7))
