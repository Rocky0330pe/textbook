# 修4-4（物理第4巻 確認：電-9〜11）で変えた数・足した数の検算
# 出力は fix44_p4_09_11_out.txt
import math

print("== 電-9 ==")
# E4-1 単位の早見
print("1 mH / 1 Ω =", 1e-3 / 1, "s (= 1 ms)")
print("1 mH / 1 kΩ =", 1e-3 / 1e3, "s (= 1 μs)")
print("1 Ω × 1 μF =", 1 * 1e-6, "s (= 1 μs)")
print("リレー 0.2 H / 400 Ω =", 0.2 / 400 * 1e3, "ms")
# E4-19 四角い波（T=1、τ=T/2）のゆれの落ち着く先
tau, h = 0.5, 0.5
a = math.exp(-h / tau)
lo = (1 - a) * a / (1 - a * a)   # 下がりきった値
hi = 1 - a + a * lo              # 上がりきった値
print("τ=T/2 の落ち着いたゆれ: %.4f 〜 %.4f（図の 0.2640〜0.7292 は3周期めの値）" % (lo, hi))
print("τ=T/20 は T/20 =", 1 / 20)
# 基本5（G-2 で差しかえ）
print("基本5: 5.0 ln4 = %.3f s、5.0 ln2 = %.3f s、比 %.1f" % (5 * math.log(4), 5 * math.log(2), math.log(4) / math.log(2)))
# チャレンジ3（G-9：下限は切り上げ）
x = math.log(3) / math.pi          # ζ/√(1-ζ²) = ln3/π
zeta = x / math.sqrt(1 + x * x)
R = zeta * 2 * math.sqrt(0.010 / 1.0e-6)
print("チャレンジ3: ζ ≥ %.4f、R ≥ %.2f Ω → 切り上げて %d Ω" % (zeta, R, math.ceil(R)))
vmax = 9 * (1 + math.exp(-math.pi * zeta / math.sqrt(1 - zeta ** 2)))
print("  そのときの山 %.3f V（12 V）" % vmax)

print("== 電-10 ==")
# E4-14 例題8：Q=100、1 MHz、9 kHz 離れた局の電力の比
Q, f0 = 100, 1000e3
for df in (5e3, 9e3):
    r = 1 / (1 + (2 * Q * df / f0) ** 2)
    print("例題8: 中心から %.0f kHz の電力の比 %.3f" % (df / 1e3, r))
# 基本4（共振周波数だけ）
L, C = 1e-3, 10e-9
w0 = 1 / math.sqrt(L * C)
print("基本4: ω0 = %.4g rad/s、f0 = %.1f Hz" % (w0, w0 / (2 * math.pi)))
# 基本5（新しい★3 の問題）
Z = math.sqrt(40 ** 2 + (60 - 30) ** 2)
print("基本5: |Z| = %.1f Ω、I = %.2f A" % (Z, 100 / Z))
# 基本6（G-2：本文の図14 の 20 V と同じ数だったので 30 V に）
print("基本6: √(100²+30²) = %.2f V" % math.sqrt(100 ** 2 + 30 ** 2))
# チャレンジ7（もとの基本4 の後半）
Qc = w0 * L / 10
print("チャレンジ7: Q = %.2f、半値幅 = %.3f kHz" % (Qc, w0 / (2 * math.pi) / Qc / 1e3))
# チャレンジ8（もとの基本5 を作り直し）
RC = 4.7e3 * 0.01e-6
fc = 1 / (2 * math.pi * RC)
ratio = 1 / math.sqrt(1 + 10 ** 2)
print("チャレンジ8: fc = %.1f Hz、10 fc で比 %.4f = %.2f dB" % (fc, ratio, 20 * math.log10(ratio)))
# チャレンジ9（300 μH）
for f in (1602e3, 531e3):
    print("チャレンジ9: %.0f kHz で C = %.1f pF" % (f / 1e3, 1 / ((2 * math.pi * f) ** 2 * 300e-6) * 1e12))
# チャレンジ10（G-9：下限は切り上げ、上限は切り捨て）
Qmin = 1000 / 9
w0L = 2 * math.pi * 1e6 * 200e-6
print("チャレンジ10: Q ≥ %.2f → %d、ω0L = %.1f Ω、R ≤ %.2f → %d Ω" % (Qmin, math.ceil(Qmin), w0L, w0L / Qmin, math.floor(w0L / Qmin)))
# チャレンジ12（G-2：本文に答えがあった問題の差しかえ）
f = 1000
w = 2 * math.pi * f
XL, XC = w * 0.01, 1 / (w * 1e-6)
Zm = math.sqrt(20 ** 2 + (XL - XC) ** 2)
I = 1 / Zm
VR, VL, VC = 20 * I, XL * I, XC * I
print("チャレンジ12: XL=%.2f XC=%.2f |Z|=%.2f I=%.2f mA" % (XL, XC, Zm, I * 1e3))
print("  VR=%.3f VL=%.3f VC=%.3f VL-VC=%.3f √(VR²+(VL-VC)²)=%.4f" % (VR, VL, VC, VL - VC, math.hypot(VR, VL - VC)))
# 例題13（スピーカーのネットワーク、π=3.14 でも確かめる）
for pi in (math.pi, 3.14):
    Cn = 1 / (2 * pi * 3000 * 8)
    Ln = 8 / (2 * pi * 3000)
    print("例題13 (π=%.5f): C = %.3f μF、L = %.4f mH" % (pi, Cn * 1e6, Ln * 1e3))
print("例題13: 300 Hz でツイーターの比 1/√(1+10²) = %.4f（%.1f dB）" % (1 / math.sqrt(101), 20 * math.log10(1 / math.sqrt(101))))
for pi in (math.pi, 3.14):
    print("じぶんでとこう13 (π=%.5f): C = %.2f μF、L = %.4f mH" % (pi, 1 / (2 * pi * 2000 * 4) * 1e6, 4 / (2 * pi * 2000) * 1e3))

print("== 電-11 ==")
# 基本2（G-2：例題1 と同じ 800 W・600 var になっていたので差しかえ）
R, X, V = 12, 16, 100
Z = math.hypot(R, X)
I = V / Z
print("基本2: Z=%.1f Ω、I=%.2f A、力率 %.2f、P=%.1f W、Q=%.1f var" % (Z, I, R / Z, R * I * I, X * I * I))
# 例題3・8・9（3けたで書くとことわった数）
print("例題3: I=%.2f A、S=%.1f VA、Q=%.1f var、C=%.4g F" % (2000 / 140, 2000 / 0.7, math.sqrt((2000 / 0.7) ** 2 - 2000 ** 2),
      math.sqrt((2000 / 0.7) ** 2 - 2000 ** 2) / (2 * math.pi * 50 * 200 ** 2)))
print("例題8: 200/√3 = %.2f V" % (200 / math.sqrt(3)))
print("例題9: Ip=%.3f A、I=%.3f A" % (200 / 30, math.sqrt(3) * 200 / 30))
