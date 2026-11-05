# 波-5（tex/p3-05.tex）の数値の検算。python3 checks/物理第3巻/波-5/calc_p3_05.py
import math
from math import pi, sqrt, sin, cos

g = 9.8
c_air = 343.0          # 20 ℃ の空気の音速（本文の値）
E_st, rho_st, G_st = 205e9, 7850.0, 79e9   # 鋼（第1巻の巻末）
E_al, rho_al = 69e9, 2700.0                # アルミニウム合金（第1巻の巻末）
K_w, rho_w = 2.2e9, 998.0                  # 水（力-8・力-12）
p0, rho_a = 101325.0, 1.20                 # 空気 20 ℃（第1巻の巻末 1.20）


def p(label, *v):
    print(label, ':', ', '.join(('%.6g' % x) if isinstance(x, float) else str(x) for x in v))


print('== 本文')
p('ウェーブ：12 m/s ÷ 20 席/s の席のはば m', 12 / 20)
p('ウェーブの幅 6〜12 m → 立っている時間 s', 6 / 12, 12 / 12)
p('c=fλ：440 Hz の波長', c_air / 440)
p('20 Hz・20 kHz の波長 m', c_air / 20, c_air / 20000)
c_st = sqrt(E_st / rho_st)
p('鋼の棒 √(E/ρ)', c_st)
nu = 0.3
M = E_st * (1 - nu) / ((1 + nu) * (1 - 2 * nu))
p('鋼の広い固体の縦波 √(M/ρ)、M', sqrt(M / rho_st), M)
p('鋼の横波 √(G/ρ)', sqrt(G_st / rho_st))
p('アルミ √(E/ρ)', sqrt(E_al / rho_al))
p('水 √(K/ρ)', sqrt(K_w / rho_w))
p('ニュートン √(p/ρ)（1.20）, ×√1.4', sqrt(p0 / rho_a), sqrt(1.4 * p0 / rho_a))
p('0 ℃：ρ=1.293 のニュートンの値, ×√1.4', sqrt(p0 / 1.293), sqrt(1.4 * p0 / 1.293))
p('津波 h=4000 m：m/s, km/h', sqrt(g * 4000), sqrt(g * 4000) * 3.6)
p('h=10 m：m/s, km/h', sqrt(g * 10), sqrt(g * 10) * 3.6)
p('h=100 m・1000 m', sqrt(g * 100), sqrt(g * 1000))
p('グリーンの法則 4000→10 m の高さの倍率 (h1/h2)^(1/4)', (4000 / 10) ** 0.25)
p('17000 km を 4000 m の深さで：s, h', 17000e3 / sqrt(g * 4000), 17000e3 / sqrt(g * 4000) / 3600)

print('== 例題3 ギター（3けた）')
cA = 2 * 0.65 * 110
p('A弦の c', cA)
p('μ=6.3 g/m の張力 N（D'"'"'Addario A弦 28.93 lb＝128.7 N）', 6.3e-3 * cA ** 2, 28.93*4.448)
cE1 = 2 * 0.65 * 329.6
p('1弦 E 329.6 Hz の c, μ=0.57 g/m の張力', cE1, 0.57e-3 * cE1 ** 2)
p('張力 4倍 → c 倍', sqrt(4))

print('== 例題4 レール')
p('鋼 1000 m の時間, 空気の時間, 差', 1000 / c_st, 1000 / c_air, 1000 / c_air - 1000 / c_st)
p('アルミ 1 m の棒をわたる時間 µs', 1 / sqrt(E_al / rho_al) * 1e6)

print('== 例題5 水')
cw = sqrt(K_w / rho_w)
p('水 1 km の時間, 空気の何倍の速さ', 1000 / cw, cw / c_air)
p('海水 K=2.34 GPa・1025', sqrt(2.34e9 / 1025))

print('== 例題8 正弦波')
A, w, kk = 0.02, 10 * pi, 5 * pi
p('ω, k, c, f, λ, T', w, kk, w / kk, w / (2 * pi), 2 * pi / kk, 2 * pi / w)
p('x=0.05, t=0.05 の y', A * sin(w * 0.05 - kk * 0.05))
p('粒子の最大の速さ Aω', A * w)
p('じぶんでとこう：y=0.05 sin(4πt−2πx)：ω,k,c,λ,T, Aω', 4 * pi, 2 * pi, 2.0, 1.0, 0.5, 0.05 * 4 * pi)
p('  x=0.25, t=0.5 の y', 0.05 * sin(4 * pi * 0.5 - 2 * pi * 0.25))

print('== 例題9 地震')
for T in (10, 7):
    p('初期微動 %g s の距離 km（6.0・3.5）' % T, T / (1 / 3.5 - 1 / 6.0))
p('大森の比例定数 k', 1 / (1 / 3.5 - 1 / 6.0))

print('== 例題10 パルス（c=2 m/s）')
p('t=0.5 s の山の位置', 0.3 + 2 * 0.5)
p('x=2 で 動き始め・山・終わり', (2 - 0.4) / 2, (2 - 0.3) / 2, (2 - 0) / 2)
p('左向き：x=-1.0 で 動き始め・山・終わり（はじめ 0〜0.4、山 0.3）', (0 - (-1.0)) / 2, (0.3 + 1.0) / 2, (0.4 + 1.0) / 2)

print('== ⑦ ばねとおもりの列')
a, ks, m = 0.10, 40.0, 0.10
w0 = sqrt(ks / m)
c0 = a * w0
p('√(ks/m), c0, ω_max', w0, c0, 2 * w0)
for lam_over_a in (100, 20, 10, 8, 6, 4, 3, 2):
    k = 2 * pi / (lam_over_a * a)
    om = 2 * w0 * abs(sin(k * a / 2))
    print('  λ=%ga: ka=%.4f ω=%.4f c_p=%.4f c_g=%.4f c_p/c0=%.4f' % (lam_over_a, k * a, om, om / k, c0 * cos(k * a / 2), om / k / c0))

print('== 例題11 鋼の棒の要素（断面 1 cm²、5 mm）')
Aar, aa = 1e-4, 0.005
mm_ = rho_st * Aar * aa
kss = E_st * Aar / aa
p('m, k_s, √(k_s/m), c=a√(k_s/m), ω_max, f_max, Δt<2/ω_max', mm_, kss, sqrt(kss / mm_), aa * sqrt(kss / mm_), 2 * sqrt(kss / mm_),
  2 * sqrt(kss / mm_) / (2 * pi), 2 / (2 * sqrt(kss / mm_)))
p('じぶんでとこう：アルミ 1 mm の Δt', 0.001 / sqrt(E_al / rho_al))

print('== 例題12 群速度（a=0.10, ks=40, m=0.10）')
for lam_over_a in (4, 2, 8):
    k = 2 * pi / (lam_over_a * a)
    om = 2 * w0 * sin(k * a / 2)
    p('λ=%ga：k, ω, c_p, c_g' % lam_over_a, k, om, om / k, c0 * cos(k * a / 2))
# 4 m 進む時間（λ=4a の波群）
k = 2 * pi / (4 * a)
p('λ=4a の波群が 4 m 進む時間', 4 / (c0 * cos(k * a / 2)))
p('じぶんでとこう：a=0.05, ks=20, m=0.05 のc0, λ=4a・6a の c_p, c_g',
  0.05 * sqrt(20 / 0.05), *[x for la in (4, 6) for x in (2 * sqrt(20 / 0.05) * sin(pi / la) / (2 * pi / (la * 0.05)), 0.05 * sqrt(20 / 0.05) * cos(pi / la))])

print('== うなりのつつみ：2つの波の和（群速度の図）')
k1, k2 = 2 * pi / (4.4 * a), 2 * pi / (3.6 * a)
o1, o2 = 2 * w0 * sin(k1 * a / 2), 2 * w0 * sin(k2 * a / 2)
p('k1,k2,ω1,ω2, Δω/Δk, (ω1+ω2)/(k1+k2)', k1, k2, o1, o2, (o2 - o1) / (k2 - k1), (o1 + o2) / (k1 + k2))
p('つつみの山から山（2π/Δk）m, うなりの周期 2π/Δω s', 2 * pi / (k2 - k1), 2 * pi / (o2 - o1))

print('== ⑧ 表計算（差分）')


def run(s, steps, N=20):
    y0 = [0.0] * (N + 1)
    y0[9], y0[10], y0[11] = 0.5, 1.0, 0.5
    # 1歩め：はなした瞬間は止まっている → y1 = y0 + s²/2 (差の差)
    y1 = [0.0] * (N + 1)
    for i in range(1, N):
        y1[i] = y0[i] + s * s / 2 * (y0[i + 1] - 2 * y0[i] + y0[i - 1])
    rows = [y0, y1]
    for n in range(2, steps + 1):
        a_, b_ = rows[-2], rows[-1]
        nxt = [0.0] * (N + 1)
        for i in range(1, N):
            nxt[i] = 2 * b_[i] - a_[i] + s * s * (b_[i + 1] - 2 * b_[i] + b_[i - 1])
        rows.append(nxt)
    return rows


for s in (1.0, 1.1, 0.5):
    rows = run(s, 30)
    print('s=%g' % s)
    for n in (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30):
        r = rows[n]
        print('  %2d max|y|=%.4g  ' % (n, max(abs(x) for x in r)), ' '.join('%.3g' % x for x in r[4:17]))

# 弦の数（8-13）：c=100 m/s・Δx=0.01 m
p('Δt ≦ Δx/c', 0.01 / 100)
p('s=1.1 の Δt', 1.1 * 0.01 / 100)
# いちばんぎざぎざな形の1歩の倍率
for s in (1.0, 1.1, 1.2):
    b = 2 - 4 * s * s
    disc = b * b - 4
    if disc > 0:
        r1 = (b - sqrt(disc)) / 2
        p('s=%g のぎざぎざの1歩の倍率' % s, r1)
    else:
        p('s=%g のぎざぎざの1歩の倍率の大きさ' % s, 1.0)

print('== ⑨ 複素数')
p('ばねとおもりの列：1−cos ka を 2 sin²(ka/2) で確かめ ka=1', 1 - cos(1), 2 * sin(0.5) ** 2)

print('== 章末問題')
p('基本1：c=340, f=170 の λ, f=680 の λ', 340 / 170, 340 / 680)
p('基本2：λ=0.8 m, T=0.2 s の c, f', 0.8 / 0.2, 1 / 0.2)
p('基本3：c=143 で張力 2倍', 143 * sqrt(2))
p('基本4：初期微動 15 s の距離（k=8.4）', 15 / (1 / 3.5 - 1 / 6.0))
p('基本5：雷 光から 3.0 s（340 m/s）', 340 * 3.0)
p('チャレンジ1：ねじりの波 √(G/ρ) 鋼', sqrt(G_st / rho_st))
p('チャレンジ2：津波 h=200 m, 50 km 進む時間 分', sqrt(g * 200), 50e3 / sqrt(g * 200) / 60)
# チャレンジ3：ばねとおもりの列、λ=3a
la = 3
k = 2 * pi / (la * a)
p('チャレンジ3：λ=3a の ω, c_p, c_g', 2 * w0 * sin(pi / la), 2 * w0 * sin(pi / la) / k, c0 * cos(pi / la))
p('チャレンジ4：y=0.03 sin(20πt−4πx)：f, λ, c, Aω, x=0.1・t=0.1', 10.0, 0.5, 5.0, 0.03 * 20 * pi, 0.03 * sin(20 * pi * 0.1 - 4 * pi * 0.1))

print('== 図・表に使う行（全部の玉）')
for s, ns in ((1.0, (0, 1, 2, 3, 4, 6)), (1.1, (0, 1, 2, 3, 4, 6, 8, 10))):
    rows = run(s, 10)
    for n in ns:
        print('s=%g n=%d :' % (s, n), ' '.join('(%d,%.3f)' % (i, x) for i, x in enumerate(rows[n])))
p('例題7(2) 129 N の 2 %', 0.0063 * cA ** 2 * 0.0201)
p('1弦 23.36 lb → N、μ', 23.36 * 4.448, 23.36 * 4.448 / cE1 ** 2)
p('章末 880 Hz 空気・水', 343 / 880, 1500 / 880)
p('章末 パルス 1.0 m/s x=3.0', 2.6, 2.7, 3.0)
p('チャレンジ アルミ 2 mm', 0.002 / sqrt(E_al / rho_al), 0.010 / (0.002 / sqrt(E_al / rho_al)))
