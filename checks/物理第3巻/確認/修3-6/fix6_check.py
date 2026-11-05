# 修3-6（波-13・14・巻末）で変えた数・足した数の検算（第25回、P6 の指摘）
import math

print('== P6-18 波-13 じぶんでとこう（回折格子の角）')
th = math.degrees(math.asin(0.65 / 0.74))
print('sinθ=0.65/0.74 → θ=%.2f°（本文 61.4°）' % th)
print('y=0.30×tan61.4°=%.3f m（本文 0.55 m）' % (0.30 * math.tan(math.radians(61.4))))

print('== P6-19 波-13 シャボン膜 300 nm の弱め合う波長')
two_nt = 2 * 1.33 * 300
for m in (1, 2):
    lam = two_nt / m
    where = '可視光（380〜780 nm）' if 380 <= lam <= 780 else ('赤外線' if lam > 780 else '紫外線')
    print('m=%d: %.0f nm → %s' % (m, lam, where))

print('== P6-5 波-13 ニュートンリング（r→ρ。数は変えない）')
print('例題8 R=ρ²/(mλ)=%.3f m（本文 0.98）' % ((2.4e-3) ** 2 / (10 * 589e-9)))
print('じぶんで ρ4=%.2e m（本文 1.5 mm）' % math.sqrt(4 * 589e-9 * 1.0))
print('章末 ρ5=%.2e m（本文 2.4 mm）' % math.sqrt(5 * 589e-9 * 2.0))
print('⑦ M=1000 → Δ=Mλ/2=%.4e m（本文 0.32 mm）' % (1000 * 633e-9 / 2))
print('じぶんで M=2Δ/λ=%.1f（本文 約380）' % (2 * 0.10e-3 / 532e-9))
print('チャレンジ n−1=Mλ/(2L)=%.3e（本文 2.7e-4）' % (43 * 633e-9 / (2 * 0.050)))

print('== P6-7 チャレンジ12（自然対数。数は変えない）')
X = math.log(2) / (0.2165 - 0.0370)
print('X=ln2/0.1795=%.2f、h=%.1f°（本文 3.9・15°）' % (X, math.degrees(math.asin(1 / X))))

print('== P6-10 波-14 AM のはば')
print('搬送波 531〜1602 kHz の 9 kHz おき：%d 波' % (round((1602 - 531) / 9) + 1))
B = 15.0
print('占有周波数帯幅 %.0f kHz → のせられる音の上限 %.1f kHz（上下に同じ形）' % (B, B / 2))
print('1000 kHz に 1 kHz：f_c±f_m = %.0f・%.0f kHz' % (1000 - 1, 1000 + 1))

print('== P4-22・P6-27 巻末 表1 空気')
for Rs in (287.0, 287.05):
    print('R_s=%.2f: ρ(0 ℃)=%.4f  ρ(20 ℃)=%.4f' % (Rs, 101325 / (Rs * 273.15), 101325 / (Rs * 293.15)))
print('Z(20 ℃)=1.204×343=%.1f（表 413）' % (1.204 * 343))
try:
    import CoolProp
    import CoolProp.CoolProp as CP
    for T in (273.15, 293.15):
        d = CP.PropsSI('D', 'T', T, 'P', 101325, 'Air')
        a = CP.PropsSI('A', 'T', T, 'P', 101325, 'Air')
        print('CoolProp %s（%s）T=%.2f K: ρ=%.4f c=%.1f Z=%.1f' % (CoolProp.__version__, CP.get_BibTeXKey('Air', 'EOS'), T, d, a, d * a))
except ImportError:
    print('CoolProp なし')

print('== P6-14 巻末 表8 に足した波-14 の値')
print('静止軌道の往復 2h/c=%.3f s（波-14 例題2 0.24 s）' % (2 * 3.5786e7 / 3.00e8))
print('GPS h/c=%.4f s（例題5 0.067 s）' % (2.02e7 / 3.00e8))
print('802.11a: 20 MHz/64=%.1f kHz、48×6×3/4/4 μs=%.1f Mbit/s' % (20e3 / 64, 48 * 6 * 0.75 / 4e-6 / 1e6))
print('1550 nm 0.2 dB/km × 100 km = %.0f dB → 1/%.0f' % (0.2 * 100, 10 ** (0.2 * 100 / 10)))
print('V.34 33.6 kbit/s、V.90 下り 56 kbit/s（値の確かめは出典で。計算なし）')
