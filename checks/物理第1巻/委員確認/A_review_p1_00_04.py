#!/usr/bin/env python3
"""物理第1巻 委員確認 修A（前付・力-0〜4）：数を変えた所・足した所の検算（第21回）。
使い方: python3 checks/物理第1巻/委員確認/A_review_p1_00_04.py   → すべて OK なら最後に「全部 OK」
"""
import math

ok = True
def check(name, got, want, tol=1e-9):
    global ok
    good = abs(got - want) <= tol
    ok &= good
    print(('OK ' if good else 'NG ') + name + f'：計算 {got:.6g}、紙面 {want:g}')

g = 9.8
# ---- R1-6 力-1 例題13（ジャンプ台、v0=25 m/s、斜面30°）
th = math.radians(30)
t = 25 * math.tan(th) / 4.9
x = 25 * t
l = x / math.cos(th)
check('例題13 ⑥ t（4けた）', round(t, 3), 2.946)
check('例題13 ⑥ x=25t', round(x, 1), 73.6)
check('例題13 ⑥ 73.6/0.866', round(73.6 / 0.866, 1), 85.0)
check('例題13 ⑥ l', round(l, 1), 85.0)
check('例題13 ⑦ y=4.9×2.946²', round(4.9 * 2.946 ** 2, 1), 42.5)
check('例題13 ⑦ x tan30°', round(x * math.tan(th), 1), 42.5)
check('例題13 答え t（2けた）', float(f'{t:.2g}'), 2.9)
check('例題13 答え l（2けた）', float(f'{l:.2g}'), 85)
check('例題13 文字の式 2v0²tanα/(g cosα)', 2 * 25 ** 2 * math.tan(th) / (g * math.cos(th)), l, 1e-9)
# 同じ形のじぶんでとこう（15 m/s）は二度丸めがないことを確かめる
t2 = 15 * math.tan(th) / 4.9
check('じぶんでとこう13 t', float(f'{t2:.2g}'), 1.8)
check('じぶんでとこう13 l', float(f'{15 * t2 / math.cos(th):.2g}'), 31)

# ---- 力-0 に足した「桁の感覚」（K-11）
check('2 t の荷の重さ〔kN〕', float(f'{2000 * g / 1000:.2g}'), 20)
check('作業半径10 m の回す働き〔kN·m〕', float(f'{2000 * g * 10 / 1000:.2g}'), 200)
check('30 MPa × 1 cm²〔kN〕', 30e6 * 1e-4 / 1000, 3)
check('3 kN は約何 kg の重さか', float(f'{30e6 * 1e-4 / g:.1g}'), 300)
check('2 t を 0.50 m/s で上げる動力〔kW〕', 2000 * g * 0.50 / 1000, 9.8)
# この式の読み方 T=m(g+a)：a=-g で T=0
check('T=m(g+a)、a=-g', 2000 * (g + (-g)), 0)

# ---- 力-1 章末問題 基本7・8（K-11 で足した）
check('基本7 x', 3.0 * 5.0, 15)
check('基本7 y', 4.0 * 5.0, 20)
check('基本7 速さ', math.hypot(3.0, 4.0), 5.0)
check('基本7 距離', math.hypot(15, 20), 25)
vA = 90 / 3.6; vB = 108 / 3.6
check('基本8 Aから見たB', vB - vA, 5.0, 1e-9)
check('基本8 Bから見たA', vA - vB, -5.0, 1e-9)

# ---- 力-2 章末問題 基本8（K-11 で足した）
v0 = 54 / 3.6
a = (0 - v0 ** 2) / (2 * 30)
check('基本8 v0', v0, 15)
check('基本8 a', a, -3.75)
check('基本8 力〔N〕', 1200 * abs(a), 4500)

# ---- 力-2 もっと知りたい「宇宙ステーション」（K-11 で足した）
check('ISS 距離の比', round(6770 / 6370, 2), 1.06)
check('ISS g の倍率', round((6370 / 6770) ** 2, 2), 0.89)
check('ISS 重力加速度', round(9.8 * (6370 / 6770) ** 2, 1), 8.7)

# ---- 力-3 チャレンジ（K-10・K-11 で足した2問）
V = math.sqrt(2 * g * 0.20)
check('弾道ふりこ (1) V', round(V, 2), 1.98)
v = 1.01 * V / 0.010
check('弾道ふりこ (2) v（2けた）', float(f'{v:.2g}'), 200)
check('弾道ふりこ (3) 変わった割合〔%〕', round(100 * (1 - 0.010 / 1.01)), 99)
v1 = math.sqrt(2 * g * 1.8); v2 = math.sqrt(2 * g * 0.80)
check('弾むボール (1) 前の速さ', round(v1, 2), 5.94)
check('弾むボール (1) あとの速さ', round(v2, 2), 3.96)
check('弾むボール (1) e', round(v2 / v1, 2), 0.67)
J = 0.50 * (v2 + v1)
check('弾むボール (2) 力積〔N·s〕', float(f'{J:.2g}'), 4.9)
check('弾むボール (3) 平均の力〔N〕（2けた）', float(f'{J / 0.010 + 0.50 * g:.2g}'), 500)

print('全部 OK' if ok else '合わない所がある')
