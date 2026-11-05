#!/usr/bin/env python3
"""物理第4巻 確認の直し 修4-3（電-6〜8）：直した数と、直した向きの図の検算。
出力は check_fix4_3_out.txt。"""
import math
import numpy as np

mu0 = 4 * math.pi * 1e-7
print('== E3-23 電-6 桁の感覚：MRI 1.5〜3 T は地球の磁場（4.6e-5 T）の何倍')
for B in (1.5, 3.0):
    print(f'  {B} T / 4.6e-5 T = {B / 4.6e-5:.3g} 倍')
print('  → 約3万〜7万倍（3.3万〜6.5万）')

print('== E3-28 電-7 例題3（l=0.20 m, S=4.0 cm2, mu_r=2000, N=200, I=0.50 A）')
S = 4.0e-4
R_fe = 0.20 / (2000 * mu0 * S)
Phi3 = 200 * 0.50 / R_fe
print(f'  R_fe = {R_fe:.4g} /H（3けた 1.99e5）, Phi = {Phi3:.4g} Wb（5.03e-4）, B = {Phi3 / S:.4g} T（1.26）')
print('== E3-28 電-7 例題4（すき間 1.0 mm）')
R_g = 1.0e-3 / (mu0 * S)
tot = R_fe + R_g
Phi4 = 200 * 0.50 / tot
print(f'  R_g = {R_g:.4g} /H（1.99e6）, 和 = {tot:.4g}（2.19e6）, Phi = {Phi4:.4g} Wb（4.57e-5）, '
      f'B = {Phi4 / S:.4g} T（0.114）, すき間の割合 = {R_g / tot:.3f}（0.91）, 磁束の比 = {Phi3 / Phi4:.3g}')
print('== E3-13 電-7 チャレンジ10：L = N^2 / R_m')
L1 = 200 ** 2 / R_fe
L2 = 200 ** 2 / tot
print(f'  L = {L1:.4g} H（約0.20）, すき間で {L2:.4g} H（約0.018）, 比 {L1 / L2:.3g}（約11分の1）')

print('== 電-7 チャレンジ12（偶数ページのために足した）：鉄心にたまるエネルギー')
H3 = 200 * 0.50 / 0.20
B3 = Phi3 / S
u = 0.5 * B3 * H3
V = 0.20 * S
print(f'  H = {H3:.0f} A/m, B = {B3:.4g} T, BH/2 = {u:.4g} J/m3（約314）, 体積 {V:.2g} m3, '
      f'エネルギー {u * V:.4g} J, LI^2/2 = {0.5 * L1 * 0.50 ** 2:.4g} J（どちらも約2.5e-2）')
print('== 電-7 ⑨ もっと知りたい（偶数ページのために足した）：最大エネルギー積 Br^2/(4 mu_rec mu0)')
for name, Br, mrec in (('ネオジム', 1.3, 1.05), ('フェライト', 0.40, 1.1)):
    print(f'  {name}: (BH)max = {Br ** 2 / (4 * mrec * mu0) / 1e3:.4g} kJ/m3')
print(f'  比 = {(1.3 ** 2 / 1.05) / (0.40 ** 2 / 1.1):.3g}（約11倍）')
Bs = np.linspace(0, 1.3, 1301)
prod = Bs * (1.3 - Bs) / (1.05 * mu0)
print(f'  数で確かめ：B|H| が最大になる B = {Bs[prod.argmax()]:.3f} T（Br/2 = 0.65）')
# すき間のエネルギー = (1/2) B |H_m| × 磁石の体積（例題11：l_m=5.0 mm, l_g=1.0 mm, S は約分）
lm, lg = 5.0e-3, 1.0e-3
Bop = 1.3 / (1 + 1.05 * lg / lm)
Hm = lg * Bop / (mu0 * lm)
print(f'  例題11 の動作点 B = {Bop:.4g} T：すき間 B^2/(2mu0)*lg = {Bop ** 2 / (2 * mu0) * lg:.4g}, '
      f'(1/2)B|Hm|*lm = {0.5 * Bop * Hm * lm:.4g}（同じ）')

print('== E3-24 電-7 図4：鉄の曲線 B = 1.65 tanh(H/400) + mu0 H のはじめの傾き')
slope = 1.65 / 400 + mu0
print(f'  dB/dH(0) = {slope:.4g} T/(A/m), mu_r = {slope / mu0:.4g}（約3300）。破線 B=1.65H/400 が 2.0 T になる H = {2.0 / (1.65 / 400):.0f} A/m')

print('== E3-15 電-8 表計算：B列・C列の 50 を 100 にしたとき')
for tms in (0, 2.5, 5.0, 7.5, 10.0):
    ang = 360 * 100 * tms / 1000
    e = 100 * 0.5 * 0.01 * 2 * math.pi * 100 * math.sin(math.radians(ang))
    print(f'  t={tms:5.1f} ms 角 {ang:5.0f}° 起電力 {e:7.1f} V')
print('  → 山 314.2 V、10 ms で1回まわる')

print('== E3-17 電-8 例題9：10 cm2 は何 cm 角か')
print(f'  sqrt(10) = {math.sqrt(10):.2f} cm（約3 cm 角。切手くらい）')

print('== E3-27 電-8 表皮深さのグラフの線の名前を置く所（線の値と字の位置）')
for name, k, x, ylab, anchor in (('アルミ', 11.5867, 1500, 2.4, 'south'), ('銅', 9.3347, 1500, 1.5, 'north'),
                                  ('鉄', 2.2508, 300, 0.75, 'north')):
    print(f'  {name}: f={x} Hz の線 {k * math.sqrt(50 / x):.3f} mm、字の{anchor}のはし {ylab} mm')

print('== 向きの外積（E3-1・E3-2・E3-5・E3-6・E3-26）')
x, y, z = np.eye(3)
# E3-5 電-6 図15：B は右（+x）、見る向きは軸の向き（+z が手前）。右上のはしの辺 a は ⊙（+z）
u = np.array([math.cos(math.radians(50)), math.sin(math.radians(50)), 0.0])
F_top = np.cross(z, x)
F_bot = np.cross(-z, x)
n = np.cross(u, z)  # 面に垂直な向き（電流の向きに右ねじを回す）
tau = np.cross(n, x)
print(f'  電-6 図15：右上の辺 a（⊙）の力 {F_top}（上）、左下の辺 a（⊗）の力 {F_bot}（下）、'
      f'法線 {np.round(n, 3)}（-40°の向き）、トルク n×B {np.round(tau, 3)}（+z：反時計回り。図の矢印と同じ）。'
      ' 力は紙面の中、回る軸は紙面に垂直＝辺 a に平行')
# E3-6・E3-26 電-6 図14 ホール効果：電流 +x、B は上（+y）、手前が +z
F_pos = np.cross(x, y)
F_ele = -1 * np.cross(-x, y)
print(f'  電-6 図14：正の電荷 v=+x で v×B = {F_pos}（手前）、電子 v=-x, q<0 で {F_ele}（同じ手前）。'
      ' 押される面は同じで、手前の面の符号だけが反対。はば w は手前とおくの面のあいだ、厚さ t_H は B の向き')
# E3-1 電-7 図5：左の磁気回路。左の脚の巻き線の手前の半分の電流は +x、脚の軸は y
m = np.cross(z, x)  # 手前（+z）の導線で dl=+x のとき r×dl の向き
print(f'  電-7 図5 左：手前の巻き線の電流 +x → 脚の中の磁場 {m}（上向き）→ 上の辺で右へ → 時計回り。'
      ' 右の電気回路：電池の長い線（＋）を上にしたので、電流は＋から出て上→右→下（図の矢印）→左→－へもどる時計回り')
# E3-2 電-8 図：電磁石のすき間。div B = 0 なので、左の脚から板へ出た磁束は右の脚へもどる
print('  電-8 電磁石：左のすき間 下向き（脚→板）、右のすき間 上向き（板→脚）。板を通る磁束は左→右で、'
      '閉じた面（板を囲む袋）から出る磁束の和は 0（下へ入る分＝上へ出る分）')
