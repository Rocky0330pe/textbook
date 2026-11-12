# -*- coding: utf-8 -*-
"""物理第5巻 原-9（tex/p5-09.tex）の例題・じぶんでとこう・章末問題・表・グラフの数値の検算（組 原W5）。
使い方：python3 calc_p5_09.py > calc_p5_09_out.txt
本文の丸め（計画書 B のはじめ・E の8）：kT/e = 0.0259 V（300 K）、hc = 1240 eV·nm、e = 1.60e-19 C、eps0 = 8.85e-12 F/m。
ケイ素の値（章の頭のコメントの出典）：Eg 1.12 eV、Nc 2.8e19・Nv 1.04e19 cm^-3、n_i 1.0e10 cm^-3（例題の基準）、
移動度 1350・480 cm²/(V·s)、比誘電率 11.7。"""
import math

kT = 0.0259        # eV（300 K）
hc = 1240.0        # eV·nm
e = 1.60e-19       # C
eps0 = 8.85e-12    # F/m
kB_eV = 8.617333e-5  # eV/K（k_B/e。CODATA 2022 の k_B と e から）
Eg = 1.12
Nc, Nv = 2.8e19, 1.04e19
ni0 = 1.0e10
mun, mup = 1350.0, 480.0
epsr = 11.7


def p(*a):
    print(*a)


def ni_T(T, Eg=Eg):
    kt = kB_eV * T
    return math.sqrt(Nc * Nv * (T / 300) ** 3) * math.exp(-Eg / (2 * kt))


p("== ① 光電池（作ったデータ：光の強さに比例）")
for L in (0.5, 1, 2):
    p("光の強さ", L, "→ 電流 mA", round(60 * L))

p("\n== ③ 真性キャリア密度")
ni300 = math.sqrt(Nc * Nv) * math.exp(-Eg / (2 * kT))
p("n_i(300 K)（kT=0.0259）cm^-3", f"{ni300:.3g}")
p("√(NcNv) cm^-3", f"{math.sqrt(Nc*Nv):.3g}", " e^(-Eg/2kT)", f"{math.exp(-Eg/(2*kT)):.3g}")
p("n_i(300)（kB T 正確）", f"{ni_T(300):.3g}", " n_i(350)", f"{ni_T(350):.3g}", " 比", f"{ni_T(350)/ni_T(300):.3g}")
p("比（T^1.5 をのぞく、指数だけ）", f"{math.exp(-Eg/(2*kB_eV*350))/math.exp(-Eg/(2*kB_eV*300)):.3g}")
p("比（T^1.5 の分）", f"{(350/300)**1.5:.3g}")
for T in (250, 300, 350, 400, 450, 500):
    p("グラフ T", T, "n_i", f"{ni_T(T):.3g}", "log10", f"{math.log10(ni_T(T)):.3f}")
p("m^-3 への換算：1e10 cm^-3 =", f"{1e10*1e6:.3g}", "m^-3")
p("ケイ素の原子の数密度 5.0e22 cm^-3 に対する n_i の割合", f"{1e10/5.0e22:.3g}")
# ガラス（9 eV）は原-8
# 300 K→330 K（章末 基本6）
p("n_i(330)/n_i(300)", f"{ni_T(330)/ni_T(300):.3g}")
p("禁制帯2倍の2倍の図：Eg 2.24 の n_i(300)", f"{ni_T(300, 2.24):.3g}")

p("\n== ④ 不純物")
Nd = 1e16
p("例題3：n", f"{Nd:.3g}", "p", f"{ni0**2/Nd:.3g}")
p("じぶん3：ホウ素 2e15 → p", 2e15, "n", f"{ni0**2/2e15:.3g}")
p("リン 1e16 はケイ素原子の何個に1個", f"{5.0e22/1e16:.3g}")
p("章末 基本2：ヒ素 5e15 → n,p", 5e15, f"{ni0**2/5e15:.3g}")

p("\n== ⑤ ドリフトと拡散")
sig_n = e * Nd * mun
p("例題4：n形 σ S/cm", f"{sig_n:.3g}", "ρ Ω·cm", f"{1/sig_n:.3g}")
sig_i = e * ni0 * (mun + mup)
p("例題4：真性 σ", f"{sig_i:.3g}", "ρ Ω·cm", f"{1/sig_i:.3g}", "比", f"{(1/sig_i)/(1/sig_n):.3g}")
p("じぶん4：p形 2e15 ρ", f"{1/(e*2e15*mup):.3g}")
p("章末 基本2：ヒ素 5e15 ρ", f"{1/(e*5e15*mun):.3g}")
p("不純物10倍 → ρ 1/10（1e17）", f"{1/(e*1e17*mun):.3g}")
Dn = mun * kT
Dp = mup * kT
p("例題6：Dn cm²/s", f"{Dn:.3g}", "Dp", f"{Dp:.3g}")
Ln = math.sqrt(Dn * 1e-6)
p("例題6：Ln (1 μs) cm", f"{Ln:.3g}", "μm", f"{Ln*1e4:.3g}")
Lp = math.sqrt(Dp * 1e-6)
p("じぶん6：Lp (1 μs) μm", f"{Lp*1e4:.3g}", " Lp(10 μs) μm", f"{math.sqrt(Dp*1e-5)*1e4:.3g}")
p("寿命4倍 → 拡散距離2倍")

p("\n== ⑥ pn 接合")
Na = 1e16
Vbi = kT * math.log(Na * Nd / ni0 ** 2)
eps = epsr * eps0 * 1e-2   # F/cm
W = math.sqrt(2 * eps * Vbi / e * (1 / Na + 1 / Nd))
Emax = 2 * Vbi / W
p("例題7：Vbi V", f"{Vbi:.3g}", "W cm", f"{W:.3g}", "μm", f"{W*1e4:.3g}", "Emax V/cm", f"{Emax:.3g}")
p("  ln(NaNd/ni^2)", f"{math.log(Na*Nd/ni0**2):.4g}")
p("  2εVbi/e", f"{2*eps*Vbi/e:.4g}")
# じぶん7：Na=1e17, Nd=1e16
Na2 = 1e17
Vbi2 = kT * math.log(Na2 * Nd / ni0 ** 2)
W2 = math.sqrt(2 * eps * Vbi2 / e * (1 / Na2 + 1 / Nd))
p("じぶん7（Na 1e17, Nd 1e16）：Vbi", f"{Vbi2:.3g}", "W μm", f"{W2*1e4:.3g}", "Emax V/cm", f"{2*Vbi2/W2:.3g}",
  "n側の割合", f"{Na2/(Na2+Nd):.3g}", "n側 μm", f"{W2*1e4*Na2/(Na2+Nd):.3g}")
# 章末 チャレンジ1：Na=1e18, Nd=1e15
Na3, Nd3 = 1e18, 1e15
Vbi3 = kT * math.log(Na3 * Nd3 / ni0 ** 2)
W3 = math.sqrt(2 * eps * Vbi3 / e * (1 / Na3 + 1 / Nd3))
p("章末チャレンジ1（Na 1e18, Nd 1e15）：Vbi", f"{Vbi3:.3g}", "W μm", f"{W3*1e4:.3g}", "Emax V/cm", f"{2*Vbi3/W3:.3g}",
  "n側の割合", f"{Na3/(Na3+Nd3):.4g}")
p("逆電圧 5 V（例題7の接合）W μm", f"{math.sqrt(2*eps*(Vbi+5)/e*(1/Na+1/Nd))*1e4:.3g}")
for ND in (1e15, 1e16, 1e17, 1e18):
    p("2倍の図 Vbi（Na=Nd=", ND, "）", f"{kT*math.log(ND*ND/ni0**2):.3g}",
      "W μm", f"{math.sqrt(2*eps*kT*math.log(ND*ND/ni0**2)/e*(2/ND))*1e4:.3g}")

p("\n== ⑦ ダイオード")
Is = 1e-14
V1 = kT * math.log(1e-3 / Is)
p("例題8：1 mA の電圧 V", f"{V1:.4g}", "10倍で増える mV", f"{kT*math.log(10)*1e3:.3g}")
p("  ln(1e11)", f"{math.log(1e11):.4g}")
for I in (1e-6, 1e-5, 1e-4, 1e-3, 1e-2, 1e-1):
    p("   電流", I, "電圧", f"{kT*math.log(I/Is+1):.4g}")
p("じぶん8：Is=1e-13, 10 mA", f"{kT*math.log(1e-2/1e-13):.4g}", " 100倍 mV", f"{kT*math.log(100)*1e3:.3g}")
r = (math.exp(0.5 / kT) - 1) / (1 - math.exp(-0.5 / kT))
p("例題9：±0.5 V の比", f"{r:.3g}", " 0.5/kT", f"{0.5/kT:.4g}", "順の電流 A", f"{Is*(math.exp(0.5/kT)-1):.3g}")
r2 = (math.exp(0.6 / kT) - 1) / (1 - math.exp(-0.6 / kT))
p("じぶん9：±0.6 V の比", f"{r2:.3g}", "順の電流 A", f"{Is*(math.exp(0.6/kT)-1):.3g}")
p("章末 基本3：Is=2e-14, 5 mA", f"{kT*math.log(5e-3/2e-14):.4g}", " 100倍 mV", f"{kT*math.log(100)*1e3:.3g}")
for V in (0.0, 0.2, 0.4, 0.5, 0.55, 0.6, 0.65, 0.7):
    p("   I–V V", V, "I mA", f"{Is*(math.exp(V/kT)-1)*1e3:.4g}")
# 温度：同じ電流で電圧は約 -2 mV/K（参考）

p("\n== ⑨ LED の色")
for E, name in ((1.9, "赤"), (2.7, "青"), (2.3, "緑"), (1.42, "GaAs"), (3.4, "GaN"), (1.12, "Si"), (2.0, "黄みの赤"), (1.4, "赤外")):
    p(name, E, "eV →", f"{hc/E:.4g}", "nm")
p("波長→エネルギー 650 nm", f"{hc/650:.3g}", " 460 nm", f"{hc/460:.3g}", " 940 nm", f"{hc/940:.3g}")
p("LED 3 V・20 mA の光の数（効率 30%、460 nm）", f"{0.3*3*0.02/(hc/460*e):.3g}", "個/s")
p("乾電池 3 V・100 Ω・赤 LED 1.9 V の電流 mA", f"{(3-1.9)/100*1e3:.3g}", " 青 2.8 V", f"{(3-2.8)/100*1e3:.3g}")

p("\n== ⑩ 太陽電池")
JL, J0, A = 35e-3, 1e-12, 100.0
IL, I0 = JL * A, J0 * A
Voc = kT * math.log(IL / I0 + 1)
best = (0, 0, 0)
N = 200000
for k in range(N + 1):
    V = Voc * k / N
    I = IL - I0 * (math.exp(V / kT) - 1)
    if V * I > best[0]:
        best = (V * I, V, I)
Pm, Vm, Im = best
FF = Pm / (Voc * IL)
p("例題10：IL A", IL, "I0 A", I0, "Voc V", f"{Voc:.4g}", "Pmax W", f"{Pm:.4g}", "Vm V", f"{Vm:.4g}", "Im A", f"{Im:.4g}",
  "FF", f"{FF:.3g}", "効率", f"{Pm/(1000*A*1e-4):.3g}")
for V in (0, 0.1, 0.2, 0.3, 0.4, 0.45, 0.5, 0.52, 0.54, 0.55, 0.56, 0.58, 0.6, 0.62, Voc):
    I = IL - I0 * (math.exp(V / kT) - 1)
    p("   V", f"{V:.3f}", "I A", f"{I:.4g}", "P W", f"{V*I:.4g}")
Voc2 = kT * math.log(2 * IL / I0 + 1)
p("光2倍：Voc", f"{Voc2:.4g}", "増える mV", f"{(Voc2-Voc)*1e3:.3g}", " kT ln2", f"{kT*math.log(2)*1e3:.3g}")
best2 = (0, 0, 0)
for k in range(N + 1):
    V = Voc2 * k / N
    I = 2 * IL - I0 * (math.exp(V / kT) - 1)
    if V * I > best2[0]:
        best2 = (V * I, V, I)
p("光2倍：Pmax W", f"{best2[0]:.4g}", "Vm", f"{best2[1]:.4g}", "比", f"{best2[0]/Pm:.3g}")
p("じぶん10：JL 30 mA/cm² Voc", f"{kT*math.log(30e-3/1e-12+1):.4g}", " 60枚直列 V", f"{60*kT*math.log(30e-3/1e-12+1):.3g}")
# じぶん10：同じセルで 0.50 V のときの電力
I05 = IL - I0 * (math.exp(0.50 / kT) - 1)
p("じぶん10：0.50 V の電流 A", f"{I05:.4g}", "電力 W", f"{0.5*I05:.4g}")
p("例題11：0.6 V で 2 V に要る個数", math.ceil(2 / 0.6), " 3個は", 3 * 0.6)
p("じぶん11：0.5 V で 3 V（青）", math.ceil(3.0 / 0.5))
p("例題12：850 nm・η 0.8：A/W", f"{0.8*850/hc:.3g}", " 1 μW の光 → μA", f"{0.8*850/hc*1:.3g}")
p("じぶん12：650 nm・η 0.7", f"{0.7*650/hc:.3g}", " 2 mW → mA", f"{0.7*650/hc*2:.3g}")
p("1光子あたり 850 nm eV", f"{hc/850:.3g}")
p("章末 基本4：940 nm・η 0.6：A/W", f"{0.6*940/hc:.3g}", " 0.50 mW → mA", f"{0.6*940/hc*0.5:.3g}")
p("章末 基本5：JL 32 mA/cm²・J0 1e-12：Voc", f"{kT*math.log(32e-3/1e-12+1):.4g}", " 72枚 V", f"{72*kT*math.log(32e-3/1e-12+1):.3g}")
# ショックレーとクワイサーの上限（文献の値を本文で引くだけ）

p("\n== ⑪ キャリア密度の式")
Ec_EF = kT * math.log(Nc / Nd)
p("例題5：Ec−EF eV（Nd=1e16）", f"{Ec_EF:.3g}", " Nc/Nd", f"{Nc/Nd:.3g}")
p("じぶん5：EF−Ev（Na=1e16）", f"{kT*math.log(Nv/1e16):.3g}")
p("章末 チャレンジ3：EF−Ev（Na=1e17）", f"{kT*math.log(Nv/1e17):.3g}", "  Ec−EF（Nd=1e18）", f"{kT*math.log(Nc/1e18):.3g}")
p("真性のフェルミ準位：中央からのずれ (kT/2) ln(Nv/Nc) eV", f"{kT/2*math.log(Nv/Nc):.3g}")
p("Ec−EF=0.21 で e^(-…)", f"{math.exp(-Ec_EF/kT):.3g}")
# アインシュタインの関係のたしかめ
p("D/μ = kT/e V", kT)

p("\n== ⑫ 空乏層・ショックレーの式")
# 例題7と同じ接合の電位を差分で（Python の囲み）
Nx = 400
L = 0.6e-4  # cm（-0.3〜0.3 μm）
xn = W * Na / (Na + Nd)
xp = W * Nd / (Na + Nd)
p("xn μm", f"{xn*1e4:.4g}", "xp μm", f"{xp*1e4:.4g}")
# ショックレー：p+n 接合
A_d = 1e-2  # cm²
Dp1 = mup * kT
tp = 1e-6
Lp1 = math.sqrt(Dp1 * tp)
Is_calc = e * A_d * ni0 ** 2 * Dp1 / (Lp1 * Nd)
p("本文の例：p+n、A=1 mm²、Nd=1e16、τp=1 μs：Dp", f"{Dp1:.3g}", "Lp cm", f"{Lp1:.3g}", "Is A", f"{Is_calc:.3g}")
# 章末 チャレンジ2：A = 4 mm²、Nd=1e15、τp=10 μs
A2, Nd2, tp2 = 4e-2, 1e15, 1e-5
Lp2 = math.sqrt(Dp1 * tp2)
Is2 = e * A2 * ni0 ** 2 * Dp1 / (Lp2 * Nd2)
p("章末チャレンジ2：Lp cm", f"{Lp2:.3g}", "Is A", f"{Is2:.3g}", " 0.60 V の電流 mA", f"{Is2*(math.exp(0.6/kT)-1)*1e3:.3g}")

p("\n== ⑬ ペルチェ・ゼーベック")
p("例題13：COP 上限（5℃と35℃）", f"{278.15/30:.3g}", " 278/30", f"{278/30:.3g}")
p("じぶん13：0℃と40℃", f"{273.15/40:.3g}", "  273/40", f"{273/40:.3g}")
p("ゼーベック：1対 0.4 mV/K・127対・ΔT 30 K → V", f"{0.4e-3*127*30:.3g}")
p("章末 チャレンジ4：1対 0.4 mV/K・100対・ΔT 50 K", f"{0.4e-3*100*50:.3g}", " 内部 2 Ω に同じ負荷 2 Ω：電力 W", f"{(0.4e-3*100*50/4)**2*2:.3g}")
p("K 熱電対 41 μV/K と比べて：0.4 mV/K は", f"{0.4e-3/41e-6:.3g}", "倍")
