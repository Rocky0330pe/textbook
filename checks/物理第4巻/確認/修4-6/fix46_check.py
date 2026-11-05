# -*- coding: utf-8 -*-
"""第27回 修4-6（電-15・電-16・巻末・部扉）：直しで書いた数の検算。
使い方：python3 fix46_check.py > fix46_check_out.txt
"""
import math

print("== 電-16 ②：調定率をことばで書いた式（G-5）==")
droop = 0.05
print(f"1/調定率 = 1/{droop} = {1/droop:.0f} 倍（本文「そのずれの 1/0.05=20 倍まで」）")
print(f"周波数が5 % 下がると出力を {0.05/droop*100:.0f} % 増やす")
# ② のプログラム（本文と同じもの。変数名を droop にした）
f0 = 50.0
H, D, Tg = 5.0, 1.0, 5.0
dPL = 0.01
dt = 0.1
df, dPg = 0.0, 0.0
out = []
for n in range(301):
    if n <= 40 and n % 10 == 0 or n % 100 == 0:
        out.append((round(n*dt, 1), round(df*f0, 3)))
    ddf = (dPg - dPL - D*df) / (2*H)
    ddPg = (-df/droop - dPg) / Tg
    df, dPg = df + ddf*dt, dPg + ddPg*dt
book = [(0.0, 0.0), (1.0, -0.046), (2.0, -0.073), (3.0, -0.076), (4.0, -0.06), (10.0, -0.02), (20.0, -0.023), (30.0, -0.024)]
print("プログラムの出力：", out)
print("本文の実行結果と同じ：", out == book)
print(f"落ち着く値（式）：-dPL/(1/調定率 + D)×f0 = {-dPL/(1/droop + D)*f0:+.4f} Hz（本文「-0.024 Hz ほど」）")

print()
print("== 電-15 図1：使いみちの字の x 座標（x = 7.5×(4 − log10 λ)）（E6-21）==")
def x_of(lam):
    return 7.5 * (4 - math.log10(lam))
def lam_of(x):
    return 10 ** (4 - x / 7.5)
for name, lam, x in [("AM 1000 kHz", 300, 11), ("FM 80 MHz", 3.75, 25), ("電子レンジ 2.45 GHz", 0.122, 39.5),
                     ("こたつ（遠赤外線 約10 μm）", 10e-6, 67.5), ("リモコン（約0.9 μm）", 0.9e-6, 75.3),
                     ("日焼け（UV-B 280〜315 nm）", 0.3e-6, 79), ("レントゲン", None, 101)]:
    if lam:
        print(f"{name}: 本当の波長の x = {x_of(lam):.1f}、字の x = {x}（字の所の波長 {lam_of(x):.3g} m）")
    else:
        print(f"{name}: 字の x = {x}（字の所の波長 {lam_of(x):.3g} m）")
print("直す前：日焼け x=85 →", f"{lam_of(85):.3g} m", "、リモコン・こたつ x=66 →", f"{lam_of(66):.3g} m")

print()
print("== 巻末 表1の注：銅の自由電子の数（E6-15）==")
NA = 6.02214076e23
n = 8.96e6 / 63.55 * NA
print(f"8.96e6 g/m^3 ÷ 63.55 g/mol × {NA} = {n:.4e} 個/m^3（本文・巻末 8.49×10^28。6.02×10^23 なら {8.96e6/63.55*6.02e23:.4e}）")

print()
print("== 電-15 例題8・例題13（行を分けただけ。数は同じ）==")
for n2 in (1.5, 1.333):
    r = (1 - n2) / (1 + n2)
    print(f"n2={n2}: r_E={r:.3f}, R={r*r:.4f}")
print(f"λ/4 = 3.00e8/(2.4e9)/4 = {3.00e8/2.4e9/4:.4f} m、P = 73×1.0^2 = {73*1.0**2:.0f} W")
