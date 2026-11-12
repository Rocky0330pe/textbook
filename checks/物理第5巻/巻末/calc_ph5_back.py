# -*- coding: utf-8 -*-
"""物理第5巻『原子』の巻末の表（核種のデータ・物性値・定数）と前付の数を計算し直す（前付・巻末の組、第31回）。
使い方: python3 -I checks/物理第5巻/巻末/calc_ph5_back.py > checks/物理第5巻/巻末/calc_ph5_back_out.txt
出典（値はすべて、各章の頭のコメントに出典が書かれたもの。Wikipedia は使っていない）
- 定数：CODATA 2022（NIST physics.nist.gov/cuu/Constants/Table/allascii.txt。原-1〜原-11 の組が 11月11日に curl で読んだ値）。
- 原子の質量：NIST "Atomic Weights and Isotopic Compositions"（AME2020。checks/物理第5巻/原-11/nist_masses_20261111.json）。中性子は CODATA 2022。
- 半減期・崩壊のエネルギー：ENSDF（IAEA LiveChart の API。出典の組が 11月11日に確かめた。checks/物理第5巻/出典/check_sources_out.txt）。
- 原子の線・電離エネルギー：NIST Handbook of Basic Atomic Spectroscopic Data・NIST ASD（原-4・原-7）。特性X線：NIST X-ray Transition Energies（原-4・原-8）。
- 分子：NIST Chemistry WebBook（Huber & Herzberg。原-6・原-7）。減弱係数：NIST XCOM の表（原-13）。陽子の飛程：NIST PSTAR（原-13）。
- 中性子の断面積：IAEA Neutron Data Standards 2017 表11、NIST NCNR（Sears 1992）、Pritychenko arXiv:2503.18990（原-13・原-15）。
- 線量：環境省「放射線による健康影響等に関する統一的な基礎資料（令和7年度版）」、電離放射線障害防止規則（e-Gov）（原-14）。
"""
import json, math, os

here = os.path.dirname(os.path.abspath(__file__))
M = json.load(open(os.path.join(here, '..', '原-11', 'nist_masses_20261111.json'), encoding='utf-8'))
def mass(k):
    return float(M[k][0])

print('== 1 定数（CODATA 2022）')
h = 6.62607015e-34; hbar = h / (2 * math.pi); e = 1.602176634e-19; c = 299792458.0
kB = 1.380649e-23; NA = 6.02214076e23
me = 9.1093837139e-31; mp = 1.67262192595e-27; mn = 1.67492750056e-27; u = 1.66053906892e-27
eps0 = 8.8541878188e-12; a0 = 5.29177210544e-11; Rinf = 10973731.568157; alpha = 7.2973525643e-3
muB = 9.2740100657e-24; F = 96485.33212
print('ħ=h/2π=%.9e J·s（CODATA 1.054571817e-34）' % hbar)
print('m_e c²=%.8f MeV（0.51099895069）' % (me * c**2 / e / 1e6))
print('m_p c²=%.6f MeV（938.27208943）' % (mp * c**2 / e / 1e6))
print('m_n c²=%.6f MeV（939.56542194）' % (mn * c**2 / e / 1e6))
print('1 u c²=%.6f MeV（931.49410372）' % (u * c**2 / e / 1e6))
print('e/m_e=%.9e C/kg（1.75882000838e11）' % (e / me))
print('hc=%.5f eV·nm（本文 1240）' % (h * c / e * 1e9))
print('ħc=%.5f MeV·fm（197.3269804）' % (hbar * c / e / 1e6 * 1e15))
print('ke²=e²/(4πε0)=%.5f MeV·fm（本文 1.44）' % (e**2 / (4 * math.pi * eps0) / e / 1e6 * 1e15))
print('k=1/(4πε0)=%.5e（本文 8.99e9）' % (1 / (4 * math.pi * eps0)))
print('R∞hc=%.9f eV（13.605693122990）' % (Rinf * h * c / e))
print('1/α=%.6f（137.035999177）' % (1 / alpha))
print('a0=ħ/(m_e c α)=%.8e m（5.29177210544e-11）' % (hbar / (me * c * alpha)))
print('μ_B=eħ/(2m_e)=%.8e J/T（9.2740100657e-24）、%.8e eV/T' % (e * hbar / (2 * me), e * hbar / (2 * me) / e))
print('電子のコンプトン波長 h/(m_e c)=%.8f pm（2.42631023538）' % (h / (me * c) * 1e12))
print('F/e=%.6e（N_A）' % (F / e))
for T in (293.6, 300.0):
    print('T=%.1f K: k_B T=%.5f eV' % (T, kB * T / e))
print('1 eV ↔ %.1f K' % (e / kB))
print('熱中性子 0.0253 eV の速さ=%.0f m/s（本文 2200）' % math.sqrt(2 * 0.0253 * e / mn))
sigma = 2 * math.pi**5 * kB**4 / (15 * h**3 * c**2)
print('σ=2π⁵k⁴/(15h³c²)=%.9e（5.670374419e-8）' % sigma)
print('c1=2πhc²=%.9e W·m²（3.741771852e-16）、c2=hc/k=%.9e m·K（1.438776877e-2）' % (2 * math.pi * h * c**2, h * c / kB))
# ウィーン：x=5(1-e^{-x}) の解
x = 5.0
for _ in range(50):
    x = 5 * (1 - math.exp(-x))
print('ウィーンの定数 b=hc/(k x)=%.9e m·K（2.897771955e-3）' % (h * c / (kB * x)))
gp = 42.577478461e6
print('陽子：1.5 T で %.2f MHz、3.0 T で %.2f MHz（原-7 例題7：63.9・127.7）' % (gp * 1.5 / 1e6, gp * 3.0 / 1e6))
ge = 2.00231930436
print('電子の ESR：g μ_B B / h、0.35 T で %.3f GHz' % (ge * muB * 0.35 / h / 1e9))

print('== 2 原子の質量と1核子あたりの結合エネルギー（NIST AME2020、中性子は CODATA 2022）')
mH = mass('H1'); mN = 1.00866491606; uMeV = u * c**2 / e / 1e6
tab = [('D2', 1, 2), ('T3', 1, 3), ('He3', 2, 3), ('He4', 2, 4), ('Li7', 3, 7), ('Be9', 4, 9), ('C12', 6, 12), ('C14', 6, 14),
       ('N14', 7, 14), ('O16', 8, 16), ('Fe56', 26, 56), ('Ni62', 28, 62), ('Kr92', 36, 92), ('Ba141', 56, 141),
       ('Pb208', 82, 208), ('Po210', 84, 210), ('Rn222', 86, 222), ('Ra226', 88, 226), ('U235', 92, 235), ('U238', 92, 238),
       ('Pu239', 94, 239)]
for k, Z, A in tab:
    m = mass(k); B = (Z * mH + (A - Z) * mN - m) * uMeV
    print('%-6s Z=%2d A=%3d  m=%s u  B=%.2f MeV  B/A=%.3f MeV  存在比=%s' % (k, Z, A, M[k][0], B, B / A, M[k][1] or '―'))
print('H1 m=%s u、存在比 %s；n m=%.11f u' % (M['H1'][0], M['H1'][1], mN))
print('n→p＋電子 の Q=(m_n−m_H)c²=%.4f MeV（本文 0.782）' % ((mN - mH) * uMeV))

print('== 3 核反応・崩壊の Q 値（原子の質量から）')
def Q(lhs, rhs):
    return (sum(lhs) - sum(rhs)) * uMeV
He4 = mass('He4')
print('Ra226→Rn222+α  Q=%.3f MeV（ENSDF 4.8707）' % Q([mass('Ra226')], [mass('Rn222'), He4]))
print('Po210→Pb206+α  Q=%.3f MeV（ENSDF 5.4075）' % Q([mass('Po210')], [mass('Pb206'), He4]))
print('U238→Th234+α   Q=%.3f MeV（ENSDF 4.2699）' % Q([mass('U238')], [mass('Th234'), He4]))
print('Po212→Pb208+α  Q=%.3f MeV（ENSDF 8.954）' % Q([mass('Po212')], [mass('Pb208'), He4]))
print('D+T→He4+n     Q=%.3f MeV' % Q([mass('D2'), mass('T3')], [He4, mN]))
print('U235+n→Ba141+Kr92+3n Q=%.1f MeV（原-11 例題3 の 173 MeV）' % Q([mass('U235'), mN], [mass('Ba141'), mass('Kr92'), 3 * mN]))
print('C14→N14（β⁻）Q=%.4f MeV' % Q([mass('C14')], [mass('N14')]))
print('4 H1 → He4 （電子の分をふくめ 2 m_e×2 を引く前）Q=%.2f MeV' % Q([4 * mH], [He4]))

print('== 4 半減期（ENSDF・環境省）から崩壊定数と平均寿命')
yr = 365.25 * 86400
hl = [('トリチウム', 12.32 * yr), ('炭素14（計算）', 5730 * yr), ('炭素14（評価）', 5700 * yr), ('コバルト60', 1925.28 * 86400),
      ('ストロンチウム90', 28.91 * yr), ('モリブデン99', 65.924 * 3600), ('テクネチウム99m', 6.0072 * 3600), ('ヨウ素131', 8.0252 * 86400),
      ('ヨウ素135', 6.58 * 3600), ('キセノン135', 9.14 * 3600), ('セシウム134', 2.0652 * yr), ('セシウム137', 30.08 * yr),
      ('ラドン222', 3.8222 * 86400), ('ポロニウム210', 138.376 * 86400), ('ポロニウム212', 294.3e-9), ('ラジウム226', 1600 * yr),
      ('ウラン235', 7.04e8 * yr), ('ウラン238', 4.468e9 * yr), ('プルトニウム239', 24110 * yr), ('カリウム40', 1.248e9 * yr)]
for n, T in hl:
    lam = math.log(2) / T
    print('%s: T=%.4g s  λ=%.4g /s  τ=%.4g s' % (n, T, lam, 1 / lam))
print('コバルト60 1925.28 日=%.3f 年' % (1925.28 / 365.25))
print('炭素14：τ=5730/ln2=%.0f 年（本文 8270）、5700/5730=%.4f（差 %.2f %%）' % (5730 / math.log(2), 5700 / 5730, (1 - 5700 / 5730) * 100))
# ラジウム 1 g の放射能（Ci のもと）
NRa = NA / mass('Ra226')
print('ラジウム226 1 g：A=λN=%.3e Bq（1 Ci=3.7e10）' % (math.log(2) / (1600 * yr) * NRa))
NCs = NA / mass('Cs137')
print('セシウム137 1 g：A=%.3e Bq' % (math.log(2) / (30.08 * yr) * NCs))

print('== 5 原子の線・特性X線')
for n, E in [('Fe Kα1', 6404.006), ('Cu Kα1', 8047.823), ('Mo Kα1', 17479.372), ('Ag Kα1', 22162.917), ('W Kα1', 59318.847), ('Cu Kβ', 8905.413)]:
    print('%s: %.3f keV  λ=hc/E=%.5f nm' % (n, E / 1e3, h * c / (E * e) * 1e9))
print('Na D 線の平均 589.29 nm → %.4f eV' % (h * c / e / 589.29e-9))
print('Na 3p：A=0.616e8 /s → 寿命 %.1f ns' % (1 / 0.616e8 * 1e9))
# 水素のバルマー α（空気中）：R_H を換算質量で
RH = Rinf / (1 + me / mp)
lam_vac = 1 / (RH * (1 / 4 - 1 / 9))
print('Hα（真空）=%.3f nm、空気の屈折率 1.000276 で %.3f nm（NIST 656.285 は微細構造の重みの平均）' % (lam_vac * 1e9, lam_vac / 1.000276 * 1e9))
print('ライマンα（真空）=%.3f nm（NIST 121.567）' % (1 / (RH * 0.75) * 1e9))

print('== 6 分子（NIST WebBook）')
cm1 = lambda nu: (h * c * nu * 100 / e, c * nu * 100 / 1e12)
for n, nu in [('CO 0→1', 2143.24), ('HCl 0→1', 2885.31), ('N₂ 0→1', 2329.92)]:
    E, f = cm1(nu)
    print('%s: %.2f cm⁻¹ = %.4f eV、%.2f THz、λ=%.3f μm' % (n, nu, E, f, 1e4 / nu))
print('CO：ωe−2ωexe=%.2f cm⁻¹' % (2169.81358 - 2 * 13.28831))
print('HCl：ωe−2ωexe=%.2f cm⁻¹' % (2990.946 - 2 * 52.8186))
print('N₂：ωe−2ωexe=%.2f cm⁻¹' % (2358.57 - 2 * 14.324))
B0 = 1.93128 - 0.01750 / 2
print('CO の J=0→1：2B0c=%.2f GHz（観測 115.27）' % (2 * B0 * c * 100 / 1e9))
print('H₂ D0=36118 cm⁻¹ → %.3f eV' % (h * c * 36118 * 100 / e))
print('アンモニア 23.870 GHz → %.4f cm⁻¹、%.3e eV、λ=%.3f cm' % (23.870e9 / (c * 100), h * 23.870e9 / e, c / 23.870e9 * 100))

print('== 7 固体・半導体')
for n, Eg in [('Si', 1.12), ('Ge', 0.66), ('GaAs', 1.42), ('GaN', 3.4)]:
    print('%s: Eg=%.2f eV → 吸収のはしの波長 %.0f nm' % (n, Eg, 1239.84198 / Eg))
aSi = 0.5431020511e-9; MSi = 28.0855
print('Si：8 / a³=%.4e /m³、密度=%.4f g/cm³（NIST 2.330）' % (8 / aSi**3, 8 / aSi**3 * MSi / NA / 1e6))
n_cu = 8.49e28
EF = hbar**2 / (2 * me) * (3 * math.pi**2 * n_cu)**(2 / 3)
print('銅：E_F=%.3f eV、v_F=%.4e m/s、T_F=%.0f K、v_F τ=%.1f nm' % (EF / e, math.sqrt(2 * EF / me), EF / kB, math.sqrt(2 * EF / me) * 2.4e-14 * 1e9))
print('銅：ρ=1.72e-8 から τ=m/(n e² ρ)=%.3e s' % (me / (n_cu * e**2 * 1.72e-8)))
print('銅：n=ρN_A/M（8.96 g/cm³、63.55 g/mol）=%.4e /m³' % (8.96e6 / 63.55 * NA))
print('ケイ素 n_i：N_c=2.8e19、N_v=1.04e19、Eg=1.12、300 K → %.2e cm⁻³' % (math.sqrt(2.8e19 * 1.04e19) * math.exp(-1.12 / (2 * kB * 300 / e))))
print('ケイ素の導電率（真性 1.0e10、μn 1350・μp 480）=%.3e S/cm' % (1.0e10 * e * (1350 + 480)))

print('== 8 放射線と物質（NIST）')
mu_rho = {'骨': (1.92, 0.315, 0.0797, None), '軟組織': (1.06, 0.205, 0.0849, None), '水': (1.00, 0.206, 0.0857, 0.0632),
          'コンクリート': (2.30, 0.266, 0.0788, 0.0581), 'アルミニウム': (2.699, 0.278, 0.0746, 0.0550),
          '鉄': (7.874, 1.21, 0.0735, 0.0535), '鉛': (11.35, 5.02, 0.111, 0.0588)}
for n, (rho, a, b, cc) in mu_rho.items():
    s = '%s: ρ=%.3f  μ(60 keV)=%.3f /cm 半価層 %.2f cm；μ(0.662 MeV)=%.4f /cm 半価層 %.2f cm' % (n, rho, a * rho, math.log(2) / (a * rho), b * rho, math.log(2) / (b * rho))
    if cc:
        s += '；μ(1.25 MeV)=%.4f /cm 半価層 %.2f cm' % (cc * rho, math.log(2) / (cc * rho))
    print(s)
print('鉛 0.662 MeV：1/10 価層 %.2f cm' % (math.log(10) / (0.111 * 11.35)))
for E, R in [(70, 4.080), (150, 15.77), (225, 31.74), (250, 37.94)]:
    print('陽子 %d MeV：水の CSDA 飛程 %.2f g/cm² → %.2f cm' % (E, R, R / 1.0))
print('α 5.30 MeV の空気中の飛程：ガイガーの式 0.318E^1.5=%.2f cm' % (0.318 * 5.30**1.5))
print('W=33.97 eV：1 MeV で %.0f 組のイオン' % (1e6 / 33.97))

print('== 9 中性子と原子炉')
parts = [166.2, 4.8, 8.0, 7.0, 7.2, 9.6]
print('分裂のエネルギーの内訳の和=%.1f MeV、ニュートリノを除くと %.1f MeV' % (sum(parts), sum(parts) - 9.6))
print('U-235 の η=ν σf/(σf+σc)=%.3f（本文 2.08）' % (2.43 * 585 / (585 + 99)))
print('Standards 2017：587.3/585=%.4f、99.5/99=%.4f' % (587.3 / 585, 99.5 / 99))
print('β=ν_d/ν=1.57e-2/2.425=%.5f（本文 0.0065）' % (1.57e-2 / 2.425))
E1 = 200e6 * e
print('1 g の U-235 がすべて分裂：%.3e J' % (NA / mass('U235') * E1))
for t in (1, 3600, 86400, 30 * 86400, yr):
    T0 = 3 * yr
    print('崩壊熱 3年運転、止めて %g s 後：P/P0=%.4f %%' % (t, 0.066 * (t**-0.2 - (t + T0)**-0.2) * 100))

print('== 10 線量と防護（環境省・電離則）')
wT = {'赤色骨髄・結腸・肺・胃・乳房': 0.12 * 5, '残りの組織': 0.12, '生殖腺': 0.08, '膀胱・食道・肝臓・甲状腺': 0.04 * 4,
      '骨表面・脳・唾液腺・皮膚': 0.01 * 4}
print('組織加重係数の合計=%.2f' % sum(wT.values()))
print('自然 2.1＋医療 2.6=%.1f mSv/年' % (2.1 + 2.6))
nat = [0.3, 0.33, 0.37, 0.09, 0.80, 0.18, 0.014]
print('自然の内訳の合計（宇宙線・大地・Rn222・Rn220・食品の Pb210/Po210・K40・C14）=%.3f mSv/年（ほかの小さな分をふくめ 2.1）' % sum(nat))
print('トリチウム 1500 Bq/L を 2 L/日×365 日飲むと：%.4f mSv' % (1500 * 2 * 365 * 0.000018e-3))
print('Cs-137 経口 0.013 μSv/Bq で 100 Bq/kg の食品 1 kg：%.2f μSv' % (100 * 0.013))
# 空気カーマ率定数（原-14 と同じ計算）
Eg = 0.661657; y = 0.851; muen = math.exp(math.log(0.02953) + (math.log(0.02882) - math.log(0.02953)) * (math.log(Eg) - math.log(0.6)) / (math.log(0.8) - math.log(0.6)))
phi = 1e6 * y / (4 * math.pi * 1.0**2) * 3600   # 1 MBq、1 m、1時間の光子数 /m²
K = phi * Eg * 1e6 * e * muen * 0.1   # μen/ρ cm²/g → m²/kg は 0.1 倍
print('Cs-137 の空気カーマ率定数=%.4f μGy·m²/(MBq·h)、0.0927/これ=%.2f' % (K * 1e6, 0.0927 / (K * 1e6)))

print('== 11 単位と換算')
print('1 eV=%.9e J' % e)
print('1 u=%.6f MeV/c²' % uMeV)
print('1 b=1e-28 m²=1e-24 cm²')
print('1 年=365.25 日=%.0f s' % yr)
print('1 cm⁻¹ ↔ %.6e eV ↔ %.4f GHz' % (h * c * 100 / e, c * 100 / 1e9))
print('1 Ci=3.7e10 Bq')
print('λ〔nm〕=%.2f/E〔eV〕' % (h * c / e * 1e9))

print('== 12 確認の直し（第32回）の数と、巻末の表の照らし合わせ（巻を組む組、11月12日）')
# 原-13 表・巻末の表6：骨・軟組織の 0.662 MeV の μ/ρ（修5-5 が NIST の 0.6・0.8 MeV から両対数で補間した値）
for n, rho, mr, hv in [('骨', 1.92, 0.0797, '4.5'), ('軟組織', 1.06, 0.0849, '7.7')]:
    print('%s：μ/ρ=%.4f、半価層 ln2/(μ/ρ·ρ)=%.2f cm（巻末 %s cm）' % (n, mr, math.log(2) / (mr * rho), hv))
# 原-15 ⑤：濃縮度と η（σf=585、σc5=99、σc8=2.68 b、ν=2.43。巻末の表7 と同じ値。原子の数の比で混ぜる）
def eta_x(x):
    return 2.43 * 585 / (585 + 99 + (1 - x) / x * 2.68)
for x in (0.0072, 0.03, 0.06):
    print('濃縮度 %.2f %%：η=%.3f' % (x * 100, eta_x(x)))
print('6 %% と 3 %% の η の比 %.3f（本文「1.85 から約1.96 へ、6 %% ほど」）' % (eta_x(0.06) / eta_x(0.03)))
# 原-16 例題3：崩壊熱 1.5 MW で1日に蒸発する 100 ℃の水（蒸発熱 2.257 MJ/kg）
print('1.5e6 W × 86400 s ÷ 2.257e6 J/kg = %.3e kg（本文 57 t）' % (1.5e6 * 86400 / 2.257e6))
# 原-12 例題12：ポロニウム212 の半減期（巻末の表3 は 294.3 ns）
print('ポロニウム212：294.3 ns = %.4f μs（本文 0.29 μs）。U-238（4.468e9 年）との半減期の比 %.1e' % (294.3e-3, 4.468e9 * yr / 294.3e-9))
