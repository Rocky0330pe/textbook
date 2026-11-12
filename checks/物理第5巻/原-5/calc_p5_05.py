# 物理第5巻 原-5「波で書く電子：シュレディンガー方程式」の数値の検算（組 原W3）
# 使い方：python3 calc_p5_05.py > calc_p5_05_out.txt
# 定数は CODATA 2022（NIST）。本文の丸めは h=6.63e-34、ħ=1.055e-34、mₑ=9.11e-31、e=1.60e-19、hc=1240 eV·nm。
import math
import numpy as np

pi = math.pi
h = 6.62607015e-34
hbar = h / (2 * pi)
e = 1.602176634e-19
c = 299792458.0
me = 9.1093837139e-31
hc = h * c / e * 1e9          # eV nm
hbar2_2m = hbar**2 / (2 * me) / e * 1e18   # eV nm^2
h_eVs = h / e


def box(n, L_nm, m=me):
    """無限に深い井戸 E_n = n^2 h^2/(8 m L^2)（eV）"""
    return n**2 * h**2 / (8 * m * (L_nm * 1e-9)**2) / e


def P_range(n, a, b):
    """幅 L=1 の箱、状態 n で a<x<b にいる確率"""
    return (b - a) - (math.sin(2 * n * pi * b) - math.sin(2 * n * pi * a)) / (2 * n * pi)


def dx_over_L(n):
    return math.sqrt(1 / 12 - 1 / (2 * n**2 * pi**2))


out = []
def p(label, *v):
    print(label + ':', *v)

p('ħ²/(2mₑ) eV·nm²', round(hbar2_2m, 5), '  2mₑ/ħ² 1/(eV nm²)', round(1 / hbar2_2m, 3))
p('h²/(8 mₑ (1nm)²) eV', box(1, 1))
p('hc eV nm', hc)

print('\n== ① 弦（波-6）と電子の箱：比')
for n in (1, 2, 3, 4):
    p(f'n={n} 弦の振動数の比・箱のエネルギーの比', n, n**2)

print('\n== 例題1 幅 1 nm の箱')
for n in (1, 2, 3, 4):
    E = box(n, 1)
    lam = 2 * 1 / n
    pmom = h / (lam * 1e-9)
    p(f'n={n} λ nm・p kg m/s・E eV', lam, f'{pmom:.3e}', round(E, 4))
p('jibun1：幅 0.5 nm の E1・E2 eV', round(box(1, 0.5), 3), round(box(2, 0.5), 3))
p('③ 本文：幅 0.2 nm（原子の大きさ）の E1 eV', round(box(1, 0.2), 2))

print('\n== 例題2 2→1 の光')
dE = box(2, 1) - box(1, 1)
p('ΔE eV・λ nm', round(dE, 4), round(hc / dE, 1))
dE32 = box(3, 1) - box(2, 1)
p('jibun2：3→2 ΔE eV・λ nm', round(dE32, 4), round(hc / dE32, 1))
dE31 = box(3, 1) - box(1, 1)
p('章末B5：1→3 の吸収 ΔE eV・λ nm', round(dE31, 4), round(hc / dE31, 1))

print('\n== 例題3 まん中の 1/3 にいる確率')
for n in (1, 2, 3):
    p(f'n={n}', round(P_range(n, 1 / 3, 2 / 3), 4))
p('検算 n=1 の式 1/3+√3/(2π)', 1 / 3 + math.sqrt(3) / (2 * pi))
p('検算 n=2 の式 1/3-√3/(4π)', 1 / 3 - math.sqrt(3) / (4 * pi))
p('古典（どこも同じ）', 1 / 3)
p('jibun3：n=1 で 0<x<L/4', round(P_range(1, 0, 0.25), 4))
p('jibun3：n=2 で 0<x<L/4', round(P_range(2, 0, 0.25), 4))
p('章末B2：n=2 で左半分', round(P_range(2, 0, 0.5), 4))
# 数値積分でも確かめる
xs = np.linspace(1 / 3, 2 / 3, 200001)
p('数値積分 n=1', np.trapezoid(2 * np.sin(pi * xs)**2, xs))

print('\n== 例題4 規格化')
for L in (1, 2):
    p(f'L={L} nm の A=√(2/L) 1/√m', f'{math.sqrt(2 / (L * 1e-9)):.3e}')
p('積分 ∫0^L sin²(πx/L)dx = L/2 の検算（L=1）', np.trapezoid(np.sin(pi * np.linspace(0, 1, 100001))**2, np.linspace(0, 1, 100001)))
p('|ψ1|² の最大（L=1 nm）= 2/L 1/m・1/nm', 2 / 1e-9, 2.0)
p('まん中の 0.01 nm にいる確率（n=1）≈ 2/L×0.01 nm', 2 * 0.01)

print('\n== 例題5 不確かさ')
for n in (1, 2, 3, 10):
    dx = dx_over_L(n)
    dp = n * pi  # ħ/L 単位
    p(f'n={n} Δx/L・Δp/(ħ/L)・ΔxΔp/ħ', round(dx, 4), round(dp, 3), round(dx * dp, 3))
p('古典の一様な分布の Δx/L = 1/√12', round(1 / math.sqrt(12), 4))
# 例題5：L=1 nm の数
dx1 = dx_over_L(1) * 1e-9
dp1 = pi * hbar / 1e-9
p('n=1 L=1nm Δx m・Δp kg m/s・Δv m/s', f'{dx1:.3e}', f'{dp1:.3e}', f'{dp1 / me:.3e}')

print('\n== 例題6 GaAs の量子井戸（m*=0.067 mₑ）')
for L in (10, 5, 20):
    p(f'L={L} nm E1 eV', round(box(1, L, 0.067 * me), 5))
p('kT(300K) eV', 1.380649e-23 * 300 / e)
p('自由電子なら 10 nm の E1 eV', round(box(1, 10), 5))
p('質量 0.067 倍 → エネルギー倍率', 1 / 0.067)

print('\n== 例題7 1 g の玉')
m, L, v = 1e-3, 1e-2, 1e-2
K = 0.5 * m * v**2
E1 = h**2 / (8 * m * L**2)
p('K J・E1 J・n', K, f'{E1:.3e}', f'{math.sqrt(K / E1):.3e}', f'2Lmv/h={2 * L * m * v / h:.3e}')
p('隣との差 ΔE/E ≈ 2/n', f'{2 / math.sqrt(K / E1):.1e}')
m, L, v = 1e-9, 1e-6, 1e-3
p('jibun7：1 μg・1 μm・1 mm/s の n', f'{2 * L * m * v / h:.3e}')

print('\n== 例題8 重ね合わせのゆれ')
for L in (1, 2):
    dE = box(2, L) - box(1, L)
    T = h_eVs / dE
    p(f'L={L} nm ΔE eV・周期 fs', round(dE, 4), round(T * 1e15, 3))
# <x>(t) の振れ幅
x12 = -16 / (9 * pi**2)
p('x12/L（ψ1 と ψ2 の重なり）', round(x12, 5), '  (ψ1+ψ2)/√2 の <x> の振れ幅/L', round(abs(x12), 4))
p('0.6ψ1+0.8ψ2 の <x> 振れ幅/L = 2·0.6·0.8·|x12|', round(2 * 0.6 * 0.8 * abs(x12), 4))

print('\n== 例題9 0.6ψ1+0.8ψ2')
c1, c2 = 0.6, 0.8
p('確率', c1**2, c2**2, ' 合計', c1**2 + c2**2)
p('<E> eV', round(c1**2 * box(1, 1) + c2**2 * box(2, 1), 4))
c1, c3 = 0.8, 0.6
p('jibun9：0.8ψ1+0.6ψ3 確率・<E>', c1**2, c3**2, round(c1**2 * box(1, 1) + c3**2 * box(3, 1), 4))

print('\n== 例題10 輪の上の電子')
for L in (1, 2):
    E1 = h**2 / (2 * me * (L * 1e-9)**2) / e
    p(f'1周 {L} nm：E_n = {E1:.4f} n² eV', [round(E1 * n * n, 3) for n in range(0, 4)])
p('箱（両はし固定）1 nm と輪 1 nm の n=1 の比', (h**2 / (2 * me * 1e-18) / e) / box(1, 1))
# 章末C2：ベンゼンの輪
Lb = 6 * 0.139
E1b = h**2 / (2 * me * (Lb * 1e-9)**2) / e
dEb = E1b * (4 - 1)
p('ベンゼン 1周 0.834 nm：E1 eV・1→2 ΔE eV・λ nm', round(E1b, 3), round(dEb, 3), round(hc / dEb, 0))

print('\n== 例題12 差分法（箱 1 nm）')
def fd(N, L=1.0):
    dx = L / (N + 1)
    main = np.full(N, 2.0) * hbar2_2m / dx**2
    off = np.full(N - 1, -1.0) * hbar2_2m / dx**2
    H = np.diag(main) + np.diag(off, 1) + np.diag(off, -1)
    w, v = np.linalg.eigh(H)
    return w, v
for N in (10, 50, 200):
    w, _ = fd(N)
    p(f'N={N}', [round(x, 4) for x in w[:3]])
w, _ = fd(50, 2.0)
p('jibun12：N=50・幅 2 nm の E1 eV（正しい値 ' + str(round(box(1, 2), 4)) + '）', round(w[0], 4))
w, _ = fd(4)
p('本文：N=4 の行列の固有値（はじめの1つ）', [round(x, 4) for x in w])
# 4×4 の行列の成分
dx = 1 / 5
p('N=4 の対角・となり eV', round(2 * hbar2_2m / dx**2, 4), round(-hbar2_2m / dx**2, 4))
# 誤差の割合
for N in (10, 50, 200):
    w, _ = fd(N)
    p(f'N={N} の E1 の誤差 %', round((w[0] - box(1, 1)) / box(1, 1) * 100, 3))

print('\n== ⑫ シューティング（表計算）：幅 1 nm、Δx=0.05 nm、E を変えて右の壁で ψ=0')
def shoot(E, L=1.0, M=20):
    dx = L / M
    k = dx * dx / hbar2_2m
    psi = [0.0, 0.01]
    for i in range(1, M):
        psi.append(2 * psi[i] - psi[i - 1] - k * E * psi[i])
    return psi
for E in (0.30, 0.35, 0.376, 0.40):
    p(f'E={E}：右の壁の ψ', round(shoot(E)[-1], 5))
# 二分法で
lo, hi = 0.3, 0.45
for _ in range(60):
    mid = (lo + hi) / 2
    if shoot(lo)[-1] * shoot(mid)[-1] <= 0:
        hi = mid
    else:
        lo = mid
p('Δx=0.05 nm で右の壁が0になる E eV', round(mid, 4))

print('\n== 章末問題')
p('B1：幅 0.3 nm：E1・E2 eV・2→1 の光 nm', round(box(1, 0.3), 3), round(box(2, 0.3), 3), round(hc / (box(2, 0.3) - box(1, 0.3)), 0))
for L in (0.8,):
    dE = box(2, L) - box(1, L)
    p(f'B4：幅 {L} nm の 2→1 ΔE eV・λ nm', round(dE, 3), round(hc / dE, 0))
p('B3：幅 1/2 → 4倍、幅 3倍 → 1/9', 4, 1 / 9)
# C1: <x²>/L² → 1/3
for n in (1, 10, 100):
    p(f'C1：n={n} の <x²>/L²', round(1 / 3 - 1 / (2 * n**2 * pi**2), 5))
p('C1：古典の <x²>/L² = 1/3', 1 / 3)
# C3: (ψ1+ψ2)/√2 の <x>(t)
p('C3：<x> の振れ幅 16/(9π²) L', round(16 / (9 * pi**2), 4), ' 周期 fs', round(h_eVs / (box(2, 1) - box(1, 1)) * 1e15, 2))
# 本文 ⑩ の <x>(t) を数値で確かめる
xs = np.linspace(0, 1, 20001)
psi1 = np.sqrt(2) * np.sin(pi * xs)
psi2 = np.sqrt(2) * np.sin(2 * pi * xs)
p('数値の x12', np.trapezoid(psi1 * xs * psi2, xs), 'と', x12)
