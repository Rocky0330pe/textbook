# 修3-5（P5-22）：水の屈折率を IAPWS R9-97（Release on the Refractive Index of Ordinary Water Substance
# as a Function of Wavelength, Temperature and Pressure, 1997。Harvey ほか J. Phys. Chem. Ref. Data 27, 761 (1998)）の式で計算する。
# iapws.org・tsapps.nist.gov は作業環境から届かなかった（プロキシが 403）。係数は、R9-97 を実装した
# Python の chemicals 1.5.2（chemicals/refractivity.py の RI_IAPWS。PyPI から取得）から写し、
# その実装の例の値（298.15 K・997.047435 kg/m3・0.5893 µm で 1.33285819…、IAPWS 2010 の本の検算値）と合うことを確かめた。
# 水の密度（0.101325 MPa）は NIST Chemistry WebBook（IAPWS-95）：20 ℃ 998.2072、25 ℃ 997.0476 kg/m3。
from math import sqrt

a = [0.244257733, 0.0097463448, -0.00373235, 0.0002686785,
     0.0015892057, 0.0024593426, 0.90070492, -0.0166626219]
LUV, LIR = 0.229202, 5.432937


def n_iapws(T, rho, lam_um):
    d = rho / 1000.0
    th = T / 273.15
    L2 = (lam_um / 0.589) ** 2
    A = d * (a[0] + a[1] * d + a[2] * th + a[3] * L2 * th + a[4] / L2
             + a[5] / (L2 - LUV ** 2) + a[6] / (L2 - LIR ** 2) + a[7] * d * d)
    return sqrt((2 * A + 1) / (1 - A))


print('検算（chemicals の例 1.3328581926）:', f'{n_iapws(298.15, 997.047435, 0.5893):.10f}')
rho20 = 998.2072
for lam in (0.4047, 0.4050, 0.5893, 0.6328, 0.6563):
    print(f'20 ℃・{lam*1000:5.1f} nm  n = {n_iapws(293.15, rho20, lam):.5f}')
print(f'25 ℃・589.3 nm  n = {n_iapws(298.15, 997.0476, 0.5893):.5f}')
# 原稿の値：水 1.333（589 nm）、656 nm で 1.331、405 nm 付近で 1.343（波-12 の出典のコメント・本文）
for lam, txt in ((0.5893, 1.333), (0.6563, 1.331), (0.4050, 1.343)):
    v = n_iapws(293.15, rho20, lam)
    print(f'{lam*1000:5.1f} nm：原稿 {txt}  IAPWS {v:.4f}  差 {v - txt:+.4f}  3けたに丸めると {round(v, 3)}')

# IAPWS の値は真空に対する屈折率。空気から水へ入る光（虹・プール）で効くのは、空気に対する屈折率 n水/n空気。
# 空気の n−1（15 ℃・101.325 kPa、Ciddor の式。波-12 の出典のコメントの LIGO の資料）：589 nm 約 2.77e-4。
# 20 ℃では密度に比例して 288.15/293.15 倍。405 nm・656 nm は分散で ±1e-5 ほど変わるが、4けた目には効かない。
nair = 1 + 2.77e-4 * 288.15 / 293.15
print(f'空気（20 ℃）の n ≈ {nair:.6f}')
for lam, txt in ((0.5893, 1.333), (0.6563, 1.331), (0.4050, 1.343)):
    v = n_iapws(293.15, rho20, lam) / nair
    print(f'{lam*1000:5.1f} nm：空気に対する水の屈折率 {v:.5f}（原稿 {txt}、差 {v - txt:+.4f}）')
