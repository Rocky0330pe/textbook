# -*- coding: utf-8 -*-
"""熱-15（並び方を数える：統計力学の入口）の数値の検算。
本文・例題・じぶんでとこう・章末問題・こたえ・表・グラフの数を、すべてここで計算する。
出力は calc15_out.txt（python3 calc15.py > calc15_out.txt）。
定数：k_B と N_A は 2019年の SI の決めた値。g は本文と同じ 9.8 m/s²。
"""
import math, random

kB = 1.380649e-23        # J/K（決めた値）
NA = 6.02214076e23       # 1/mol（決めた値）
R = kB * NA              # 8.314 J/(mol K)
eV = 1.602176634e-19     # J（決めた値）
g = 9.8
out = []
def p(*a):
    s = " ".join(str(x) for x in a)
    print(s)

def ein(t):              # アインシュタインの比熱 C_V/(3R)、t=T/θ_E
    x = 1 / t
    return x * x * math.exp(x) / (math.exp(x) - 1) ** 2

def sch(t):              # 2準位の比熱 C/(N k_B)、t=k_B T/Δ
    x = 1 / t
    return x * x * math.exp(x) / (1 + math.exp(x)) ** 2

p("R =", R)
p("==== ① 場合の数")
p("4個：", [math.comb(4, k) for k in range(5)], "合計", 2 ** 4)
p("10個：", [math.comb(10, k) for k in range(11)], "合計", 2 ** 10)
p("10個 で左5個の確率", math.comb(10, 5) / 2 ** 10, " 全部左", 1 / 2 ** 10)
for N in [4, 10, 100]:
    pr = [math.comb(N, k) / 2 ** N for k in range(N + 1)]
    p("N", N, "最大の確率", max(pr), "左40〜60 %の確率", sum(pr[k] for k in range(N + 1) if 0.4 * N <= k <= 0.6 * N))
p("N=1000 左45〜55 %", sum(math.comb(1000, k) for k in range(450, 551)) / 2 ** 1000)

p("==== ② 爆発")
f52 = math.factorial(52)
p("52! =", f"{f52:.4e}", "log10", math.log10(f52))
p("13! =", math.factorial(13))
p("10! =", math.factorial(10))
p("そろった並び（スートのかたまり 4!）の確率", 24 / f52)
age = 13.8e9 * 365.25 * 24 * 3600
p("宇宙の年齢〔s〕", f"{age:.2e}", " 1秒に1回で並べ終わる割合", age / f52)
p("C(100,50) =", f"{math.comb(100,50):.4e}", " 2^100 =", f"{2**100:.4e}", " 割合", math.comb(100, 50) / 2 ** 100)
p("C(20,10) =", math.comb(20, 10), " 2^20 =", 2 ** 20)
p("C(1000,500) =", f"{math.comb(1000,500):.3e}")
p("2^-100 =", 2 ** -100, " 2^-20 =", 2 ** -20, " 2^-50 =", 2 ** -50)
p("1 mol 全部左：log10 確率 =", -NA * math.log10(2))
for N in [100, 10000, 1e6, NA]:
    p("ゆらぎ σ=√N/2", N, math.sqrt(N) / 2, " σ/N", math.sqrt(N) / 2 / N)

p("==== ③ つぼ（表計算の例と、本文のプログラム）")
# 表計算の画面の例：N=10、はじめ全部左、RAND の数は seed を決めて作る
random.seed(14)
L = 10; rows = []
for step in range(1, 13):
    r = round(random.random(), 2)
    L = L - 1 if r < L / 10 else L + 1
    rows.append((step, r, L))
p("表計算の例（ステップ, RAND, 左の数）：", rows)
# 平均の近づき方 N/2 + (N/2)(1-2/N)^t
for N in [10, 100, 1000]:
    for t in [N // 2, N, 2 * N]:
        p("平均の左の割合 N", N, "t", t, 0.5 + 0.5 * (1 - 2 / N) ** t)
# グラフのデータ（図 fig-tsubo）：N=10,100,1000、2000ステップ
random.seed(7)
graph = {}; mm = {}
for N in [10, 100, 1000]:
    L = N; pts = [(0, 1.0)]
    for step in range(1, 2001):
        L = L - 1 if random.random() < L / N else L + 1
        if step % (2 if N == 10 else 20) == 0:   # N=10 は2回ごと、ほかは20回ごと
            pts.append((step, L / N))
        if N == 10 and L in (0, 10):
            p("つぼ N=10：全部が片方", step, L)
        if (N == 1000 and step > 1500) or (N == 100 and step > 300):
            mm.setdefault(N, []).append(L)
    graph[N] = pts
for N in mm:
    p("近づいたあとの幅 N", N, min(mm[N]) / N, max(mm[N]) / N)
for N in graph:
    p("GRAPH", N, " ".join(f"({a},{b:.3f})" for a, b in graph[N]))

# 本文のプログラム（そのまま）
random.seed(1)
for N in [100, 10000]:
    L = N
    data = []
    for step in range(200 * N):
        if random.random() < L / N:
            L = L - 1
        else:
            L = L + 1
        if step >= 20 * N:
            data.append(L)
    ave = sum(data) / len(data)
    sd = (sum((x - ave) ** 2 for x in data) / len(data)) ** 0.5
    p("PROG1", N, round(ave, 1), round(sd, 1))

p("==== やってみよう（さいころ、おはじき6個、30回）")
random.seed(3)
L = 6; seq = []; Ls = []
for i in range(30):
    d = random.randint(1, 6)
    # おはじき1〜6。左にあるおはじきの集合を追う
    seq.append(d)
left = set(range(1, 7)); Ls = []
for d in seq:
    if d in left: left.remove(d)
    else: left.add(d)
    Ls.append(len(left))
p("さいころ", seq)
p("左の数", Ls, " 6回め以降の平均", sum(Ls[5:]) / len(Ls[5:]))
p("6個で左が k 個の確率", [round(math.comb(6, k) / 64, 3) for k in range(7)])

p("==== ④ ボルツマンの関係")
p("R ln2 =", R * math.log(2), " R ln3 =", R * math.log(3), " 0.5 R ln2 =", 0.5 * R * math.log(2))
def om(N, j): return math.comb(j + N - 1, j)
p("Ω(3,j) j=0..6", [om(3, j) for j in range(7)])
tab = [(a, om(3, a), om(3, 6 - a), om(3, a) * om(3, 6 - a)) for a in range(7)]
p("2つの固体（3個と3個、粒6つ）", tab, "合計", sum(t[3] for t in tab), " C(11,6)", math.comb(11, 6))
p("ln Ω(3,j)", [round(math.log(om(3, j)), 3) for j in range(7)])
p("1粒ふえたときの ln の増え", [round(math.log(om(3, j + 1)) - math.log(om(3, j)), 3) for j in range(6)])
p("Ω(2,2)=", om(2, 2), " Ω(3,2)=", om(3, 2), " Ω(4,3)=", om(4, 3))
# 本文のプログラム2
from math import comb
NA_, NB_, j = 300, 200, 100
def omega(N, j):
    return comb(j + N - 1, j)
tot = comb(j + NA_ + NB_ - 1, j)
def both(a):                   # A が a 粒のときの数（本文のプログラムと同じ）
    return omega(NA_, a) * omega(NB_, j - a)
best = max(range(j + 1), key=both)
p("PROG2 いちばん多い j_A", best)
pp = sum(both(a) for a in range(50, 71)) / tot
p("PROG2 50〜70の確率", round(pp, 3))
p("PROG2 全部Bにある確率", both(0) / tot)
# 図（2つの固体の山）の最大値
for n_ in [3, 30, 300]:
    jj = 2 * n_; t_ = comb(jj + 2 * n_ - 1, jj)
    p("図 fig-kotai 原子", n_, "ずつ：最大の高さ", max(omega(n_, a) * omega(n_, jj - a) / t_ * jj for a in range(jj + 1)))
# 例題13・じぶんでとこう13・章末7
p("例13 2個と2個・粒4", [omega(2, a) * omega(2, 4 - a) for a in range(5)], "合計", comb(7, 4), " 9/35 =", 9 / 35)
p("じぶん13 2個と3個・粒3", [omega(2, a) * omega(3, 3 - a) for a in range(4)], "合計", comb(7, 3), " 12/35 =", 12 / 35)
p("章末7 3個と3個・粒4", [omega(3, a) * omega(3, 4 - a) for a in range(5)], "合計", comb(9, 4), " 36/126 =", 36 / 126)
# 図「大きな数のけた」
p("けた：宇宙の年齢の秒", math.log10(age), " 1 mol", math.log10(NA), " 2^100", 100 * math.log10(2), " 52!", math.log10(f52), " 52!/N_A のけた", math.log10(f52) - math.log10(NA))
# ダイヤモンドの点（測った値 6.115 を 3R でわる）
p("ダイヤモンド 6.115/(3R) =", 6.115 / (3 * R), " T/θ_E =", 298 / 1300)
# 例題1 の常用対数の和
p("例1 log10 の和", sum(math.log10(k) for k in range(1, 53)))
# 例題7・8
p("例8 表 2/x と (e^x-1)/(e^x+1)", [(x, round(2 / x, 3), round((math.exp(x) - 1) / (math.exp(x) + 1), 3)) for x in [2.2, 2.3, 2.4, 2.5]])
p("例8 f(2.40) =", 2.4 ** 2 * math.exp(2.4) / (math.exp(2.4) + 1) ** 2)

p("==== ⑤ スターリング")
for n in [5, 10, 52, 100, 1000]:
    ex = math.lgamma(n + 1); st = n * math.log(n) - n
    st2 = st + 0.5 * math.log(2 * math.pi * n)
    p("n", n, "ln n!", round(ex, 3), "n ln n − n", round(st, 3), "ずれ%", round((ex - st) / ex * 100, 2),
      " +1 の形", round(st + 1, 3), " √(2πn) の形", round(st2, 3))
p("52!：スターリング（√ つき）→ 10^", (52 * math.log(52) - 52 + 0.5 * math.log(2 * math.pi * 52)) / math.log(10))
for x in [0.5, 0.25, 0.1]:
    p("混合 −[x ln x+(1−x)ln(1−x)]", x, -(x * math.log(x) + (1 - x) * math.log(1 - x)))
p("ln C(100,50)/100 =", math.log(math.comb(100, 50)) / 100, " ln2 =", math.log(2))
p("ln C(1000,500)/1000 =", math.log(math.comb(1000, 500)) / 1000)
p("混合 1 mol（0.25 mol と 0.75 mol）ΔS =", R * -(0.25 * math.log(0.25) + 0.75 * math.log(0.75)))

p("==== ⑥ ボルツマン分布")
for xx in [0, 1, 2, 3]:
    p("e^-x", xx, math.exp(-xx), " 2倍の温度で e^-(x/2)", math.exp(-xx / 2))
M_N2, M_O2, M_He, M_air = 28.014e-3, 31.999e-3, 4.0026e-3, 28.96e-3
for M, nm in [(M_N2, "N2"), (M_O2, "O2"), (M_He, "He"), (M_air, "空気")]:
    H = kB * 288.15 / (M / NA * g)
    p("高さの目安 k_BT/(mg) 15 ℃", nm, round(H / 1e3, 2), "km  富士山3776 m で", round(math.exp(-3776 / H), 3))
H0 = kB * 273.15 / (M_N2 / NA * g)
p("N2 0 ℃", H0 / 1e3)
p("N2 15 ℃ で 1/2 になる高さ", kB * 288.15 / (M_N2 / NA * g) * math.log(2) / 1e3)
p("N2 15℃ 高さ 10 km の割合", math.exp(-10e3 / (kB * 288.15 / (M_N2 / NA * g))))
p("O2/N2 の比 10 km で（等温・まざらないとした）", math.exp(-10e3 / (kB * 288.15 / (M_O2 / NA * g))) / math.exp(-10e3 / (kB * 288.15 / (M_N2 / NA * g))))
# アレニウス（身近な例）
for Ea in [0.5, 0.6]:
    p("反応の速さの比 20→30 ℃ Ea", Ea, "eV", math.exp(Ea * eV / kB * (1 / 293.15 - 1 / 303.15)))
p("Ea=0.5 eV を kJ/mol に", 0.5 * eV * NA / 1e3)

p("==== ⑦ 2準位")
for T in [77, 300, 600, 1000]:
    p("差 0.1 eV", T, "K：k_BT〔eV〕", round(kB * T / eV, 5), " 上/下", math.exp(-0.1 * eV / (kB * T)))
p("差 0.1 eV のときの Δ/(k_B T) at 300 K", 0.1 * eV / (kB * 300))
# 上にいる割合 at 300 K
r = math.exp(-0.1 * eV / (kB * 300)); p("上にいる割合 300 K", r / (1 + r))
# 山
best = max((sch(t / 10000), t / 10000) for t in range(1000, 20000))
p("ショットキーの山 k_BT/Δ =", best[1], " C/(Nk_B) =", best[0])
p("山の温度 差0.1 eV", best[1] * 0.1 * eV / kB, "K")
p("山の温度 差0.01 eV", best[1] * 0.01 * eV / kB, "K")
for t in [0.1, 0.2, 0.3, 0.42, 0.6, 1, 2, 3]:
    p("2準位 t", t, "U/(NΔ)", round(1 / (math.exp(1 / t) + 1), 4), "C/Nk", round(sch(t), 4))
# MRI
f = 42.577e6 * 1.5; h = 6.62607015e-34
dE = h * f
p("MRI 1.5 T：周波数", f, "ΔE〔eV〕", dE / eV, " Δ/kT (310 K)", dE / (kB * 310), " 差の割合 tanh", math.tanh(dE / (2 * kB * 310)))

p("==== ⑧ アインシュタイン")
for t in [0.1, 0.2, 0.25, 0.5, 1, 2, 3]:
    p("C/3R T/θ_E", t, round(ein(t), 4), " C〔J/(mol K)〕", round(3 * R * ein(t), 2))
p("3R =", 3 * R)
p("ダイヤモンド θ_E=1300 K, 300 K：C =", 3 * R * ein(300 / 1300), " 298 K:", 3 * R * ein(298 / 1300))
p("ダイヤモンド θ_E=1300 K, 1000 K：C =", 3 * R * ein(1000 / 1300))
for xx in [0.1, 0.2, 0.5, 1, 2]:
    p("平均エネルギー/k_BT  x=Δε/k_BT", xx, xx / (math.exp(xx) - 1), " 1−x/2 の近似", 1 - xx / 2)
p("高温の1自由度 k_BT 300 K〔J〕", kB * 300, " 〔eV〕", kB * 300 / eV)

p("==== ⑨ 分布")
for x in [-2, -1, 0, 1, 2, 3]:
    p("x=(ε−μ)/kT", x, "B", math.exp(-x), "F", 1 / (math.exp(x) + 1), "BE", (1 / (math.exp(x) - 1) if x > 0 else None))

p("==== 例題・じぶんでとこう・章末")
p("例1 52! =", f"{f52:.3e}", " じぶん13! =", f"{math.factorial(13):.3e}")
p("例2 C(100,50) =", f"{math.comb(100,50):.3e}", " じぶん C(20,10) =", math.comb(20, 10), " 2^20", 2 ** 20)
p("例3 2^-100 =", f"{2**-100:.2e}", " じぶん 2^-20 =", f"{2**-20:.2e}")
p("例4 R ln2 =", R * math.log(2), " じぶん R ln3 =", R * math.log(3))
p("例5 n=10,100 は上。じぶん n=1000 ずれ%", (math.lgamma(1001) - (1000 * math.log(1000) - 1000)) / math.lgamma(1001) * 100)
p("例6 N2 8.73 km。じぶん O2", kB * 288.15 / (M_O2 / NA * g) / 1e3, " He", kB * 288.15 / (M_He / NA * g) / 1e3)
p("例7 0.0209。じぶん 600 K", math.exp(-0.1 * eV / (kB * 600)))
p("例8 山 t=0.417。じぶん 差0.05 eV の山の温度", best[1] * 0.05 * eV / kB)
p("例9 0.724・0.921・0.991。じぶん T=2θ_E", ein(2), " T=θ_E/4", ein(0.25))
p("例10 じぶん x=0.2 → ", 0.2 / (math.exp(0.2) - 1), " x=1 →", 1 / (math.e - 1))
p("例11 k_BT ln2 300 K =", kB * 300 * math.log(2), " じぶん 77 K", kB * 77 * math.log(2), " 1 GB（8×10^9 ビット）300 K", 8e9 * kB * 300 * math.log(2))
p("例12 リフル：log2(52!)/52 =", math.log2(f52) / 52, " 2^52 =", f"{2**52:.3e}")
p("例12 じぶん 10枚：log2(10!)/10 =", math.log2(math.factorial(10)) / 10, " 20枚", math.log2(math.factorial(20)) / 20)
# 章末
p("章末 基本：コイン 6 枚で表3枚", math.comb(6, 3), "/", 64, "=", math.comb(6, 3) / 64)
p("章末 基本：分子 30 個 全部左", 2 ** -30)
p("章末 基本：ヘリウム 2 mol 体積2倍", 2 * R * math.log(2))
p("章末 基本：ln 20! と 20 ln20 −20", math.lgamma(21), 20 * math.log(20) - 20, (math.lgamma(21) - (20 * math.log(20) - 20)) / math.lgamma(21) * 100)
p("章末 基本：差 0.2 eV 1000 K の比", math.exp(-0.2 * eV / (kB * 1000)))
p("章末 基本：空気 15 ℃の高さの目安", kB * 288.15 / (M_air / NA * g) / 1e3)
p("章末 基本：Ω(4,3) と 2つの固体（2個と2個、粒4つ）", om(4, 3), [(a, om(2, a) * om(2, 4 - a)) for a in range(5)])
p("章末 チャレンジ：2準位 Δ=0.05 eV 400 K の U/(N) 〔eV〕", 0.05 / (math.exp(0.05 * eV / (kB * 400)) + 1))
p("章末 チャレンジ：アインシュタイン θ_E=300 K の固体 1 mol 150 K→ C", 3 * R * ein(0.5))
p("章末 チャレンジ：混合 N2 0.79 と O2 0.21 1 mol", R * -(0.79 * math.log(0.79) + 0.21 * math.log(0.21)))
p("章末 チャレンジ：1 GB を 77 K で消す最小のエネルギー", 8e9 * kB * 77 * math.log(2))

p("==== 章末 チャレンジ12（MRI 3 T）")
dE3 = 6.62607015e-34 * 42.577e6 * 3 / eV; kT310 = kB * 310 / eV
p("3 T：ΔE〔eV〕", dE3, " k_BT(310 K)〔eV〕", kT310, " a", dE3 / kT310, " 差÷全体 (1-r)/(1+r)", math.tanh(dE3 / kT310 / 2))
