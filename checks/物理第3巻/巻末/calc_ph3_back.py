# -*- coding: utf-8 -*-
"""物理第3巻『波動』の前付・巻末の表の数を計算し直す（事務局、第24回）。
使い方: python3 checks/物理第3巻/巻末/calc_ph3_back.py  （出力は calc_ph3_back_out.txt に写す）
- 空気は CoolProp 8.0（Lemmon ほかの空気の状態式）、水・ヘリウムは CoolProp と NIST Chemistry WebBook（curl で読んだ値をここに書いた）。
- 屈折率は、一次資料の式（Daimon・Masumura 2007 の水、Peter 1923 のダイヤモンド、SCHOTT の N-BK7、Dodge 1984 の MgF2、
  Ciddor 1996 の空気）の係数（refactiveindex.info のデータベースの写し。式のもとの論文は各行に書いた）から計算した。
- A 特性は IEC 61672-1:2013 の附属書の式（20.6・107.7・737.9・12194 Hz、A1000＝−2.00 dB）。
"""
import math
import CoolProp.CoolProp as CP

print('== 1 音の速さ・密度・音響インピーダンス')
for T in (0, 20):
    rho = CP.PropsSI('D', 'T', 273.15 + T, 'P', 101325, 'Air')
    c = CP.PropsSI('A', 'T', 273.15 + T, 'P', 101325, 'Air')
    print('空気 %d ℃: rho=%.4f c=%.1f Z=%.1f' % (T, rho, c, rho * c))
print('空気 0 ℃（理想気体の式 1.4・287）: c=%.1f' % math.sqrt(1.4 * 287 * 273.15))
print('空気 20 ℃（理想気体の式）: c=%.1f' % math.sqrt(1.4 * 287 * 293.15))
for T in (8, 20):
    rho = CP.PropsSI('D', 'T', 273.15 + T, 'P', 101325, 'Water')
    c = CP.PropsSI('A', 'T', 273.15 + T, 'P', 101325, 'Water')
    print('水 %d ℃: rho=%.3f c=%.2f Z=%.4g' % (T, rho, c, rho * c))
# NIST WebBook（Thermophysical Properties of Fluid Systems、0.101325 MPa）を curl で読んだ値
nist = {'水 8 ℃': (999.851, 1439.14), '水 20 ℃': (998.207, 1482.35), 'ヘリウム 20 ℃': (0.166311, 1007.89)}
for k, (r, c) in nist.items():
    print('NIST %s: rho=%g c=%g Z=%.4g' % (k, r, c, r * c))
rho = CP.PropsSI('D', 'T', 293.15, 'P', 101325, 'Helium'); c = CP.PropsSI('A', 'T', 293.15, 'P', 101325, 'Helium')
print('CoolProp ヘリウム 20 ℃: rho=%.4f c=%.1f' % (rho, c))
print('水 sqrt(K/rho) K=2.2GPa: %.0f' % math.sqrt(2.2e9 / 998))
print('体 Z=1060*1540=%.4g' % (1060 * 1540))
E, nu, rho = 205e9, 0.3, 7850
G = E / (2 * (1 + nu)); K = E / (3 * (1 - 2 * nu))
print('鋼 G=%.1f GPa K=%.1f GPa 棒 %.0f 縦 %.0f 横 %.0f Z(5900)=%.3g' % (G / 1e9, K / 1e9, math.sqrt(E / rho), math.sqrt((K + 4 / 3 * G) / rho), math.sqrt(79e9 / rho), rho * 5900))
print('空気の断熱の体積弾性率 gamma*p=%.3f MPa' % (1.4 * 101325 / 1e6))

print('== 2 屈折率')
def sell2(c, lam):  # n^2-1 = C0 + sum B l^2/(l^2-C)
    s = 1 + c[0]
    for i in range(1, len(c), 2): s += c[i] * lam**2 / (lam**2 - c[i + 1])
    return math.sqrt(s)
def sell1(c, lam):  # n^2-1 = C0 + sum B l^2/(l^2-C^2)
    s = 1 + c[0]
    for i in range(1, len(c), 2): s += c[i] * lam**2 / (lam**2 - c[i + 1]**2)
    return math.sqrt(s)
water = [0, 5.684027565E-1, 5.101829712E-3, 1.726177391E-1, 1.821153936E-2, 2.086189578E-2, 2.620722293E-2, 1.130748688E-1, 1.069792721E1]
for lam in (0.4047, 0.5893, 0.6328, 0.6563):
    print('水 20 ℃（Daimon・Masumura 2007） %.1f nm: %.4f' % (lam * 1000, sell2(water, lam)))
air = lambda lam: 1 + 0.05792105 / (238.0185 - lam**-2) + 0.00167917 / (57.362 - lam**-2)   # Ciddor 1996（15 ℃・101.325 kPa・CO2 450 ppm）
for lam in (0.5893, 0.6328):
    print('空気 15 ℃（Ciddor 1996） %.1f nm: n-1=%.4e' % (lam * 1000, air(lam) - 1))
print('空気 20 ℃（密度に比例として） 633 nm: n-1=%.3e' % ((air(0.6328) - 1) * 288.15 / 293.15))
for name, n in [('水 1.33', 1.33), ('水 1.333', 1.333), ('ガラス 1.5', 1.5), ('ガラス 1.52', 1.52), ('ダイヤモンド 2.42', 2.42)]:
    print('臨界角 %s: %.1f°' % (name, math.degrees(math.asin(1 / n))))
print('ファイバ NA=%.3f 受け入れ角 %.1f°' % (math.sqrt(1.48**2 - 1.46**2), math.degrees(math.asin(math.sqrt(1.48**2 - 1.46**2)))))
print('反射率 ガラス(1.5) %.1f %%、水 %.1f %%' % (((1.5 - 1) / 2.5)**2 * 100, ((1.333 - 1) / 2.333)**2 * 100))

print('== 3 A 特性（IEC 61672-1 附属書の式）')
def RA(f):
    return 12194**2 * f**4 / ((f**2 + 20.6**2) * math.sqrt((f**2 + 107.7**2) * (f**2 + 737.9**2)) * (f**2 + 12194**2))
for nom, n in [(31.5, -15), (63, -12), (100, -10), (125, -9), (250, -6), (500, -3), (1000, 0), (2000, 3), (4000, 6), (8000, 9), (16000, 12)]:
    f = 1000 * 10**(n / 10)   # 正確な中心周波数（基数10）
    print('%6g Hz: %.1f dB' % (nom, 20 * math.log10(RA(f)) + 2.00))

print('== 4 前付・定数')
print('343/440=%.3f 343/880=%.3f' % (343 / 440, 343 / 880))
print('20 μPa の音圧レベル 0、20 Pa: %.0f dB、63 Pa: %.0f dB' % (20 * math.log10(20 / 20e-6), 20 * math.log10(63 / 20e-6)))
print('CD のビットの速さ 44100*16*2=%d bit/s' % (44100 * 16 * 2))
print('電話 8000*8=%d bit/s' % (8000 * 8))
print('量子化の S/N 6.02b+1.76: 8 ビット %.1f、16 ビット %.1f dB' % (6.02 * 8 + 1.76, 6.02 * 16 + 1.76))
print('水晶時計 2^15=%d' % 2**15)
print('Q=1/(2ζ): ζ=0.01→%.0f 0.05→%.0f 0.2→%.1f 0.4→%.2f' % (1 / 0.02, 1 / 0.1, 1 / 0.4, 1 / 0.8))
