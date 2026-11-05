# 物理第4巻『電磁気学』計画書（tools/phys4-plan.md）の例題の「答えの見こみ」を計算するスクリプト（組 P4-R）。
# 使い方：python3 plan_numbers.py > plan_numbers_out.txt   （numpy があれば行列の例題に使う。なければ自前のガウス消去）
# 定数は CODATA 2022（NIST）。〔要〕〔仮〕の物性値・実機の値は仮の値で、章を書く組が出典で確かめて差しかえる。
import math, cmath
pi = math.pi
e = 1.602176634e-19        # 電気素量 C（定義値）〔確〕
c0 = 299792458.0           # 真空の光速 m/s（定義値）〔確〕
eps0 = 8.8541878188e-12    # 真空の誘電率 F/m（CODATA 2022）〔確〕
mu0 = 1.25663706127e-6     # 真空の透磁率 N/A^2（CODATA 2022）〔確〕
me = 9.1093837139e-31      # 電子の質量 kg〔確〕
mp = 1.67262192595e-27     # 陽子の質量 kg〔確〕
F_far = 96485.33212        # ファラデー定数 C/mol〔確〕
k = 1 / (4 * pi * eps0)    # クーロンの法則の定数（8-5 は 8.99e9）
g = 9.8
rho_cu = 1.68e-8           # 銅の抵抗率 Ω·m（20 ℃）〔要〕
sig_cu = 1 / rho_cu
sig_al = 1 / 2.65e-8       # アルミニウム〔要〕


def p(label, *vals):
    out = []
    for v in vals:
        if isinstance(v, float):
            out.append(f"{v:.4g}")
        elif isinstance(v, complex):
            out.append(f"{abs(v):.4g}∠{math.degrees(cmath.phase(v)):.2f}°")
        else:
            out.append(str(v))
    print(f"{label}: " + ", ".join(out))


def solve(A, b):
    try:
        import numpy as np
        return list(np.linalg.solve(np.array(A, dtype=complex if any(isinstance(x, complex) for r in A for x in r) else float), np.array(b)))
    except ImportError:
        n = len(A); M = [list(r) + [bb] for r, bb in zip(A, b)]
        for i in range(n):
            piv = max(range(i, n), key=lambda r: abs(M[r][i])); M[i], M[piv] = M[piv], M[i]
            for r in range(n):
                if r != i:
                    f = M[r][i] / M[i][i]
                    M[r] = [x - f * y for x, y in zip(M[r], M[i])]
        return [M[i][n] / M[i][i] for i in range(n)]


def par(*rs):
    return 1 / sum(1 / r for r in rs)


print("== 定数")
p("k=1/(4πε0)", k)
p("c=1/√(μ0ε0)", 1 / math.sqrt(mu0 * eps0))
p("真空のインピーダンス √(μ0/ε0) Ω", math.sqrt(mu0 / eps0))
p("μ0/(4π×1e-7)−1", mu0 / (4 * pi * 1e-7) - 1)

print("\n== 電-0 序章")
P = 100e6; R = 10.0
for V in (100e3, 500e3):
    I = P / V; Ploss = R * I ** 2
    p(f"送電 {V/1e3:.0f} kV：電流 A・損失 MW・割合 %", I, Ploss / 1e6, Ploss / P * 100)
p("ドライヤー 1200 W・100 V の電流 A", 1200 / 100)
p("東京–大阪 400 km を光の速さで ms", 400e3 / c0 * 1e3)

print("\n== 電-1")
p("1 C どうし 1 m の力 N", k * 1 * 1 / 1 ** 2)
r = 5.29e-11; Fe = k * e * e / r ** 2; G = 6.674e-11; Fg = G * me * mp / r ** 2
p("水素原子 クーロン力 N・万有引力 N・比", Fe, Fg, Fe / Fg)
# 髪の毛（仮の値）：下じき −2.0e-8 C、毛先 +1.0e-10 C、距離 5 cm。髪 1 本 長さ 10 cm・直径 80 μm・密度 1300 kg/m3
Fhair = k * 2.0e-8 * 1.0e-10 / 0.05 ** 2
mhair = 1300 * pi * (40e-6) ** 2 * 0.10
p("髪の毛 電気の力 N・髪1本の重さ N・比", Fhair, mhair * g, Fhair / (mhair * g))
# 重ね合わせ：+1 μC (0,0)、−1 μC (0.1,0)、点 (0.05,0.05)
def Efield(qs, x, y):
    Ex = Ey = 0.0
    for q, (a, b) in qs:
        dx, dy = x - a, y - b; rr = math.hypot(dx, dy)
        Ex += k * q * dx / rr ** 3; Ey += k * q * dy / rr ** 3
    return Ex, Ey
Ex, Ey = Efield([(1e-6, (0, 0)), (-1e-6, (0.1, 0))], 0.05, 0.05)
p("重ね合わせ (0.05,0.05) の電場 Ex・Ey・大きさ N/C", Ex, Ey, math.hypot(Ex, Ey))
# 力を受けない点：+4q at 0、+q at 0.3 → 4/x² = 1/(0.3−x)²
p("+4q と +q（0.3 m）の間で力が0の点 m", 0.3 * 2 / 3)
# 正三角形 1 辺 0.1 m、各 +1 μC：1つが受ける力
F1 = k * 1e-12 / 0.1 ** 2
p("正三角形 1 μC・0.1 m：1 組の力 N・合力 N", F1, 2 * F1 * math.cos(math.radians(30)))
for rr in (0.1, 0.2, 0.3, 0.5, 1.0):
    p(f"点電荷 1 nC の電場 r={rr}", k * 1e-9 / rr ** 2)
# 双極子：±1 nC、間 1 cm、軸上 10 cm と 20 cm
def Edip(z, d=0.01, q=1e-9):
    return k * q * (1 / (z - d / 2) ** 2 - 1 / (z + d / 2) ** 2)
p("双極子 軸上 0.1 m・0.2 m・比（≈8）", Edip(0.1), Edip(0.2), Edip(0.1) / Edip(0.2))
lam = 1e-9
p("線電荷 1 nC/m の 0.1 m の電場 N/C", lam / (2 * pi * eps0 * 0.1))
Q = 1e-8; a = 0.1
zmax = a / math.sqrt(2)
Ering = lambda z: k * Q * z / (z * z + a * a) ** 1.5
p("円環 1e-8 C・半径 0.1 m：最大の z m・最大の電場 N/C", zmax, Ering(zmax))
p("一様な平面 1 μC/m2 の電場 N/C", 1e-6 / (2 * eps0))
# インクジェット（仮）：m=1e-10 kg、q=2e-13 C、E=1e6 V/m、極板 1 cm、20 m/s
acc = 2e-13 * 1e6 / 1e-10; t = 0.01 / 20
p("インクの曲がり：加速度 m/s2・時間 s・ずれ mm", acc, t, 0.5 * acc * t * t * 1e3)

print("\n== 電-2")
Q = 1e-8; R0 = 0.1
p("帯電球 1e-8 C・半径 0.1 m：外 0.2 m の E・中 0.05 m の E（一様に分布）", k * Q / 0.2 ** 2, k * Q * 0.05 / R0 ** 3)
p("同じ線電荷をガウスで（電-1 と同じ）", 1e-9 / (2 * pi * eps0 * 0.1))
p("1 nC の電位 0.1 m V", k * 1e-9 / 0.1)
p("極板 1 cm・100 V の電場 V/m", 100 / 0.01)
for V in (100, 1000):
    p(f"電子を {V} V で加速した速さ m/s", math.sqrt(2 * e * V / me))
p("1 eV J", e)
E_air = 100.0; R_earth = 6.371e6
sig = eps0 * E_air
p("晴天の大気電場 100 V/m：表面電荷 C/m2・地球全体 C", sig, sig * 4 * pi * R_earth ** 2)
# ラプラス方程式：5×5 の格子の内側 3×3、上辺 100 V・他 0 V
N = 5
phi = [[0.0] * N for _ in range(N)]
for j in range(N):
    phi[0][j] = 100.0
phi[0][0] = phi[0][N - 1] = 50.0  # 角は使わない
for _ in range(2000):
    for i in range(1, N - 1):
        for j in range(1, N - 1):
            phi[i][j] = 0.25 * (phi[i - 1][j] + phi[i + 1][j] + phi[i][j - 1] + phi[i][j + 1])
p("ラプラス 3×3 の中心 V（上辺 100 V）・上の列", phi[2][2], phi[1][1], phi[1][2])
# 同軸の電場：内 a=0.5 mm、外 b=2 mm、1 kV
a, b, V = 0.5e-3, 2e-3, 1000
p("同軸 内側の表面の電場 V/m", V / (a * math.log(b / a)))
p("半径 1 cm の球を 30 kV：表面の電場 V/m", 30e3 / 0.01)
# 双極子の電位から電場（軸上で −dφ/dz）
def phidip(z, d=0.01, q=1e-9):
    return k * q * (1 / (z - d / 2) - 1 / (z + d / 2))
h = 1e-6
p("双極子 −dφ/dz（0.1 m）と直接の E", -(phidip(0.1 + h) - phidip(0.1 - h)) / (2 * h), Edip(0.1))

print("\n== 電-3")
S, d = 0.01, 1e-3
C = eps0 * S / d
p("平行板 0.01 m2・1 mm の C pF", C * 1e12)
V = 1000
p("1 kV：Q C・E V/m・U J", C * V, V / d, 0.5 * C * V ** 2)
p("2 μF と 3 μF：直列 μF・並列 μF", par(2, 3), 2 + 3.0)
p("PET（εr 3.2〔要〕）を入れた C pF", 3.2 * C * 1e12)
# 半分（すき間の半分の厚さ）に εr=3.2 の板：直列
C1 = 3.2 * eps0 * S / (d / 2); C2 = eps0 * S / (d / 2)
p("厚さ半分を誘電体で：C pF（直列）", par(C1, C2) * 1e12)
C1 = 3.2 * eps0 * (S / 2) / d; C2 = eps0 * (S / 2) / d
p("面積半分を誘電体で：C pF（並列）", (C1 + C2) * 1e12)
p("電気二重層キャパシタ 1 F・2.7 V の J", 0.5 * 1 * 2.7 ** 2)
a, b, er = 0.45e-3, 1.6e-3, 2.3
Cl = 2 * pi * eps0 * er / math.log(b / a); Ll = mu0 / (2 * pi) * math.log(b / a)
p("同軸 a=0.45 mm・b=1.6 mm・εr 2.3：C pF/m・L μH/m", Cl * 1e12, Ll * 1e6)
p("地球の静電容量 μF", 4 * pi * eps0 * R_earth * 1e6)
p("極板の引力 0.01 m2・1 mm・1 kV N", eps0 * S * V ** 2 / (2 * d ** 2))
Qc, h = 20.0, 5000.0
p("雷雲 20 C・高さ 5 km：真下の地面の電場 V/m（鏡像）", 2 * k * Qc / h ** 2)
p("タッチパネル 1 cm2・ガラス 1 mm・εr 7〔要〕 pF", 7 * eps0 * 1e-4 / 1e-3 * 1e12)
p("圧電素子 1 nF・1 nC の電圧 V", 1e-9 / 1e-9)
th1 = math.radians(45)
p("境目の屈折 εr 1→4、45° で入る電気力線の角°", math.degrees(math.atan(4 * math.tan(th1))))

print("\n== 電-4")
P, V = 1200, 100
I = P / V
p("ドライヤー：I A・R Ω・1 分の熱 kJ", I, V / I, P * 60 / 1e3)
n_cu = 8.49e28; S = 2.0e-6
p("銅線 2 mm2・12 A のドリフトの速さ mm/s", I / (n_cu * e * S) * 1e3)
p("1 m 進むのにかかる時間 分", 1 / (I / (n_cu * e * S)) / 60)
R40 = rho_cu * 40 / S
p("銅線 2 mm2・往復 40 m：R Ω・12 A の電圧降下 V", R40, R40 * I)
p("Pt100 の 100 ℃ Ω（α=0.00385〔要〕）", 100 * (1 + 0.00385 * 100))
Rhot = 100 ** 2 / 100
Rcold = Rhot / (1 + 0.0045 * (2500 - 20))
p("100 W 電球：点灯時 Ω・冷えたとき Ω・つけた瞬間 A", Rhot, Rcold, 100 / Rcold)
p("10 Ω と 30 Ω：直列・並列 Ω", 40.0, par(10, 30))
kWh = 1.2 * 0.25 * 30
p("1200 W を 15 分/日・30 日：kWh・円（31 円/kWh〔要〕）", kWh, kWh * 31)
p("ひずみゲージ 120 Ω・K 2・500e-6 の ΔR Ω", 120 * 2 * 500e-6)
E0, r_in, RL = 1.5, 0.2, 2.8
I = E0 / (r_in + RL)
p("電池 1.5 V・0.2 Ω・負荷 2.8 Ω：I A・端子電圧 V", I, E0 - r_in * I)
p("燃料電池 ΔG 237.13 kJ/mol の電圧 V", 237130 / (2 * F_far))
p("熱電対 K 約41 μV/K〔要〕で 300 K の差 mV", 41e-6 * 300 * 1e3)
p("ドライヤー 1200 W＋ストーブ 800 W の電流 A（コード 15 A）", (1200 + 800) / 100)
tau = me * sig_cu / (n_cu * e * e)
p("ドルーデ：銅の衝突の間の時間 s", tau)

print("\n== 電-5")
I_line = 200.0; r_per_m = 0.5e-3
Vbird = I_line * r_per_m * 0.05
p("鳥：電線 0.5 Ω/km・200 A・足の間 5 cm：電圧 V・体 1 kΩ〔仮〕の電流 μA", Vbird, Vbird / 1e3 * 1e6)
p("12 A が 1 Ω と 3 Ω に分かれる A", 12 * 3 / 4, 12 * 1 / 4)
# 3-6⑦：9 V・6 V・2 Ω×3（網目電流 I1, I2）
sol = solve([[4, 2], [2, 4]], [9, 6])
p("3-6⑦ の回路を行列で I1・I2 A", *[float(abs(x)) for x in sol])
# 3 網目の例：R1=1,R2=2,R3=3,R4=4,R5=5,E=10 のはしご（網目電流）
A3 = [[1 + 2, -2, 0], [-2, 2 + 3 + 4, -4], [0, -4, 4 + 5]]
sol3 = solve(A3, [10, 0, 0])
p("はしご（1・2・3・4・5 Ω、10 V）の網目電流 A", *[float(abs(x)) for x in sol3])
# 節点電位：中の節点の電位 φ：(9−φ)/2 + (6−φ)/2 = φ/2
phi_m = (9 / 2 + 6 / 2) / (1 / 2 + 1 / 2 + 1 / 2)
p("節点電位法：まん中の点の電位 V・まん中の電流 A", phi_m, phi_m / 2)
Eth = (9 / 2 + 6 / 2) / (1 / 2 + 1 / 2); Rth = par(2, 2)
p("テブナン：E_th V・R_th Ω・2 Ω の電流 A", Eth, Rth, Eth / (Rth + 2))
p("1/4 ブリッジ 5 V・120 Ω・ΔR 0.12 Ω の出力 mV（近似・正確）", 5 * 0.12 / (4 * 120) * 1e3,
  (5 * (120.12 / (120.12 + 120)) - 2.5) * 1e3)
p("分流器：10 Ω・10 mA → 1 A Ω", 10 * 0.01 / (1 - 0.01))
p("倍率器：1 V・1 kΩ → 100 V kΩ", (100 - 1) / (1 / 1e3) / 1e3)
Eb, rb = 12.0, 0.5
p("最大電力 12 V・0.5 Ω：R_L Ω・P W", rb, Eb ** 2 / (4 * rb))
I_s = 3.0 / (5 + 1.0); I_p = 1.5 / (5 + 0.25)
p("電池2本 直列・並列（豆電球 5 Ω・1本 0.5 Ω）A", I_s, I_p)
p("コンデンサーを含む回路 12 V・4 Ω+2 Ω・10 μF：V_C V・Q μC", 12 * 2 / 6, 10e-6 * 4 * 1e6)

print("\n== 電-6")
B = mu0 * 10 / (2 * pi * 0.05)
p("10 A・5 cm の B T・地磁気の水平分力 3.0e-5 T〔要〕と合わせた振れ°", B, math.degrees(math.atan(B / 3.0e-5)))
p("円電流 10 巻・1 A・半径 5 cm の中心 T", 10 * mu0 * 1 / (2 * 0.05))
p("ソレノイド 1000 /m・2 A T", mu0 * 1000 * 2)
p("環状コイル 500 巻・1 A・半径 0.1 m T", mu0 * 500 * 1 / (2 * pi * 0.1))
p("導線の力 3 A・0.2 m・0.5 T N（4-14⑧）", 3 * 0.2 * 0.5)
p("平行電流 1 A・1 m の力 N/m", mu0 * 1 * 1 / (2 * pi * 1))
p("コード 10 A・3 mm の反発 N/m", mu0 * 10 * 10 / (2 * pi * 3e-3))
v = math.sqrt(2 * e * 1000 / me)
p("電子 1 kV・1 mT の半径 m", me * v / (e * 1e-3))
p("陽子 1 T のサイクロトロン振動数 MHz", e * 1 / (2 * pi * mp) / 1e6)
p("ホール電圧 n=1e22・1 mA・0.1 T・厚さ 0.1 mm mV", 1e-3 * 0.1 / (1e22 * e * 1e-4) * 1e3)
p("コイルのトルク 100 巻・2 cm 角・10 mA・0.2 T N·m", 100 * 0.01 * 4e-4 * 0.2)
p("送電線 1000 A の 20 m 下 μT（基準 200 μT）", mu0 * 1000 / (2 * pi * 20) * 1e6)
p("速度選別器 1e4 V/m・0.01 T m/s", 1e4 / 0.01)

print("\n== 電-7")
p("鉄の中 1.5 T の磁化 M A/m（μ0H を無視）", 1.5 / mu0)
p("鉄心 μr 1000・1000 /m・0.1 A の B T・空心 T", 1000 * mu0 * 1000 * 0.1, mu0 * 1000 * 0.1)
l, S, mur, N, I = 0.2, 4e-4, 2000, 200, 0.5
Rm = l / (mur * mu0 * S); Phi = N * I / Rm
p("磁気回路：R_m 1/H・Φ Wb・B T", Rm, Phi, Phi / S)
Rg = 1e-3 / (mu0 * S); Phi2 = N * I / (Rm + Rg)
p("すき間 1 mm：R_g・Φ Wb・B T・すき間の割合", Rg, Phi2, Phi2 / S, Rg / (Rm + Rg))
p("すき間 1 mm で 0.5 T に要る NI A", 0.5 / mu0 * 1e-3)
loss = 4 * 1.5 * 50  # 4 B_max H_c（J/m3・1 周）
p("ヒステリシス損（面積 4BmHc の近似、Hc 50 A/m〔仮〕）J/m3・50 Hz で W/kg", loss, loss * 50 / 7850)
th = math.radians(80)
p("鉄 μr 1000 から空気：鉄の中 80° の磁力線の空気の角°", math.degrees(math.atan(math.tan(th) / 1000)))
p("地磁気 全磁力 46000 nT〔要〕の H A/m", 46000e-9 / mu0)
chi = 9.0e-6
p("水の反磁性 χ 9.0e-6〔要〕で浮く B dB/dz T2/m", mu0 * 1000 * g / chi)
p("リレー 2000 巻・30 mA・すき間 0.5 mm の B T", mu0 * 2000 * 0.03 / 0.5e-3)
p("ネオジム 1.3 T とフェライト 0.4 T〔要〕の吸引力の比（B^2）", (1.3 / 0.4) ** 2)

print("\n== 電-8")
p("コイル 100 巻・1e-4 Wb を 0.1 s：V", 100 * 1e-4 / 0.1)
l, v, B, R = 0.5, 2.0, 0.1, 1.0
emf = v * B * l; I = emf / R
p("棒 0.5 m・2 m/s・0.1 T：V・I・力 N・仕事率 W・熱 W", emf, I, I * B * l, I * B * l * v, I * I * R)
p("発電機 100 巻・0.01 m2・0.5 T・50 Hz の山 V", 100 * 0.5 * 0.01 * 2 * pi * 50)
p("飛行機の翼 60 m・250 m/s・3.5e-5 T〔要〕 V", 60 * 250 * 3.5e-5)
Ls = mu0 * 1000 ** 2 * pi * 0.01 ** 2 / 0.1
p("ソレノイド 1000 巻・0.1 m・半径 1 cm の L mH", Ls * 1e3)
p("リレー 0.2 H・30 mA を 0.1 ms で切る V", 0.2 * 0.03 / 1e-4)
p("相互誘導 M 0.01 H・100 A/s の V", 0.01 * 100)
p("リレー 0.2 H・30 mA のエネルギー J", 0.5 * 0.2 * 0.03 ** 2)
p("電磁石 1 T・1e-3 m2 の吸引力 N（1 面）", 1 ** 2 * 1e-3 / (2 * mu0))
def skin(f, sigma, mur=1):
    return math.sqrt(2 / (2 * pi * f * mur * mu0 * sigma))
p("IH 25 kHz：鉄 σ1e7・μr100〔仮〕 mm・アルミ mm・銅 mm", skin(25e3, 1e7, 100) * 1e3, skin(25e3, sig_al) * 1e3, skin(25e3, sig_cu) * 1e3)
p("積層 0.35 mm と 3.5 mm の渦電流損の比", (0.35 / 3.5) ** 2)
p("IC カード 13.56 MHz・2 μH の共振 C pF", 1 / ((2 * pi * 13.56e6) ** 2 * 2e-6) * 1e12)

print("\n== 電-9")
E, R, C = 10, 20e3, 100e-6
p("6-4 の RC：τ s・はじめの電流 mA", R * C, E / R * 1e3)
tau = 470e-6 * 10e3
p("充電器 470 μF・10 kΩ〔仮〕：τ s・5 V→2 V の時間 s", tau, tau * math.log(5 / 2))
p("リレー 12 V・400 Ω・0.2 H：τ ms・I mA", 0.2 / 400 * 1e3, 12 / 400 * 1e3)
p("充電のエネルギー 100 μF・10 V：C mJ・電池 mJ・抵抗 mJ", 0.5 * 100e-6 * 100 * 1e3, 100e-6 * 10 * 10 * 1e3, 0.5 * 100e-6 * 100 * 1e3)
L, C = 10e-3, 1e-6
p("LC 10 mH・1 μF：ω rad/s・f Hz", 1 / math.sqrt(L * C), 1 / (2 * pi * math.sqrt(L * C)))
p("臨界抵抗 Ω", 2 * math.sqrt(L / C))
# RLC ステップ：10 V、R=20 Ω のコンデンサーの電圧の最大（9-7 の 17.29 V）
R = 20.0; wn = 1 / math.sqrt(L * C); z = R / 2 * math.sqrt(C / L); wd = wn * math.sqrt(1 - z * z)
p("RLC 10 V・20 Ω：ζ・最大 V", z, 10 * (1 + math.exp(-z * wn * pi / wd)))
p("電球の突入（電-4 の 8.2 Ω）A・点灯中の何倍", 100 / (100 / (1 + 0.0045 * 2480)), (1 + 0.0045 * 2480))
p("フラッシュ 100 μF・300 V〔仮〕：J・1 ms で kW", 0.5 * 100e-6 * 300 ** 2, 0.5 * 100e-6 * 300 ** 2 / 1e-3 / 1e3)
p("力-6 のモーター I 0.02・c 0.01 → τ s（L=0.02 H・R=0.01 Ω と同じ）", 0.02 / 0.01)
C1, C2, V1 = 10e-6, 10e-6, 10.0
Vf = C1 * V1 / (C1 + C2)
p("10 μF を 10 V にして空の 10 μF とつなぐ：V・前 mJ・後 mJ", Vf, 0.5 * C1 * V1 ** 2 * 1e3, 0.5 * (C1 + C2) * Vf ** 2 * 1e3)

print("\n== 電-10")
p("100 V の山 V", 100 * math.sqrt(2))
p("1200 W・100 V：実効 A・山 A", 12.0, 12 * math.sqrt(2))
for f in (50, 1592):
    p(f"10 mH の X_L {f} Hz Ω", 2 * pi * f * 10e-3)
p("1 μF の X_C 50 Hz Ω", 1 / (2 * pi * 50 * 1e-6))
Z = complex(4, 3)
p("RL 4 Ω・3 Ω・100 V：|Z|・I A・位相°", abs(Z), 100 / abs(Z), -math.degrees(cmath.phase(Z)))
L, C, R = 10e-3, 1e-6, 20.0
f0 = 1 / (2 * pi * math.sqrt(L * C)); Q = 2 * pi * f0 * L / R
p("RLC 6-13：f0 Hz・I mA(1 V)・Q・ζ", f0, 1 / R * 1e3, Q, 1 / (2 * Q))
for f in (1000, 2000):
    w = 2 * pi * f
    p(f"  {f} Hz の電流 mA", 1 / abs(complex(R, w * L - 1 / (w * C))) * 1e3)
Lr = 200e-6
for f in (1e6, 594e3):
    p(f"ラジオ 200 μH・{f/1e3:.0f} kHz の C pF", 1 / ((2 * pi * f) ** 2 * Lr) * 1e12)
p("Q 100・1 MHz の半値幅 kHz", 1e6 / 100 / 1e3)
Rf, Cf = 1e3, 0.1e-6
fc = 1 / (2 * pi * Rf * Cf)
p("RC ローパス：fc Hz・10 kHz の dB", fc, 20 * math.log10(1 / math.sqrt(1 + (10e3 / fc) ** 2)))
p("マクスウェルブリッジ R2=R3=1 kΩ・C4=0.01 μF の L mH", 1e3 * 1e3 * 0.01e-6 * 1e3)
p("ひずみ波 100 V と 3 倍波 10 V の実効値 V", math.sqrt(100 ** 2 + 10 ** 2))
w0 = 2 * pi * f0
p("並列共振（同じ L・C、R=20 Ω が L と直列）のインピーダンス Ω", L / (C * R))

print("\n== 電-11")
V, I, pf = 100, 10, 0.8
p("100 V・10 A・力率 0.8：P W・Q var・S VA", V * I * pf, V * I * math.sqrt(1 - pf ** 2), V * I)
P, pf, V = 2000, 0.7, 200
I = P / (V * pf); Qr = P * math.tan(math.acos(pf))
p("モーター 2 kW・力率 0.7・200 V：I A・Q var・力率1にする C μF（50 Hz）", I, Qr, Qr / (2 * pi * 50 * V ** 2) * 1e6)
p("力率改善後の電流 A・損失の比", P / V, (P / V / I) ** 2)
p("線間 200 V の相電圧 V", 200 / math.sqrt(3))
p("三相 200 V・10 A・力率 0.85 の電力 kW", math.sqrt(3) * 200 * 10 * 0.85 / 1e3)
# 単相2線 と 三相3線：同じ電力・同じ線間電圧・同じ損失のときの銅の量の比
# 単相：I1=P/V、損失 2 I1² R1。三相：I3=P/(√3V)、損失 3 I3² R3 = P²R3/V²。等しい→ R3 = 2R1 → 断面半分、3本 → 3×(1/2) / 2 = 0.75
p("三相3線／単相2線の銅の量", 3 * 0.5 / 2)
ws = 2 * pi * 50
ts = [i / 1000 * 0.02 for i in range(1000)]
pt = [sum(math.cos(ws * t - 2 * pi * k_ / 3) * math.cos(ws * t - 2 * pi * k_ / 3 - math.acos(0.85)) for k_ in range(3)) for t in ts]
p("三相の瞬時電力（相 1 V・1 A・力率 0.85）最小・最大", min(pt), max(pt))
for pole in (2, 4):
    p(f"回転磁界 50 Hz・{pole} 極 min^-1", 120 * 50 / pole)
p("Δ 30 Ω → Y Ω", 30 / 3.0)
p("50 kVA・力率 0.8 の kW", 50 * 0.8)
p("電-0 例題1 を力率 0.9〔仮〕で：電流の倍・損失の倍", 1 / 0.9, 1 / 0.9 ** 2)

print("\n== 電-12")
p("6600 V → 100 V：巻数比・二次 30 A のときの一次 A", 6600 / 100, 30 * 100 / 6600)
Phi = 100 / (4.44 * 50 * 200)
p("100 V・50 Hz・200 巻：Φmax Wb・20 cm2 の B T", Phi, Phi / 20e-4)
Pout, Pfe, Pcu = 10e3, 50, 150
p("変圧器 10 kVA：全負荷の効率 %・最大効率の負荷率", Pout / (Pout + Pfe + Pcu) * 100, math.sqrt(Pfe / Pcu))
x = math.sqrt(Pfe / Pcu)
p("  最大効率 %", x * Pout / (x * Pout + 2 * Pfe) * 100)
K, R, V = 0.05, 0.5, 12.0
p("直流モーター K 0.05・R 0.5・12 V：無負荷 rad/s・起動トルク N·m・起動電流 A", V / K, K * V / R, V / R)
p("波-4 の a・a′", K / R, K * K / R)
w = 200.0; I = (V - K * w) / R; Tq = K * I
p("200 rad/s のとき：I A・T N·m・出力 W・入力 W・効率 %", I, Tq, Tq * w, V * I, Tq * w / (V * I) * 100)
p("4 極・50 Hz・1440 min^-1 のすべり", (1500 - 1440) / 1500)
# 誘導モーター：簡単な等価回路 V/相 = 200/√3、R1=0（無視）、R2'=0.5、X=1.0、s=0.04、4 極 50 Hz
Vph = 200 / math.sqrt(3); R2, X, s = 0.1, 0.8, 0.04
I2 = Vph / math.hypot(R2 / s, X); Pag = 3 * I2 ** 2 * R2 / s; wsync = 2 * pi * 1500 / 60
p("誘導モーター（仮）：I2 A・トルク N·m・最大トルクのすべり", I2, Pag / wsync, R2 / X)
for pole, f in ((8, 400), (2, 50), (24, 50)):
    p(f"同期速度 {pole} 極・{f} Hz min^-1", 120 * f / pole)
p("V/f 一定：25 Hz の電圧 V", 200 * 25 / 50)
p("回生 1500 kg・20 m/s・効率 70 % kJ", 0.5 * 1500 * 400 * 0.7 / 1e3)

print("\n== 電-13")
a, b, er = 0.45e-3, 1.6e-3, 2.3
L_ = mu0 / (2 * pi) * math.log(b / a); C_ = 2 * pi * eps0 * er / math.log(b / a)
Z0 = math.sqrt(L_ / C_); vp = 1 / math.sqrt(L_ * C_)
p("同軸：Z0 Ω・速さ m/s・光速の何倍", Z0, vp, vp / c0)
er2 = 1.5
lnba = 75 / (60 / math.sqrt(er2))
p("75 Ω・発泡 εr 1.5〔仮〕の b/a", math.exp(lnba))
p("50→75 Ω：r・電力 %", (75 - 50) / 125, ((75 - 50) / 125) ** 2 * 100)
p("300→75 Ω：r・電力 %", (75 - 300) / 375, ((75 - 300) / 375) ** 2 * 100)
p("10 m の往復 ns", 2 * 10 / vp * 1e9)
p("50 Hz の波長 km（光速）・1 GHz の線の中の波長 m", c0 / 50 / 1e3, vp / 1e9)
Rl, Xl, I, pf = 0.5, 0.4, 100, 0.8
p("配電線 0.5 Ω・0.4 Ω・100 A・力率 0.8 の電圧降下 V（1 相）", I * (Rl * pf + Xl * math.sqrt(1 - pf ** 2)))
p("%Z 5 % の変圧器の短絡電流は定格の何倍", 100 / 5)
beta = 2 * pi / (c0 / 50)
p("無負荷 300 km の受電端電圧 倍", 1 / math.cos(beta * 300e3))
p("λ/4 変成器 50 と 100 Ω の間 Ω", math.sqrt(50 * 100))
p("7-11 の線（r=1・g=1・1 km）cosh・sinh", math.cosh(1), math.sinh(1))
# ABCD：直列 2 Ω の箱 × 並列 0.5 S の箱（7-3 と同じ (2 2;0.5 1)）
A_ = [[1, 2], [0, 1]]; B_ = [[1, 0], [0.5, 1]]
M = [[sum(A_[i][t] * B_[t][j] for t in range(2)) for j in range(2)] for i in range(2)]
p("直列 2 Ω × 並列 0.5 S の ABCD・AD−BC", M, M[0][0] * M[1][1] - M[0][1] * M[1][0])

print("\n== 電-14")
I = 1.0; r = 0.05
p("充電 1 A・極板の縁 5 cm の磁場 T", mu0 * I / (2 * pi * r))
p("海水 σ 4・εr 80〔要〕・1 MHz：変位電流／伝導電流", 2 * pi * 1e6 * 80 * eps0 / 4)
p("1e6 V/m の電場 J/m3・1 T の磁場 J/m3", 0.5 * eps0 * 1e12, 1 / (2 * mu0))
p("導線 100 V・10 A のポインティングの流れ W", 100 * 10.0)
S0 = 1361.0
E0 = math.sqrt(2 * S0 / (c0 * eps0))
p("太陽光 1361 W/m2〔要〕：E0 V/m・B0 T", E0, E0 / c0)
p("電子レンジ 1000 W が 0.3 m 角の窓を通るとしたら W/m2（仮）", 1000 / 0.09)
p("棒 2 m/s・0.1 T と動く人の見る電場 V/m・棒 0.5 m の電圧 V（電-8 例題2）", 2 * 0.1, 2 * 0.1 * 0.5)
p("海水の比の逆数", 1 / (2 * pi * 1e6 * 80 * eps0 / 4))

print("\n== 電-15")
p("2.45 GHz の波長 cm", c0 / 2.45e9 * 100)
for f in (80e6, 1e6, 2.4e9):
    p(f"{f/1e6:g} MHz の波長 m", c0 / f)
p("太陽光の放射圧（吸収）Pa・200 m2 の帆（反射）N", S0 / c0, 2 * S0 / c0 * 200)
p("E0 1 V/m の H0 mA/m", 1 / math.sqrt(mu0 / eps0) * 1e3)
p("半波長ダイポール 73 Ω・1 A（実効）の放射 W", 73 * 1 ** 2)
p("空の青 450/700 の4乗", (700 / 450) ** 4)
for n in (1.5, 1.333):
    p(f"垂直入射の反射 n={n} %", ((n - 1) / (n + 1)) ** 2 * 100)
p("ブルースター角 n=1.5 °", math.degrees(math.atan(1.5)))
p("水 √80・光の屈折率 1.333", math.sqrt(80.2), 1.333)
for f in (50, 1e6, 2.45e9):
    p(f"銅の表皮深さ {f:g} Hz mm", skin(f, sig_cu) * 1e3)
p("円い穴 1 mm の遮断波長 mm（1.706 d）", 1.706 * 1)
# 遮断より下の減衰：α ≈ 2π/λc（λ≫λc）→ 1 mm の厚さで何 dB
lc = 1.706e-3; alpha = 2 * pi / lc * math.sqrt(1 - (lc / 0.1224) ** 2)
p("穴（直径 1 mm・板厚 1 mm）の減衰 dB", 20 * math.log10(math.e) * alpha * 1e-3)
p("  強さの割合（dB から）", 10 ** (-20 * math.log10(math.e) * alpha * 1e-3 / 10))
p("2.4 GHz の λ/4 cm", c0 / 2.4e9 / 4 * 100)
p("1 W を全方向に 10 m で W/m2", 1 / (4 * pi * 100))
# ラーモア：電子が 1e20 m/s^2 で加速したときの放射の仕事率
p("ラーモア a=1e20 m/s2 の W", e ** 2 * 1e40 / (6 * pi * eps0 * c0 ** 3))

print("\n== 電-16（見本の計算）")
H, f, dP = 5.0, 50.0, 0.01
p("慣性 H 5 s・1 % の電源が落ちた直後の df/dt Hz/s", dP * f / (2 * H))
p("単相全波整流 100 V の平均 V", 2 * math.sqrt(2) * 100 / pi)
p("太陽光 1 kW/m2・効率 20 %・1 GW の面積 km2", 1e9 / (1e3 * 0.2) / 1e6)
p("東西の連系 210→300 万 kW〔要〕の増え方 %", (300 - 210) / 210 * 100)
