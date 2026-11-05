# -*- coding: utf-8 -*-
"""物理第4巻『電磁気学』の巻末の表（物性値・定数・単位）と前付の数を計算し直す（事務局、第26回）。
使い方: python3 -I checks/物理第4巻/巻末/calc_ph4_back.py  （出力は calc_ph4_back_out.txt に写す）
- 定数は CODATA 2022（NIST physics.nist.gov/cgi-bin/cuu/Value?ep0 ・mu0・me・mp・e・c・f・z0 を 11月5日に curl で読んだ値をここに書いた）。
- 抵抗率は電-4 の表（ph:電-4:tab-rho）の値。銅は標準軟銅（1/58 Ω·mm²/m、IEC 60028・米国標準局の銅線表）。
- Pt100 は JIS C 1604・IEC 60751 の式（A=3.9083e-3、B=-5.775e-7）。K 熱電対は NIST ITS-90 の多項式（0〜1372 ℃）。
"""
import math

print('== 定数（CODATA 2022）')
eps0 = 8.8541878188e-12
mu0 = 1.25663706127e-6
c = 299792458.0
e = 1.602176634e-19
me = 9.1093837139e-31
mp = 1.67262192595e-27
F = 96485.33212
Z0_nist = 376.730313412
k = 1 / (4 * math.pi * eps0)
print('k=1/(4πε0)=%.6e N·m²/C²（本文 8.99e9）' % k)
print('μ0/(4π×1e-7)-1=%.2e' % (mu0 / (4 * math.pi * 1e-7) - 1))
print('1/sqrt(ε0μ0)=%.1f m/s（c=%.0f）' % (1 / math.sqrt(eps0 * mu0), c))
print('η0=sqrt(μ0/ε0)=%.6f Ω（NIST %.9f）、120π=%.3f' % (math.sqrt(mu0 / eps0), Z0_nist, 120 * math.pi))
print('e/me=%.4e C/kg、mp/me=%.2f' % (e / me, mp / me))
print('F/e=アボガドロ定数 %.6e' % (F / e))

print('== 抵抗率（20 ℃）と、長さ 1 m・断面積 1 mm² の抵抗')
rho = {'銀': 1.59e-8, '銅（標準軟銅 1/58）': 1 / 58 * 1e-6, 'アルミニウム': 2.65e-8, 'タングステン': 5.6e-8,
       '鉄': 9.7e-8, 'ニクロム': 1.1e-6, '黒鉛': 1e-5}
for n, r in rho.items():
    print('%s: ρ=%.4g Ω·m  σ=%.3g S/m  1 m・1 mm² で %.3g Ω' % (n, r, 1 / r, r / 1e-6))
print('ニクロム/銅=%.0f 倍' % (1.1e-6 / 1.72e-8))
print('海水 σ=4.29 S/m → ρ=%.3f Ω·m' % (1 / 4.29))
print('銅の自由電子の数（密度 8.96 g/cm³、63.55 g/mol、1原子に1個）=%.3e /m³' % (8.96e3 / 63.55e-3 * 6.02214076e23))

print('== Pt100（JIS C 1604・IEC 60751）')
A, B = 3.9083e-3, -5.775e-7
for t in (0, 20, 100):
    print('t=%d ℃: R=%.2f Ω' % (t, 100 * (1 + A * t + B * t * t)))
print('0〜100 ℃の平均の温度係数 α=%.5f /K' % ((100 * (1 + A * 100 + B * 1e4) - 100) / 100 / 100))

print('== K 熱電対（NIST ITS-90、基準接点 0 ℃）')
cK = [-0.176004136860E-01, 0.389212049750E-01, 0.185587700320E-04, -0.994575928740E-07, 0.318409457190E-09,
      -0.560728448890E-12, 0.560750590590E-15, -0.320207200030E-18, 0.971511471520E-22, -0.121047212750E-25]
a0, a1, a2 = 0.118597600000E+00, -0.118343200000E-03, 0.126968600000E+03
def EK(t):
    return sum(ci * t ** i for i, ci in enumerate(cK)) + a0 * math.exp(a1 * (t - a2) ** 2)
for t in (20, 100, 300):
    print('t=%d ℃: E=%.3f mV' % (t, EK(t)))
print('0〜300 ℃の平均 %.1f μV/K' % (EK(300) / 300 * 1000))

print('== 比誘電率と同軸ケーブル（電-3 ⑩・電-13 ②）')
a, b = 0.45e-3, 1.6e-3
for er in (2.3, 1.5):
    Zc = math.sqrt(mu0 / (eps0 * er)) / (2 * math.pi) * math.log(b / a)
    Cp = 2 * math.pi * eps0 * er / math.log(b / a)
    print('εr=%.1f: Z0=%.1f Ω、C\'=%.1f pF/m、速度係数=%.3f' % (er, Zc, Cp * 1e12, 1 / math.sqrt(er)))
print('L\'=μ0/(2π)ln(b/a)=%.3f μH/m' % (mu0 / (2 * math.pi) * math.log(b / a) * 1e6))
print('RG-58 の速度係数 0.66 → εr=%.2f' % (1 / 0.66 ** 2))
print('水の比誘電率 80.2 → 屈折率の2乗ではない（光の n=1.333、n²=%.3f）' % (1.333 ** 2))
L1, C1 = 1.045e-3, 0.01085e-6   # 1 km あたり（架空送電線の例）
print('架空送電線 1 mH/km・0.011 μF/km: Z0=%.0f Ω、速さ=%.3e m/s' % (math.sqrt(L1 / C1), 1 / math.sqrt(L1 * C1) * 1e3))

print('== 磁性・地磁気')
Bh, Bv = 3.0e-5, 3.5e-5
print('地磁気 水平 %.1e・鉛直 %.1e → 全体 %.3e T、伏角 %.1f°' % (Bh, Bv, math.hypot(Bh, Bv), math.degrees(math.atan2(Bv, Bh))))
print('1 Oe=%.2f A/m、1 T=1e4 G' % (1000 / (4 * math.pi)))

print('== 法令と電波の周波数・波長（c=3.00e8）')
for n, f in [('IH 20.05 kHz', 20.05e3), ('IH 100 kHz', 100e3), ('AM 526.5 kHz', 526.5e3), ('AM 1606.5 kHz', 1606.5e3),
             ('IC カード 13.56 MHz', 13.56e6), ('FM 76.1 MHz', 76.1e6), ('FM 94.9 MHz', 94.9e6), ('地デジ 470 MHz', 470e6),
             ('地デジ 710 MHz', 710e6), ('電子レンジ 2450 MHz', 2450e6), ('電波の上限 3 THz', 3e12)]:
    print('%s: λ=%.4g m' % (n, 3.00e8 / f))
print('家庭の電圧 101±6 → %d〜%d V、202±20 → %d〜%d V' % (95, 107, 182, 222))
print('100 V の山 = %.1f V' % (100 * math.sqrt(2)))
E, H = 61.4, 0.163
print('電波防護指針 61.4 V/m ÷ 0.163 A/m = %.1f Ω、61.4×0.163 = %.2f W/m² = %.3f mW/cm²' % (E / H, E * H, E * H / 10))
print('E²/η0 = %.2f W/m²' % (E ** 2 / Z0_nist))

print('== 機器')
print('柱上変圧器 6600/210 = %.1f、6600/105 = %.1f' % (6600 / 210, 6600 / 105))
print('半波長アンテナの放射抵抗（電-15 の calc の値 73.1 Ω）')
print('== 単位')
print('1 kWh = %.1e J、1 eV = %.4e J' % (3.6e6, e))
print('太陽定数 1361 W/m² の放射圧（吸収）= %.2e Pa' % (1361 / c))
