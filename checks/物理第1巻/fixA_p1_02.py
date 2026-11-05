# 物理第1巻 第19回の直し（組A）：力-2 で変えた・足した数の検算。  python3 -I fixA_p1_02.py
import math
g = 9.8
def floor_to(x, d):   # 上限の答えは、条件をこえない向き（切り捨て）にまるめる
    f = 10 ** d
    return math.floor(x * f) / f
# ⑦ カーブの速さの上限（例題8・じぶんでとこう8・チャレンジ1(1)）
for r, mu in ((50, 0.7), (50, 0.4), (100, 0.5)):
    v = math.sqrt(mu * g * r)
    print("カーブ r=%d μ=%.1f：v≦%.3f m/s → %s m/s、時速 %.2f → %d km" % (r, mu, v, floor_to(v, 0), v * 3.6, math.floor(v * 3.6)))
# 例題7・じぶんでとこう7 の上限
for mu in (0.40, 0.25):
    a = mu * g; print("荷物 μ=%.2f：a0≦%.3f → %s" % (mu, a, floor_to(a, 1)))
# ⑦ 2倍にすると（軌道の半径）：地面すれすれ v=√(gR)、周期 2πR/v
R = 6.371e6; v1 = math.sqrt(g * R); T1 = 2 * math.pi * R / v1
for k in (1, 2, 4):
    v = v1 / math.sqrt(k); T = T1 * k ** 1.5
    print("r=%dR：v=%.2f km/s、T=%.0f s（%.1f 時間、%.0f 分）" % (k, v / 1000, T, T / 3600, T / 60))
print("2倍で速さ %.3f 倍、周期 %.3f 倍" % (1 / math.sqrt(2), 2 ** 1.5))
# 章末 チャレンジ1(2) 円すい振り子、チャレンジ2 月
print("円すい振り子 l=0.50 60°：T=%.3f s" % (2 * math.pi * math.sqrt(0.50 * math.cos(math.radians(60)) / g)))
Tm = 2 * math.pi * math.sqrt(3.84e8**3 / 3.99e14); print("月 T=%.3e s = %.1f 日" % (Tm, Tm / 86400))
# 基本：アトウッド 3.0/2.0 kg、斜面 30°・μ'=0.30・5.0 m
print("アトウッド a=%.2f F_T=%.1f" % ((3 - 2) / 5 * g, 2 * 3 * 2 / 5 * g))
a = g * (0.5 - 0.30 * math.cos(math.radians(30))); print("斜面 a=%.3f t=%.2f" % (a, math.sqrt(2 * 5.0 / a)))
# チャレンジ3（板の上の物体）の場合分けを数で確かめる：m=1、m板=2、μ=0.5、μ'=0.4
m, mb, mu, mup = 1.0, 2.0, 0.5, 0.4
Fmax = mu * (mb + m) * g
for F in (0.5 * Fmax, 1.5 * Fmax):
    if F <= Fmax:
        aa = F / (mb + m); print("F=%.2f：いっしょに a=%.3f、摩擦 %.3f ≦ μmg %.3f" % (F, aa, m * aa, mu * m * g))
    else:
        print("F=%.2f：物体 a1=%.3f、板 a2=%.3f（a2>a1 ですべる）" % (F, mup * g, (F - mup * m * g) / mb))
# チャレンジ4（机とおもり）：mA=2、mB=1、μ'=0.2
mA, mB, mup = 2.0, 1.0, 0.2
aa = (mB - mup * mA) * g / (mA + mB); FT = (1 + mup) * mA * mB * g / (mA + mB)
print("机とおもり a=%.3f F_T=%.3f  確かめ A: %.3f B: %.3f" % (aa, FT, FT - mup * mA * g - mA * aa, mB * g - FT - mB * aa))
# ⑧ 身近な例：霧（半径 10 μm）と雨つぶ（半径 1 mm、二乗の抵抗 C_D≈0.5 として見当）
mu_air = 1.81e-5; rho_w = 1000; rho_a = 1.2
r = 10e-6; vf = (4 / 3 * math.pi * r**3 * rho_w * g) / (6 * math.pi * mu_air * r); print("霧 v_f=%.4f m/s" % vf)
r = 1e-3; mrain = 4 / 3 * math.pi * r**3 * rho_w; c = 0.5 * rho_a * 0.5 * math.pi * r**2
print("雨つぶ（見当）v_t=%.1f m/s（観測は約6.5 m/s：1秒に数 m）" % math.sqrt(mrain * g / c))
