#!/usr/bin/env python3
"""第25回 修3-1（P1 の指摘）で変えた・確かめた数の検算。
使い方: python3 checks/物理第3巻/確認/fix3_1_check.py
"""
import math

ok = True
def check(name, got, want, tol):
    global ok
    good = abs(got - want) <= tol
    ok &= good
    print(f"{'OK ' if good else 'NG '} {name}: {got:.6g}（本文 {want}）")

# P1-2 波-1 図8・例題10：山が 10 mm → 8.0 mm
d = math.log(10 / 8.0)
z_exact = d / math.sqrt(4 * math.pi**2 + d**2)
z_appr = d / (2 * math.pi)
check("δ=ln1.25", d, 0.223, 0.0005)
check("ζ（厳密）", z_exact, 0.035, 0.0005)
print(f"   参考：丸めない δ で近似 δ/2π = {z_appr:.6g}（2けたのさかい目。本文は δ を 0.223 と丸めてから割るので 0.03549 → 0.035）")
check("0.223÷6.283", 0.223 / 6.283, 0.035, 0.0005)
check("√(39.48+0.050) の分母で", 0.223 / math.sqrt(39.48 + 0.050), 0.035, 0.0005)
# 例題10 のじぶんでとこう・章末問題 基本5（変えていないが、同じ式なので確かめる）
d2 = math.log(20 / 8.0) / 5
check("じぶんでとこう δ", d2, 0.18, 0.005)
check("じぶんでとこう ζ", d2 / math.sqrt(4 * math.pi**2 + d2**2), 0.029, 0.0005)
d3 = math.log(12 / 9.0)
check("章末 基本5 δ", d3, 0.29, 0.005)
check("章末 基本5 ζ", d3 / math.sqrt(4 * math.pi**2 + d3**2), 0.046, 0.0005)

# P1-6 波-2 例題10：ζ=0.1、ω/ω_n=0.1 のおくれ
r, zeta = 0.1, 0.1
phi = math.degrees(math.atan2(2 * zeta * r, 1 - r**2))
check("例題10 φ（ω/ω_n=0.1）", phi, 1.2, 0.05)
r = 10
phi10 = math.degrees(math.atan2(2 * zeta * r, 1 - r**2))
check("例題10 φ（ω/ω_n=10）", phi10, 179, 0.5)

# P1-21 波-1 例題5：300 kg・30 kN/m
f = math.sqrt(30000 / 300) / (2 * math.pi)
check("例題5 f_n", f, 1.6, 0.05)
print("   → 目安 1〜1.5 Hz の上のはしより少し上:", f > 1.5)

# P1-12 で式を分けた所（数は変えていない）
check("波-1 例題3 ばね 0.06 m", 0.5 * 200 * 0.06**2, 0.36, 1e-9)
check("波-1 例題3 v", math.sqrt(2 * (1.0 - 0.36) / 0.5), 1.6, 1e-9)
check("波-2 例題2 たくわえ", 0.5 * 8 * 0.5**2, 1.0, 1e-9)
check("波-2 例題2 損失", math.pi * 0.4 * 4 * 0.5**2, 1.26, 0.005)
r = 800 / 337.6
den = math.sqrt((1 - r**2)**2 + (0.2 * r)**2)
check("波-2 例題7 (ω/ω_n)^2", r**2, 5.62, 0.005)
check("波-2 例題7 分母", den, 4.64, 0.005)
check("波-2 例題7 |X|", 0.125 / 40 * 1000 * r**2 / den, 3.8, 0.05)
for z, want in ((0.1, 0.15), (0.3, 0.25)):
    r = 3
    t = math.sqrt(1 + (2 * z * r)**2) / math.sqrt((1 - r**2)**2 + (2 * z * r)**2)
    check(f"波-2 例題5 伝達率 ζ={z}", t, want, 0.005)

# P1-19 波-2 ③の終わりに足した「車の速さ v を2倍にすると？」：f_n=1.5 Hz、λ=10 m
lam, fn = 10, 1.5
check("36 km/h で1秒の回数", 36 / 3.6 / lam, 1.0, 1e-9)
check("72 km/h で1秒の回数", 72 / 3.6 / lam, 2.0, 1e-9)
check("共振の速さ km/h", lam * fn * 3.6, 54, 1e-9)
# 波-2 基本2〜4（★3 の段の道具で解けることの確かめ）
w = 2 * math.pi * 1800 / 60
check("基本2 不つり合いの力", 0.005 * 0.2 * w**2, 36, 0.5)
check("基本3 v", 8 * 1.25, 10, 1e-9)
check("基本4 共振の風", 0.80 * 2.0 / 0.2, 8.0, 1e-9)
check("基本4 渦の回数", 0.2 * 10 / 2.0, 1.0, 1e-9)

# P1-15 U 字管：液面1つの「ためるもの」S/(ρg)、2つで S/(2ρg)
rho, g, S, l = 1000, 9.8, 1e-4, 0.40
iner = rho * l / S
cap1 = S / (rho * g)
cap2 = S / (2 * rho * g)
check("U字管 ω_n（液面2つ）", 1 / math.sqrt(iner * cap2), math.sqrt(2 * g / l), 1e-9)
print("   （液面1つだと √(g/l) =", round(math.sqrt(g / l), 4), "で、本文の √(2g/l) と違う）")
check("U字管 T", 2 * math.pi * math.sqrt(l / (2 * g)), 0.90, 0.005)

# P1-7 ギター：A弦（5弦）110 Hz、6弦（E）は 82.4 Hz（平均律、A4=440 Hz）
check("6弦 E2", 440 * 2 ** (-29 / 12), 82.4, 0.05)
check("5弦 A2", 440 / 4, 110, 1e-9)

print("すべて OK" if ok else "NG あり")
