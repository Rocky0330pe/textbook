# -*- coding: utf-8 -*-
"""物理第5巻 原-10（tex/p5-10.tex）の例題・じぶんでとこう・章末問題・表・グラフの数値の検算（組 原W5）。
使い方：python3 calc_p5_10.py > calc_p5_10_out.txt
本文の丸め：k_B T/e = 0.0259 V（300 K）。ダイオードの I_s = 1e-14 A（原-9 と同じ。計画書 C-4 の約束）。"""
import math

VT = 0.0259


def p(*a):
    print(*a)


p("== ① 論理")
for A in (0, 1):
    for B in (0, 1):
        p("A", A, "B", B, "AND", A & B, "OR", A | B, "NAND", 1 - (A & B), "XOR(和)", A ^ B, "AND(くり上がり)", A & B)
p("1+1 = 10（2進数）")

p("\n== ⑦ はてな：チップの消費電力")
N, a, C, E, f = 1e10, 0.01, 0.05e-15, 0.7, 3e9
p("例題1：1回 C E^2 J", f"{C*E**2:.3g}", " P W", f"{a*N*C*E**2*f:.3g}", " 1秒の切りかえ回数", f"{a*N*f:.3g}")
p("じぶん1：E 0.5 V", f"{a*N*C*0.5**2*f:.3g}", " 比", f"{(0.5/0.7)**2:.3g}")
p("章末 基本5：N 2e9, a 0.05, C 0.1 fF, E 1.0, f 1 GHz", f"{0.05*2e9*0.1e-15*1.0**2*1e9:.3g}")
p("2倍の図：E 2倍 → 4倍")
p("1回のエネルギーと室温の熱 k_B T（J）", f"{1.380649e-23*300:.3g}", " 比", f"{C*E**2/(1.380649e-23*300):.3g}")

p("\n== ③⑥ バイポーラ・増幅")
IC, RC = 1e-3, 4.7e3
gm = IC / VT
p("例題3：gm S", f"{gm:.4g}", "増幅度", f"{-gm*RC:.4g}")
p("じぶん3：IC 2 mA, RC 2.2 k：gm", f"{2e-3/VT:.4g}", "増幅度", f"{-2e-3/VT*2.2e3:.4g}")
p("章末 基本2：IC 0.5 mA, RC 10 k：gm", f"{0.5e-3/VT:.4g}", "増幅度", f"{-0.5e-3/VT*1e4:.4g}")
p("hFE 100, IB 10 μA → IC mA", 100 * 10e-6 * 1e3)
p("VBE 10 mV 増やすと IC 倍", f"{math.exp(0.010/VT):.3g}", " 60 mV で", f"{math.exp(0.0596/VT):.3g}")
p("小信号の条件：v_be 1 mV の非線形のずれ e^{x}-1-x の割合", f"{(math.exp(0.001/VT)-1-0.001/VT)/(0.001/VT):.3g}")
p("RC の電圧降下 1 mA×4.7 k", 1e-3 * 4.7e3, "V")

p("\n== ④⑤⑩ MOSFET")
k, WL, Vth = 200e-6, 10, 0.5
for VGS in (0.5, 0.75, 1.0, 1.25, 1.5, 1.8, 1.2):
    ID = 0.5 * k * WL * (VGS - Vth) ** 2
    p("VGS", VGS, "ID mA（飽和）", f"{ID*1e3:.4g}", "gm mA/V", f"{k*WL*(VGS-Vth)*1e3:.4g}", "Ron Ω", (f"{1/(k*WL*(VGS-Vth)):.4g}" if VGS > Vth else "-"))
p("じぶん5：W/L 100, VGS 1.8：Ron", f"{1/(k*100*1.3):.4g}")
p("章末 基本3：k' 100 μA/V², W/L 20, Vth 0.4, VGS 1.0：ID mA", f"{0.5*100e-6*20*0.6**2*1e3:.4g}", "gm", f"{100e-6*20*0.6*1e3:.4g}")
p("章末 チャレンジ1：Ron 10 Ω にする W/L（VGS 1.8）", f"{1/(10*k*1.3):.4g}")
# ID–VDS の曲線（図）
for VGS in (1.0, 1.25, 1.5):
    row = []
    for VDS in (0, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5):
        Vov = VGS - Vth
        ID = k * WL * ((Vov) * VDS - VDS ** 2 / 2) if VDS < Vov else 0.5 * k * WL * Vov ** 2
        row.append(f"{ID*1e3:.3g}")
    p("ID–VDS VGS", VGS, row)
# 反転層の電荷：Cox
eps_ox = 3.9 * 8.85e-12
tox = 2e-9
p("Cox（酸化膜 2 nm）F/m²", f"{eps_ox/tox:.3g}", " μF/cm²", f"{eps_ox/tox*1e2:.3g}")
p("反転層の電子 1 V あたり /cm²", f"{eps_ox/tox*1/1.6e-19*1e-4:.3g}")
p("k' = μ_n Cox（μ_n 400 cm²/(V s) とする）A/V²", f"{400e-4*eps_ox/tox:.3g}")

p("\n== ⑧ オペアンプ")
p("例題6：-R2/R1", -100 / 10, "出力", -10 * 0.1)
p("じぶん6：R1 2 k, R2 30 k", -30 / 2, "0.2 V →", -15 * 0.2)
p("例題7：1+R2/R1", 1 + 100 / 10, " 0.1 V →", 11 * 0.1)
p("じぶん7：R1 1 k, R2 9 k", 1 + 9 / 1)
p("章末 基本4：R1 1 k, R2 22 k, 50 mV →", -22 * 0.05)
A = 1e4
G = A / (1 + A / 1000)
p("有限の増幅度 A=1e4、1+R2/R1=1000：G", f"{G:.4g}", "ずれ %", f"{(1000-G)/1000*100:.3g}")
A = 1e5
p("A=1e5, 1000:", f"{A/(1+A/1000):.4g}", f"{(1000-A/(1+A/1000))/10:.3g} %")
p("A=1e5, 反転 -10 のときの入力の電圧差（出力 -1 V）μV", f"{1/1e5*1e6:.3g}")

p("\n== ⑨ 計装・A/D")
p("例題8：1.25 mV ×1000", 1.25e-3 * 1000, " R2/R1 = 999 → R1 100 Ω, R2 99.9 kΩ")
p("じぶん8：2.5 mV → 2.0 V：倍率", 2.0 / 2.5e-3)
LSB = 3.3 / 4096
p("例題11：12 ビット 3.3 V の1目もり mV", f"{LSB*1e3:.4g}", " 1.25 V のコード", int(1.25 / LSB), " 2進数", bin(int(1.25 / LSB)))
p("  ひずみの分解能：1目もりは何 mV の入力（1000倍）μV", f"{LSB/1000*1e6:.3g}")
p("じぶん11：10 ビット 5 V", f"{5/1024*1e3:.4g}", "mV  2.5 V のコード", int(2.5 / (5 / 1024)))
p("章末 基本6：16 ビット 5 V μV", f"{5/65536*1e6:.4g}")
p("2進数：1551 =", bin(1551), " 512 =", bin(512))

p("\n== ⑦ CMOS の遅れ")
R, Cg = 1e3, 1e-15
tau = R * Cg
p("例題9：τ ps", tau * 1e12, " 1段 0.69τ ps", f"{0.693*tau*1e12:.3g}", " 10段 ps", f"{10*0.693*tau*1e12:.3g}")
p("じぶん9：2 kΩ・2 fF：τ ps", 2e3 * 2e-15 * 1e12, " 10段", f"{10*0.693*4e-12*1e12:.3g}")
p("章末 基本7：3入力 NAND の数", 6)

p("\n== ⑪ パワー MOSFET")
Ron, I, Vb, tsw, fs = 10e-3, 50, 300, 100e-9, 10e3
Pc = Ron * I ** 2
Psw = 0.5 * Vb * I * (tsw + tsw) * fs
p("例題10：導通損 W", Pc, "スイッチング損 W", f"{Psw:.4g}", "合計", f"{Pc+Psw:.4g}", " 15 kW に対する %", f"{(Pc+Psw)/(Vb*I)*100:.3g}")
p("  1回のスイッチングのエネルギー J（オンとオフ）", f"{0.5*Vb*I*tsw*2:.3g}")
Psw2 = 0.5 * Vb * I * 2 * tsw * 20e3
p("じぶん10：20 kHz：スイッチング損", f"{Psw2:.4g}", "合計", f"{Pc+Psw2:.4g}", "%", f"{(Pc+Psw2)/15e3*100:.3g}")
Pc2 = 2 * Ron * (I / 2) ** 2
p("章末 チャレンジ2：2個並列：導通損", Pc2, "合計（スイッチングは同じ 15 W）", Pc2 + Psw, "%", f"{(Pc2+Psw)/15e3*100:.3g}")
p("15 kW", Vb * I)

p("\n== ⑫ ニュートン法")
Is = 1e-14


def newton(E, R, V0, n=8, nd=1):
    V = V0
    out = []
    for it in range(1, n + 1):
        f_ = Is * (math.exp(V / VT) - 1) - (E - nd * V) / R
        df = Is / VT * math.exp(V / VT) + nd / R
        V = V - f_ / df
        out.append(V)
    return out


for V0 in (0.7, 0.6, 0.8):
    h = newton(5.0, 1e3, V0)
    p("例題12：はじめ", V0, ["%.5f" % v for v in h])
# 二分法でたしかめ
lo, hi = 0.3, 1.0
for _ in range(100):
    mid = (lo + hi) / 2
    if Is * (math.exp(mid / VT) - 1) - (5 - mid) / 1e3 > 0:
        hi = mid
    else:
        lo = mid
p("答え V_D", f"{lo:.5f}", " I mA", f"{(5-lo)/1e3*1e3:.4g}")
# 1回めの途中の値（本文の表）
V = 0.7
f_ = Is * (math.exp(V / VT) - 1) - (5 - V) / 1e3
df = Is / VT * math.exp(V / VT) + 1 / 1e3
p("  V=0.7：ダイオードの電流 A", f"{Is*(math.exp(V/VT)-1):.4g}", "抵抗の電流 A", f"{(5-V)/1e3:.4g}", "f", f"{f_:.4g}", "f'", f"{df:.4g}", "次", f"{V-f_/df:.5f}")
for V in newton(5.0, 1e3, 0.7, 4):
    f_ = Is * (math.exp(V / VT) - 1) - (5 - V) / 1e3
    p("   V", f"{V:.5f}", "f A", f"{f_:.3g}")
V = 0.6
f_ = Is * (math.exp(V / VT) - 1) - (5 - V) / 1e3
df = Is / VT * math.exp(V / VT) + 1 / 1e3
p("  V=0.6：f", f"{f_:.4g}", "f'", f"{df:.4g}", "次", f"{V-f_/df:.5f}")
# じぶん12：3.3 V, 330 Ω
h = newton(3.3, 330, 0.7)
p("じぶん12：3.3 V・330 Ω：", ["%.5f" % v for v in h], " I mA", f"{(3.3-h[-1])/330*1e3:.4g}")
# チャレンジ3：ダイオード2個直列（5 V, 1 kΩ）
h = newton(5.0, 1e3, 0.7, 8, 2)
p("章末チャレンジ3：2個直列：", ["%.5f" % v for v in h], " I mA", f"{(5-2*h[-1])/1e3*1e3:.4g}")
# 固定点の繰り返し（ダイオードの電圧を電流から）で比べる
V = 0.7
seq = []
for _ in range(5):
    I_ = (5 - V) / 1e3
    V = VT * math.log(I_ / Is + 1)
    seq.append("%.5f" % V)
p("別の繰り返し（電流→電圧）", seq)
