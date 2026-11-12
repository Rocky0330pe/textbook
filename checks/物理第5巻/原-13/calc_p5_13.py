# 物理第5巻 原-13「放射線が物にあたる：放射線と物質」の数値の検算（組 原W7）
# 使い方：python3 calc_p5_13.py > calc_p5_13_out.txt
# 出典（11月11日に作業環境から読んだ）
#  ・質量減弱係数 μ/ρ・質量エネルギー吸収係数：NIST "X-Ray Mass Attenuation Coefficients"（Hubbell & Seltzer）
#      https://physics.nist.gov/PhysRefData/XrayMassCoef/ElemTab/z82.html（鉛）・z26（鉄）・z13（アルミ）、
#      ComTab/water.html・concrete.html（Ordinary）・bone.html（Bone, Cortical, ICRU-44）・tissue.html（Tissue, Soft, ICRU-44）
#      密度は同じ資料の表1・表2（鉛 11.35、鉄 7.874、アルミ 2.699、骨 1.92、軟組織 1.06、コンクリート 2.30 g/cm³）
#  ・陽子の水の中の CSDA 飛程：NIST PSTAR（https://physics.nist.gov/cgi-bin/Star/ap_table-t.pl、Water, Liquid）
#  ・α 粒子の空気中の CSDA 飛程：NIST ASTAR（Air, Dry）、電子のアルミの CSDA 飛程：NIST ESTAR（Aluminum）
#  ・熱中性子の吸収断面積：H 0.3326 b・Co-59 37.18 b（NIST NCNR の表を引く二次資料2つ：検索の抜粋。原本は Sears 1992）
#  ・半減期・エネルギー：Co-60 5.27 年・1.17 と 1.33 MeV、Cs-137 の γ 線 0.662 MeV（放出の割合 85 %）、Po-210 の α 5.30 MeV、
#      Y-90 の β の最大 2.28 MeV（二次資料2つ以上で照らし合わせた。DDEP・NNDC は届かなかった）
import math

NA = 6.02214076e23
meMeV = 0.51099895069
year = 365.25 * 86400


def p(label, *vals):
    s = ", ".join(f"{v:.4g}" if isinstance(v, float) else str(v) for v in vals)
    print(f"{label}: {s}")


# ---- NIST μ/ρ（cm²/g）：エネルギー（MeV）の表（必要な所だけ）
MU = {
    'Pb': {0.04: 14.36, 0.05: 8.041, 0.06: 5.021, 0.08: 2.419, 0.1: 5.549, 0.15: 2.014, 0.6: 0.1248, 0.8: 0.0887,
           1.0: 0.07102, 1.25: 0.05876, 1.5: 0.05222, 2.0: 0.04606},
    'Fe': {0.06: 1.205, 0.1: 0.3717, 0.6: 0.07704, 0.8: 0.06699, 1.0: 0.05995, 1.25: 0.0535},
    'Al': {0.06: 0.2778, 0.1: 0.1704, 0.6: 0.07802, 0.8: 0.06841, 1.0: 0.06146, 1.25: 0.05496},
    'water': {0.04: 0.2683, 0.05: 0.2269, 0.06: 0.2059, 0.08: 0.1837, 0.1: 0.1707, 0.15: 0.1505, 0.6: 0.08956,
              0.8: 0.07865, 1.0: 0.07072, 1.25: 0.06323},
    'conc': {0.06: 0.266, 0.1: 0.1738, 0.6: 0.08236, 0.8: 0.07227, 1.0: 0.06495, 1.25: 0.05807},
    'bone': {0.04: 0.6655, 0.05: 0.4242, 0.06: 0.3148, 0.08: 0.2229, 0.1: 0.1855, 0.15: 0.148, 0.6: 0.08332, 0.8: 0.07308},
    'tissue': {0.04: 0.2688, 0.05: 0.2264, 0.06: 0.2048, 0.08: 0.1823, 0.1: 0.1693, 0.15: 0.1492, 0.6: 0.08873, 0.8: 0.07793},
}
RHO = {'Pb': 11.35, 'Fe': 7.874, 'Al': 2.699, 'water': 1.0, 'conc': 2.30, 'bone': 1.92, 'tissue': 1.06}
MUEN_AIR = {0.6: 0.02953, 0.8: 0.02882}   # 空気の μen/ρ（原-14 で使う）


def mu_rho(mat, E):
    t = MU[mat]
    if E in t:
        return t[E]
    ks = sorted(t)
    for a, b in zip(ks, ks[1:]):
        if a < E < b:   # 両対数の補間（NIST の表の使い方）
            return math.exp(math.log(t[a]) + (math.log(t[b]) - math.log(t[a])) * (math.log(E) - math.log(a)) / (math.log(b) - math.log(a)))
    raise ValueError


def mu(mat, E):
    return mu_rho(mat, E) * RHO[mat]


print("== ③ 減弱・はてな？・例題1")
mb, mt = mu('bone', 0.06), mu('tissue', 0.06)
p("60 keV 骨 μ/ρ・μ 1/cm、軟組織 μ/ρ・μ 1/cm", mu_rho('bone', 0.06), mb, mu_rho('tissue', 0.06), mt)
p("2 cm 通って残る割合 骨・軟組織", math.exp(-2 * mb), math.exp(-2 * mt))
p("骨と軟組織の μ の比", mb / mt)
p("半価層 骨・軟組織 cm", math.log(2) / mb, math.log(2) / mt)
p("じぶんで1：1 cm 通って 骨・軟組織", math.exp(-mb), math.exp(-mt))
for E in (0.04, 0.05, 0.06, 0.08, 0.1, 0.15):
    p(f"  {E*1000:.0f} keV：骨/軟組織 の μ 比（グラフ）", mu('bone', E) / mu('tissue', E))
p("骨 1 cm＋軟組織 3 cm と 軟組織 4 cm（60 keV）の残る割合", math.exp(-mb - 3 * mt), math.exp(-4 * mt))
print("== 厚さ2倍・密度2倍（図）")
for x in (1, 2, 4):
    p(f"  軟組織 60 keV {x} cm で残る", math.exp(-mt * x))

print("== 例題2〜4（γ線の遮へい）")
for mat in ('Pb', 'Fe', 'water', 'conc', 'Al'):
    m_ = mu(mat, 0.662)
    p(f"0.662 MeV {mat}：μ/ρ・μ・半価層・1/10 価層 cm", mu_rho(mat, 0.662), m_, math.log(2) / m_, math.log(10) / m_)
for mat in ('Pb', 'Fe', 'water', 'conc'):
    m_ = mu(mat, 1.25)
    p(f"1.25 MeV {mat}：μ/ρ・μ・半価層・1/10 価層 cm", mu_rho(mat, 1.25), m_, math.log(2) / m_, math.log(10) / m_)
mc = mu('conc', 1.25)
p("例題4：コンクリート 1/1000 cm（=ln1000/μ）・半価層の何枚分", math.log(1000) / mc, math.log2(1000))
p("例題4 じぶん：鉛で 1/1000 cm", math.log(1000) / mu('Pb', 1.25))
p("例題2 じぶん：鉛 2 cm で残る割合（0.662）", math.exp(-2 * mu('Pb', 0.662)))
p("鉛 1 cm（0.662）で残る割合（原-14 例題6）", math.exp(-mu('Pb', 0.662)))
p("例題3 じぶん：鉄で 1/100 cm", math.log(100) / mu('Fe', 0.662))
p("面密度 1 g/cm² あたりで比べる（0.662 MeV）μ/ρ 鉛・鉄・水・コンクリート", mu_rho('Pb', .662), mu_rho('Fe', .662), mu_rho('water', .662), mu_rho('conc', .662))
p("同じ重さ（面密度 10 g/cm²）で残る割合 鉛・水", math.exp(-10 * mu_rho('Pb', .662)), math.exp(-10 * mu_rho('water', .662)))

print("== 例題5（100 keV 鉛と水）")
p("100 keV：鉛 μ・水 μ・比", mu('Pb', 0.1), mu('water', 0.1), mu('Pb', 0.1) / mu('water', 0.1))
p("鉛 0.25 mm（エプロン）で 100 keV が残る割合", math.exp(-mu('Pb', 0.1) * 0.025))
p("鉛 0.25 mm に等しい水の厚さ cm", mu('Pb', 0.1) * 0.025 / mu('water', 0.1))
p("じぶん5：60 keV で 鉛と水の比", mu('Pb', 0.06) / mu('water', 0.06))
p("鉛の K 吸収端：80 keV と 100 keV の μ/ρ", MU['Pb'][0.08], MU['Pb'][0.1])

print("== ④ コンプトン散乱・電子対生成（例題6）")


def compton(E, th):
    return E / (1 + E / meMeV * (1 - math.cos(math.radians(th))))


for th in (0, 30, 60, 90, 120, 180):
    p(f"0.662 MeV が {th}° 散乱 → 光子 MeV・電子 MeV", compton(0.662, th), 0.662 - compton(0.662, th))
for th in (90, 180):
    p(f"60 keV が {th}° 散乱 → 光子 keV", compton(0.06, th) * 1000)
for th in (90, 180):
    p(f"1.25 MeV が {th}° → 光子 MeV", compton(1.25, th))
p("電子対生成のしきい MeV、消える光子 MeV（1個ずつ）", 2 * meMeV, meMeV)
p("じぶん6：1.25 MeV（Co-60 の平均）・2.0 MeV で 電子と陽電子が分ける運動エネルギー MeV", 1.25 - 2 * meMeV, 2.0 - 2 * meMeV)

print("== ⑤ 荷電粒子（例題7・8）")
Ea = 5.30
Rg = 0.318 * Ea ** 1.5
p("α 5.30 MeV：ガイガーの式 cm", Rg)
# ASTAR（Air, Dry）CSDA 飛程 g/cm²：5.0 MeV 4.368e-3、5.5 MeV 5.048e-3。空気の密度 1.205e-3 g/cm³（20 ℃・1気圧：NIST 表2）
Ra = 4.368e-3 + (5.048e-3 - 4.368e-3) * (Ea - 5.0) / 0.5
p("ASTAR：5.30 MeV の CSDA 飛程 g/cm²・空気 cm", Ra, Ra / 1.205e-3)
for E_ in (4.0, 6.0, 7.69):
    p(f"  ガイガー α {E_} MeV cm", 0.318 * E_ ** 1.5)
p("α 5.3 MeV が体（水、密度1）で止まる深さ μm（ASTAR の空気 g/cm² ×(水/空気の阻止能の比 約1.0)の目安：省略）", "-")
Eb = 2.28
Rkp = 0.412 * Eb ** (1.265 - 0.0954 * math.log(Eb))
p("β 2.28 MeV：カッツ・ペンフォールド g/cm²・アルミ mm・水 mm", Rkp, Rkp / 2.699 * 10, Rkp / 1.0 * 10)
for E_ in (0.546, 1.0, 0.5):
    R_ = 0.412 * E_ ** (1.265 - 0.0954 * math.log(E_))
    p(f"  β {E_} MeV：g/cm²・アルミ mm・水 mm", R_, R_ / 2.699 * 10, R_ * 10)
# ESTAR アルミ CSDA：2.0 MeV 1.224、2.5 MeV 1.550 g/cm²
Re = 1.224 + (1.550 - 1.224) * (Eb - 2.0) / 0.5
p("ESTAR：2.28 MeV のアルミの CSDA 飛程 g/cm²・mm（道のりの長さ）", Re, Re / 2.699 * 10)
p("同じ速さで α と陽子：止める力の比 z²", 2 ** 2 / 1 ** 2)
p("同じ運動エネルギーの α と陽子：速さの2乗の比 v_p²/v_α²（質量比 3.97）、止める力の比 z²/v²", 3.97, 4 * 3.97)

print("== ⑦ ベーテの式とブラッグピーク（例題9）")
me_c2 = meMeV
Mp = 938.27208943
I_w = 75e-6   # 水の平均励起エネルギー 75 eV（PSTAR が使う値）
K = 0.307075  # MeV cm²/g（4π N_A r_e² m_e c²）
ZA_w = 10 / 18.015


def bethe(T):   # 陽子、水、MeV cm²/g（殻補正・密度効果なし）
    g = 1 + T / Mp
    b2 = 1 - 1 / g ** 2
    Wm = 2 * me_c2 * b2 * g * g / (1 + 2 * g * me_c2 / Mp + (me_c2 / Mp) ** 2)
    return K * ZA_w / b2 * (0.5 * math.log(2 * me_c2 * b2 * g * g * Wm / I_w ** 2) - b2)


PSTAR_S = {10: 45.67, 50: 12.45, 70: 9.559, 100: 7.289, 150: 5.445, 200: 4.492, 250: 3.911}
PSTAR_R = {10: 0.1230, 20: 0.4260, 50: 2.227, 70: 4.080, 100: 7.718, 150: 15.77, 200: 25.96, 225: 31.74, 250: 37.94}
for T in (10, 50, 70, 100, 150, 200, 250):
    p(f"陽子 {T} MeV：ベーテ S・PSTAR S（MeV cm²/g）", bethe(T), PSTAR_S[T])
for E_ in (70, 150, 230):
    Rbk = 0.0022 * E_ ** 1.77
    if E_ == 230:
        Rp = 31.74 + (37.94 - 31.74) * (230 - 225) / 25
    else:
        Rp = PSTAR_R[E_]
    p(f"陽子 {E_} MeV：ブラッグ・クリーマン cm・PSTAR cm", Rbk, Rp)
p("じぶん9：深さ 10 cm に止めるエネルギー（ブラッグ・クリーマン）MeV", (10 / 0.0022) ** (1 / 1.77))
p("PSTAR：100 MeV 7.72 cm と 150 MeV 15.77 cm の間で 10 cm → 補間 MeV", 100 + 50 * (10 - 7.718) / (15.77 - 7.718))
# ブラッグピーク：S(E)=E^(1-p)/(αp) で 0.1 mm ずつ進める
al, pp = 0.0022, 1.77


def S_bk(E):
    return E ** (1 - pp) / (al * pp)


p("ブラッグ・クリーマンの S(150 MeV) MeV/cm", S_bk(150))
E = 150.0
x = 0.0
dx = 0.001
dep = {}
while E > 0:
    dE = min(E, S_bk(E) * dx)
    k = int(x)   # 1 cm ごとに集める
    dep[k] = dep.get(k, 0) + dE
    E -= dE
    x += dx
p("150 MeV：止まる深さ cm（細かいきざみ）", x)
print("  1 cm ごとに置いたエネルギー（MeV）：", {k: round(v, 1) for k, v in dep.items()})
# 表計算（1 cm きざみ）の表
E = 150.0
rows = []
for i in range(0, 17):
    S_ = S_bk(E) if E > 0 else 0
    rows.append((i, E, S_))
    E = E - S_ * 1.0 if E > S_ else 0
print("  表計算（1 cm ごと）x, E, S：", [(r[0], round(r[1], 1), round(r[2], 2)) for r in rows])
p("入口と止まる直前（1 MeV）の S の比", S_bk(1) / S_bk(150))
p("陽子 150 MeV が入口で 1 cm に落とすエネルギー MeV と、止まる直前の S(5 MeV)", S_bk(150), S_bk(5))

print("== ⑧ 断面積・中性子（例題10・11）")
for A_, name in ((1, 'H'), (2, 'D'), (12, 'C'), (16, 'O'), (238, 'U')):
    a = ((A_ - 1) / (A_ + 1)) ** 2
    xi = 1.0 if A_ == 1 else 1 + a / (1 - a) * math.log(a)
    p(f"{name}（A={A_}）：正面衝突で残る α・ξ・2 MeV→0.025 eV の回数", a, xi, math.log(2e6 / 0.025) / xi)
p("ln(2e6/0.025)", math.log(2e6 / 0.025))
p("H：1回で平均して半分 → 2 MeV を 0.025 eV にするのに 2^n：n", math.log2(2e6 / 0.025))
Nw = 1.0 / 18.015 * NA
Sa = Nw * 2 * 0.3326e-24
p("水の分子の数密度 /cm³・H 原子 /cm³", Nw, 2 * Nw)
p("水：Σa（H だけ）1/cm・平均の道のり cm", Sa, 1 / Sa)
Sa_O = Nw * 0.00019e-24
p("（参考）酸素の吸収 0.19 mb を足すと Σa", Sa + Sa_O)
# 例題11 じぶん：重水 D 0.000519 b（〔要〕なので使わない）→ じぶんは鉛ではなく「ホウ素」も〔要〕。じぶんは同じ式で 10 cm 進んで吸収されない割合
p("じぶん11：水の中を 10 cm・45 cm・100 cm 進んで、まだ吸収されない割合", math.exp(-Sa * 10), math.exp(-Sa * 45), math.exp(-Sa * 100))
# 光子の μ を断面積で読む：鉛 0.662 MeV の原子1個あたりの断面積 b
NPb = 11.35 / 207.2 * NA
p("鉛：原子の数密度 /cm³・0.662 MeV の原子1個の断面積 b", NPb, mu('Pb', 0.662) / NPb / 1e-24)
Nh2o = 1.0 / 18.015 * NA
p("水：分子1個の断面積（0.662 MeV）b", mu('water', 0.662) / Nh2o / 1e-24)
p("平均自由行程 1/μ：鉛・水（0.662 MeV）cm", 1 / mu('Pb', 0.662), 1 / mu('water', 0.662))

print("== ⑨ 放射化（例題12）")
N59 = 1.0 / 58.933 * NA
s59 = 37.18e-24
phi = 1e13
T60 = 5.27 * year
lam = math.log(2) / T60
Asat = N59 * s59 * phi
p("Co-59 1 g：原子の数・Nσφ（飽和）Bq", N59, Asat)
for ty in (1, 5.27, 10.54, 15.81, 20):
    p(f"  {ty} 年照射：A Bq・飽和の割合", Asat * (1 - math.exp(-lam * ty * year)), 1 - math.exp(-lam * ty * year))
p("1年で使った Co-59 の割合（燃えつきの見積もり）", s59 * phi * year)
p("じぶん12：1か月（30日）・半年で A Bq", Asat * (1 - math.exp(-lam * 30 * 86400)), Asat * (1 - math.exp(-lam * 0.5 * year)))
p("じぶん12：照射を止めて 5.27 年後（20年照射）Bq", Asat * (1 - math.exp(-lam * 20 * year)) / 2)

print("== 例題13（密度計）")
mw = mu('water', 0.662)
p("水 10 cm：残る割合・空/水の比", math.exp(-10 * mw), math.exp(10 * mw))
p("じぶん13：油（密度 0.85）なら残る割合・比（μ/ρ は水と同じとみる）", math.exp(-10 * mw * 0.85), math.exp(10 * mw * 0.85))
p("密度が 1.00→1.01 で計数が変わる割合 %", (1 - math.exp(-10 * mw * 0.01)) * 100)

print("== ⑩ 2倍の図・飽和")
for n in (1, 2, 3, 4):
    p(f"  照射 {n} 半減期：飽和の割合", 1 - 0.5 ** n)

print("== ② 電離（W 値 34 eV）")
for E_ in (5.3e6, 1e6, 0.662e6):
    p(f"  {E_/1e6} MeV で作るイオンの組の数（34 eV）", E_ / 34)

print("== 章末問題")
p("基本1：アルミ（0.662 MeV）μ・半価層 cm", mu('Al', 0.662), math.log(2) / mu('Al', 0.662))
p("基本2：半価層 3 枚 → 残る割合、1/16 にする枚数", 0.5 ** 3, 4)
p("基本3：μ=0.5/cm の物 3 cm で残る割合・半価層", math.exp(-1.5), math.log(2) / 0.5)
p("基本4：コンプトン 0.662 MeV を 180° → 光子 MeV・電子 MeV", compton(0.662, 180), 0.662 - compton(0.662, 180))
p("基本5：α 4.0 MeV（ガイガー）cm", 0.318 * 4.0 ** 1.5)
p("基本6：中性子 1 MeV を水素で 0.025 eV に：回数", math.log(1e6 / 0.025))
p("チャレンジ1：鉛 1 cm＋鉄 5 cm（0.662）で残る割合、同じ割合にする鉛だけの厚さ cm",
  math.exp(-mu('Pb', .662) - 5 * mu('Fe', .662)), (mu('Pb', .662) + 5 * mu('Fe', .662)) / mu('Pb', .662))
p("チャレンジ2：照射 2 半減期 → 止めて 1 半減期：飽和の何倍", 0.75 * 0.5)
p("チャレンジ3：炭素で 2 MeV → 1 eV の回数", math.log(2e6 / 1) / (1 + ((11 / 13) ** 2) / (1 - (11 / 13) ** 2) * math.log((11 / 13) ** 2)))
p("チャレンジ4：陽子 100 MeV のブラッグ・クリーマン飛程 cm・PSTAR 7.72", 0.0022 * 100 ** 1.77)

print("== 章末問題（差しかえ後）")
p("基本1：鉛の半価層 0.55 cm を3枚（1.65 cm）で残る割合・1/16 の厚さ cm", 0.5 ** 3, 4 * 0.55)
p("基本3：1.25 MeV が 90° 散乱：光子 MeV・電子 MeV", compton(1.25, 90), 1.25 - compton(1.25, 90))
p("基本4：α 6.0 MeV（ガイガー）cm", 0.318 * 6.0 ** 1.5)
aO = ((16 - 1) / 17) ** 2
p("基本5：2 MeV 中性子が酸素と正面衝突：残る割合・MeV", aO, 2 * aO)
p("基本6：3.0 MeV の電子対生成：運動エネルギーの合計 MeV", 3.0 - 2 * meMeV)
R100 = 0.0022 * 100 ** 1.77
p("チャレンジ4：陽子 100 MeV の飛程 cm・水 5 cm 進んだあとの E MeV", R100, ((R100 - 5) / 0.0022) ** (1 / 1.77))
p("例題9：70・150・230 の 1.77 乗", 70 ** 1.77, 150 ** 1.77, 230 ** 1.77)

print("== もっと知りたい：CT の 2×2 のます目")
a_, b_, c_, d_ = 0.22, 0.60, 0.22, 0.22
p("横（上・下）・たて（左・右）・ななめ 1.41(a+d)", a_ + b_, c_ + d_, a_ + c_, b_ + d_, 1.41 * (a_ + d_))
import numpy as _np
Mx = _np.array([[1, 1, 0, 0], [0, 0, 1, 1], [1, 0, 1, 0], [0, 1, 0, 1], [1.41, 0, 0, 1.41]], float)
y = _np.array([0.82, 0.44, 0.44, 0.82, 0.62])
sol = _np.linalg.lstsq(Mx, y, rcond=None)[0]
p("連立方程式の答え a・b・c・d", *[float(v) for v in sol])
p("たて・横だけの行列の階数（4 未満なら決まらない）", int(_np.linalg.matrix_rank(Mx[:4])))

print("== モンテカルロ（表計算の例）")
import random
random.seed(13)
mu_mc = mt   # 60 keV 軟組織
paths = [-math.log(1 - random.random()) / mu_mc for _ in range(1000)]
for xx in (1, 2, 3, 5, 10):
    p(f"  1000 個で x={xx} cm より先まで行く数・e^-μx×1000", sum(s > xx for s in paths), 1000 * math.exp(-mu_mc * xx))
random.seed(5)
rr = [round(random.random(), 3) for _ in range(8)]
print("  見本の乱数：", rr, " 道のり cm：", [round(-math.log(1 - r) / mu_mc, 2) for r in rr])
p("平均の道のり（1/μ）cm", 1 / mu_mc)
