#!/usr/bin/env python3
"""物理第5巻 原-7（電子の席の決まり：原子と周期表）の数値の検算（組 原W4）。
python3 calc_p5_07.py > calc_p5_07_out.txt
定数は CODATA 2022（NIST）、電離エネルギーは NIST ASD、分子の定数は NIST Chemistry WebBook、密度は NIST（X 線の表の表1）。
"""
import math
import numpy as np

# CODATA 2022
h = 6.62607015e-34
hbar = 1.054571817e-34
e = 1.602176634e-19
c = 299792458.0
kB = 1.380649e-23
NA = 6.02214076e23
me = 9.1093837139e-31
eps0 = 8.8541878188e-12
a0 = 5.29177210544e-11
Ry = 13.605693122990          # eV
muB = 9.2740100657e-24        # J/T
muB_eV = 5.7883817982e-5      # eV/T
ge = 2.00231930436092         # 電子の g 因子の大きさ（CODATA 2022）
gp_MHz = 42.577478461         # 陽子の磁気回転比/2π MHz/T
u = 1.66053906892e-27
mu0 = 1.25663706127e-6
kC = 1 / (4 * math.pi * eps0)
kT300 = kB * 300 / e
pi = math.pi


def p(label, *v):
    out = []
    for x in v:
        if isinstance(x, float):
            out.append(f"{x:.6g}")
        else:
            out.append(str(x))
    print(f"{label}: " + "  ".join(out))


print("== 定数の丸め")
p("ke^2/(2a0) eV", kC * e ** 2 / (2 * a0) / e)
p("ke^2/a0 eV（=2Ry）", kC * e ** 2 / a0 / e)
p("a0 pm", a0 * 1e12)
p("kT 300K eV", kT300)
p("ħ²/(m a0²) eV（=2Ry）", hbar ** 2 / (me * a0 ** 2) / e)

print("\n== ③ 水素の準位（ボーアと同じ）")
for n in range(1, 6):
    p(f"E_{n} eV", -Ry / n ** 2, f"r_n=n^2 a0 = {n*n*a0*1e12:.1f} pm")
p("2→1 の光 eV・nm", Ry * (1 - 1 / 4), 1239.84198 / (Ry * 0.75))
p("3→2 の光 nm", 1239.84198 / (Ry * (1 / 4 - 1 / 9)))

print("\n== 1s の確率（例題2・3）")
P_in = 1 - 5 * math.exp(-2)
p("r<a0 の確率 1-5e^-2", P_in)
for k in (2, 3, 4, 5):
    x = 2 * k
    p(f"r<{k}a0 の確率", 1 - math.exp(-x) * (1 + x + x * x / 2))
p("⟨r⟩=1.5a0 pm・最も多い a0 pm", 1.5 * a0 * 1e12, a0 * 1e12)
# 動径分布 P(r)=4 r^2/a0^3 e^{-2r/a0} の最大値（a0 単位）
r = np.linspace(0, 8, 80001)
P = 4 * r ** 2 * np.exp(-2 * r)
p("動径分布の最大の r/a0・値（1/a0）", float(r[np.argmax(P)]), float(P.max()))
p("動径分布の数値積分（=1 になるか）", float(np.trapezoid(P, r)))
p("⟨r⟩ 数値（a0 単位）", float(np.trapezoid(r * P, r)))
# 1s の |ψ|^2 の中心の値と r=a0 の値の比
p("|ψ|^2 の比 r=a0 / r=0", math.exp(-2))
# 2s の動径分布 r^2 (2-r)^2 e^{-r} /8 の山の位置
rL = np.linspace(0, 60, 600001)
P2s = rL ** 2 * (2 - rL) ** 2 * np.exp(-rL) / 8
P2p = rL ** 4 * np.exp(-rL) / 24
p("2s 動径分布 規格化", float(np.trapezoid(P2s, rL)), "2p", float(np.trapezoid(P2p, rL)))
p("2s のいちばん高い山 r/a0", float(rL[np.argmax(P2s)]), "2p の山 r/a0", float(rL[np.argmax(P2p)]))
p("2s の ⟨r⟩/a0", float(np.trapezoid(rL * P2s, rL)), "2p", float(np.trapezoid(rL * P2p, rL)))
p("2s の節 r/a0", 2.0)

print("\n== ⑩ 1s を代入して確かめる（例題4）")
# ψ=e^{-r/a}：∇²ψ = (1/r²) d/dr (r² dψ/dr) = (1/a² - 2/(a r)) ψ
# Hψ = -ħ²/(2m)(1/a² - 2/(a r))ψ - ke²/r ψ
# 1/r の項が消える条件：ħ²/(m a) = ke² → a = ħ²/(m k e²)
a_calc = hbar ** 2 / (me * kC * e ** 2)
p("a=ħ²/(mke²) pm", a_calc * 1e12)
E1 = -hbar ** 2 / (2 * me * a_calc ** 2) / e
p("E=-ħ²/(2ma²) eV", E1)
# 差分で確かめる（a0 で長さをはかる）
rr = np.linspace(0.05, 10, 20001) * a0
psi = np.exp(-rr / a0)
dr = rr[1] - rr[0]
lap = np.gradient(rr ** 2 * np.gradient(psi, dr), dr) / rr ** 2
Hpsi = -hbar ** 2 / (2 * me) * lap - kC * e ** 2 / rr * psi
ratio = (Hpsi / psi)[200:-200] / e
p("差分の Hψ/ψ（eV）の最小・最大", float(ratio.min()), float(ratio.max()))
# He+（Z=2）
p("He+ の 1s：a/Z pm・E=-Z²Ry eV", a0 / 2 * 1e12, -4 * Ry)
# 練習：e^{-r/b} で b=2a0 を入れると 1/r の項が残る
b = 2 * a0
coef_1r = (hbar ** 2 / (me * b) - kC * e ** 2) / e   # J·m を eV·m
p("b=2a0 のとき 1/r の係数 ħ²/(mb)-ke² （eV·pm）", coef_1r * 1e12)

print("\n== ④ 席の数")
for n in range(1, 5):
    seats = sum(2 * (2 * l + 1) for l in range(n))
    p(f"n={n}", "l=", list(range(n)), "2(2l+1)=", [2 * (2 * l + 1) for l in range(n)], "計", seats, "2n²", 2 * n * n)
p("周期の長さ", [2, 8, 8, 18, 18, 32, 32])
p("貴ガスの原子番号", [2, 10, 18, 36, 54, 86, 118])
import itertools
print("累積", list(itertools.accumulate([2, 8, 8, 18, 18, 32, 32])))

print("\n== 電離エネルギー（NIST ASD）と有効核電荷（例題1・5）")
IE = {1: 13.598434599702, 2: 24.587389011, 3: 5.391714996, 4: 9.322699, 5: 8.298019, 6: 11.2602880,
      7: 14.53413, 8: 13.618055, 9: 17.42282, 10: 21.564541, 11: 5.13907696, 12: 7.646236, 13: 5.985769,
      14: 8.15168, 15: 10.486686, 16: 10.3600167, 17: 12.967633, 18: 15.7596119, 19: 4.34066373,
      20: 6.1131549210, 21: 6.56149, 22: 6.828120, 23: 6.746187, 24: 6.76651, 25: 7.4340380,
      26: 7.9024681, 27: 7.88101, 28: 7.639878, 29: 7.726380, 30: 9.394197, 31: 5.9993020,
      32: 7.899435, 33: 9.78855, 34: 9.752368, 35: 11.81381, 36: 13.9996055, 37: 4.1771281,
      38: 5.69486745, 39: 6.21726, 40: 6.634126, 41: 6.75885, 42: 7.09243, 43: 7.11938, 44: 7.36050,
      45: 7.45890, 46: 8.336839, 47: 7.576234, 48: 8.993820, 49: 5.7863558, 50: 7.343918,
      51: 8.608389, 52: 9.009808, 53: 10.451236, 54: 12.1298437}
for Z, n in ((2, 1), (3, 2), (10, 2), (11, 3), (18, 3), (19, 4)):
    Zeff = n * math.sqrt(IE[Z] / Ry)
    p(f"Z={Z}（n={n}）IE={IE[Z]:.2f} eV・水素の式で Z² Ry/n² = {Z*Z*Ry/n/n:.0f} eV・Zeff", Zeff)
p("Ne と Na の比", IE[10] / IE[11])
p("Ne の IE / kT(300K)", IE[10] / kT300, "Na", IE[11] / kT300)
p("Na と Cl：Na の IE 5.14・Cl の電子親和力 3.61（〔要確認〕）の差", IE[11] - 3.6127)
# 図用の点（Z, IE）
print("図の点:", " ".join(f"({Z},{IE[Z]:.2f})" for Z in sorted(IE)))

print("\n== ⑥ スピン・ESR・NMR（例題6・7）")
dE1 = ge * muB_eV * 1.0
p("1 T の ESR：ΔE eV・f GHz", dE1, dE1 * e / h / 1e9)
p("300 K の上/下", math.exp(-dE1 / kT300))
p("差の割合 (下-上)/(下+上)", (1 - math.exp(-dE1 / kT300)) / (1 + math.exp(-dE1 / kT300)))
for B in (0.35, 1.5, 3.0):
    p(f"B={B} T：ESR GHz・NMR(陽子) MHz", ge * muB_eV * B * e / h / 1e9, gp_MHz * B)
p("陽子 1.5 T ΔE eV", h * gp_MHz * 1e6 * 1.5 / e)
dEp15 = h * gp_MHz * 1e6 * 1.5 / e
p("陽子 1.5 T・310 K の (下-上)/(下+上)", math.tanh(dEp15 / (2 * kB * 310 / e)))
p("陽子 3 T・310 K の (下-上)/(下+上)", math.tanh(h * gp_MHz * 1e6 * 3 / e / (2 * kB * 310 / e)))
# 熱-15 の形（0.1 eV・300 K で 0.021）
p("熱-15：0.1 eV・300 K", math.exp(-0.1 / kT300))
p("μB を出す ħe/(2m)", hbar * e / (2 * me), "μB/h GHz/T", muB / h / 1e9)

print("\n== ⑤ 銅の自由電子の数（例題8）・鉄の磁化（例題9）")
rhoCu, MCu = 8.960e3, 63.546e-3
nCu = rhoCu / MCu * NA
p("銅 1 m3 の原子の数", nCu)
p("1 cm3 の銅の原子の数", nCu / 1e6)
rhoFe, MFe = 7.874e3, 55.845e-3
nFe = rhoFe / MFe * NA
p("鉄 1 m3 の原子の数", nFe)
for mu in (2.2, 2.22, 4.0):
    M = mu * muB * nFe
    p(f"鉄 {mu} μB：M A/m・μ0 M T", M, mu0 * M)
# アルミ・亜鉛の参考
print("\n== ⑪ 結合と回転（例題10・11）")
D0_cm = 36118.3   # H2 の D0（WebBook）
D0 = D0_cm * h * c * 100 / e
p("H2 D0 eV・kJ/mol", D0, D0 * e * NA / 1e3)
p("H2 の D0 / kT(300K)", D0 / kT300)
p("H2+ の結合（2.65 eV〔参考〕）", 2.65)
mC, mO = 12.0, 15.99491461957
muCO = mC * mO / (mC + mO) * u
p("CO の換算質量 u", mC * mO / (mC + mO))
re_ = 112.8323e-12
I = muCO * re_ ** 2
Bc = hbar ** 2 / (2 * I)
p("CO：I kg m2・ħ²/(2I) eV・J=0→1 GHz", I, Bc / e, 2 * Bc / h / 1e9)
Be_cm, ae_cm = 1.93128087, 0.01750441
B0_cm = Be_cm - ae_cm / 2
p("WebBook：Be→2Be c GHz・B0→2B0 c GHz", 2 * Be_cm * c * 100 / 1e9, 2 * B0_cm * c * 100 / 1e9)
p("波長 mm（115.27 GHz）", c / 115.271e9 * 1e3)
p("ħ²/(2I) / kT(300K)", Bc / e / kT300)
p("回転の温度 θ_rot=ħ²/(2I kB) K", Bc / kB)
# 300 K でいちばん多い J
J = np.arange(0, 60)
w = (2 * J + 1) * np.exp(-J * (J + 1) * Bc / (kB * 300))
p("300 K でいちばん多い J", int(J[np.argmax(w)]))
# H2 の回転
mH = 1.00782503223
muH2 = mH * mH / (2 * mH) * u
reH2 = 74.14e-12
p("H2 の回転 θ_rot K（r=74.14 pm〔参考〕）", hbar ** 2 / (2 * muH2 * reH2 ** 2) / kB)

print("\n== 2倍の図")
for Z in (1, 2, 3):
    p(f"Z={Z}：1s の半径 a0/Z pm・E=-Z² 13.6", a0 / Z * 1e12, -Z * Z * Ry)

print("\n== 章末問題")
# 基本
p("Mg (Z=12)：1s2 2s2 2p6 3s2、K殻2・L殻8・M殻2", 2 + 8 + 2)
p("Ar (Z=18)", 2 + 8 + 8)
p("n=5 の席 2n²", 50)
p("He+ の電離 eV", 4 * Ry, "Li2+ ", 9 * Ry)
p("He+ の 2→1 の光 nm", 1239.84198 / (4 * Ry * 0.75))
p("NMR 0.5 T・7 T MHz", gp_MHz * 0.5, gp_MHz * 7)
p("ESR 9.5 GHz の磁場 T", 9.5e9 * h / (ge * muB))
p("K の Zeff", 4 * math.sqrt(IE[19] / Ry))
p("Na 1 mol を電離 kJ", IE[11] * e * NA / 1e3)
# チャレンジ
p("1s：r>2a0 にいる確率 13e^-4", 13 * math.exp(-4))
p("1s：r<a0/2 の確率 1-e^-1(1+1+1/2)", 1 - math.exp(-1) * 2.5)
# 2s の確率 r<2a0（節の内側）
r2 = np.linspace(0, 2, 200001)
p("2s：節 r=2a0 の内側の確率", float(np.trapezoid(r2 ** 2 * (2 - r2) ** 2 * np.exp(-r2) / 8, r2)))
# CO の J=1→2 の周波数
p("CO の J=1→2 GHz（2倍）", 4 * Bc / h / 1e9)
# 13C16O
mC13 = 13.00335483507
muCO13 = mC13 * mO / (mC13 + mO)
p("13CO/12CO の周波数の比", (mC * mO / (mC + mO)) / muCO13, "13CO J0→1 GHz", 115.271 * (mC * mO / (mC + mO)) / muCO13)
# ESR 0.34 T
p("ESR 0.34 T GHz", ge * muB_eV * 0.34 * e / h / 1e9)
# MRI 3 T と 1.5 T の差の割合
print("\n== Python の囲み（電子の雲の点）")
rng = np.random.default_rng(1)
N = 20000
# r の分布 4r^2 e^{-2r}：ガンマ分布（形3・尺度1/2）
rs = rng.gamma(3, 0.5, N)
p("点の r の平均（1.5 になるか）", float(rs.mean()), "r<1 の割合", float((rs < 1).mean()))

print("\n== 本文・例題・問題で足した数（本文の丸めの定数で）")
p("He：24.59+54.42 eV・反発なしの 2×54.42・差・ke²/差 nm", IE[2] + 4 * Ry, 8 * Ry, 8 * Ry - IE[2] - 4 * Ry, 1.43996 / (8 * Ry - IE[2] - 4 * Ry))
p("Rb の Zeff（5s、4.18 eV）", 5 * math.sqrt(IE[37] / Ry))
p("ESR 7 T GHz・NMR 7 T MHz", ge * muB_eV * 7 * e / h / 1e9, gp_MHz * 7)
p("上/下=1/2 の温度 K（ΔE=1.16e-4 eV, kB=8.62e-5）", 1.16e-4 / (8.62e-5 * math.log(2)))
p("例題6：1.16e-4/4.14e-15 Hz・e^-(1.16e-4/0.0259)", 1.16e-4 / 4.14e-15, math.exp(-1.16e-4 / 0.0259))
p("例題8：8.96e6/63.55*6.02e23・銀 10.50e6/107.9*6.02e23", 8.96e6 / 63.55 * 6.02e23, 10.50e6 / 107.9 * 6.02e23)
nfe = 7.87e6 / 55.85 * 6.02e23
p("例題9：n・M・μ0M・1μB の μ0M", nfe, nfe * 2.2 * 9.27e-24, 4e-7 * math.pi * nfe * 2.2 * 9.27e-24, 4e-7 * math.pi * nfe * 9.27e-24)
p("例題10：4.48×1.60e-19×6.02e23 J/mol・4.48/0.0259", 4.48 * 1.60e-19 * 6.02e23, 4.48 / 0.0259)
p("じぶんで10：13.6 eV ×NA kJ・問題：5.14 eV×NA kJ", 13.6 * 1.60e-19 * 6.02e23 / 1e3, 5.14 * 1.60e-19 * 6.02e23 / 1e3)
mu_ = 6.856 * 1.661e-27
I_ = mu_ * (112.8e-12) ** 2
B_ = (1.055e-34) ** 2 / (2 * I_)
p("例題11（本文の丸め）：μ・I・ħ²/2I J・eV・f GHz", mu_, I_, B_, B_ / 1.602e-19, 2 * B_ / 6.626e-34 / 1e9)
m12 = 12.00 * 15.99 / 27.99
m13 = 13.00 * 15.99 / 28.99
p("問題：μ12・μ13・13CO の周波数 GHz", m12, m13, 115.27 * m12 / m13)
p("例題1：Zeff Ne・Na、遮へいなし Ne・Na", 2 * math.sqrt(21.6 / 13.6), 3 * math.sqrt(5.14 / 13.6), 13.6 * 100 / 4, 13.6 * 121 / 9)
p("じぶんで1：Ar・例題5：Li・じぶんで5：K", 3 * math.sqrt(15.8 / 13.6), 2 * math.sqrt(5.39 / 13.6), 4 * math.sqrt(4.34 / 13.6))
p("じぶんで6：B=hf/(gμB) T", 4.14e-15 * 9.5e9 / (2.00 * 5.79e-5))
p("例題7：42.58×1.5・3.0、じぶんで7：0.50", 42.58 * 1.5, 42.58 * 3.0, 42.58 * 0.50)
