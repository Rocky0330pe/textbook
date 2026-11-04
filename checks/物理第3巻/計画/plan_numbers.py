# 物理第3巻『波動』計画書（tools/phys3-plan.md）の例題の「答えの見こみ」を計算し直すスクリプト（組 P3-R）。
# 使い方：python3 plan_numbers.py   （numpy があれば使う。なければ標準ライブラリだけで計算する）
# 値の前提（g=9.8、音速 343 m/s（20 ℃）など）は計画書 C-3 と同じ。〔要〕の物性値は仮の値で、章を書く組が出典で確かめる。
import math
pi = math.pi; g = 9.8


def p(label, *vals):
    print(f"{label}: " + ", ".join(f"{v:.4g}" if isinstance(v, float) else str(v) for v in vals))


def agm(a, b):
    for _ in range(40):
        a, b = (a + b) / 2, math.sqrt(a * b)
    return a


def K_ellip(k):  # 第1種完全楕円積分 K(k)=π/(2 agm(1, √(1−k²)))
    return pi / (2 * agm(1.0, math.sqrt(1 - k * k)))


def c_air(theta_c, gamma=1.4, R=287.05):  # 乾いた空気の音速
    return math.sqrt(gamma * R * (theta_c + 273.15))


def bis(f, a, b):
    for _ in range(100):
        mid = (a + b) / 2
        if (f(a) > 0) == (f(mid) > 0):
            a = mid
        else:
            b = mid
    return (a + b) / 2


c = 343.0  # 20 ℃ の空気（本文で使う値）

print("== 波-0")
p("雷 3 s（340）m", 340 * 3.0)
p("光ファイバ 400 km（n=1.5）ms", 400e3 / (3.0e8 / 1.5) * 1e3)
p("ビルの固有周期の目安 0.1×階数（30階）〔要〕", 0.1 * 30)

print("== 波-1")
l = 2.0
p("ブランコ l=2.0 m の周期", 2 * pi * math.sqrt(l / g))
p("秒ふりこ（T=2 s）の長さ", g * 2 ** 2 / (4 * pi ** 2))
m, k, A = 0.5, 200.0, 0.10
w = math.sqrt(k / m)
p("ばね 0.5 kg・200 N/m：ω_n, T, v_max, ½kA²", w, 2 * pi / w, A * w, 0.5 * k * A * A)
p("静たわみ 10 mm の f_n", math.sqrt(g / 0.010) / (2 * pi))
p("1/4車両 300 kg・30 kN/m の f_n", math.sqrt(30e3 / 300) / (2 * pi))
k1, k2 = 100.0, 300.0
ks = 1 / (1 / k1 + 1 / k2); kp = k1 + k2
p("直列・並列 k と 1 kg の ω", ks, kp, math.sqrt(ks), math.sqrt(kp))
E, I, L = 205e9, 1e-6, 1.0
kc = 3 * E * I / L ** 3
p("片持ち（力-10 例題4）k=3EI/L³, 100 kg の f_n", kc, math.sqrt(kc / 100) / (2 * pi))
for th in (10, 30, 60, 90):
    kk = math.sin(math.radians(th) / 2)
    p(f"大きなふれ {th}° の T/T0（楕円積分）・近似 1+θ²/16", 2 / pi * K_ellip(kk), 1 + math.radians(th) ** 2 / 16)
p("棒（1 m、はしで支える）の実体ふりこ T", 2 * pi * math.sqrt(2 * 1.0 / (3 * g)))
d = math.log(10 / 8)
p("山 10→8 mm：δ, ζ", d, d / math.sqrt(4 * pi ** 2 + d * d))
G, D, Ls, J = 79e9, 0.010, 0.5, 0.02
kt = G * pi * D ** 4 / (32 * Ls)
p("ねじり k_t, f_n", kt, math.sqrt(kt / J) / (2 * pi))
p("ばねの質量 0.15 kg を足したレイリー法 ω（無視・考慮）", math.sqrt(200 / 0.5), math.sqrt(200 / (0.5 + 0.15 / 3)))
p("片持ちはりの質量の係数 33/140", 33 / 140)

print("== 波-2")
m, k, cc = 0.5, 8.0, 0.4
wn = math.sqrt(k / m); z = cc / (2 * math.sqrt(m * k))
p("6-13 のばね ω_n, ζ, 最大倍率 1/(2ζ√(1−ζ²)), Q=1/(2ζ)", wn, z, 1 / (2 * z * math.sqrt(1 - z * z)), 1 / (2 * z))


def amp(w):
    return 1 / math.sqrt((k - m * w * w) ** 2 + (cc * w) ** 2)


wpk = wn * math.sqrt(1 - 2 * z * z); Apk = amp(wpk)
w1 = bis(lambda w: amp(w) - Apk / math.sqrt(2), 0.1, wpk)
w2 = bis(lambda w: amp(w) - Apk / math.sqrt(2), wpk, 20)
p("半値幅 Δω（数値）・2ζω_n", w2 - w1, 2 * z * wn)
fn = math.sqrt(50e3 / 40.0) / (2 * pi)
p("洗濯機 40 kg・50 kN/m：f_n, 回転数 min⁻¹", fn, fn * 60)


def TR(r, z):
    return math.sqrt(1 + (2 * z * r) ** 2) / math.sqrt((1 - r * r) ** 2 + (2 * z * r) ** 2)


r = math.sqrt(11); fn2 = 25 / r
p("防振 25 Hz で伝達率 0.1（ζ=0）：r, f_n, 静たわみ mm", r, fn2, g / (2 * pi * fn2) ** 2 * 1e3)
p("伝達率 r=√2（ζ=0.1）, r=3（ζ=0.1）", TR(math.sqrt(2), 0.1), TR(3, 0.1))
p("不つり合い 1 g×0.1 m・3000 min⁻¹ の力 N", 1e-3 * 0.1 * (3000 / 60 * 2 * pi) ** 2)
Ds, Lsh = 0.020, 0.8
Ish = pi * Ds ** 4 / 64; ksh = 48 * 205e9 * Ish / Lsh ** 3; wc = math.sqrt(ksh / 5.0)
p("危険速度 k, ω_c, min⁻¹", ksh, wc, wc * 60 / (2 * pi))
p("うね 10 m を f_n 1.5 Hz で：m/s, km/h", 1.5 * 10, 1.5 * 10 * 3.6)
for rr in (0.1, 1.0, 10.0):
    H = 1 / math.sqrt((1 - rr * rr) ** 2 + (2 * 0.1 * rr) ** 2)
    p(f"ボード ω/ω_n={rr} ζ=0.1 の dB, 位相°", 20 * math.log10(H), -math.degrees(math.atan2(2 * 0.1 * rr, 1 - rr * rr)))
p("カルマン渦 St=0.2, d=1 m, 10 m/s の f", 0.2 * 10 / 1.0)

print("== 波-3")
m, k, K = 1.0, 100.0, 10.0
w1, w2 = math.sqrt(k / m), math.sqrt((k + 2 * K) / m)
p("6-14 の2台車 ω1, ω2, うなりの周期", w1, w2, 2 * pi / (w2 - w1))
p("2重ふりこ（同じ m, l=1 m）ω", math.sqrt((2 - math.sqrt(2)) * g), math.sqrt((2 + math.sqrt(2)) * g))
p("2層の建物 ω/√(k/m)", math.sqrt((3 - math.sqrt(5)) / 2), math.sqrt((3 + math.sqrt(5)) / 2))
mu = 0.05
p("TMD μ=0.05 同調：分かれた2つの ω/ω_n", math.sqrt(1 + mu / 2 - math.sqrt(mu + mu * mu / 4)), math.sqrt(1 + mu / 2 + math.sqrt(mu + mu * mu / 4)))
p("デン・ハルトフの最適 f=1/(1+μ), ζ_opt", 1 / (1 + mu), math.sqrt(3 * mu / (8 * (1 + mu) ** 3)))
try:
    import numpy as np
    Kk = np.array([[2, -1, 0], [-1, 2, -1], [0, -1, 1]]) * 100.0
    ev = np.linalg.eigvalsh(Kk)
    p("3層（m=1, k=100）の ω", *[float(x) for x in np.sqrt(ev)])
    Mm = np.diag([2.0, 1.0]); K2 = np.array([[300.0, -100], [-100, 100]])
    ev2 = np.sort(np.real(np.linalg.eigvals(np.linalg.solve(Mm, K2))))
    p("質量のちがう2自由度 M=diag(2,1), K=[[300,-100],[-100,100]] の ω", *[float(x) for x in np.sqrt(ev2)])
except ImportError:
    p("3層（式）", *[math.sqrt(100 * (2 - 2 * math.cos((2 * j - 1) * pi / 7))) for j in (1, 2, 3)])

print("== 波-4")
p("エアコン（9-8・9-9）定常の室温 (35+9×26)/10", (35 + 9 * 26) / 10)
p("1次おくれ t=τ, 3τ の割合", 1 - math.exp(-1), 1 - math.exp(-3))
for zz in (0.5, 0.7):
    p(f"2次おくれ ζ={zz} の行き過ぎ量 %", 100 * math.exp(-zz * pi / math.sqrt(1 - zz * zz)))
p("ζ=0.5, ω_n=2 の整定時間（2 %）≈4/(ζω_n)", 4 / (0.5 * 2))
p("モーター 10/(0.5s+1), K_p=1：極, ずれ %", -(1 + 10) / 0.5, 100 / 11)
p("(s+1)^3+K：安定の上限 K（a2a1>a0：9>1+K）", 8)
p("むだ時間 2 s の位相 ω=0.5 で°", -math.degrees(0.5 * 2))
wpc = math.sqrt(2); Gm = 2.0 / (wpc * math.sqrt(wpc ** 2 + 1) * math.sqrt(wpc ** 2 + 4))
p("2/(s(s+1)(s+2))：位相交差 ω, |G|, ゲイン余裕 dB", wpc, Gm, -20 * math.log10(Gm))
p("限界感度法 Ku=4, Tu=10 s：Kp, Ti, Td", 0.6 * 4.0, 0.5 * 10.0, 0.125 * 10.0)
p("車 1/(1000s+50)：τ, 500 N の終わりの速さ", 1000 / 50, 500 / 50)

print("== 波-5")
p("440 Hz の波長（343 m/s）", c / 440)
p("A弦 110 Hz・0.65 m の c（9-1）", 110 * 2 * 0.65)
for mu_l in (5e-3, 6e-3):
    p(f"A弦 線密度 {mu_l} kg/m の張力 N〔要〕", (110 * 2 * 0.65) ** 2 * mu_l)
p("鋼の棒 √(E/ρ)（205 GPa・7850）", math.sqrt(205e9 / 7850))
p("水 √(K/ρ)（2.2 GPa・998）", math.sqrt(2.2e9 / 998))
p("空気 √(γp/ρ)（20 ℃, 1.204）・ニュートンの √(p/ρ)", math.sqrt(1.4 * 101325 / 1.204), math.sqrt(101325 / 1.204))
p("津波 √(gh) h=4000 m：m/s, km/h", math.sqrt(g * 4000), math.sqrt(g * 4000) * 3.6)
A_, f_, lam = 0.02, 5.0, 0.4
w = 2 * pi * f_; kw = 2 * pi / lam
p("y=A sin(ωt−kx)：ω, k, c, x=0.05・t=0.05 の y, 粒子の最大速さ", w, kw, w / kw, A_ * math.sin(w * 0.05 - kw * 0.05), A_ * w)
p("初期微動 10 s（P 6 km/s・S 3.5 km/s）の距離 km", 10 / (1 / 3.5 - 1 / 6))

print("== 波-6")
p("1フレットの位置 mm（0.65 m）", 650 * (1 - 2 ** (-1 / 12)))
p("開管 0.5 m・閉管 0.5 m の基本振動", c / (2 * 0.5), c / (4 * 0.5))
p("ペットボトル（閉管 0.20 m）", c / (4 * 0.20))
p("鋼の棒 1 m 両はし自由の縦振動 f1", math.sqrt(205e9 / 7850) / 2)
bl1 = 4.7300407; h = 0.006; Lb = 0.20; cb = math.sqrt(205e9 / 7850)
p("鉄琴の板（鋼 6 mm・0.20 m）f1, 2番めとの比", bl1 ** 2 / (2 * pi * Lb ** 2) * cb * h / math.sqrt(12), (7.8532046 / bl1) ** 2)
p("βL の確かめ cos·cosh=1 の解", bis(lambda x: math.cos(x) * math.cosh(x) - 1, 4.0, 5.0))
Ip = 2.73e-7; mpl = 74 / 9.8; Lp = 4.0
p("SGP 50A（水入り）4 m 単純支持の f1", pi / (2 * Lp ** 2) * math.sqrt(205e9 * Ip / mpl))
p("まん中ではじいた弦の振幅 8h/(n²π²)（h=1）n=1,3,5", *[8 / (n * n * pi * pi) for n in (1, 3, 5)])
p("太鼓の膜（ベッセル）振動数比 j11/j01, j21/j01", 3.8317 / 2.4048, 5.1356 / 2.4048)
p("部屋 4 m の1番めの定在波", c / (2 * 4.0))
p("電子レンジ 2.45 GHz の λ/2 cm", 2.998e8 / 2.45e9 / 2 * 100)

print("== 波-7")
Za = 1.204 * c; Zt = 1.63e6; Zw = 1.48e6; Zs = 46e6


def R(z1, z2):
    return ((z2 - z1) / (z2 + z1)) ** 2


p("空気の Z, 空気→体の R, 透過率", Za, R(Za, Zt), 1 - R(Za, Zt))
p("ゼリー(1.5e6)→体の R", R(1.5e6, Zt))
p("音圧 1 Pa の強さ W/m², dB（20 µPa 基準）", 1 / Za, 20 * math.log10(1 / 20e-6))
p("線密度4倍の弦へ：振幅の反射係数", (1 - 2) / (1 + 2))
Tw = 4 * Za * Zw / (Za + Zw) ** 2
p("空気→水の透過率, dB", Tw, 10 * math.log10(Tw))
p("1/4波長の整合層 √(30e6×1.5e6)", math.sqrt(30e6 * 1.5e6))
p("50 Ω→75 Ω の反射係数", (75 - 50) / (75 + 50))
lam = 10.0; kk = 2 * pi / lam; cph = math.sqrt(g / kk)
p("深い水 λ=10 m：位相速度, 群速度", cph, cph / 2)
p("体の中 0.5 dB/(cm·MHz)・5 MHz・往復 20 cm の減衰 dB〔要〕", 0.5 * 5 * 20)
p("距離2倍で −dB", 20 * math.log10(2))
p("ガラス n=1.5 の垂直反射率", ((1.5 - 1) / (1.5 + 1)) ** 2)

print("== 波-8")
f0 = 960.0; vs = 60 / 3.6; cs = 340.0
p("サイレン 960 Hz・60 km/h（音速 340）近づく・遠ざかる", f0 * cs / (cs - vs), f0 * cs / (cs + vs))
p("スピーカー 680 Hz の波長（340）", 340 / 680)
p("スピードガン 24.15 GHz・40 m/s の Δf Hz〔要〕", 2 * 40 / 2.998e8 * 24.15e9)
p("血流 5 MHz・0.5 m/s・60°（1540）の Δf Hz", 2 * 5e6 * 0.5 * math.cos(math.radians(60)) / 1540)
p("マッハ2 の円すいの半角°", math.degrees(math.asin(1 / 2)))
p("単スリット a=0.1 mm, 633 nm の1番めの暗線の角°", math.degrees(math.asin(633e-9 / 0.1e-3)))

print("== 波-9")
p("雷 3 s（343）km", 343 * 3 / 1000)
p("331.5+0.6θ（15 ℃）・√(γRT)（15 ℃）・20 ℃", 331.5 + 0.6 * 15, c_air(15), c_air(20))
p("1 Pa は何 dB", 20 * math.log10(1 / 20e-6))
p("L_W=100 dB の点音源、10 m（自由空間 −11）", 100 - 20 * math.log10(10) - 11)
p("80+80, 80+70 dB", 10 * math.log10(2 * 10 ** 8), 10 * math.log10(10 ** 8 + 10 ** 7))


def Aw(f):
    f2 = f * f
    ra = (12194 ** 2 * f2 ** 2) / ((f2 + 20.6 ** 2) * math.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2)) * (f2 + 12194 ** 2))
    return 20 * math.log10(ra) + 2.00


p("A特性 100 Hz, 1 kHz, 4 kHz dB（IEC 61672 の式）", Aw(100), Aw(1000), Aw(4000))
p("質量則（垂直入射）ガラス 12.5 kg/m²・500 Hz：20log(πfm/ρc)", 20 * math.log10(pi * 500 * 12.5 / Za))
p("残響 0.161V/A：189 m³・30 m²", 0.161 * 189 / 30)
p("20 Hz と 20 kHz の波長 m", c / 20, c / 20000)

print("== 波-10")
p("コウモリ 6 ms の往復 m, 100 kHz の波長 mm", c * 0.006 / 2, c / 100e3 * 1e3)
cst = 5920.0
p("鋼の探傷 20 µs の往復 mm, 10 mm の往復 µs", cst * 20e-6 / 2 * 1e3, 2 * 0.010 / cst * 1e6)
p("水→鋼の振幅反射係数", (Zs - Zw) / (Zs + Zw))
p("ソナー 0.2 s の往復 m", 1500 * 0.2 / 2)
w = 2 * pi * 10
p("10 Hz・1 mm：速度 mm/s, 加速度 m/s²", 1e-3 * w * 1e3, 1e-3 * w * w)
p("軸受の外輪の欠陥 BPFO（9玉・d/D=0.2・30 Hz）", 9 / 2 * 30.0 * (1 - 0.2))
p("圧電 d33=400 pC/N・10 N の電荷 nC〔要〕", 400e-12 * 10 * 1e9)
z = 0.7
for rr in (0.2, 0.5):  # 加速度計：x/(a/ω_n²)
    p(f"加速度計 ζ=0.7・ω/ω_n={rr} の感度のずれ", 1 / math.sqrt((1 - rr * rr) ** 2 + (2 * z * rr) ** 2))

print("== 波-11")
p("車輪：1コマ 2.75×360/24, 見える回転°", 2.75 * 360 / 24, 2.75 * 360 / 24 - 45)
p("CD のナイキスト周波数", 44100 / 2)
p("7 kHz を 8 kHz でとると", abs(7000 - 8000))
p("10.24 kHz・1024 点の Δf", 10240 / 1024)
p("16 ビットの量子化 SN dB", 6.02 * 16 + 1.76)
p("RC 1 kΩ・0.1 µF の f_c", 1 / (2 * pi * 1e3 * 0.1e-6))
p("26 文字の情報量 bit", math.log2(26))
p("シャノン 3 kHz・30 dB の容量 kb/s", 3e3 * math.log2(1 + 1000) / 1e3)
p("FFT と DFT の手間の比 N=1024", 1024 ** 2 / (1024 * 10))
p("平均 100 回の SN の改善 dB", 20 * math.log10(math.sqrt(100)))

print("== 波-12")
nw = 1.333
p("見かけの深さ 10 cm/n", 10 / nw)
p("空気→水 45° の屈折角°", math.degrees(math.asin(math.sin(math.radians(45)) / nw)))
for nn, name in ((1.333, '水'), (1.5, 'ガラス'), (2.42, 'ダイヤ')):
    p(f"臨界角 {name}", math.degrees(math.asin(1 / nn)))
NA = math.sqrt(1.48 ** 2 - 1.46 ** 2)
p("ファイバ NA, 受け入れ角°", NA, math.degrees(math.asin(NA)))
f = 0.050; a = 2.0; b = 1 / (1 / f - 1 / a)
p("f=50 mm・2 m の像の位置 mm, 倍率", b * 1e3, b / a)
p("両凸 R=0.1 m・n=1.5 の f", 1 / ((1.5 - 1) * (1 / 0.1 + 1 / 0.1)))
p("2枚のレンズ f=0.1・0.1・間 0.05 の合成 f", 0.1 * 0.1 / (0.1 + 0.1 - 0.05))
p("1000 cd・2 m の照度 lx", 1000 / 2 ** 2)


def rainbow(n):  # 主虹の角（最小偏角から）
    best = None
    for i in range(1, 90000):
        th = math.radians(i / 1000); r_ = math.asin(math.sin(th) / n); Dv = pi + 2 * th - 4 * r_
        if best is None or Dv < best:
            best = Dv
    return 180 - math.degrees(best)


p("主虹の角 n=1.331（赤）, 1.343（紫）", rainbow(1.331), rainbow(1.343))

print("== 波-13")
p("散乱の強さ (700/450)^4", (700 / 450) ** 4)
p("ヤング d=0.2 mm・L=1 m・633 nm の間隔 mm", 1.0 * 633e-9 / 0.2e-3 * 1e3)
p("格子 1000 本/mm・550 nm の1次の角°", math.degrees(math.asin(550e-9 / 1e-6)))
p("CD 1.6 µm・650 nm の1次の角°〔要〕", math.degrees(math.asin(650e-9 / 1.6e-6)))
p("反射防止 MgF2 n=1.38・550 nm の厚さ nm", 550 / (4 * 1.38))
p("目 D=3 mm・550 nm の分解能 rad, 分", 1.22 * 550e-9 / 3e-3, math.degrees(1.22 * 550e-9 / 3e-3) * 60)
p("マリュス 60° の割合", math.cos(math.radians(60)) ** 2)
p("ブルースター角 n=1.5°", math.degrees(math.atan(1.5)))
p("マイケルソン 1000 本・633 nm の移動 mm", 1000 * 633e-9 / 2 * 1e3)

print("== 波-14")
p("2.4 GHz の λ/4 cm", 2.998e8 / 2.4e9 / 4 * 100)
p("静止衛星の往復 s（高度 35786 km・真上）", 2 * 35786e3 / 2.998e8)
p("CD の量 kb/s, 128 kb/s との比", 44100 * 16 * 2 / 1e3, 44100 * 16 * 2 / 128e3)
p("ファイバ 0.2 dB/km・100 km〔要〕", 0.2 * 100)
