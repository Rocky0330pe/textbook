# 物理第5巻 原-11「質量はエネルギー：相対論と原子核」の数値の検算（組 原W6）。
# 使い方：python3 calc_p5_11.py > calc_p5_11_out.txt
# 定数：CODATA 2022（NIST allascii.txt〔確〕。計画書 C-3 と同じ）。
# 原子の質量：NIST "Atomic Weights and Isotopic Compositions"（AME2020 にもとづく相対原子質量）。
#   11月11日に physics.nist.gov/cgi-bin/Compositions/stand_alone.pl?ele=…&isotype=all を読み、
#   同じフォルダの nist_masses_20261111.json に保存した〔確〕。
# ミューオンの平均寿命 2.1969803 μs：MuLan, arXiv:1211.0960〔確〕。
# GPS の軌道半径 26560 km（高さ 20200 km）：ESA Navipedia "GPS Space Segment"〔確：検索の抜粋〕、波-14 の 20200 km と同じ。
# 地球の GM＝3.986004418e14 m^3/s^2（WGS84・IERS の値）〔要確認：一次資料に届かず。計画書と同じ値〕。
# π中間子の質量 約 140 MeV（139.57 MeV）〔要確認：PDG に届かず〕。
# 半経験的質量公式の係数（15.8・18.3・0.714・23.2・12.0 MeV）〔要確認：教科書ごとに少しちがう一例〕。
# 太陽の明るさ 3.828e26 W：IAU 2015 Resolution B3（arXiv:1510.07674）〔確〕。
import json, math, os

here = os.path.dirname(os.path.abspath(__file__))
NIST = {k: float(v[0]) for k, v in json.load(open(os.path.join(here, 'nist_masses_20261111.json'))).items()}
NIST['H2'] = NIST['D2']; NIST['H3'] = NIST['T3']
M = NIST
pi = math.pi
h = 6.62607015e-34; hbar = h / (2 * pi); e = 1.602176634e-19; c = 299792458.0
me = 9.1093837139e-31; u = 1.66053906892e-27; uMeV = 931.49410372; meMeV = 0.51099895069
mpMeV = 938.27208943; mnMeV = 939.56542194; mn_u = 1.00866491606
alpha = 7.2973525643e-3; hbarc = 197.3269804; NA = 6.02214076e23
year = 365.25 * 86400; day = 86400
c3 = 3.00e8   # 本文の丸め


def p(label, *vals):
    out = []
    for v in vals:
        out.append(f"{float(v):.6g}" if isinstance(v, (int, float)) else str(v))
    print(f"{label}: " + ", ".join(out))


def B(Z, N, key):
    """結合エネルギー MeV（原子の質量から。電子の結合エネルギーは無視）"""
    return (Z * M['H1'] + N * mn_u - M[key]) * uMeV


print('== 定数の丸めの確かめ')
p('1 u（MeV）', uMeV)
p('m_e c^2・m_p c^2・m_n c^2（MeV）', meMeV, mpMeV, mnMeV)
p('1 u の質量を c=3.00e8 でエネルギーに（J）・（MeV）', u * c3 ** 2, u * c3 ** 2 / e / 1e6)
p('h/(m_e c)（pm）', h / (me * c) * 1e12)

print('\n== ② E=mc^2 の桁')
p('1 g の質量のエネルギー J（c=3.00e8）・kWh', 1e-3 * c3 ** 2, 1e-3 * c3 ** 2 / 3.6e6)
p('炭素 1 個が燃える 約 4 eV〔目安〕と 核分裂 1 回 約 200 MeV の比', 200e6 / 4)
p('1 J に対応する質量 kg', 1 / c ** 2)

print('\n== ③ 原子核の大きさ・例題1（原子核の密度）')
r0 = 1.2
for Ak, A in (('He4', 4), ('C12', 12), ('Fe56', 56), ('Au197', 197), ('U238', 238), ('Al27', 27)):
    p(f'{Ak} の半径 fm（r0=1.2）', r0 * A ** (1 / 3))
rho = u / (4 / 3 * pi * (r0 * 1e-15) ** 3)
p('核子 1 個あたりの体積から密度 kg/m3（u/(4/3 π r0^3)）', rho)
p('1 cm3 の質量 kg・トン', rho * 1e-6, rho * 1e-6 / 1e3)
p('金197 の半径・原子（0.1 nm）との比', r0 * 197 ** (1 / 3), 0.1e-9 / (r0 * 197 ** (1 / 3) * 1e-15))
p('じぶんでとこう1：鉄56 の半径 fm・原子 0.1 nm との比', r0 * 56 ** (1 / 3), 0.1e-9 / (r0 * 56 ** (1 / 3) * 1e-15))
p('2倍の図：質量数2倍で半径', 2 ** (1 / 3))

print('\n== ④⑤ 例題2：結合エネルギー（NIST の質量）')
for name, Z, N_ in (('H2', 1, 1), ('He4', 2, 2), ('C12', 6, 6), ('O16', 8, 8), ('Fe56', 26, 30), ('Ni62', 28, 34),
                    ('U235', 92, 143), ('U238', 92, 146)):
    dm = Z * M['H1'] + N_ * mn_u - M[name]
    p(f'{name}：質量欠損 u・B MeV・1核子あたり MeV', dm, dm * uMeV, dm * uMeV / (Z + N_))
p('He4 の質量の勘定：2×H1・2×n・合計', 2 * M['H1'], 2 * mn_u, 2 * M['H1'] + 2 * mn_u)
p('He4 の質量欠損の割合 %', (2 * M['H1'] + 2 * mn_u - M['He4']) / (2 * M['H1'] + 2 * mn_u) * 100)
p('丸め：0.0304 u × 931.5', 0.0304 * 931.5)

print('\n== ⑤ 結合エネルギーの曲線のデータ（図）')
curve = 'H2 He3 He4 Li6 Li7 Be9 B10 B11 C12 N14 O16 F19 Ne20 Na23 Mg24 Al27 Si28 P31 S32 Cl35 Ar40 Ca40 Fe56 Ni62 Cu63 Zn64 Kr84 Sr88 Zr90 Mo98 Ag107 Sn120 I127 Xe132 Ba138 Ce140 Nd142 Gd158 W184 Au197 Pb208 Bi209 Th232 U238'.split()
Zof = dict(H=1, He=2, Li=3, Be=4, B=5, C=6, N=7, O=8, F=9, Ne=10, Na=11, Mg=12, Al=13, Si=14, P=15, S=16, Cl=17, Ar=18, Ca=20,
           Fe=26, Ni=28, Cu=29, Zn=30, Kr=36, Sr=38, Zr=40, Mo=42, Ag=47, Sn=50, I=53, Xe=54, Ba=56, Ce=58, Nd=60, Gd=64, W=74,
           Au=79, Pb=82, Bi=83, Th=90, U=92)
pts = []
for k in curve:
    import re
    s, A = re.match(r'([A-Za-z]+)(\d+)', k).groups(); A = int(A); Z = Zof[s]
    b = B(Z, A - Z, k) / A
    pts.append((A, b))
print('coordinates {' + ' '.join(f'({A},{b:.3f})' for A, b in pts) + '}')
best = max(pts, key=lambda t: t[1]); p('いちばん大きい（A, MeV）', *best)

print('\n== ⑥ 例題3：Q 値')
Q_DT = (M['H2'] + M['H3'] - M['He4'] - mn_u) * uMeV
p('D+T→He4+n：Δm u・Q MeV', M['H2'] + M['H3'] - M['He4'] - mn_u, Q_DT)
p('  中性子が持つ分（運動量保存、質量比 4:1）MeV・He4 の分', Q_DT * 4 / 5, Q_DT / 5)
Q_U = (M['U235'] + mn_u - M['Ba141'] - M['Kr92'] - 3 * mn_u) * uMeV
p('U235+n→Ba141+Kr92+3n：Δm u・Q MeV', M['U235'] + mn_u - M['Ba141'] - M['Kr92'] - 3 * mn_u, Q_U)
p('  U235 の質量に対する割合 %', (M['U235'] + mn_u - M['Ba141'] - M['Kr92'] - 3 * mn_u) / (M['U235'] + mn_u) * 100)
p('  D+T の質量に対する割合 %', (M['H2'] + M['H3'] - M['He4'] - mn_u) / (M['H2'] + M['H3']) * 100)
Q_DD = (2 * M['H2'] - M['He3'] - mn_u) * uMeV
p('じぶんでとこう3：D+D→He3+n：Δm u・Q MeV', 2 * M['H2'] - M['He3'] - mn_u, Q_DD)
Q_Li = (M['Li7'] + M['H1'] - 2 * M['He4']) * uMeV
p('章末 基本：Li7+p→2He4（コッククロフト・ウォルトン）Δm u・Q MeV', M['Li7'] + M['H1'] - 2 * M['He4'], Q_Li)
Q_n = (mn_u - M['H1']) * uMeV
p('⑥本文・章末：中性子→陽子+電子（原子の質量で n − H1）Q MeV', Q_n)
p('  粒子の質量で m_n − m_p − m_e MeV', mnMeV - mpMeV - meMeV)
Q_C14 = (M['C14'] - M['N14']) * uMeV
p('⑥本文：C14→N14（β）Q MeV（原子の質量の差）', Q_C14)

print('\n== 例題4：太陽（はてな？）')
dm4 = 4 * M['H1'] - M['He4']
Q4 = dm4 * uMeV
p('4H1−He4：Δm u・Q MeV・割合 %', dm4, Q4, dm4 / (4 * M['H1']) * 100)
L = 3.828e26
p('1秒に減る質量 kg（L/c^2）', L / c ** 2)
p('1秒の反応の回数・使う水素 kg（4×H1）', L / (Q4 * 1e6 * e), L / (Q4 * 1e6 * e) * 4 * M['H1'] * u)
p('  水素÷減る質量（=1/0.00712）', (L / (Q4 * 1e6 * e) * 4 * M['H1'] * u) / (L / c ** 2))
p('じぶんでとこう4：水素 1 kg が全部ヘリウムに：J（割合 0.712 %、c=3.00e8）', 0.00712 * 1 * c3 ** 2)
p('  正確に', dm4 / (4 * M['H1']) * c ** 2)

print('\n== ⑦ 例題5：ミューオン')
tau_mu = 2.1969803e-6
for beta in (0.995, 0.98):
    g = 1 / math.sqrt(1 - beta ** 2)
    p(f'β={beta}：γ・寿命 μs・距離（遅れなし）km・距離（遅れあり）km', g, g * tau_mu * 1e6, beta * c * tau_mu / 1e3, beta * c * g * tau_mu / 1e3)
p('丸め：0.995×3.00e8×2.2e-6 m・×10', 0.995 * 3e8 * 2.2e-6, 0.995 * 3e8 * 2.2e-6 * 10)
p('2倍の図：v=0.5c と 0.866c の γ', 1 / math.sqrt(1 - 0.25), 1 / math.sqrt(1 - 0.866 ** 2))
for b in (0.1, 0.3, 0.5, 0.6, 0.8, 0.866, 0.9, 0.95, 0.99):
    p(f'γ(β={b})', 1 / math.sqrt(1 - b * b))
p('近似 1+β^2/2（β=0.1・0.3・0.6）', 1 + 0.005, 1 + 0.045, 1 + 0.18)

print('\n== ⑦ 例題6：GPS')
GM = 3.986004418e14; RE = 6.371e6; rG = 26560e3
vG = math.sqrt(GM / rG)
sp = -0.5 * vG ** 2 / c ** 2 * day * 1e6
gr = GM / c ** 2 * (1 / RE - 1 / rG) * day * 1e6
p('衛星の速さ m/s・1周の時間 h', vG, 2 * pi * rG / vG / 3600)
p('速さによる遅れ μs/日・重力の差による進み μs/日・合計', sp, gr, sp + gr)
p('合計を距離に km', (sp + gr) * 1e-6 * c / 1e3)
p('丸め：v=3.87e3、c=3.00e8 で −v²/(2c²)×86400 μs', -0.5 * 3.87e3 ** 2 / 3e8 ** 2 * day * 1e6)
vI = 7.7e3
p('じぶんでとこう6：国際宇宙ステーション v=7.7 km/s の遅れ μs/日', -0.5 * vI ** 2 / c3 ** 2 * day * 1e6)

print('\n== ⑦ 例題7：速度の合成')
add = lambda a, b: (a + b) / (1 + a * b)
p('0.6+0.6・0.5+0.5・0.9+0.9・1+0.5', add(0.6, 0.6), add(0.5, 0.5), add(0.9, 0.9), add(1, 0.5))
p('100 km/h 同士（m/s）のずれ：u+v−合成', (lambda a, b: (a + b) - (a + b) / (1 + a * b / c ** 2))(100 / 3.6, 100 / 3.6))
p('章末 チャレンジ：0.8c の γ・地上 1 年で船内・100 m の船', 1 / math.sqrt(1 - 0.64), math.sqrt(1 - 0.64), 100 * math.sqrt(1 - 0.64))

print('\n== ⑧ 例題8：電子の速さ（電-2 の約束）')
for kV in (1, 100, 1000):
    K = kV * 1e-3   # MeV
    g = 1 + K / meMeV
    bc = math.sqrt(2 * K / meMeV)
    p(f'{kV} kV：γ・v/c（相対論）・v/c（ニュートン）', g, math.sqrt(1 - 1 / g ** 2), bc)
p('K=m c^2 のとき v/c・pc MeV（章末）', math.sqrt(1 - 1 / 4), math.sqrt(3) * meMeV)

print('\n== ⑧ 例題9：1 MeV の電子の運動量')
K = 1.0
E = K + meMeV
pc = math.sqrt(E ** 2 - meMeV ** 2)
p('E MeV・pc MeV・p kg m/s・v/c', E, pc, pc * 1e6 * e / c, pc / E)
p('ニュートンの式 p=√(2mK) で pc MeV', math.sqrt(2 * meMeV * K))
Kp = 1000.0
Ep = Kp + mpMeV
p('じぶんでとこう9：運動エネルギー 1000 MeV の陽子 pc MeV・v/c', math.sqrt(Ep ** 2 - mpMeV ** 2), math.sqrt(Ep ** 2 - mpMeV ** 2) / Ep)
p('v≪c：E≈mc²+½mv² の確かめ（電子 1 kV）K の式どうしの差 eV', ((1 / math.sqrt(1 - (0.0625) ** 2) - 1) * meMeV - 0.5 * meMeV * 0.0625 ** 2) * 1e6)

print('\n== ⑧ 例題10：コンプトン')
lc = h / (me * c)
for th in (90, 180, 60):
    dl = lc * (1 - math.cos(math.radians(th)))
    Eg = 0.662
    Ep_ = Eg / (1 + Eg / meMeV * (1 - math.cos(math.radians(th))))
    p(f'θ={th}：Δλ pm・0.662 MeV のγ線の散乱後 MeV・電子が受けとる MeV', dl * 1e12, Ep_, Eg - Ep_)
p('0.662 MeV の波長 pm（hc=1240 eV nm）', 1240 / 0.662e6 * 1e3)
p('章末 チャレンジ：電子と陽電子が止まって消える 0.511 MeV の光の波長 pm', 1239.84198 / meMeV / 1e6 * 1e3)

print('\n== ⑨ 例題11：光のドップラー')
dop = lambda b: math.sqrt((1 - b) / (1 + b))
p('遠ざかる β=0.1：f/f0・音の式 1/(1+β)・近似 1−β', dop(0.1), 1 / 1.1, 0.9)
p('近づく β=0.1：f/f0', dop(-0.1))
p('Hα 656.3 nm 遠ざかる 0.1c の波長 nm', 656.3 / dop(0.1))
lam1 = 663.0; lam0 = 656.3
r = (lam1 / lam0) ** 2
beta = (r - 1) / (r + 1)
p('じぶんでとこう11：663.0 nm に見えた β・速さ m/s・近似 Δλ/λ', beta, beta * c, (lam1 - lam0) / lam0)
for b in (0.0, 0.2, 0.4, 0.6, 0.8):
    p(f'グラフ：β={b} の f/f0・音 1/(1+β)・1−β', dop(b), 1 / (1 + b), 1 - b)

print('\n== ⑩ 例題12：核力の距離')
k = 8.99e9; ee = 1.60e-19
for r_fm in (1, 2, 3):
    F = k * ee ** 2 / (r_fm * 1e-15) ** 2
    U = k * ee ** 2 / (r_fm * 1e-15) / e / 1e6
    p(f'陽子どうし {r_fm} fm：力 N・位置エネルギー MeV', F, U)
p('湯川：ħc/(m_π c^2) fm（139.57）・（140）', hbarc / 139.57, hbarc / 140)
p('e²/(4πε0) MeV fm', alpha * hbarc)
p('陽子にはたらく重さとの比（230 N ÷ m_p g）', 230 / (1.6726e-27 * 9.8))

print('\n== ⑩ 例題13：半経験的質量公式')
aV, aS, aC, aA, aP = 15.8, 18.3, 0.714, 23.2, 12.0


def semf(A, Z, parts=False):
    N_ = A - Z
    d = aP / math.sqrt(A) if (Z % 2 == 0 and N_ % 2 == 0) else (-aP / math.sqrt(A) if (Z % 2 and N_ % 2) else 0)
    t = (aV * A, -aS * A ** (2 / 3), -aC * Z * (Z - 1) / A ** (1 / 3), -aA * (A - 2 * Z) ** 2 / A, d)
    return t if parts else sum(t)


for A_, Z_, key in ((56, 26, 'Fe56'), (238, 92, 'U238'), (208, 82, 'Pb208'), (62, 28, 'Ni62'), (16, 8, 'O16'), (4, 2, 'He4')):
    t = semf(A_, Z_, True)
    p(f'A={A_} Z={Z_}：体積・表面・クーロン・対称・対・合計・実際（NIST）・1核子あたり（式）', *t, sum(t), B(Z_, A_ - Z_, key), sum(t) / A_)
print('半経験式の曲線（いちばん安定な Z を整数で選ぶ）：')
pts2 = []
for A_ in list(range(12, 241, 4)):
    Zs = max(range(1, A_), key=lambda Z_: semf(A_, Z_))
    pts2.append((A_, semf(A_, Zs) / A_))
print('coordinates {' + ' '.join(f'({A},{b:.3f})' for A, b in pts2) + '}')
# 項ごとの1核子あたり（グラフ用、Z は A/(2+0.0153A^{2/3}) の近似）
print('項ごとの 1核子あたり（体積・表面・クーロン・対称）：')
for A_ in (10, 20, 40, 60, 100, 150, 200, 240):
    Z_ = A_ / (2 + 0.0153 * A_ ** (2 / 3))
    p(f'  A={A_} Z≈{Z_:.1f}', aV, -aS / A_ ** (1 / 3), -aC * Z_ * (Z_ - 1) / A_ ** (4 / 3), -aA * (A_ - 2 * Z_) ** 2 / A_ ** 2)
# 分裂：A=236 が 118×2 に分かれるときのエネルギー（式）
p('式で U236 → 2×Pd118（Z=46）の Q MeV', semf(118, 46) * 2 - semf(236, 92))

print('\n== 章末問題')
p('基本1：O16 B MeV・1核子あたり', B(8, 8, 'O16'), B(8, 8, 'O16') / 16)
p('基本：Al27 の半径 fm', 1.2 * 27 ** (1 / 3))
p('基本：U238 の半径 fm', 1.2 * 238 ** (1 / 3))
p('基本：1 g → J・kWh', 9.0e13, 9.0e13 / 3.6e6)

print('\n== はてな？：太陽が石炭のように燃えていたら')
Msun = 1.3271244e20 / 6.67430e-11   # IAU 2015 B3 の GM（名目値）÷ G（CODATA 2022）
p('太陽の質量 kg', Msun)
p('石炭 3e7 J/kg〔仮〕で全部燃やした熱 J・3.83e26 W で何年', 2.0e30 * 3e7, 2.0e30 * 3e7 / 3.83e26 / year)
print('\n== ② 水素が燃える（NIST WebBook：水の生成エンタルピー −285.83 kJ/mol〔確〕）')
dH = 285.83e3
p('1分子あたり eV', dH / NA / e)
p('質量の割合（水 18.01 u の静止エネルギーに対して）', dH / NA / e / (18.0106 * uMeV * 1e6))
p('お湯 1 kg を 80 K 温める熱 J・その質量 kg', 4.18e3 * 80, 4.18e3 * 80 / c3 ** 2)
p('100 W の電球を 9.0e13 J で何年', 9.0e13 / 100 / year)
print('\n== 章末 チャレンジ：Hβ 486.1 nm が 481.2 nm に（近づく）')
r = (481.2 / 486.1) ** 2
b = (1 - r) / (1 + r)
p('β・速さ m/s', b, b * c)
p('章末 チャレンジ：Pb208 の式と実際・クーロンの項', semf(208, 82), B(82, 126, 'Pb208'), semf(208, 82, True)[2])
p('章末 基本：Al27 と U238 の体積の比', 238 / 27)
p('陽子・電子の質量 u', mpMeV / uMeV, meMeV / uMeV)
p('H1 原子 = 陽子+電子−13.6 eV の確かめ u', (mpMeV + meMeV - 13.6e-6) / uMeV, M['H1'])
p('B/A：Fe56 と U238 の差 × 236', (8.79 - 7.57) * 236)
p('章末 基本：D+D→T+p：Δm u・Q MeV', 2 * M['H2'] - M['H3'] - M['H1'], (2 * M['H2'] - M['H3'] - M['H1']) * uMeV)
p('  6けたの値で：2×2.014102−3.016049−1.007825・×931.5', 2 * 2.014102 - 3.016049 - 1.007825, (2 * 2.014102 - 3.016049 - 1.007825) * 931.5)
p('章末 チャレンジ：0.511 MeV の光子の波長 pm（hc=1240 eV nm）', 1240 / 0.511e6 * 1e3)
