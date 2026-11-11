#!/usr/bin/env python3
"""物理第5巻 原-8（固体の中の電子：エネルギーバンド）の数値の検算（組 原W4）。
python3 calc_p5_08.py > calc_p5_08_out.txt
定数は CODATA 2022（NIST）。ケイ素の格子定数は CODATA 2022、銅の Kα1 は NIST X-ray Transition Energies、
密度は NIST（X 線の表の表1）、銅の n・τ・抵抗率は第4巻 電-4 にそろえた。
"""
import math
import numpy as np

h = 6.62607015e-34
hbar = 1.054571817e-34
e = 1.602176634e-19
c = 299792458.0
kB = 1.380649e-23
NA = 6.02214076e23
me = 9.1093837139e-31
R = 8.314462618
aSi = 0.5431020511e-9
pi = math.pi
kT300 = kB * 300 / e
hc_eVnm = h * c / e * 1e9


def p(label, *v):
    out = []
    for x in v:
        out.append(f"{x:.6g}" if isinstance(x, float) else str(x))
    print(f"{label}: " + "  ".join(out))


print("== 定数")
p("kT 300 K eV", kT300, "hc eV·nm", hc_eVnm)

print("\n== ① 結晶の原子の数（単純立方1・体心2・面心4・ダイヤモンド8）")
for name, n_, f in (("単純立方", 1, pi / 6), ("体心立方", 2, pi * math.sqrt(3) / 8), ("面心立方", 4, pi * math.sqrt(2) / 6), ("ダイヤモンド", 8, pi * math.sqrt(3) / 16)):
    p(f"{name}：1つの立方体の原子・つまり方", n_, f)
# 銅（面心立方）の格子定数を密度から
rhoCu, MCu = 8.960e3, 63.546e-3
nCu = rhoCu / MCu * NA
aCu = (4 / nCu) ** (1 / 3)
p("銅の n・格子定数 nm・最も近い原子の間 nm", nCu, aCu * 1e9, aCu / math.sqrt(2) * 1e9)

print("\n== ② ブラッグ（例題2）")
EKa1 = 8047.8227  # eV（NIST）
lamKa1 = hc_eVnm / EKa1
p("Cu Kα1 の波長 nm", lamKa1)
for hkl in ((1, 1, 1), (2, 2, 0), (3, 1, 1), (4, 0, 0)):
    d = aSi / math.sqrt(sum(x * x for x in hkl))
    s = lamKa1 * 1e-9 / (2 * d)
    th = math.degrees(math.asin(s))
    p(f"Si {hkl}：d nm・θ°・2θ°", d * 1e9, th, 2 * th)
# 練習：d=0.2 nm に 0.154 → θ
p("d=0.200 nm・λ=0.154 nm の θ°", math.degrees(math.asin(0.154 / 0.4)))
p("n=2 の θ°（Si 111）", math.degrees(math.asin(2 * lamKa1 * 1e-9 / (2 * aSi / math.sqrt(3)))))
# 銅（面心立方）111
d111Cu = aCu / math.sqrt(3)
p("銅 111：d nm・2θ°", d111Cu * 1e9, 2 * math.degrees(math.asin(lamKa1 * 1e-9 / (2 * d111Cu))))
# 可視光でブラッグ反射は起きるか
p("λ=500 nm・d=0.3 nm：sinθ", 500 / 0.6)

print("\n== ③ ケイ素の密度（例題3）")
MSi = 28.0855e-3
mSi = MSi / NA
rho = 8 * mSi / aSi ** 3
p("密度 kg/m3・g/cm3", rho, rho / 1e3)
p("数密度 1/m3・1/cm3", 8 / aSi ** 3, 8 / aSi ** 3 / 1e6)
p("NIST の密度 2.330 との差 %", (rho / 1e3 / 2.330 - 1) * 100)
p("最も近い原子の間 √3a/4 nm", math.sqrt(3) * aSi / 4 * 1e9)
p("1 cm3 の原子 1 個あたりの体積の立方根 nm", (aSi ** 3 / 8) ** (1 / 3) * 1e9)

print("\n== ④ 自由電子（例題4）")
n = 8.49e28
kF = (3 * pi ** 2 * n) ** (1 / 3)
EF = hbar ** 2 * kF ** 2 / (2 * me)
vF = hbar * kF / me
p("kF 1/nm・λF nm", kF * 1e-9, 2 * pi / kF * 1e9)
p("E_F eV・T_F K・v_F m/s・km/s", EF / e, EF / kB, vF, vF / 1e3)
p("v_F / c", vF / c)
# 手でわかる版：E_F = (h^2/8m)(3n/π)^{2/3}
EF2 = h ** 2 / (8 * me) * (3 * n / pi) ** (2 / 3)
p("h²/(8m)(3n/π)^{2/3} eV（同じか）", EF2 / e)
# 2倍：n を8倍
p("n を 8倍：E_F eV", hbar ** 2 * (3 * pi ** 2 * 8 * n) ** (2 / 3) / (2 * me) / e)
# 熱の速さとくらべる（古典の 300 K の電子）
v_th = math.sqrt(3 * kB * 300 / me)
p("古典の 300 K の電子の速さ km/s", v_th / 1e3)
# ほかの金属（1原子あたり1個：Na, Ag, Au／Al 3個）
for name, rho_, M_, z in (("Na", 0.971e3, 22.98977e-3, 1), ("Al", 2.699e3, 26.98154e-3, 3), ("Ag", 10.50e3, 107.8682e-3, 1)):
    nn = rho_ / M_ * NA * z
    p(f"{name}：n・E_F eV", nn, hbar ** 2 * (3 * pi ** 2 * nn) ** (2 / 3) / (2 * me) / e)
# 1 nm の箱（原-5）の E_1 と比べる
p("1 nm の箱 E1 eV（原-5）", h ** 2 / (8 * me * 1e-18) / e)
# 状態の数を数える：一辺 L の箱、n_x^2+n_y^2+n_z^2 <= N_max^2 の格子点の数
for Nmax in (5, 10, 20, 40):
    g = np.arange(1, Nmax + 1)
    X, Y, Z = np.meshgrid(g, g, g, indexing='ij')
    cnt = int(np.sum(X ** 2 + Y ** 2 + Z ** 2 <= Nmax ** 2))
    p(f"半径 {Nmax}：格子点の数・(1/8)(4/3)πN^3", cnt, pi * Nmax ** 3 / 6)

print("\n== ⑤ フェルミ分布（例題5）")
for dE in (-0.1, -0.05, 0.0, 0.05, 0.1, 0.2):
    p(f"300 K：E-E_F={dE}", 1 / (math.exp(dE / kT300) + 1))
for T in (300, 600, 1000):
    kt = kB * T / e
    p(f"{T} K：kT eV・占有 0.9 と 0.1 の間のはば 2·kT·ln9 eV", kt, 2 * kt * math.log(9))
p("ボルツマン近似：E-E_F=0.2 で e^-x", math.exp(-0.2 / kT300))

print("\n== ⑥ 電子の比熱（例題6）")
TF = EF / kB
ratio = pi ** 2 / 3 * 300 / TF
p("(π²/3)(T/T_F)", ratio)
p("目安 (kT/E_F)", 300 / TF)
gamma = pi ** 2 / 2 * R / TF
p("電子の比熱の係数 γ mJ/(mol K²)（自由電子）", gamma * 1e3)
p("300 K の電子の比熱 J/(mol K)・格子 3R", gamma * 300, 3 * R)

print("\n== ⑦ 1次元の結晶（例題7）")
a = 0.25e-9
E_gap_center = (hbar * pi / a) ** 2 / (2 * me) / e
p("k=π/a の自由電子 eV（=h²/(8ma²)）", E_gap_center, h ** 2 / (8 * me * a ** 2) / e)
p("λ=2a nm", 2 * a * 1e9)
p("a=0.5 nm なら eV", h ** 2 / (8 * me * (0.5e-9) ** 2) / e)
p("a=0.25 nm の2つめ（k=2π/a）eV", 4 * E_gap_center)

print("\n== ⑪ くし形の結晶（クローニッヒ・ペニー：例題8）")
Pk = 3 * pi / 2
ak = 0.5e-9
E0 = (hbar / ak) ** 2 / (2 * me) / e  # qa=1 のときのエネルギー eV
p("qa=1 のエネルギー eV", E0)
qa = np.linspace(1e-6, 5 * pi, 2000001)
F = np.cos(qa) + Pk * np.sin(qa) / qa
allowed = np.abs(F) <= 1
Eq = E0 * qa ** 2
edges = np.flatnonzero(np.diff(allowed.astype(int)))
bands = []
start = 0 if allowed[0] else None
idx = list(edges)
# 帯のはしを組にする
st = None
for i in range(len(qa) - 1):
    pass
bnd = []
cur = None
for k in edges:
    if not allowed[k] and allowed[k + 1]:
        cur = Eq[k + 1]
    elif allowed[k] and not allowed[k + 1] and cur is not None:
        bnd.append((float(cur), float(Eq[k])))
        cur = None
for lo, hi in bnd[:4]:
    p("帯 eV", lo, hi, "はば", hi - lo)
for i in range(3):
    p(f"すき間 {i+1} eV", bnd[i + 1][0] - bnd[i][1])
# 自由電子の k=π/a, 2π/a, 3π/a のエネルギー
for m in (1, 2, 3):
    p(f"自由電子の k={m}π/a のエネルギー eV", E0 * (m * pi) ** 2)
# 帯の上のはしは qa = mπ（cos(qa)=±1 で sin=0）
p("帯の上のはしの qa/π", *[round(math.sqrt(hi / E0) / pi, 4) for lo, hi in bnd[:3]])
# P を変える
for Pv in (0.5 * pi, 3 * pi / 2, 5 * pi):
    F2 = np.cos(qa) + Pv * np.sin(qa) / qa
    al = np.abs(F2) <= 1
    ed = np.flatnonzero(np.diff(al.astype(int)))
    bb = []
    cur = None
    for k in ed:
        if not al[k] and al[k + 1]:
            cur = Eq[k + 1]
        elif al[k] and not al[k + 1] and cur is not None:
            bb.append((round(float(cur), 2), round(float(Eq[k]), 2)))
            cur = None
    p(f"P={Pv/pi:.2f}π の帯 eV", *bb[:3])

print("\n== ⑧⑨ はてな（例題1）")
for Eg, name in ((1.12, "Si"), (9.0, "ガラス"), (0.67, "Ge"), (1.42, "GaAs"), (3.4, "GaN"), (5.5, "ダイヤモンド")):
    p(f"{name} {Eg} eV：e^(-Eg/2kT) 300K", math.exp(-Eg / (2 * kT300)))
p("比（Si/ガラス）の 10 のべき", math.log10(math.exp(-1.12 / (2 * kT300)) / math.exp(-9.0 / (2 * kT300))))
p("Eg を 2 倍（1.12→2.24）：比は2乗", math.exp(-2.24 / (2 * kT300)), math.exp(-1.12 / (2 * kT300)) ** 2)
# ガラス 8〜10 eV の幅
for Eg in (8.0, 9.0, 10.0):
    p(f"Eg={Eg}：10 のべき", math.log10(math.exp(-Eg / (2 * kT300))))
# 温度 300→350 K（Si）
p("Si 300→350 K の e^(-Eg/2kT) の比", math.exp(-1.12 / (2 * kB * 350 / e)) / math.exp(-1.12 / (2 * kT300)))
# 光の色：Eg と λ
for Eg in (1.12, 1.42, 3.4, 9.0):
    p(f"Eg={Eg} eV の光の波長 nm", hc_eVnm / Eg)
p("可視光 400 nm・700 nm の eV", hc_eVnm / 400, hc_eVnm / 700)

print("\n== ⑩ 平均自由行程・ウィーデマン・フランツ（例題9・10）")
tau = 2.4e-14
p("v_F τ nm", vF * tau * 1e9, "原子の間（0.256 nm）の何倍", vF * tau / (aCu / math.sqrt(2)))
# 古典の速さで計算すると
p("古典の速さ×τ nm", v_th * tau * 1e9)
L0 = pi ** 2 * kB ** 2 / (3 * e ** 2)
p("ローレンツ数 W·Ω/K²", L0)
for rho_ in (1.72e-8, 1.68e-8):
    p(f"銅 293 K ρ={rho_}：κ W/(m K)", L0 * 293 / rho_)
# アルミ 2.65e-8（電-4）
p("アルミ 293 K ρ=2.65e-8：κ", L0 * 293 / 2.65e-8)
# 古典（ドルーデの 3/2 k²/e²）
p("ドルーデの古典の比 (3/2)(k/e)²", 1.5 * (kB / e) ** 2)

print("\n== ⑪ デバイ（例題11）")
thD = 343.0
A = 12 * pi ** 4 / 5 * R
p("12π⁴R/5", A)
for T in (5, 10, 20, 40):
    p(f"{T} K：C J/(mol K)", A * (T / thD) ** 3, "電子 γT", gamma * T)
# 3R の何分の1
p("10 K の C / 3R", A * (10 / thD) ** 3 / (3 * R))
# デバイ関数の数値（全温度）
def debye_C(T, th):
    x = np.linspace(1e-6, th / T, 20001)
    f = x ** 4 * np.exp(x) / (np.exp(x) - 1) ** 2
    return 9 * R * (T / th) ** 3 * np.trapezoid(f, x)
for T in (10, 20, 50, 100, 200, 300):
    p(f"デバイの式（全部）{T} K", debye_C(T, thD), "T³ 則", A * (T / thD) ** 3)
# アインシュタイン（熱-15）θ_E = 0.806 θ_D くらい；比べる
thE = 0.806 * thD
for T in (10, 20):
    x = thE / T
    p(f"アインシュタイン {T} K（θE={thE:.0f}）", 3 * R * x * x * math.exp(x) / (math.exp(x) - 1) ** 2)

print("\n== ⑫ 超伝導（例題12）")
for Tc in (9.2, 9.5, 9.6, 1.2, 7.2):
    D = 1.76 * kB * Tc / e
    p(f"Tc={Tc}：Δ meV・2Δ の光 THz", D * 1e3, 2 * D * e / h / 1e12)
p("Nb-Ti 9.5 K の kT_c meV", kB * 9.5 / e * 1e3)
p("液体ヘリウム 4.2 K の kT meV", kB * 4.2 / e * 1e3)
# MRI 3 T（電-6）
print("\n== 章末問題")
# 基本
p("Si 220：2θ°", 2 * math.degrees(math.asin(lamKa1 * 1e-9 / (2 * aSi / math.sqrt(8)))))
p("d=0.282 nm（NaCl）θ°", math.degrees(math.asin(lamKa1 / (2 * 0.282))))
# 銀の n・E_F（10.50 g/cm3 107.87）
nAg = 10.50e3 / 107.8682e-3 * NA
p("Ag：n・E_F・v_F", nAg, hbar ** 2 * (3 * pi ** 2 * nAg) ** (2 / 3) / (2 * me) / e, hbar * (3 * pi ** 2 * nAg) ** (1 / 3) / me)
# アルミ（3個）
nAl = 2.699e3 / 26.98154e-3 * NA * 3
p("Al：n・E_F", nAl, hbar ** 2 * (3 * pi ** 2 * nAl) ** (2 / 3) / (2 * me) / e)
p("占有 1000 K・E-E_F=0.1", 1 / (math.exp(0.1 / (kB * 1000 / e)) + 1))
p("GaAs と Si の e^(-Eg/2kT) の比", math.exp(-1.42 / (2 * kT300)) / math.exp(-1.12 / (2 * kT300)))
p("ダイヤモンド 5.5 eV の e^(-Eg/2kT)", math.exp(-5.5 / (2 * kT300)))
p("a=0.30 nm の 1次元 k=π/a eV", h ** 2 / (8 * me * (0.3e-9) ** 2) / e)
# チャレンジ
# 金（1個）19.32 g/cm3 196.97
nAu = 19.32e3 / 196.96657e-3 * NA
EFAu = hbar ** 2 * (3 * pi ** 2 * nAu) ** (2 / 3) / (2 * me) / e
p("Au：n・E_F eV", nAu, EFAu)
# 銅の電子の比熱の係数と 4 K の電子 vs 格子
p("銅 4 K：電子 γT・格子", gamma * 4, A * (4 / thD) ** 3, "等しくなる温度 K", math.sqrt(gamma / A * thD ** 3))
# WF で銀（ρ=1.59e-8）
p("銀 293 K ρ=1.59e-8：κ", L0 * 293 / 1.59e-8)

print("\n== 本文の丸め（k_BT＝0.0259 eV など）で書いた数")
kt = 0.0259
for Eg in (1.12, 2.24, 9.0, 1.42, 5.5):
    x = Eg / (2 * kt)
    p(f"Eg={Eg}：指数・e^-x・10のべき", x, math.exp(-x), -x / math.log(10))
p("Si/ガラスの比（10のべき）", (9.0 - 1.12) / (2 * kt) / math.log(10))
p("GaAs/Si", math.exp(-1.42 / (2 * kt)) / math.exp(-1.12 / (2 * kt)))
p("Si 300→350 K（kT 0.0259→0.0302）", math.exp(-1.12 / (2 * 0.030216)) / math.exp(-1.12 / (2 * kt)))
for dE in (0.05, -0.05, 0.10, -0.10):
    p(f"例題5：{dE}", 1 / (math.exp(dE / kt) + 1), "e^x", math.exp(dE / kt))
p("じぶんで5：1000 K +0.1", 1 / (math.exp(0.1 / 0.0862) + 1))
p("例題2：sinθ・θ・2θ（λ=0.1541, d=0.5431/√3）", 0.1541 / (2 * 0.5431 / math.sqrt(3)), math.degrees(math.asin(0.1541 / (2 * 0.5431 / math.sqrt(3)))), 2 * math.degrees(math.asin(0.1541 / (2 * 0.5431 / math.sqrt(3)))))
p("n=2：sinθ・θ", 2 * 0.1541 / (2 * 0.5431 / math.sqrt(3)), math.degrees(math.asin(2 * 0.1541 / (2 * 0.5431 / math.sqrt(3)))))
p("n の上限（nλ<2d）", 2 * 0.5431 / math.sqrt(3) / 0.1541)
d220 = 0.5431 / math.sqrt(8)
p("じぶんで2：d・sinθ・θ・2θ", d220, 0.1541 / (2 * d220), math.degrees(math.asin(0.1541 / (2 * d220))), 2 * math.degrees(math.asin(0.1541 / (2 * d220))))
a3 = (0.5431e-9) ** 3
p("例題3：a³・ρ g/cm3・n", a3, 8 * 28.09e-3 / 6.022e23 / a3 / 1e3, 8 / a3)
p("じぶんで3：銅の a nm", (4 * 63.55e-3 / (8.96e3 * 6.022e23)) ** (1 / 3) * 1e9)
kF_ = (3 * pi ** 2 * 8.49e28) ** (1 / 3)
p("例題4（丸め）：kF・E_F J・eV・T_F・v_F", kF_, (1.055e-34 * 1.36e10) ** 2 / (2 * 9.11e-31), (1.055e-34 * 1.36e10) ** 2 / (2 * 9.11e-31) / 1.602e-19, 1.13e-18 / 1.38e-23, 1.055e-34 * 1.36e10 / 9.11e-31)
kF_ag = (3 * pi ** 2 * 5.86e28) ** (1 / 3)
p("じぶんで4（銀）：kF・E_F eV・v_F", kF_ag, hbar ** 2 * kF_ag ** 2 / (2 * me) / e, hbar * kF_ag / me)
p("例題6・じぶんで6", pi ** 2 / 3 * 300 / 8.2e4, pi ** 2 / 3 * 30 / 8.2e4)
p("例題7：E eV（6.63e-34, 9.11e-31）", (6.63e-34) ** 2 / (8 * 9.11e-31 * (0.25e-9) ** 2) / 1.602e-19)
p("じぶんで7・問題4：a=0.30・0.20", h ** 2 / (8 * me * (0.30e-9) ** 2) / e, h ** 2 / (8 * me * (0.20e-9) ** 2) / e)
p("例題9：ℓ nm・倍", 1.57e6 * 2.4e-14 * 1e9, 1.57e6 * 2.4e-14 / 0.256e-9)
p("例題10：κ 銅・ニクロム・じぶんで10 アルミ・問題 銀", 2.44e-8 * 293 / 1.72e-8, 2.44e-8 * 293 / 1.1e-6, 2.44e-8 * 293 / 2.65e-8, 2.44e-8 * 293 / 1.59e-8)
p("例題11：1944×(10/343)³・(20/343)³・じぶんで11 (5/343)³", 1944 * (10 / 343) ** 3, 1944 * (20 / 343) ** 3, 1944 * (5 / 343) ** 3)
p("例題12：Δ eV・kT 4.2 K eV・比・e^-比、じぶんで12：Tc=4.0", 1.76 * 8.62e-5 * 9.5, 8.62e-5 * 4.2, 1.76 * 9.5 / 4.2, math.exp(-1.76 * 9.5 / 4.2), 1.76 * 8.62e-5 * 4.0)
p("問題1：θ n=1・n=2", math.degrees(math.asin(0.154 / 0.4)), math.degrees(math.asin(0.308 / 0.4)))
p("問題2：d nm", 0.1541 / (2 * math.sin(math.radians(14.22))))
p("問題3：鉄（a=0.287 nm）の密度 g/cm3", 2 * 55.85 / 6.022e23 / (0.287e-7) ** 3)
nal = 3 * 2.70e6 / 26.98 * 6.022e23
p("チャレンジ1：Al n・E_F", nal, hbar ** 2 * (3 * pi ** 2 * nal) ** (2 / 3) / (2 * me) / e)
p("チャレンジ2：ln99×0.0517", math.log(99) * 0.0517)
p("チャレンジ4：交差の温度 K", math.sqrt(5 * 343 ** 3 / (24 * pi ** 2 * 8.2e4)))
p("ガラスの電子の数の目安（SiO2 2.2 g/cm3・60 g/mol・30 電子）", 2.2e6 / 60.08 * 6.022e23 * 30)
p("熱電の目安 (π²/3)(k/e)(kT/E_F) V/K", pi ** 2 / 3 * (kB / e) * (0.02585 / 7.04))
p("液体窒素 77 K を ℃", 77.3 - 273.15)
