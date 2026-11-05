# 物理第3巻 波-7「波が運ぶエネルギー：インピーダンスと反射」の数値の検算
# 実行：python3 checks/物理第3巻/波-7/calc_p3_07.py > checks/物理第3巻/波-7/calc_p3_07_out.txt
import math
pi = math.pi
def p(*a):
    print(*[("%.6g" % x) if isinstance(x, float) else x for x in a])

# ---- 物性値（〔要確認〕は章の頭のコメントと報告に書いた）
rho_air, c_air = 1.204, 343.0          # 20 ℃・1 気圧（熱-4 ⑥の 343 m/s）
rho_w, c_w = 998.0, 1482.0              # 水 20 ℃〔要確認〕
rho_t, c_t = 1060.0, 1540.0             # 体（軟らかい組織）〔要確認〕
Z_air = rho_air * c_air
Z_w = rho_w * c_w
Z_t = 1.63e6                            # 〔要確認〕 1060×1540 = 1.632e6
Z_gel = 1.5e6                           # 〔要確認〕
Z_steel = 7850 * 5900                   # 〔要確認〕
Z_pzt = 30e6                            # 〔要確認〕
Z_bone = 7.8e6                          # 〔要確認〕
print("== 表：インピーダンス")
p("空気", Z_air, "水", Z_w, "体(1060*1540)", rho_t * c_t, "鋼", Z_steel)

def r(z1, z2): return (z1 - z2) / (z1 + z2)          # 変位（速度）の反射係数
def tau(z1, z2): return 2 * z1 / (z1 + z2)          # 変位（速度）の透過係数
def Rpow(z1, z2): return r(z1, z2) ** 2
def Tpow(z1, z2): return 4 * z1 * z2 / (z1 + z2) ** 2

print("== ① 弦のエネルギー（ロープ μ=0.20, F_T=80）")
mu, FT = 0.20, 80.0
c = math.sqrt(FT / mu); Z = math.sqrt(FT * mu)
p("c, Z", c, Z, "μc", mu * c, "F_T/c", FT / c)
f, A = 2.0, 0.05; w = 2 * pi * f
e = 0.5 * mu * w ** 2 * A ** 2
p("1 m あたりのエネルギー ½μω²A² J/m", e, "仕事率 e*c W", e * c, "½Zω²A²", 0.5 * Z * w ** 2 * A ** 2)
p("振幅2倍・振動数2倍のとき", 0.5 * Z * w ** 2 * (2 * A) ** 2, 0.5 * Z * (2 * w) ** 2 * A ** 2)
p("じぶん3：f=1 Hz, A=0.10 m", 0.5 * Z * (2 * pi * 1) ** 2 * 0.1 ** 2)
p("じぶん3：f=3 Hz, A=0.05", 0.5 * Z * (2 * pi * 3) ** 2 * 0.05 ** 2)
p("粒の最大の速さ Aω", A * w)

print("== ② 強さと距離")
Lsun, AU = 3.828e26, 1.496e11
p("太陽の光の強さ W/m²", Lsun / (4 * pi * AU ** 2))
p("火星 1.524 AU", Lsun / (4 * pi * (1.524 * AU) ** 2))
p("距離2倍・10倍の dB", -10 * math.log10(4), -10 * math.log10(100))
p("1 m で 80 dB → 2, 4, 10 m", 80 - 20 * math.log10(2), 80 - 20 * math.log10(4), 80 - 20 * math.log10(10))
P_sp = 0.01
p("1 W のスピーカー 0.01 W 音響出力, 2 m での強さ W/m², dB", P_sp / (4 * pi * 4), 10 * math.log10(P_sp / (4 * pi * 4) / 1e-12))
p("例題10：0.010 W の点音源 1 m, 2 m, 10 m の I と dB")
for rr in (1, 2, 10):
    I = 0.010 / (4 * pi * rr * rr)
    p(" r", rr, "I", I, "dB", 10 * math.log10(I / 1e-12))
p("線の音源：距離2倍で", -10 * math.log10(2))
p("じぶん10：5 m で 70 dB → 20 m, 50 m", 70 - 20 * math.log10(4), 70 - 20 * math.log10(10))

print("== ③ 音の強さ")
p("Z_air", Z_air)
pe = 1.0
I = pe ** 2 / Z_air
p("実効値1 Pa の I W/m², dB(I0=1e-12), dB(20 µPa)", I, 10 * math.log10(I / 1e-12), 20 * math.log10(pe / 20e-6))
p("粒子速度の実効値 m/s", pe / Z_air, "変位の振幅 1 kHz (µm)", pe * math.sqrt(2) / Z_air / (2 * pi * 1000) * 1e6)
p("じぶん2：実効値 0.02 Pa", 0.02 ** 2 / Z_air, 10 * math.log10(0.02 ** 2 / Z_air / 1e-12), 20 * math.log10(0.02 / 20e-6))
p("じぶん2：水中で実効値1 Pa", 1 / Z_w)
p("I0=1e-12 と 20 µPa の関係：(20e-6)^2/413", (20e-6) ** 2 / Z_air)

print("== ④ はてな？の答え・例題1")
p("空気→体 r, r², 通る割合", r(Z_air, Z_t), Rpow(Z_air, Z_t), Tpow(Z_air, Z_t))
p("比 Z_t/Z_air", Z_t / Z_air)
p("往復（空気の層を2回通る）通る割合", Tpow(Z_air, Z_t) ** 2)
p("ゼリー→体 r, r², 通る", r(Z_gel, Z_t), Rpow(Z_gel, Z_t), Tpow(Z_gel, Z_t))
p("水→体", r(Z_w, Z_t), Rpow(Z_w, Z_t))
p("じぶん1：体→骨 r², 体→空気（肺）r²", Rpow(Z_t, Z_bone), Rpow(Z_t, Z_air))
p("通る割合の dB（空気→体）", 10 * math.log10(Tpow(Z_air, Z_t)))

print("== 例題4：線密度4倍の弦（同じ張力）")
Z1, Z2 = 1.0, 2.0
p("r, tau, r², (Z2/Z1)tau²", r(Z1, Z2), tau(Z1, Z2), r(Z1, Z2) ** 2, Z2 / Z1 * tau(Z1, Z2) ** 2)
p("3 cm のパルス：反射, 透過 cm", 3 * r(Z1, Z2), 3 * tau(Z1, Z2))
p("じぶん4：線密度 1/4 の弦へ（Z2=Z1/2）", r(1, 0.5), tau(1, 0.5), r(1, 0.5) ** 2, 0.5 * tau(1, 0.5) ** 2)
p("じぶん4：9倍", r(1, 3), tau(1, 3), r(1, 3) ** 2, 3 * tau(1, 3) ** 2)
print("== Z の比と r, r² のグラフ用")
for q in (0.01, 0.1, 0.25, 0.5, 1, 2, 4, 10, 100, 4000):
    p(" Z2/Z1", float(q), "r", r(1, q), "r²", r(1, q) ** 2)

print("== 例題5：空気から水へ")
p("空気→水 r², 通る割合, dB", Rpow(Z_air, Z_w), Tpow(Z_air, Z_w), 10 * math.log10(Tpow(Z_air, Z_w)))
p("水中の振幅の比 tau（変位）", tau(Z_air, Z_w), "圧力の透過 2Z2/(Z1+Z2)", 2 * Z_w / (Z_air + Z_w))
p("じぶん5：水→鋼", Rpow(Z_w, Z_steel), Tpow(Z_w, Z_steel), 10 * math.log10(Tpow(Z_w, Z_steel)))

print("== ⑤ ばねの端・ダンパーの端")
# ばねの端：Z_end = k_s/(jω)
Z1 = 4.0
for ks, f in ((8.0, 0.1), (8.0, 1.0), (8.0, 10.0), (50.0, 1.0)):
    w = 2 * pi * f
    Ze = ks / (1j * w)
    rr = (Z1 - Ze) / (Z1 + Ze)
    p(" ks", ks, "f", f, "|r|", abs(rr), "角(°)", math.degrees(math.atan2(rr.imag, rr.real)), "2atan", math.degrees(2 * math.atan(ks / (w * Z1))))
p("ダンパー b=2Z1, Z1/2 の r", r(4, 8), r(4, 2))
p("例題11 じぶん：b=6 の r, r²", r(4, 6), r(4, 6) ** 2)
# おもりの端：Z_end = jωm
for m, f in ((0.1, 1.0), (0.1, 10.0)):
    w = 2 * pi * f; Ze = 1j * w * m; rr = (Z1 - Ze) / (Z1 + Ze)
    p(" おもり m", m, "f", f, "|r|", abs(rr), "角", math.degrees(math.atan2(rr.imag, rr.real)))

print("== 例題6：1/4 波長の整合層")
Zm = math.sqrt(Z_pzt * Z_gel)
p("Zm", Zm)
cm, fz = 3000.0, 5e6
p("層の中の波長 mm, λ/4 mm", cm / fz * 1e3, cm / fz / 4 * 1e3)
p("層なし PZT→ゼリー r²", Rpow(Z_pzt, Z_gel), "通る", Tpow(Z_pzt, Z_gel))
# 層ありの正確な計算（伝達行列）
def through(z1, zm, z2, kd):
    # 入力インピーダンス法：負荷 z2 を zm の層 (電気長 kd) を通して見る
    zin = zm * (z2 + 1j * zm * math.tan(kd)) / (zm + 1j * z2 * math.tan(kd))
    rr = (zin - z1) / (zin + z1)
    return 1 - abs(rr) ** 2
p("λ/4 層あり（設計の振動数）通る割合", through(Z_pzt, Zm, Z_gel, pi / 2))
p("振動数が 0.8 倍のとき", through(Z_pzt, Zm, Z_gel, pi / 2 * 0.8))
p("じぶん6：水(1.48e6)と鋼(4.6e7)の間の層", math.sqrt(Z_w * Z_steel))
p("じぶん6：その層 c=2500, 2 MHz の厚さ mm", 2500 / 2e6 / 4 * 1e3)

print("== 例題7：50 Ω → 75 Ω")
r_v = (75 - 50) / (75 + 50)
p("電圧の反射係数, 電力の反射, 通る, リターンロス dB", r_v, r_v ** 2, 1 - r_v ** 2, -20 * math.log10(r_v))
p("じぶん7：75→50", (50 - 75) / 125, "300→75", (75 - 300) / 375, ((75 - 300) / 375) ** 2)

print("== 例題8：深い水の波 λ=10 m")
g = 9.8
for lam in (10.0, 100.0, 1.0):
    k = 2 * pi / lam; cph = math.sqrt(g / k)
    p(" λ", lam, "c", cph, "c_g", cph / 2, "周期", lam / cph)
p("じぶん8：周期 10 s のうねり λ=gT²/2π, c, c_g", g * 100 / (2 * pi), g * 10 / (2 * pi), g * 10 / (4 * pi))
p("1000 km を c_g で何時間", 1000e3 / (g * 10 / (4 * pi)) / 3600)

print("== 例題9：体の中の吸収")
alpha_db = 0.5
p("5 MHz・深さ10 cm（往復20 cm）dB", alpha_db * 5 * 20, "強さの比", 10 ** (-alpha_db * 5 * 20 / 10))
p("3.5 MHz・深さ15 cm 往復30 cm", alpha_db * 3.5 * 30)
p("じぶん9：10 MHz で 60 dB まで、何 cm の深さ", 60 / (alpha_db * 10) / 2)
p("5 MHz の波長 mm（1540）", 1540 / 5e6 * 1e3, "3.5 MHz", 1540 / 3.5e6 * 1e3, "10 MHz", 1540 / 10e6 * 1e3)
p("dB/m と α（1/m）：20log10(e)", 20 * math.log10(math.e))
p("0.5 dB/(cm MHz)×5 MHz = 2.5 dB/cm → α 1/cm（振幅）", 2.5 / 8.686)

print("== 例題12：ガラスの反射")
for n in (1.5, 1.333, 2.42, 1.38):
    p(" n", n, "R", ((n - 1) / (n + 1)) ** 2)
R1 = ((1.5 - 1) / 2.5) ** 2
p("窓ガラス2面（多重反射を入れる）", R1 + (1 - R1) ** 2 * R1 / (1 - R1 ** 2), "ざっと 2R", 2 * R1)
p("反射防止の理想の n", math.sqrt(1.5))
nm = 1.38
p("MgF2 λ/4 膜 (n=1.38) 550 nm の厚さ nm", 550 / nm / 4, "反射率", ((1 * 1.5 - nm ** 2) / (1 * 1.5 + nm ** 2)) ** 2)
p("じぶん12：水とガラスの境 r²", ((1.5 - 1.333) / (1.5 + 1.333)) ** 2)

print("== 中耳")
area, lever = 55 / 3.2, 1.3
p("面積比, 圧力の倍率, dB", area, area * lever, 20 * math.log10(area * lever))
p("空気→水（内耳のリンパ液を水とみなす）通る割合 dB", 10 * math.log10(Tpow(Z_air, Z_w)))

print("== ⑦ 球面波")
p("r=1→2 振幅", 0.5)

print("== 章末問題")
mu, FT = 0.30, 120.0; c1 = math.sqrt(FT / mu); Z1 = mu * c1
p("基本1 c, Z, P(1.5 Hz, 0.080 m)", c1, Z1, 0.5 * Z1 * (2 * pi * 1.5) ** 2 * 0.08 ** 2)
p("基本2 90 dB → 3 m, 70 dB の距離", 90 - 20 * math.log10(3), 10 ** ((90 - 70) / 20))
p("基本3 2.0 Pa：I, dB", 4 / Z_air, 20 * math.log10(2 / 20e-6))
p("基本4 水→空気 通る割合, 体と水 r, r²", Tpow(Z_w, Z_air), r(Z_t, Z_w), r(Z_t, Z_w) ** 2)
p("基本5 線密度 1/9：r, τ, 4 cm で, r²", r(1, 1 / 3), tau(1, 1 / 3), 4 * r(1, 1 / 3), 4 * tau(1, 1 / 3), r(1, 1 / 3) ** 2)
p("チャレンジ1 ばね 8 N/m・Z1=4 で 90° の f", 8 / 4 / (2 * pi))
for T in (15.0, 10.0):
    cg = g * T / (4 * pi)
    p("チャレンジ2 周期", T, "c_g", cg, "時間 h", 1000e3 / cg / 3600)
p("チャレンジ3 80 dB：3.5 MHz, 7 MHz の深さ cm", 80 / (0.5 * 3.5 * 2), 80 / (0.5 * 7 * 2))
p("⑤ 位相：r<0 のとき e^{jπ}", (math.cos(pi), math.sin(pi)))
