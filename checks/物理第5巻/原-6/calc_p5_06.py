# 物理第5巻 原-6「壁をすりぬける：トンネル効果と調和振動子」の数値の検算（組 原W3）
# 使い方：python3 calc_p5_06.py > calc_p5_06_out.txt
# 定数は CODATA 2022（NIST）。分子の値は NIST Chemistry WebBook（Huber & Herzberg の2原子分子の定数、11月11日に読んだ）：
#   CO  X¹Σ⁺：ωe=2169.81358, ωexe=13.28831 cm⁻¹ → 0→1 の吸収 ωe−2ωexe=2143.24 cm⁻¹、re=1.128323 Å
#   HCl X¹Σ⁺（H³⁵Cl）：ωe=2990.946, ωexe=52.8186 cm⁻¹ → 2885.31 cm⁻¹、re=1.27455 Å
#   N₂  X¹Σg⁺：ωe=2358.57, ωexe=14.324 cm⁻¹ → 2329.92 cm⁻¹
# 原子の質量は NIST（AME2020）：¹H 1.00782503223、²H 2.01410177812、¹²C 12、¹⁶O 15.99491461957、³⁵Cl 34.968852682、¹⁴N 14.00307400443 u。
import math
import numpy as np

pi = math.pi
h = 6.62607015e-34
hbar = h / (2 * pi)
e = 1.602176634e-19
c = 299792458.0
me = 9.1093837139e-31
kB = 1.380649e-23
u = 1.66053906892e-27
hc = h * c / e * 1e9           # eV nm
hb2m = hbar**2 / (2 * me) / e * 1e18   # eV nm^2 = 0.0381
K1 = math.sqrt(1 / hb2m)       # κ〔1/nm〕= K1 √(U−E〔eV〕)


def p(label, *v):
    print(label + ':', *v)


def kappa(dU):
    return K1 * math.sqrt(dU)


def T_exact(E, U0, a):
    """四角い壁（高さ U0、厚さ a nm）を E<U0 の電子が通りぬける割合"""
    k = kappa(U0 - E)
    s = math.sinh(k * a)
    return 1 / (1 + U0**2 * s**2 / (4 * E * (U0 - E)))


def T_approx(E, U0, a):
    return math.exp(-2 * kappa(U0 - E) * a)


p('ħ²/(2mₑ) eV nm²', round(hb2m, 5), ' κ の係数 1/nm', round(K1, 4))

print('\n== 例題1 フラッシュメモリの酸化膜（3.2 eV）')
k = kappa(3.2)
p('κ 1/nm', round(k, 3), ' 1/κ nm', round(1 / k, 4))
for a in (2, 5, 8):
    p(f'a={a} nm：e^(−2κa)', f'{math.exp(-2 * k * a):.2e}')
f_hit = 1e13      # 〔仮〕1秒に壁に当たる回数
yr10 = 10 * 365.25 * 24 * 3600
p('10年 s', f'{yr10:.3e}', ' 当たる回数', f'{f_hit * yr10:.2e}')
for a in (2, 5, 8):
    P = math.exp(-2 * k * a)
    p(f'a={a}：1秒にぬける割合・ぬけるまでの時間の目安 s', f'{f_hit * P:.2e}', f'{1 / (f_hit * P):.2e}')
p('2 nm：ぬけるまで 分', round(1 / (f_hit * math.exp(-2 * k * 2)) / 60, 1))
for a in (1, 2):
    p(f'jibun1：壁 1 eV、a={a} nm', f'{math.exp(-2 * kappa(1) * a):.2e}')
# 書きこみ：10 MV/cm＝1 V/nm の電場で、三角の壁の厚さ U/(eE)
p('書きこむとき：1 V/nm で三角の壁の厚さ nm', 3.2 / 1.0)
p('有効質量 0.42 倍なら κ の倍率', round(math.sqrt(0.42), 3), ' 8 nm の e^(−2κa)', f'{math.exp(-2 * k * math.sqrt(0.42) * 8):.1e}')

print('\n== ② 例題2 階段の反射')
def R_step(E, U):
    k1 = math.sqrt(E)
    k2 = math.sqrt(E - U)
    return ((k1 - k2) / (k1 + k2))**2
for E, U in ((2, 1), (1.5, 1), (4, 3), (1.1, 1), (10, 1)):
    R = R_step(E, U)
    p(f'E={E} U={U}：k2/k1・R・T', round(math.sqrt((E - U) / E), 4), round(R, 4), round(1 - R, 4))
k1 = math.sqrt(2); k2 = 1.0
p('T＝4k1k2/(k1+k2)²', round(4 * k1 * k2 / (k1 + k2)**2, 4))

print('\n== 例題3 壁の正確な透過率と近似')
for a in (0.5, 1.0, 0.7, 0.3):
    te, ta = T_exact(1, 2, a), T_approx(1, 2, a)
    pref = 16 * 1 * 1 / 4
    p(f'U=2 E=1 a={a}：正確・e^(−2κa)・16E(U−E)/U²×e^(−2κa)', f'{te:.4g}', f'{ta:.4g}', f'{pref * ta:.4g}')
p('κ（U−E=1）1/nm', round(kappa(1), 3), ' sinh(κ·0.5)', round(math.sinh(kappa(1) * 0.5), 4), ' sinh(κ·1)', round(math.sinh(kappa(1) * 1.0), 3))

print('\n== 例題4 STM')
k = kappa(4.5)
p('κ 1/nm', round(k, 3))
for d in (0.1, 0.05, -0.3):
    p(f'針を {d} nm 近づける：電流の倍率 e^(2κd)', round(math.exp(2 * k * d), 4))
p('10倍になる近づき nm', round(math.log(10) / (2 * k), 4))
p('B：κ（U−E=1・4 eV）', round(kappa(1), 3), round(kappa(4), 3))
for dU in (1, 4):
    p(f'B：U−E={dU} で e^(−2κa)=1e−10 となる a nm', round(math.log(1e10) / (2 * kappa(dU)), 3))

print('\n== ⑥ 例題5・12 有限の井戸')
def finite_well(U0, a, n_max=10):
    """深さ U0〔eV〕・幅 a〔nm〕の井戸。底から測ったエネルギー〔eV〕のリスト"""
    z0 = (a / 2) * K1 * math.sqrt(U0)
    roots = []
    def f_even(z): return z * math.tan(z) - math.sqrt(z0**2 - z**2)
    def f_odd(z): return -z / math.tan(z) - math.sqrt(z0**2 - z**2)
    for j in range(0, 40):
        lo = j * pi / 2 + 1e-9
        hi = min((j + 1) * pi / 2 - 1e-9, z0 - 1e-12)
        if lo >= hi:
            break
        f = f_even if j % 2 == 0 else f_odd
        if f(lo) * f(hi) < 0:
            for _ in range(200):
                mid = (lo + hi) / 2
                if f(lo) * f(mid) <= 0:
                    hi = mid
                else:
                    lo = mid
            roots.append(mid)
    E = [(z * 2 / a)**2 * hb2m for z in roots]
    return z0, roots, E
z0, zs, Es = finite_well(1, 1)
p('深さ1 eV 幅1 nm：z0', round(z0, 4), ' z', [round(z, 4) for z in zs], ' E（底から）eV', [round(x, 4) for x in Es])
p('  上の壁までの残り U0−E', [round(1 - x, 4) for x in Es], ' 壁の中の κ 1/nm', [round(kappa(1 - x), 3) for x in Es], ' しみ出す深さ 1/κ nm', [round(1 / kappa(1 - x), 3) for x in Es])
p('  同じ幅の無限の井戸 E1・E2', 0.376, 1.504)
z0, zs, Es = finite_well(0.3, 1)
p('jibun5：深さ0.3 eV 幅1 nm：z0', round(z0, 4), ' E', [round(x, 4) for x in Es])
z0, zs, Es = finite_well(1, 2)
p('jibun12：深さ1 eV 幅2 nm：z0', round(z0, 4), '状態の数', len(Es), ' E', [round(x, 4) for x in Es])
z0, zs, Es = finite_well(2, 0.5)
p('C：深さ2 eV 幅0.5 nm：z0', round(z0, 4), '状態の数', len(Es), ' E', [round(x, 4) for x in Es])
# グラフの交点の検算（表計算で読む値）
z0 = 0.5 * K1
for z in (0.8, 0.85, 0.9, 0.95, 1.0):
    p(f'  z={z}：z tan z・√(z0²−z²)', round(z * math.tan(z), 4), round(math.sqrt(z0**2 - z**2), 4))

# シューティング（表計算）：深さ 1 eV、幅 1 nm、井戸の中心 x=0、左の遠く（x=−2 nm）から右へ進める。Δx=0.01 nm
def shoot(E, U0=1.0, a=1.0, L=2.0, dx=0.01):
    """井戸の底を 0、外を U0 とした。E は底から。右はし x=+L での ψ を返す"""
    n = int(round(2 * L / dx))
    x = -L
    psi_prev = 0.0
    psi = 1e-6
    for i in range(1, n):
        x = -L + i * dx
        U = 0.0 if abs(x) < a / 2 else U0
        psi_next = 2 * psi - psi_prev + dx * dx / hb2m * (U - E) * psi
        psi_prev, psi = psi, psi_next
    return psi
print('  シューティング（右はしの ψ の符号の変わり目）')
for E in (0.15, 0.18, 0.19, 0.20, 0.25, 0.6, 0.69, 0.70, 0.71, 0.8):
    p(f'   E={E}', f'{shoot(E):.3e}')
def bisect_shoot(lo, hi):
    for _ in range(80):
        mid = (lo + hi) / 2
        if shoot(lo) * shoot(mid) <= 0:
            hi = mid
        else:
            lo = mid
    return mid
p('  シューティングの答え eV', round(bisect_shoot(0.15, 0.25), 4), round(bisect_shoot(0.6, 0.8), 4))
# 差分法（行列）でも
def fd_well(U0, a, L=3.0, N=1200):
    dx = 2 * L / (N + 1)
    x = -L + dx * np.arange(1, N + 1)
    U = np.where(np.abs(x) < a / 2, 0.0, U0)
    A = hb2m / dx**2
    H = np.diag(2 * A + U) + np.diag(-A * np.ones(N - 1), 1) + np.diag(-A * np.ones(N - 1), -1)
    w, v = np.linalg.eigh(H)
    return x, w, v
x, w, v = fd_well(1, 1)
p('  差分法（行列）で 1 eV・1 nm', [round(t, 4) for t in w[:3]], '（1 eV より下が束縛）')

print('\n== ⑧ 調和振動子')
# 基底状態の外にしみ出す確率：|x|>x0 は erfc(1)
p('古典で行ける端 = x0、その外にいる確率 erfc(1)', round(math.erfc(1), 4))
# 代入で確かめる（数値）
x0 = 1.0
xs = np.linspace(-4, 4, 2001)
psi = np.exp(-xs**2 / 2)
d2 = np.gradient(np.gradient(psi, xs), xs)
lhs = -0.5 * d2 + 0.5 * xs**2 * psi    # ħ=m=ω=1
p('数値で ( −½ψ″+½x²ψ )/ψ の平均（=E/ħω）', round(float(np.median(lhs[800:1200] / psi[800:1200])), 4))

print('\n== 分子の振動')
mH, mD, mC, mO, mCl, mN = 1.00782503223, 2.01410177812, 12.0, 15.99491461957, 34.968852682, 14.00307400443
def mu(a, b): return a * b / (a + b)
mols = {'CO': (2143.24, mu(mC, mO), 112.8323), 'HCl': (2885.31, mu(mH, mCl), 127.455), 'N2': (2329.92, mu(mN, mN), 109.768), 'DCl': (None, mu(mD, mCl), None)}
for name in ('CO', 'HCl', 'N2'):
    nu, m_u, re = mols[name]
    f = c * nu * 100
    w = 2 * pi * f
    hw = h * f / e
    ks = m_u * u * w**2
    th = h * f / kB
    x = th / 300
    Cv = x**2 * math.exp(x) / (math.exp(x) - 1)**2
    x0 = math.sqrt(hbar / (m_u * u * w)) * 1e12
    lam = 1 / (nu * 100) * 1e6
    p(f'{name}：ν̃ cm⁻¹・μ u・f Hz・ħω eV・零点 eV・k_s N/m・θE K・C/R(300K)・x0 pm・λ μm', nu, round(m_u, 4), f'{f:.3e}', round(hw, 4), round(hw / 2, 4), round(ks, 1), round(th, 0), f'{Cv:.2e}', round(x0, 2), round(lam, 3))
    if re:
        p(f'   {name}：x0/re %', round(x0 / re * 100, 2))
for T in (300, 1000, 3000):
    th = h * c * 2143.24 * 100 / kB
    x = th / T
    p(f'CO の C/R（{T} K）', round(x**2 * math.exp(x) / (math.exp(x) - 1)**2, 4))
# 重水素にすると
nuH = 2885.31
ratio = math.sqrt(mols['HCl'][1] / mols['DCl'][1])
p('C：DCl の μ u・ω の比・波数 cm⁻¹（ばね定数は同じ）', round(mols['DCl'][1], 4), round(ratio, 4), round(nuH * ratio, 0))
p('  （NIST の D³⁵Cl の実測 ωe−2ωexe は 約2091 cm⁻¹〔参考〕）')
# 300 K で上の準位にいる割合（CO）
th = h * c * 2143.24 * 100 / kB
p('CO：300 K で n=1 にいる割合 e^(−θ/T)', f'{math.exp(-th / 300):.2e}')
p('B：ħω=0.2 eV の E0・E1・E2 eV、吸収の λ μm', 0.1, 0.3, 0.5, round(hc / 0.2 / 1000, 2))

print('\n== ⑪ アンモニア')
f = 23.870e9
dE = h * f / e
p('ΔE eV', f'{dE:.3e}', ' kT(300K) eV', round(kB * 300 / e, 5), ' 比 e^(−ΔE/kT)', round(math.exp(-dE / (kB * 300 / e)), 5))
p('波長 cm', round(c / f * 100, 3), ' 行き来の周期 h/ΔE ps', round(1 / f * 1e12, 2))

print('\n== ⑪ 2つの井戸（差分法）：深さ 1 eV・幅 1 nm の井戸2つ、間の壁 b nm')
def fd_double(b, U0=1.0, a=1.0, L=4.0, N=1600):
    dx = 2 * L / (N + 1)
    x = -L + dx * np.arange(1, N + 1)
    inwell = (np.abs(x) > b / 2) & (np.abs(x) < b / 2 + a)
    U = np.where(inwell, 0.0, U0)
    A = hb2m / dx**2
    H = np.diag(2 * A + U) + np.diag(-A * np.ones(N - 1), 1) + np.diag(-A * np.ones(N - 1), -1)
    w, v = np.linalg.eigh(H)
    return x, w, v, dx
for b in (0.3, 0.5, 1.0):
    x, w, v, dx = fd_double(b)
    p(f'b={b} nm：E1・E2 eV・分裂 meV・行き来の周期 fs', round(w[0], 5), round(w[1], 5), round((w[1] - w[0]) * 1000, 3), round(4.135667696e-15 / (w[1] - w[0]) * 1e15, 1))
x, w, v, dx = fd_double(0.5)
for j in (0, 1):
    vec = v[:, j] / math.sqrt(np.sum(v[:, j]**2) * dx)
    if vec[np.argmax(np.abs(vec))] < 0:
        vec = -vec
    sel = (np.abs(x) < 2.6)
    print(f'  図：b=0.5 の ψ{j + 1}（x nm, ψ）', ' '.join(f'({xx:.2f},{yy:.3f})' for xx, yy in zip(x[sel][::12], vec[sel][::12])))

print('\n== 例題12 表計算のシューティング：点を x=(i−½)Δx に置く（Δx=0.02 nm）。偶ははじめの2行を 1・1、奇は −1・1。x=2 nm まで進める')
def shoot_c(E, parity, U0=1.0, a=1.0, L=2.0, dx=0.02):
    ps = [1.0 if parity == 0 else -1.0, 1.0]
    n = int(round(L / dx))
    for i in range(1, n + 1):
        x = (i - 0.5) * dx
        U = 0.0 if x < a / 2 else U0
        ps.append(2 * ps[i] - ps[i - 1] + dx * dx / hb2m * (U - E) * ps[i])
    return ps[-1]
for par, Es in ((0, (0.15, 0.18, 0.19, 0.20, 0.25)), (1, (0.6, 0.69, 0.70, 0.71, 0.8))):
    for E in Es:
        p(f'  {"偶" if par == 0 else "奇"} E={E}：x=2 nm の ψ', f'{shoot_c(E, par):.4g}')
    lo, hi = Es[0], Es[-1]
    for _ in range(80):
        mid = (lo + hi) / 2
        if shoot_c(lo, par) * shoot_c(mid, par) <= 0:
            hi = mid
        else:
            lo = mid
    p(f'  {"偶" if par == 0 else "奇"} の答え eV', round(mid, 4))
for E in (0.06, 0.065, 0.066, 0.07):
    p(f'  jibun12（深さ1 eV・幅2 nm の偶）E={E}：x=3 nm の ψ', f'{shoot_c(E, 0, a=2.0, L=3.0):.4g}')
lo, hi = 0.06, 0.07
for _ in range(80):
    mid = (lo + hi) / 2
    if shoot_c(lo, 0, a=2.0, L=3.0) * shoot_c(mid, 0, a=2.0, L=3.0) <= 0:
        hi = mid
    else:
        lo = mid
p('  jibun12 の答え eV', round(mid, 4))

print('\n== 章末 B1')
k = kappa(3)
p('壁 3 eV：κ', round(k, 3), ' 1 nm と 2 nm の e^(−2κa)', f'{math.exp(-2 * k):.2e}', f'{math.exp(-4 * k):.2e}', ' 比', f'{math.exp(-2 * k):.2e}')

print('\n== ⑨ もっと知りたい：非調和（CO、NIST の ωe・ωexe）')
we, wx = 2169.81358, 13.28831
for v in (0, 1, 2):
    p(f'  {v}→{v + 1} の波数 cm⁻¹', round(we - 2 * (v + 1) * wx, 1))
print('\n== 章末 C：2つの井戸の分裂と e^(−κb)')
k = kappa(1 - 0.19)
p('  κ（0.81 eV）1/nm・e^(−κ×0.5)', round(k, 3), round(math.exp(-k * 0.5), 4), ' 差分法の比 1.871/18.698', round(1.871 / 18.698, 4))

print('\n== 章末 B6：STM の針を 0.05 nm 遠ざける')
p('  倍率', round(math.exp(-2 * kappa(4.5) * 0.05), 3))
