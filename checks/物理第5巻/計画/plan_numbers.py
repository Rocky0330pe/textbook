# 物理第5巻『原子』計画書（tools/phys5-plan.md）の例題の「答えの見こみ」を計算するスクリプト（組 P5-R）。
# 使い方：python3 plan_numbers.py > plan_numbers_out.txt   （numpy を使う。数値積分・固有値・根は自前でも書いてある）
# 定数は CODATA 2022（NIST allascii.txt、11月11日に読んだ）〔確〕。原子の質量は NIST "Atomic Weights and Isotopic
# Compositions"（AME2020 にもとづく相対原子質量）〔確〕。減弱係数・密度は NIST "X-Ray Mass Attenuation Coefficients"〔確〕。
# 〔要〕の値（半減期の一部・断面積・物性値・実機の値）は仮の値で、章を書く組が出典で確かめて差しかえる。〔仮〕は例題のために置いた値。
import math
import numpy as np

pi = math.pi
# ---- CODATA 2022 〔確〕
h = 6.62607015e-34          # J s（定義値）
hbar = h / (2 * pi)
e = 1.602176634e-19         # C（定義値）
c = 299792458.0             # m/s（定義値）
kB = 1.380649e-23           # J/K（定義値）
NA = 6.02214076e23          # 1/mol（定義値）
me = 9.1093837139e-31       # kg
mp = 1.67262192595e-27      # kg
mn = 1.67492750056e-27      # kg
u = 1.66053906892e-27       # kg
uMeV = 931.49410372         # MeV
meMeV = 0.51099895069       # MeV
eps0 = 8.8541878188e-12     # F/m
a0 = 5.29177210544e-11      # m
Rinf = 10973731.568157      # 1/m
Ry_eV = 13.605693122990     # eV
alpha = 7.2973525643e-3
muB_eV = 5.7883817982e-5    # eV/T
gamma_p = 42.577478461      # MHz/T（陽子の磁気回転比/2π）
ge = 2.00231930436092
lam_C = 2.42631023538e-12   # m（電子のコンプトン波長）
aSi = 5.431020511e-10       # m（ケイ素の格子定数）
Fara = 96485.33212
sigmaSB = 5.670374419e-8
b_wien = 2.897771955e-3
c1 = 3.741771852e-16
c2 = 1.438776877e-2
kC = 1 / (4 * pi * eps0)    # 本文は 8.99e9（電-1 と同じ）
eV = e
hc_eVnm = h * c / e * 1e9   # 1239.84 eV nm
kT300 = kB * 300 / e        # eV
MeVfm = 197.3269804         # ħc MeV fm
ke2_MeVfm = alpha * MeVfm   # 1.44 MeV fm
year = 365.25 * 86400

# ---- 原子の質量（u）NIST〔確〕
M = {'n': 1.00866491606, 'H1': 1.00782503223, 'H2': 2.01410177812, 'H3': 3.0160492779, 'He3': 3.0160293201,
     'He4': 4.00260325413, 'Li6': 6.0151228874, 'Li7': 7.0160034366, 'C12': 12.0, 'C14': 14.0032419884,
     'N14': 14.00307400443, 'O16': 15.99491461957, 'Fe56': 55.93493633, 'Ni62': 61.92834537, 'Kr92': 91.9261731,
     'Ba141': 140.9144033, 'U235': 235.0439301, 'U236': 236.0455682, 'U238': 238.0507884, 'Pu239': 239.0521636,
     'Co60': 59.93381630, 'Cs137': 136.90708923, 'I131': 130.90612630, 'Sr90': 89.9077300, 'K40': 39.963998166,
     'Rn222': 222.0175782, 'Ra226': 226.0254103, 'Pb206': 205.9744657, 'Pb208': 207.9766525}
ab_U235 = 0.007204; ab_U238 = 0.992742; ab_K40 = 0.000117   # 存在比 NIST〔確〕


def p(label, *vals):
    out = []
    for v in vals:
        if isinstance(v, (float, np.floating)):
            out.append(f"{float(v):.4g}")
        else:
            out.append(str(v))
    print(f"{label}: " + ", ".join(out))


def bisect(f, a, b, n=200):
    fa = f(a)
    for _ in range(n):
        m = 0.5 * (a + b); fm = f(m)
        if fa * fm <= 0:
            b = m
        else:
            a, fa = m, fm
    return 0.5 * (a + b)


def simpson(f, a, b, n=2000):
    if n % 2: n += 1
    hh = (b - a) / n
    s = f(a) + f(b)
    for i in range(1, n):
        s += (4 if i % 2 else 2) * f(a + i * hh)
    return s * hh / 3


def B_nuc(Z, N, mass_u):
    """原子の質量から結合エネルギー MeV（電子の結合エネルギーは無視）"""
    return (Z * M['H1'] + N * M['n'] - mass_u) * uMeV


print("== 定数（CODATA 2022）")
p("hc eV·nm", hc_eVnm)
p("kT (300 K) eV", kT300)
p("ħc MeV·fm・e²/(4πε0) MeV·fm", MeVfm, ke2_MeVfm)
p("1 u = MeV", uMeV)
p("F/e = N_A の確かめ", Fara / e)

# =========================================================
print("\n== 原-0 序章")
# 1円玉：アルミニウム 1.00 g、26.98 g/mol、密度 2.699 g/cm3（NIST〔確〕）
Nal = 1.00 / 26.98 * NA
vol = 1.00 / 2.699 * 1e-6
p("1円玉の原子の数・1個の体積 m3・立方体の1辺 nm", Nal, vol / Nal, (vol / Nal) ** (1 / 3) * 1e9)
p("1円玉の原子を1列に並べた長さ km（1辺 0.255 nm として）", Nal * (vol / Nal) ** (1 / 3) / 1e3)
p("地球と月の距離 3.84e5 km の何倍", Nal * (vol / Nal) ** (1 / 3) / 1e3 / 3.84e5)
# 燃える炭素 vs 核分裂
dH = 393.5e3  # J/mol C → CO2〔要：熱-1 の値と照合〕
p("炭素1個が燃えるエネルギー eV", dH / NA / e)
p("核分裂1回 200 MeV との比", 200e6 / (dH / NA / e))
p("1 kg あたり：炭素 J・ウラン235 J・比", dH / 0.012011, 200e6 * e * NA / 0.235044, 200e6 * e * NA / 0.235044 / (dH / 0.012011))
# チップの線幅 10 nm〔仮〕に並ぶケイ素の原子（原子の間かく √3 a/4）
dSi = math.sqrt(3) * aSi / 4
p("ケイ素の原子の間かく nm・10 nm に並ぶ数", dSi * 1e9, 10e-9 / dSi)

# =========================================================
print("\n== 原-1")
R_Au = 1.2 * 197 ** (1 / 3)   # fm〔要：r0=1.2 fm は目安〕
r_Au = 0.144e-9               # 金の原子半径 m〔要〕
p("金の原子核 fm・原子の半径との比・体積の比", R_Au, R_Au * 1e-15 / r_Au, (R_Au * 1e-15 / r_Au) ** 3)
p("原子を直径 100 m の競技場にすると原子核の直径 mm", 100 * R_Au * 1e-15 / r_Au * 1e3)
p("水素：陽子の半径 0.841 fm（CODATA）÷ボーア半径", 0.84075e-15 / a0)
# トムソン：E=2.0e4 V/m、B=1.0 mT
E1, B1 = 2.0e4, 1.0e-3
v1 = E1 / B1; r1 = me * v1 / (e * B1)
p("トムソン：直進の速さ m/s・磁場だけの半径 m・e/m C/kg", v1, r1, v1 / (r1 * B1))
# 電-6 例題8 と同じ数：1.0 kV・1.0 mT
v = math.sqrt(2 * e * 1000 / me); r = me * v / (e * 1e-3)
p("電-6 例題8：速さ・半径 m・r から e/m=2V/(B²r²)", v, r, 2 * 1000 / ((1e-3) ** 2 * r ** 2))
p("e/m の CODATA", e / me)
# ミリカン：油滴 半径 1.0 μm、密度 870 kg/m3〔仮〕、極板 5.0 mm
rho_oil = 870; ro = 1.0e-6; d = 5.0e-3; g = 9.8
mo = 4 / 3 * pi * ro ** 3 * rho_oil
for n in (1, 2, 3):
    p(f"ミリカン：電荷 {n}e のときつり合う電圧 V", mo * g * d / (n * e))
p("油滴の質量 kg・重さ N", mo, mo * g)
eta_air = 1.81e-5   # Pa s（力-2 例題12 と同じ空気の粘度）
p("終端速度 m/s（ストークス）", 2 * ro ** 2 * rho_oil * g / (9 * eta_air))
qs = [3.2e-19, 4.8e-19, 8.0e-19, 11.2e-19]
p("ミリカンのデータ（入試の形）：q/1.6e-19", *[q / 1.6e-19 for q in qs])
p("水 1 分子の体積 m3・1辺 nm", 18.015e-3 / 1000 / NA, (18.015e-3 / 1000 / NA) ** (1 / 3) * 1e9)
# ラザフォード：5.0 MeV の α、金 Z=79
K = 5.0; Zt = 79
dmin = 2 * Zt * ke2_MeVfm / K
p("最も近づく距離 fm（正面）", dmin)
b90 = dmin / 2
p("90°に曲がるねらいの距離 b fm・σ(>90°) m2", b90, pi * (b90 * 1e-15) ** 2)
n_Au = 19.32e3 / (196.97e-3) * NA   # 1/m3（密度 19.32 g/cm3〔要〕）
t_foil = 0.40e-6                     # 〔仮〕
p("金の数密度 1/m3・90°より大きく曲がる割合", n_Au, n_Au * t_foil * pi * (b90 * 1e-15) ** 2)
for th in (5, 10, 30, 90, 150):
    p(f"散乱角 {th}° のねらいの距離 fm", dmin / 2 / math.tan(math.radians(th) / 2))
# 質量分析：1.0 kV・0.10 T・1価
for iso, mu_ in (('C12', 12.0), ('C13', 13.00335484)):
    mm = mu_ * u
    p(f"質量分析 {iso}+ の半径 m", math.sqrt(2 * mm * 1000 / e) / 0.10)

# =========================================================
print("\n== 原-2")
for T in (1000, 1500, 2800, 5772):
    p(f"ウィーン T={T} K の山 μm", b_wien / T * 1e6)


def planck_lam(lam, T):
    return 2 * pi * h * c ** 2 / lam ** 5 / (math.exp(h * c / (lam * kB * T)) - 1)


for T in (800, 1000, 1500, 2800, 5772):
    vis = simpson(lambda L: planck_lam(L, T), 380e-9, 780e-9, 800)
    tot = sigmaSB * T ** 4
    p(f"T={T} K：可視光(380–780 nm)の割合 %", vis / tot * 100)
for lam_nm in (650, 550, 450, 300):
    p(f"光子 {lam_nm} nm のエネルギー eV・J", hc_eVnm / lam_nm, hc_eVnm / lam_nm * e)
p("緑 530 nm・1 mW の LED が出す光子の数 1/s", 1e-3 / (h * c / 530e-9))
W_K = 2.3   # カリウムの仕事関数 eV〔要〕
p("仕事関数 2.3 eV：限界波長 nm", hc_eVnm / W_K)
Kmax = hc_eVnm / 400 - W_K
p("400 nm を当てた：最大の運動エネルギー eV・阻止電圧 V・速さ m/s", Kmax, Kmax, math.sqrt(2 * Kmax * e / me))
# ミリカンの h：W=2.0 eV〔仮〕、6.0e14 と 8.0e14 Hz
V1 = h * 6.0e14 / e - 2.0; V2 = h * 8.0e14 / e - 2.0
p("阻止電圧 V（6.0e14 Hz・8.0e14 Hz）", V1, V2)
p("2点の傾きから h J s（2けたに丸めた電圧で）", (round(V2, 2) - round(V1, 2)) * e / 2.0e14)
p("ケイ素の禁制帯 1.12 eV〔要〕で光る/感じる限界の波長 μm", hc_eVnm / 1.12 / 1000)
p("光子 500 nm の運動量 kg m/s", h / 500e-9)
p("太陽 1361 W/m2：光子の数（500 nm として）1/(m2 s)・放射圧 Pa（吸収）", 1361 / (h * c / 500e-9), 1361 / c)
for th in (90, 180):
    dl = lam_C * (1 - math.cos(math.radians(th)))
    p(f"コンプトン {th}°：Δλ pm・71.0 pm の X 線は pm", dl * 1e12, 71.0 + dl * 1e12)
Eg = 0.662
for th in (90, 180):
    Ep = Eg / (1 + Eg / meMeV * (1 - math.cos(math.radians(th))))
    p(f"0.662 MeV のγ線 {th}°：散乱γ MeV・電子 MeV", Ep, Eg - Ep)
for T in (300, 5772):
    x = h * 5.45e14 / (kB * T)
    p(f"550 nm のモード1つの平均エネルギー/kT（T={T}）", x / (math.exp(x) - 1))
p("σ=2π⁵k⁴/(15h³c²)", 2 * pi ** 5 * kB ** 4 / (15 * h ** 3 * c ** 2))
p("c2=hc/k・c1=2πhc²（熱-13 と同じか）", h * c / kB, 2 * pi * h * c ** 2)
p("ウィーンの定数を x=4.965 から hc/(xk)", h * c / (4.965114231744276 * kB))
p("人の体 310 K の山 μm", b_wien / 310 * 1e6)
fr = simpson(lambda L: planck_lam(L, 310), 8e-6, 14e-6, 600) / (sigmaSB * 310 ** 4)
p("310 K の放射のうち 8–14 μm の割合 %", fr * 100)

# =========================================================
print("\n== 原-3")


def lam_e(V, rel=True):
    pp = math.sqrt(2 * me * e * V * (1 + (e * V / (2 * me * c ** 2) if rel else 0)))
    return h / pp


for V in (54, 100, 50e3, 100e3, 200e3):
    p(f"電子 {V:g} V：λ 非相対論 pm・相対論 pm", lam_e(V, False) * 1e12, lam_e(V) * 1e12)
p("550 nm との比（100 kV）", 550e-9 / lam_e(100e3))
d_Ni = 0.215e-9   # 〔要〕
p("デビソン・ガーマー 54 eV：sinθ=λ/d・θ°", lam_e(54, False) / d_Ni, math.degrees(math.asin(lam_e(54, False) / d_Ni)))
p("野球 0.145 kg・40 m/s の λ m", h / (0.145 * 40))
En = 0.0253 * e
p("熱中性子 0.0253 eV：速さ m/s・λ nm", math.sqrt(2 * En / mn), h / math.sqrt(2 * mn * En) * 1e9)
p("二重スリット：50 kV 電子、d=1 μm〔仮〕・L=1 m〔仮〕のしま μm", 1.0 * lam_e(50e3) / 1e-6 * 1e6)
dx = 0.1e-9
dp = hbar / (2 * dx)
p("原子 0.1 nm に閉じこめた電子：Δp・Δv m/s・(Δp)²/2m eV", dp, dp / me, dp ** 2 / (2 * me) / e)
p("ちり 1 μg を 1 μm に：Δv m/s", hbar / (2 * 1e-6) / 1e-9)
tau_Na = 16.2e-9  # 〔要〕
p("寿命 16 ns の準位：自然幅 Δf MHz", 1 / (2 * pi * tau_Na) / 1e6)
p("ガウスの波束 σ=1 nm：Δk 1/m・Δx·Δk", 1 / (2 * 1e-9), 1e-9 * 1 / (2 * 1e-9))
alpha_ap = 10e-3
p("200 kV TEM：λ pm・0.61λ/α nm", lam_e(200e3) * 1e12, 0.61 * lam_e(200e3) / alpha_ap * 1e9)

# =========================================================
print("\n== 原-4")
Na_D = (588.9950, 589.5924)    # nm（空気中）NIST Handbook〔確〕
for L in Na_D + (670.791, 460.733, 766.490, 553.548, 521.820, 422.673):
    p(f"線 {L} nm のエネルギー eV", hc_eVnm / L)
RH = Rinf / (1 + me / mp)
p("R_H 1/m", RH)
n_air = 1.000277   # 〔要：空気の屈折率（可視域の目安）〕
for (n1, n2, name) in ((2, 3, 'Hα'), (2, 4, 'Hβ'), (2, 5, 'Hγ'), (2, 6, 'Hδ'), (1, 2, 'Lyα'), (3, 4, 'Paα')):
    lv = 1 / (RH * (1 / n1 ** 2 - 1 / n2 ** 2))
    p(f"{name}：真空 nm・空気中 nm", lv * 1e9, lv / n_air * 1e9)
p("ライマン系列の限界 nm・電離エネルギー eV", 1 / RH * 1e9, Ry_eV / (1 + me / mp))
p("ボーア半径 nm・1番目の軌道の速さ m/s・v/c", a0 * 1e9, alpha * c, alpha)
for n in (1, 2, 3):
    p(f"E_{n} eV・r_{n} nm", -Ry_eV / n ** 2, n ** 2 * a0 * 1e9)
RHe = Rinf / (1 + me / (4.001506179 * u))
lHe = 1 / (4 * RHe * (1 / 9 - 1 / 16))
p("He+（Z=2）基底 eV・4→3 の波長 nm（真空）", -4 * Ry_eV, lHe * 1e9)
for kV in (30, 100):
    p(f"X 線管 {kV} kV の最短波長 pm", hc_eVnm / (kV * 1e3) * 1e3)
for (Z, name) in ((29, 'Cu'), (42, 'Mo'), (74, 'W')):
    EK = Ry_eV * (Z - 1) ** 2 * (1 - 1 / 4)
    p(f"モーズリー {name} Kα keV・波長 pm", EK / 1e3, hc_eVnm / EK * 1e3)
p("He-Ne 632.8 nm〔要〕：光子 eV・1 mW の光子数 1/s", hc_eVnm / 632.8, 1e-3 / (h * c / 632.8e-9))
x = hc_eVnm / 632.8 / kT300
p("1.96 eV の2準位 300 K の上/下（熱-15 の式）", math.exp(-x))
p("熱-15 例題の 0.1 eV・300 K の上/下", math.exp(-0.1 / kT300))
for f, name in ((4.74e14, '632.8 nm'), (23.87e9, 'アンモニア 23.87 GHz〔要〕')):
    xx = h * f / (kB * 300)
    p(f"自然放出/誘導放出 = e^(hf/kT)−1（{name}, 300 K）", math.exp(xx) - 1)

# =========================================================
print("\n== 原-5")


def Ebox(n, L, m=me):
    return n ** 2 * h ** 2 / (8 * m * L ** 2) / e


L = 1e-9
p("箱 1 nm の電子 E1・E2・E3 eV", Ebox(1, L), Ebox(2, L), Ebox(3, L))
p("2→1 の光 eV・nm", Ebox(2, L) - Ebox(1, L), hc_eVnm / (Ebox(2, L) - Ebox(1, L)))
for n in (1, 2, 3):
    P = 1 / 3 - (math.sin(2 * n * pi * 2 / 3) - math.sin(2 * n * pi / 3)) / (2 * n * pi)
    p(f"n={n}：まん中の 1/3 にいる確率", P)
for n in (1, 2):
    x2 = L ** 2 * (1 / 3 - 1 / (2 * n ** 2 * pi ** 2))
    Dx = math.sqrt(x2 - (L / 2) ** 2); Dp = n * pi * hbar / L
    p(f"n={n}：Δx/L・Δx·Δp/ħ", Dx / L, Dx * Dp / hbar)
p("規格化の A=√(2/L) 1/√m（L=1 nm）", math.sqrt(2 / L))
p("GaAs 井戸 10 nm、m*=0.067 me〔要〕の E1 eV", Ebox(1, 10e-9, 0.067 * me))
p("ψ1+ψ2 の重ね合わせのゆれの周期 fs", h / ((Ebox(2, L) - Ebox(1, L)) * e) * 1e15)
p("0.6ψ1+0.8ψ2：⟨E⟩ eV", 0.36 * Ebox(1, L) + 0.64 * Ebox(2, L))
p("輪（1周 1 nm）の電子 E_n=n²h²/(2mL²) n=1 eV", h ** 2 / (2 * me * L ** 2) / e)
# 差分法：N 点の行列の固有値（7-8）
for N in (10, 50, 200):
    dxg = L / (N + 1)
    A = (np.diag(np.full(N, 2.0)) - np.diag(np.ones(N - 1), 1) - np.diag(np.ones(N - 1), -1)) * hbar ** 2 / (2 * me * dxg ** 2)
    w = np.sort(np.linalg.eigvalsh(A))[:3] / e
    p(f"差分 N={N}：E1・E2・E3 eV（正しい値 0.376・1.504・3.384）", *w)
p("1 g の玉・1 cm の箱・1 cm/s の量子数 n", (1e-3 * 0.01) * 2 * 0.01 / h)
p("弦 f3/f1 と 箱 E3/E1", 3, 9)

# =========================================================
print("\n== 原-6")


def kappa(U_minus_E_eV, m=me):
    return math.sqrt(2 * m * U_minus_E_eV * e) / hbar


k_ox = kappa(3.2)
for a in (2e-9, 5e-9, 8e-9):
    p(f"酸化膜 3.2 eV〔要〕・厚さ {a*1e9:.0f} nm：e^(−2κa)", math.exp(-2 * k_ox * a))
# 階段（E=2 eV、U=1 eV）
k1 = math.sqrt(2.0); k2 = math.sqrt(1.0)
p("階段 E=2 eV・U=1 eV の反射率（波-7 と同じ形）", ((k1 - k2) / (k1 + k2)) ** 2)


def T_barrier(E, U, a, m=me):
    if E < U:
        kk = kappa(U - E, m); k0 = math.sqrt(2 * m * E * e) / hbar
        return 1 / (1 + (U ** 2 * math.sinh(kk * a) ** 2) / (4 * E * (U - E)))
    return None


for a in (0.5e-9, 1.0e-9):
    p(f"壁 U=2 eV・E=1 eV・幅 {a*1e9} nm：正確な T・近似 e^(−2κa)", T_barrier(1.0, 2.0, a), math.exp(-2 * kappa(1.0) * a))
kS = kappa(4.5)
p("STM 仕事関数 4.5 eV〔要〕：κ 1/nm・0.1 nm で電流は何分の1", kS * 1e-9, 1 / math.exp(-2 * kS * 0.1e-9))


# 有限の深さの井戸：深さ 1 eV、幅 1 nm
def finite_well(U0, a, m=me):
    z0 = a / 2 * math.sqrt(2 * m * U0 * e) / hbar
    roots = []
    # 偶：z tan z = sqrt(z0²−z²)、奇：−z cot z = sqrt(z0²−z²)
    grid = np.linspace(1e-6, z0 - 1e-9, 20000)
    for kind in ('even', 'odd'):
        f = (lambda z: z * math.tan(z) - math.sqrt(z0 ** 2 - z ** 2)) if kind == 'even' else (lambda z: -z / math.tan(z) - math.sqrt(z0 ** 2 - z ** 2))
        vals = [f(z) for z in grid]
        for i in range(len(grid) - 1):
            if vals[i] * vals[i + 1] < 0 and abs(vals[i] - vals[i + 1]) < 50:
                zz = bisect(f, grid[i], grid[i + 1])
                roots.append((2 * zz / a * hbar) ** 2 / (2 * m) / e)
    return z0, sorted(roots)


z0, Es = finite_well(1.0, 1e-9)
p("有限井戸 1 eV・1 nm：z0・束縛状態のエネルギー eV（底から）", z0, *Es)
p("同じ幅の無限井戸 E1・E2 eV", Ebox(1, 1e-9), Ebox(2, 1e-9))
# 調和振動子：CO 2143 cm^-1〔要〕
nu_CO = 2143e2 * c
mu_CO = 12 * 15.99491462 / (12 + 15.99491462) * u
p("CO の振動：f Hz・ħω eV・零点 eV・ばね定数 N/m", nu_CO, h * nu_CO / e, h * nu_CO / e / 2, mu_CO * (2 * pi * nu_CO) ** 2)
thE = h * nu_CO / kB
xE = thE / 300
p("CO：θ_E K・300 K のアインシュタイン比熱 C/R", thE, xE ** 2 * math.exp(xE) / (math.exp(xE) - 1) ** 2)
p("CO の零点のゆれの幅 √(ħ/(μω)) pm", math.sqrt(hbar / (mu_CO * 2 * pi * nu_CO)) * 1e12)
p("HCl 2886 cm^-1〔要〕の波長 μm", 1 / 2886e2 * 1e6)
p("アンモニア 23.87 GHz〔要〕の分裂 eV", h * 23.87e9 / e)

# =========================================================
print("\n== 原-7")
for n in (1, 2, 3, 4):
    p(f"n={n} の席の数 2n²", 2 * n * n)
p("1s：r=a0 の内側にいる確率 1−5e^{−2}", 1 - 5 * math.exp(-2))
p("1s の ⟨r⟩=1.5a0 pm・いちばん多い r=a0 pm", 1.5 * a0 * 1e12, a0 * 1e12)
# 1s が H ψ = E ψ を満たすかを差分で確かめる（S6 の球のラプラシアン）
rr = np.linspace(0.2, 6, 2000) * a0
psi = np.exp(-rr / a0)
dr = rr[1] - rr[0]
lap = (np.gradient(rr ** 2 * np.gradient(psi, dr), dr)) / rr ** 2
Hpsi = -hbar ** 2 / (2 * me) * lap - kC * e ** 2 / rr * psi
p("差分の Hψ/ψ の平均 eV（−13.6 になるか）", float(np.mean((Hpsi / psi)[50:-50])) / e)
p("1 T のゼーマン分裂（電子 gμ_B B）eV・ESR 周波数 GHz", ge * muB_eV * 1, ge * muB_eV / (h / e) / 1e9)
p("1 T・300 K：上/下の数の比", math.exp(-ge * muB_eV / kT300))
for B in (1.5, 3.0):
    p(f"MRI {B} T の陽子の共鳴 MHz", gamma_p * B)
n_Cu = 8.96e3 / 63.546e-3 * NA   # 密度 8.96 g/cm3〔要〕
p("銅：1 原子 1 個の自由電子の数密度 1/m3（電-4 の 8.49e28）", n_Cu)
Zeff = 2 * math.sqrt(5.39 / Ry_eV)   # Li の電離エネルギー 5.39 eV〔要〕
p("Li の 2s：有効核電荷", Zeff)
n_Fe = 7.874e3 / 55.845e-3 * NA
M_Fe = 2.2 * n_Fe * 9.2740100657e-24   # 2.2 μB/原子〔要〕
p("鉄 2.2 μB/原子：M A/m・μ0M T", M_Fe, 4 * pi * 1e-7 * M_Fe)
p("H2 436 kJ/mol〔要〕→ eV", 436e3 / NA / e)
r_CO = 112.8e-12   # 〔要〕
I_CO = mu_CO * r_CO ** 2
Bc = hbar ** 2 / (2 * I_CO)
p("CO の回転：ħ²/(2I) eV・J=0→1 の周波数 GHz", Bc / e, 2 * Bc / h / 1e9)

# =========================================================
print("\n== 原-8")
p("NaCl d=0.282 nm〔要〕・Cu Kα 0.1541 nm〔要〕の θ°", math.degrees(math.asin(0.1541 / (2 * 0.282))))
mSi = 28.0855e-3 / NA
p("ケイ素：8 原子/立方体の密度 g/cm3・数密度 1/m3", 8 * mSi / aSi ** 3 / 1e3, 8 / aSi ** 3)
n = 8.49e28
EF = hbar ** 2 * (3 * pi ** 2 * n) ** (2 / 3) / (2 * me)
vF = hbar * (3 * pi ** 2 * n) ** (1 / 3) / me
p("銅 n=8.49e28：E_F eV・T_F K・v_F m/s", EF / e, EF / kB, vF)
for dE in (-0.1, -0.05, 0.05, 0.1):
    p(f"フェルミ分布 300 K：E−E_F={dE} eV の占有", 1 / (math.exp(dE / kT300) + 1))
p("電子の比熱 / (3/2 Nk)：(π²/3)(T/T_F)（300 K）", pi ** 2 / 3 * 300 / (EF / kB))
thD = 343.0   # 銅〔要〕
for T in (10, 20):
    p(f"デバイ T³：銅 {T} K の C J/(mol K)", 12 * pi ** 4 / 5 * 8.314462618 * (T / thD) ** 3)
a_l = 0.25e-9
p("1次元の結晶 a=0.25 nm：k=π/a の自由電子 eV", (hbar * pi / a_l) ** 2 / (2 * me) / e)
# クローニッヒ・ペニー（くし形）：cos(Ka)=cos(qa)+P sin(qa)/(qa)、P=3π/2、a=0.5 nm
Pk = 3 * pi / 2; ak = 0.5e-9
qa = np.linspace(1e-4, 4 * pi, 400000)
F = np.cos(qa) + Pk * np.sin(qa) / qa
allowed = np.abs(F) <= 1
Eq = (hbar * qa / ak) ** 2 / (2 * me) / e
edges = np.flatnonzero(np.diff(allowed.astype(int)))
bands = [(float(Eq[edges[i]]), float(Eq[edges[i + 1]])) for i in range(0, 6, 2)]
p("くし形の結晶（P=3π/2・a=0.5 nm）：許される帯 eV", *[f"{lo:.2f}〜{hi:.2f}" for lo, hi in bands])
p("すき間 eV（1つめ・2つめ）", bands[1][0] - bands[0][1], bands[2][0] - bands[1][1])
tau_Cu = 2.4e-14   # 電-4 例題13
p("平均自由行程 v_F τ nm", vF * tau_Cu * 1e9)
Lz = pi ** 2 * kB ** 2 / (3 * e ** 2)
p("ローレンツ数・銅 293 K の熱伝導率 W/(m K)（ρ=1.68e-8）", Lz, Lz * 293 / 1.68e-8)
p("BCS のすき間 1.76 k Tc（Nb-Ti 9.5 K〔要〕）meV", 1.76 * kB * 9.5 / e * 1e3)
p("ケイ素とガラス（9 eV〔要〕）の exp(−Eg/2kT)", math.exp(-1.12 / (2 * kT300)), math.exp(-9 / (2 * kT300)))

# =========================================================
print("\n== 原-9")
Nc, Nv, EgSi = 2.8e19, 1.04e19, 1.12   # cm^-3, eV〔要〕


def ni(T):
    kt = kB * T / e
    return math.sqrt(Nc * Nv * (T / 300) ** 3) * math.exp(-EgSi / (2 * kt))


p("ケイ素の真性キャリア n_i 300 K cm^-3", ni(300))
p("n_i(350 K)/n_i(300 K)", ni(350) / ni(300))
for Eg_, name in ((1.9, '赤 GaAsP'), (2.7, '青 InGaN'), (1.42, 'GaAs'), (3.4, 'GaN')):
    p(f"{name} {Eg_} eV〔要〕の波長 nm", hc_eVnm / Eg_)
ni_ref = 1.0e10
Nd = 1e16
p("P を 1e16 cm^-3：n・p cm^-3（n_i=1e10）", Nd, ni_ref ** 2 / Nd)
mu_n, mu_p = 1350, 480   # cm²/(V s)〔要〕
sig_n = e * Nd * mu_n
p("n 形 1e16：σ S/cm・ρ Ω cm", sig_n, 1 / sig_n)
p("真性：ρ Ω cm（n_i=1e10）", 1 / (e * ni_ref * (mu_n + mu_p)))
p("E_c−E_F eV（n=1e16）", kT300 * math.log(Nc / Nd))
D_n = mu_n * kT300
p("D=μkT/e cm²/s・τ=1 μs の拡散長 μm", D_n, math.sqrt(D_n * 1e-6) * 1e4)
Na_ = 1e16; epsSi = 11.7 * eps0   # 〔要〕
Vbi = kT300 * math.log(Na_ * Nd / ni_ref ** 2)
Wd = math.sqrt(2 * epsSi * Vbi * (1 / (Na_ * 1e6) + 1 / (Nd * 1e6)) / e)
p("pn 1e16/1e16：V_bi V・空乏層 μm・最大電場 V/cm", Vbi, Wd * 1e6, 2 * Vbi / Wd / 100)
Is = 1e-14
p("I_s=1e-14 A：1 mA の電圧 V・10倍で増える電圧 mV", kT300 * math.log(1e-3 / Is), kT300 * math.log(10) * 1e3)
p("±0.5 V の電流の比", (math.exp(0.5 / kT300) - 1) / 1)
JL, J0, A_cell = 35e-3, 1e-12, 100   # A/cm², A/cm², cm²〔仮〕
IL, I0 = JL * A_cell, J0 * A_cell
Voc = kT300 * math.log(IL / I0 + 1)
Vg = np.linspace(0, Voc, 200001)
Pg = Vg * (IL - I0 * (np.exp(Vg / kT300) - 1))
im = int(np.argmax(Pg))
p("太陽電池 100 cm²：I_L A・V_oc V・最大電力 W・その電圧 V・FF・効率 %（1000 W/m²）",
  IL, Voc, Pg[im], Vg[im], Pg[im] / (Voc * IL), Pg[im] / (1000 * A_cell * 1e-4) * 100)
p("LED 2 V を光らせる光電池（1個 0.6 V〔仮〕）の個数", math.ceil(2 / 0.6))
p("フォトダイオード 850 nm・量子効率 0.8：A/W", 0.8 * e * 850e-9 / (h * c))
p("カルノーの COP（5 ℃と 35 ℃）", 278.15 / 30)
p("サーミスターの B ≒ Eg/(2k) K（ケイ素なら）", EgSi * e / (2 * kB))

# =========================================================
print("\n== 原-10")
Ntr, act, Cg, Vdd, fclk = 1e10, 0.01, 0.05e-15, 0.7, 3e9   # 〔仮〕
p("チップの消費電力 αNCV²f W・1回の切りかえ J", act * Ntr * Cg * Vdd ** 2 * fclk, Cg * Vdd ** 2)
VT = kT300
IC = 1e-3; RC = 4.7e3
p("エミッタ接地：g_m S・増幅度", IC / VT, -IC / VT * RC)
k_n = 200e-6; WL = 10; Vt = 0.5
ID = 0.5 * k_n * WL * (1.0 - Vt) ** 2
p("MOSFET V_GS=1.0 V：I_D mA・g_m mA/V", ID * 1e3, k_n * WL * (1.0 - Vt) * 1e3)
p("スイッチのオン抵抗 V_GS=1.8 V Ω", 1 / (k_n * WL * (1.8 - Vt)))
p("反転増幅 10 kΩ・100 kΩ：倍率・0.1 V 入力の出力 V", -100 / 10, -100 / 10 * 0.1)
p("非反転：倍率", 1 + 100 / 10)
p("ひずみゲージ 1.25 mV を 1000 倍 V", 1.25e-3 * 1000)
p("RC 1 kΩ・1 fF：τ ps・10段の遅れ ps", 1e3 * 1e-15 * 1e12, 10 * 0.69 * 1e3 * 1e-15 * 1e12)
Ron, Iload = 10e-3, 50
Vbus, tsw, fsw = 300, 100e-9, 10e3
Pc = Ron * Iload ** 2; Psw = 0.5 * Vbus * Iload * tsw * 2 * fsw
p("パワー MOSFET：導通損 W・スイッチング損 W・15 kW に対する割合 %", Pc, Psw, (Pc + Psw) / 15e3 * 100)
p("12 ビット・3.3 V の 1 目もり mV", 3.3 / 4096 * 1e3)
# ダイオード＋抵抗をニュートン法で（回路シミュレーター）
E_, R_, Is_ = 5.0, 1e3, 1e-14
for V0 in (0.7, 0.6):
    Vd = V0; hist = []
    for it in range(1, 7):
        f = Is_ * (math.exp(Vd / VT) - 1) - (E_ - Vd) / R_
        df = Is_ / VT * math.exp(Vd / VT) + 1 / R_
        Vd -= f / df
        hist.append(f"{Vd:.4f}")
    p(f"ニュートン法 はじめ {V0} V：1〜6 回めの V_D V", *hist)
Vd = bisect(lambda V: Is_ * (math.exp(V / VT) - 1) - (E_ - V) / R_, 0.3, 1.0)
p("答え V_D V・電流 mA", Vd, (E_ - Vd) / R_ * 1e3)

# =========================================================
print("\n== 原-11")
Q_pp = (4 * M['H1'] - M['He4']) * uMeV
p("4 H → He-4：質量の差 u・エネルギー MeV・割合 %", 4 * M['H1'] - M['He4'], Q_pp, (4 * M['H1'] - M['He4']) / (4 * M['H1']) * 100)
Lsun = 3.828e26   # IAU 2015 B3〔確〕
p("太陽：1秒に減る質量 kg・1秒に使う水素 kg", Lsun / c ** 2, Lsun / (Q_pp * 1e6 * e) * 4 * M['H1'] * u)
tau_mu = 2.197e-6   # 〔要〕
gam = 1 / math.sqrt(1 - 0.995 ** 2)
p("ミューオン v=0.995c：γ・寿命 μs・進む距離 km（遅れなし/あり）", gam, gam * tau_mu * 1e6, 0.995 * c * tau_mu / 1e3, 0.995 * c * gam * tau_mu / 1e3)
GM = 3.986004418e14; RE = 6.371e6; rG = 26560e3   # 〔要〕
vG = math.sqrt(GM / rG)
p("GPS：速さ m/s・速さの遅れ μs/日・高さの進み μs/日・合計", vG, -0.5 * vG ** 2 / c ** 2 * 86400e6, GM / c ** 2 * (1 / RE - 1 / rG) * 86400e6,
  -0.5 * vG ** 2 / c ** 2 * 86400e6 + GM / c ** 2 * (1 / RE - 1 / rG) * 86400e6)
p("速度の合成 0.6c+0.6c", (0.6 + 0.6) / (1 + 0.36))
for kV in (1, 100):
    Kk = kV * 1e3 * e; gg = 1 + Kk / (me * c ** 2)
    p(f"電子 {kV} kV：γ・v/c", gg, math.sqrt(1 - 1 / gg ** 2))
Kmev = 1.0
p("運動エネルギー 1 MeV の電子：pc MeV", math.sqrt((Kmev + meMeV) ** 2 - meMeV ** 2))
b = 0.1
p("光のドップラー（遠ざかる 0.1c）f'/f・音の式 1/(1+β)・1−β", math.sqrt((1 - b) / (1 + b)), 1 / (1 + b), 1 - b)
for name, Z, N_, m in (('He4', 2, 2, M['He4']), ('C12', 6, 6, M['C12']), ('O16', 8, 8, M['O16']), ('Fe56', 26, 30, M['Fe56']),
                       ('Ni62', 28, 34, M['Ni62']), ('U235', 92, 143, M['U235']), ('U238', 92, 146, M['U238'])):
    B = B_nuc(Z, N_, m)
    p(f"{name}：結合エネルギー MeV・1核子あたり MeV", B, B / (Z + N_))
p("H2 の結合 MeV（重水素）", B_nuc(1, 1, M['H2']))
p("陽子どうし 1 fm のクーロン力 N（電-1 と同じ 8.99e9 で）", 8.99e9 * (1.60e-19) ** 2 / (1e-15) ** 2)
p("湯川：ħc/(m_π c²) fm（m_π=139.57 MeV〔要〕）", MeVfm / 139.57)
aV, aS, aC, aA, aP = 15.8, 18.3, 0.714, 23.2, 12.0   # MeV〔要〕


def semf(A, Z):
    N_ = A - Z
    d = aP / math.sqrt(A) if (Z % 2 == 0 and N_ % 2 == 0) else (-aP / math.sqrt(A) if (Z % 2 and N_ % 2) else 0)
    return aV * A - aS * A ** (2 / 3) - aC * Z * (Z - 1) / A ** (1 / 3) - aA * (A - 2 * Z) ** 2 / A + d


for A_, Z_ in ((56, 26), (238, 92)):
    p(f"半経験式 A={A_}：B MeV・1核子あたり", semf(A_, Z_), semf(A_, Z_) / A_)
p("D+T→He4+n の Q MeV", (M['H2'] + M['H3'] - M['He4'] - M['n']) * uMeV)
p("U235+n→Ba141+Kr92+3n の Q MeV", (M['U235'] + M['n'] - M['Ba141'] - M['Kr92'] - 3 * M['n']) * uMeV)
Ag = 197.0; R = 1.2 * Ag ** (1 / 3)
p("原子核の密度 kg/m3（r0=1.2 fm）", Ag * u / (4 / 3 * pi * (1.2e-15) ** 3 * Ag))
th = 90
dl = h / (me * c) * (1 - math.cos(math.radians(th)))
p("コンプトンの式を運動量・エネルギー保存から（90°）pm", dl * 1e12)

# =========================================================
print("\n== 原-12")
T14 = 5730.0   # 数学 6-4 と同じ（いまの評価値は 5700 年〔要〕）
p("C-14：τ 年・25% の年・60% の年", T14 / math.log(2), 2 * T14, T14 * math.log2(1 / 0.6))
p("C-14（5700 年なら）60% の年", 5700 * math.log2(1 / 0.6))
Q_a = (M['Ra226'] - M['Rn222'] - M['He4']) * uMeV
p("Ra226→Rn222+α：Q MeV・α の運動エネルギー MeV", Q_a, Q_a * 222.0 / 226.0)
T_Ra = 1600 * year   # 〔要〕
N_Ra = 1 / 226.025 * NA
p("Ra-226 1 g の放射能 Bq（1 Ci=3.7e10）", math.log(2) / T_Ra * N_Ra)
mK = 120.0   # 体の K 120 g〔仮：体重 60 kg×2 g/kg〕
N40 = mK * ab_K40 / 39.964 * NA
T_K40 = 1.25e9 * year   # 〔要：環境省は約13億年〕
p("体の K-40：原子の数・放射能 Bq（1.25e9 年）・（13億年）", N40, math.log(2) / T_K40 * N40, math.log(2) / (1.3e9 * year) * N40)
p("I-131 8 日：80 日で残る割合", 0.5 ** 10)
p("Tc-99m 6 h：24 h・3 h で残る %", 0.5 ** 4 * 100, 0.5 ** 0.5 * 100)
t1, t2 = 2.0, 1.0
tmax = t1 * t2 / (t1 - t2) * math.log(t1 / t2)
N2max = 1000 * t2 / (t1 - t2) * (math.exp(-tmax / t1) - math.exp(-tmax / t2))
p("数学 6-14 の親と子：子が最大の時刻 h・子の最大", tmax, N2max)
T_Rn = 3.82
p("永続平衡：ラドンが 99% にそろう日数", T_Rn * math.log2(100))
T_Mo, T_Tc = 66.0, 6.0   # h〔要〕
lM, lT = math.log(2) / T_Mo, math.log(2) / T_Tc
p("Mo-99/Tc-99m：Tc がいちばん多い時刻 h", math.log(lT / lM) / (lT - lM))
p("数学 6-4：λ=0.3/s・10 s：平均・0回の確率", 3.0, math.exp(-3))
gross, bkg = 1200, 900
p("正味の計数 cpm・ばらつき cpm（10 分ずつ）", (gross - bkg) / 10, math.sqrt(gross + bkg) / 10)
T238, T235 = 4.468e9, 7.04e8   # 年〔要〕
p("U-238：45億年で残る割合（46億年）", 0.5 ** (4.6e9 / T238))
R_now = ab_U235 / ab_U238
for tago in (2.0e9, 4.6e9):
    R_then = R_now * math.exp(tago * (math.log(2) / T235 - math.log(2) / T238))
    p(f"{tago/1e9:.1f} 億年×10 前の U-235 の割合 %", R_then / (1 + R_then) * 100)
# ガイガー・ヌッタル：トンネルの因子の比（Po-212 8.95 MeV と U-238 4.27 MeV）〔要：Q 値〕


def gamow(Q, Zd, Ad):
    mu_r = 4.0 * Ad / (4.0 + Ad) * uMeV   # 換算質量 MeV
    v_c = math.sqrt(2 * Q / mu_r)
    return 2 * pi * 2 * Zd * alpha / v_c


G1, G2 = gamow(8.954, 82, 208), gamow(4.270, 90, 234)   # Q 値〔要〕
p("ガモフ因子 2πη：Po-212→Pb-208・U-238→Th-234・e^{-2πη} の比の桁 log10", G1, G2, (G2 - G1) / math.log(10))
p("半減期の比の桁 log10（Po-212 0.30 μs・U-238 44.68 億年〔要〕）", math.log10(4.468e9 * year / 0.30e-6))
p("中性子の寿命 UCNτ 877.75 s〔確〕と ビーム法 約888 s〔要〕の差 s", 888 - 877.75)

# =========================================================
print("\n== 原-13")
mu = {  # μ/ρ cm²/g（NIST〔確〕）と密度 g/cm³〔確〕
    'bone60': (0.3148, 1.92), 'tissue60': (0.2048, 1.06), 'Pb662': (0.1111, 11.35), 'Fe662': (0.07345, 7.874),
    'water662': (0.08567, 1.0), 'conc1250': (0.05807, 2.30), 'Pb100': (5.549, 11.35), 'water100': (0.1707, 1.0),
    'Pb1250': (0.05876, 11.35), 'conc662': (0.07876, 2.30)}
mb = mu['bone60'][0] * mu['bone60'][1]; mt = mu['tissue60'][0] * mu['tissue60'][1]
p("60 keV：骨 μ 1/cm・筋（軟組織）μ 1/cm・2 cm の透過 骨・軟組織", mb, mt, math.exp(-mb * 2), math.exp(-mt * 2))
for key in ('Pb662', 'Fe662', 'water662', 'conc662', 'Pb1250', 'conc1250'):
    m_ = mu[key][0] * mu[key][1]
    p(f"{key}：μ 1/cm・半価層 cm・1/10 価層 cm", m_, math.log(2) / m_, math.log(10) / m_)
p("コンクリート 1.25 MeV で 1/1000 cm（ビルドアップ無視）", math.log(1000) / (mu['conc1250'][0] * mu['conc1250'][1]))
p("100 keV：鉛と水の μ の比（同じ厚さ）", mu['Pb100'][0] * 11.35 / (mu['water100'][0] * 1.0))
p("電子対生成のしきい MeV・消滅の光子 MeV", 2 * meMeV, meMeV)
p("α 5.3 MeV の空気中の飛程 cm（ガイガーの経験式 0.318E^1.5〔要〕）", 0.318 * 5.3 ** 1.5)
Eb = 2.28
Rkp = 0.412 * Eb ** (1.265 - 0.0954 * math.log(Eb))   # g/cm²（カッツ・ペンフォールドの式〔要〕）
p("β 2.28 MeV：飛程 g/cm²・アルミ mm", Rkp, Rkp / 2.699 * 10)
p("同じ速さの陽子と α のエネルギー損失の比（z²）", 4)
for E_p in (70, 150, 230):
    p(f"陽子 {E_p} MeV の水の中の飛程 cm（ブラッグ・クリーマン 0.0022E^1.77〔要〕）", 0.0022 * E_p ** 1.77)
for A_, name in ((1, 'H'), (2, 'D'), (12, 'C'), (238, 'U')):
    al = ((A_ - 1) / (A_ + 1)) ** 2
    xi = 1 if A_ == 1 else 1 + al / (1 - al) * math.log(al)
    p(f"中性子 {name}：正面衝突で残る割合 α・ξ・2 MeV→0.025 eV の衝突回数", al, xi, math.log(2e6 / 0.025) / xi)
Nw = 1.0 / 18.015 * NA
Sa = Nw * 2 * 0.332e-24   # 〔要：H の熱中性子吸収 0.332 b〕
p("水の熱中性子：Σ_a 1/cm・吸収までの平均距離 cm", Sa, 1 / Sa)
N59 = 1.0 / 58.933 * NA; s59 = 37.2e-24; phi = 1e13; T60 = 5.271 * year   # 〔要〕
lam60 = math.log(2) / T60
for ty in (1, 5.271, 20):
    p(f"Co-59 1 g・σ=37 b・φ=1e13：{ty} 年照射の Co-60 Bq", N59 * s59 * phi * (1 - math.exp(-lam60 * ty * year)))
p("飽和放射能 Bq", N59 * s59 * phi)
m_w = mu['water662'][0] * 1.0
p("密度計：0.662 MeV・内径 10 cm の管：空/水の透過・比", 1.0, math.exp(-m_w * 10), 1 / math.exp(-m_w * 10))

# =========================================================
print("\n== 原-14")
m_meas = 30000 / 60; tau_d = 100e-6
p("GM 計数管：数え落とし補正 cps", m_meas / (1 - m_meas * tau_d))
p("全身 60 kg に 1 Gy：エネルギー J・温度上昇 K（水の比熱 4.18e3）", 60 * 1, 1 / 4.18e3)
p("α 1 mGy の等価線量 mSv", 1 * 20)
p("甲状腺 10 mSv・組織加重係数 0.04〔要〕の実効線量 mSv", 10 * 0.04)
Gam = 0.0927   # μSv m²/(MBq h)〔要：Cs-137 の空気カーマ率定数の目安〕
for rr in (0.5, 1, 2):
    p(f"Cs-137 1 MBq・{rr} m：μSv/h", Gam / rr ** 2)
mPb = mu['Pb662'][0] * 11.35
p("37 MBq・2 m・30 分・鉛 1 cm：μSv（ビルドアップ無視）", 37 * Gam / 2 ** 2 * 0.5 * math.exp(-mPb * 1))
p("自然放射線 2.1 mSv/年〔確〕：平均 μSv/h", 2.1e3 / (365.25 * 24))
p("100 Bq/kg の食品 1 kg（Cs-137・1.3e-5 mSv/Bq〔要〕）μSv", 100 * 1.3e-5 * 1e3)
p("トリチウム 1500 Bq/L〔仮〕を1日2 L・1年（1.8e-5 μSv/Bq〔確〕）mSv", 1500 * 2 * 365 * 1.8e-5 * 1e-3)
tb = 10; Bcpm = 30
sB = math.sqrt(Bcpm * tb) / tb
p("バックグラウンド 30 cpm・10 分：σ cpm・3σ cpm（環境省の 3σ 法）", sB, 3 * sB)
for d_, a_ in ((10, 2), (5, 2)):
    p(f"検出器 半径 {a_} cm・{d_} cm：立体角/4π", 0.5 * (1 - d_ / math.sqrt(d_ ** 2 + a_ ** 2)))
p("20 mSv/年 を 10 μSv/h の場所で：時間 h", 20e3 / 10)
p("LNT：100 mSv で 0.5 %〔確〕：1000 人あたり", 1000 * 0.005)
p("1 Gy を 1 秒で：放射線のエネルギーと体温の差（1 Gy は 60 J）", 60)

# =========================================================
print("\n== 原-15")
Ef = 200e6 * e
p("U-235 1 g が全部分裂：J・MW·日", 1 / 235.044 * NA * Ef, 1 / 235.044 * NA * Ef / (1e6 * 86400))
Pth = 3e9
nf = Pth * 86400 / Ef
p("熱出力 3 GW：1日の分裂の数・U-235 g/日・年 kg", nf, nf * 235.044 / NA, nf * 235.044 / NA * 365 / 1e3)
nu, sf5, sc5, sc8 = 2.43, 585.0, 99.0, 2.68   # 〔要〕
for enr in (ab_U235, 0.03, 0.05):
    N5, N8 = enr, 1 - enr
    eta = nu * N5 * sf5 / (N5 * (sf5 + sc5) + N8 * sc8)
    p(f"濃縮度 {enr*100:.2f} %：η", eta)
eta3 = nu * 0.03 * sf5 / (0.03 * (sf5 + sc5) + 0.97 * sc8)
eps_, pp, ff = 1.03, 0.75, 0.90   # 〔仮〕
p("4因子 k∞ = ηεpf（3 %）", eta3 * eps_ * pp * ff)
Rp = 0.03 / 0.97; Rf = ab_U235 / ab_U238
p("熱-14 の 1.0043 倍で 0.72 % → 3 %：段の数（理想）", math.log(Rp / Rf) / math.log(1.0043))
kinf, M2 = 1.10, 60.0   # 〔仮〕
Bg = math.sqrt((kinf - 1) / M2)
p("1群：B 1/cm・平板の厚さ cm・球の半径 cm・立方体の1辺 cm", Bg, pi / Bg, pi / Bg, math.sqrt(3) * pi / Bg)
for k_ in (1.001, 1.003):
    rho = (k_ - 1) / k_
    p(f"k={k_}：ρ・ドル・即発だけの周期 s（ℓ=1e-4 s）・遅発中性子1群の周期 s（λ=0.08/s）",
      rho, rho / 0.0065, 1e-4 / (k_ - 1), (0.0065 - rho) / (0.08 * rho) if rho < 0.0065 else float('nan'))
p("温度係数 −3 pcm/K〔仮〕で 300 K 上がる：Δk", -3e-5 * 300)
lI, lX = math.log(2) / 6.57, math.log(2) / 9.14   # 1/h〔要〕
# 運転中のつり合い：I_eq = γI Σf φ/λI、X_eq = (γI+γX) Σf φ/(λX+σX φ)。γI=0.0639・γX=0.0024・σX=2.6e6 b・φ=3e13 /(cm² s)〔要〕
gI, gX, sX, phi_ = 0.0639, 0.0024, 2.6e6 * 1e-24, 3e13
sxphi = sX * phi_ * 3600   # 1/h
I0_ = gI / lI; X0_ = (gI + gX) / (lX + sxphi)
p("運転中の I/X の原子の数の比", I0_ / X0_)
I0_, X0_ = I0_ / X0_, 1.0
tg = np.linspace(0, 60, 60001)
Xt = X0_ * np.exp(-lX * tg) + I0_ * lI / (lX - lI) * (np.exp(-lI * tg) - np.exp(-lX * tg))
p("キセノンの山：停止後の時刻 h・山の高さ（運転中=1）〔要：収率・断面積・中性子束〕", tg[int(np.argmax(Xt))], Xt.max())


def ww(t, Top=365 * 86400):
    return 0.066 * (t ** -0.2 - (t + Top) ** -0.2)


for t, name in ((1, '1 s'), (10, '10 s'), (3600, '1 h'), (86400, '1 日'), (30 * 86400, '30 日'), (365 * 86400, '1 年')):
    p(f"崩壊熱（ウェイ・ウィグナー〔要〕）{name}：割合 %・3 GW で MW", ww(t) * 100, ww(t) * 3e3)
p("ITER：50 MW → 500 MW の Q", 500 / 50)
p("D-T 1 回 17.6 MeV：1 g の D-T（質量 5 u の組）が全部反応 J", 1 / 5.03 * NA * 17.59e6 * e)
# 1点炉の動特性を RK4 で（遅発中性子1群、ρ=0.001 の階段）
beta, lam_d, Lam = 0.0065, 0.08, 1e-4
rho = 0.001


def f_pk(y):
    n_, C_ = y
    return np.array([(rho - beta) / Lam * n_ + lam_d * C_, beta / Lam * n_ - lam_d * C_])


y = np.array([1.0, beta / (Lam * lam_d)]); dt = 1e-4; t = 0
out = {}
while t < 60 + 1e-9:
    for tm in (1, 10, 60):
        if abs(t - tm) < dt / 2: out[tm] = y[0]
    k1 = f_pk(y); k2 = f_pk(y + dt / 2 * k1); k3 = f_pk(y + dt / 2 * k2); k4 = f_pk(y + dt * k3)
    y = y + dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4); t += dt
p("1点炉 ρ=0.001：1 s・10 s・60 s の出力（はじめ1）", out.get(1), out.get(10), out.get(60))
p("即発跳躍 β/(β−ρ)", beta / (beta - rho))

# =========================================================
print("\n== 原-16")
for t, name in ((365 * 86400, '1 年'), (10 * 365 * 86400, '10 年')):
    p(f"崩壊熱 {name}：割合 %（ウェイ・ウィグナー、運転 3 年〔仮〕）", ww(t, 3 * 365 * 86400) * 100)
p("Cs-137・Sr-90（約30年）が 1/1000 になる年", 30.0 * math.log2(1000))
p("Pu-239（24100 年〔要〕）が 1/1000 になる年", 24100 * math.log2(1000))
p("I-131（8日）が 1/1000 になる日", 8 * math.log2(1000))
