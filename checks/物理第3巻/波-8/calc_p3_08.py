# 物理第3巻 波-8「重なる波：干渉・回折・ドップラー効果」の数値の検算
# 実行：python3 checks/物理第3巻/波-8/calc_p3_08.py > checks/物理第3巻/波-8/calc_p3_08_out.txt
import math
pi = math.pi
def p(*a):
    print(*[("%.6g" % x) if isinstance(x, float) else x for x in a])
def dop(f, c, vo, vs):  # 源→観測者の向きを正。f' = (c - vo)/(c - vs) f
    return (c - vo) / (c - vs) * f

print("== はてな？・例題1：救急車 960 Hz・60 km/h")
f0 = 960.0; v = 60 / 3.6
for c in (340.0, 343.0):
    p(" c", c, "近づく", dop(f0, c, 0, v), "遠ざかる", dop(f0, c, 0, -v), "前の波長", (c - v) / f0, "後ろの波長", (c + v) / f0, "止まっているとき", c / f0)
fa, fr = dop(f0, 340, 0, v), dop(f0, 340, 0, -v)
p("比, 半音の数", fa / fr, 12 * math.log2(fa / fr))
p("1次近似 (1±v/c)f", f0 * (1 + v / 340), f0 * (1 - v / 340))
p("770 Hz（ポー）", dop(770, 340, 0, v), dop(770, 340, 0, -v))
p("じぶん1：100 km/h 960", dop(f0, 340, 0, 100 / 3.6), dop(f0, 340, 0, -100 / 3.6))
p("じぶん1：80 km/h 770", dop(770, 340, 0, 80 / 3.6), dop(770, 340, 0, -80 / 3.6))
p("v/c", v / 340)

print("== 例題2：うなり")
p("440 と 442", abs(442 - 440.0), "まん中", 441.0, "うなりの周期", 1 / 2)
p("じぶん2：110 と 111.5", 1.5, "周期", 1 / 1.5)
p("じぶん2：A弦を合わせる：うなり3回で、張力を上げたら減った→低かった。もとは", 440 - 3)

print("== 例題3：2台のスピーカー 686 Hz")
c = 343.0; f = 686.0; lam = c / f
p("波長", lam, "経路差 0.25 m は何波長", 0.25 / lam)
# 2台が 1.0 m はなれ、3 m 前の線の上：弱め合う場所
d = 1.0; L = 3.0
for m in range(0, 3):
    # 強め合う |l1-l2| = m λ
    pass
def pathdiff(x, d=1.0, L=3.0):
    return math.hypot(x + d / 2, L) - math.hypot(x - d / 2, L)
# 強め合う・弱め合う x を二分法で
def solve(target, d=1.0, L=3.0):
    lo, hi = 0.0, 50.0
    for _ in range(200):
        mid = (lo + hi) / 2
        if pathdiff(mid, d, L) < target: lo = mid
        else: hi = mid
    return lo
for m in (0.5, 1.0, 1.5):
    p(" 経路差", m * lam, "の x", solve(m * lam))
p("じぶん3：343 Hz と 1372 Hz の波長", 343 / 343, 343 / 1372, "経路差0.5 m は", 0.5 / 1.0, 0.5 / 0.25)
p("じぶん3：経路差 0.75 m, 686 Hz", 0.75 / lam)

print("== 例題4：海岸の波の屈折")
g = 9.8
for h in (4.0, 1.0):
    p(" 深さ", h, "c=√(gh)", math.sqrt(g * h))
c1, c2 = math.sqrt(g * 4), math.sqrt(g * 1)
s2 = math.sin(math.radians(30)) * c2 / c1
p("30° → 角", math.degrees(math.asin(s2)), "sin", s2, "c2/c1", c2 / c1)
p("周期 8 s の波の波長（4 m と 1 m）", c1 * 8, c2 * 8)
s2b = math.sin(math.radians(45)) * math.sqrt(g * 0.5) / math.sqrt(g * 8)
p("じぶん4：深さ8 m→0.5 m, 45°", math.degrees(math.asin(s2b)), s2b)
p("音：空気(343)→水(1482)へ 10°", math.degrees(math.asin(math.sin(math.radians(10)) * 1482 / 343)), "臨界角", math.degrees(math.asin(343 / 1482)))
# 気温の違う空気
def cT(th): return 343.0 * math.sqrt((th + 273.15) / 293.15)
p("0 ℃, 20 ℃, 30 ℃ の音速", cT(0), cT(20), cT(30))

print("== 例題5：回折")
for fr in (500.0, 1000.0, 3000.0):
    lamv = 343 / fr
    a = 0.8
    s = lamv / a
    p(" 声", fr, "λ", lamv, "λ/a", s, "角", math.degrees(math.asin(s)) if s < 1 else "回りこむ")
p("光 633 nm・0.1 mm", math.degrees(math.asin(633e-9 / 0.1e-3)), "rad", 633e-9 / 0.1e-3)
p("光 0.8 m の戸口 rad", 550e-9 / 0.8)
p("2 m 先のスクリーンでの暗線の位置 mm（0.1 mm）", 2 * math.tan(math.asin(633e-9 / 0.1e-3)) * 1e3, "中央の明るい帯の幅", 2 * 2 * 633e-9 / 0.1e-3 * 1e3)
p("じぶん5：0.05 mm", math.degrees(math.asin(633e-9 / 0.05e-3)), "2 m で", 2 * 633e-9 / 0.05e-3 * 1e3)
p("じぶん5：100 Hz 3.43 m, 10 kHz 0.0343 m の声と 0.8 m", 343 / 100, 343 / 10000, math.degrees(math.asin(0.0343 / 0.8)))

print("== 例題6：観測者も動く（踏切 700 Hz、電車 72 km/h、343）")
fx = 700.0; vo = 72 / 3.6; c = 343.0
p("近づく", dop(fx, c, -vo, 0), "遠ざかる", dop(fx, c, vo, 0))
p("両方動く：救急車60 km/h と 車 40 km/h が近づき合う（340）", dop(960, 340, -40 / 3.6, 60 / 3.6))
p("じぶん6：同じ向き救急車60が後ろから車40に近づく（340）", dop(960, 340, 40 / 3.6, 60 / 3.6))
p("じぶん6：電車 90 km/h、踏切 700 Hz（343）", dop(fx, c, -25, 0), dop(fx, c, 25, 0))

print("== 例題7：斜めに通りすぎる救急車（340）")
c = 340.0; v = 60 / 3.6; d = 10.0
for deg in (0, 30, 45, 60, 90, 120, 180):
    th = math.radians(deg)
    p(" 角", deg, "f'", 960 * c / (c - v * math.cos(th)))
# 時刻と聞こえる高さ：出した時刻 te, 位置 x=v te（観測者は (0,d)）
print(" 時刻（聞こえた）と高さ")
for te in (-6, -3, -2, -1, -0.5, 0, 0.5, 1, 2, 3, 6):
    x = v * te; rr = math.hypot(x, d)
    tr = te + rr / c
    vt = -v * x / rr  # 観測者へ近づく速さ
    p("  te", float(te), "tr", tr, "f'", 960 * c / (c - vt))
# 960 Hz が聞こえる時刻
p("960 Hz が聞こえる時刻（最も近い時刻 0 のあと）", d / c)
p("じぶん7：角 60° で遠ざかる（120°）", 960 * c / (c - v * math.cos(math.radians(120))))
p("じぶん7：d=20 m,そのとき 960 Hz の時刻", 20 / 340)

print("== 例題8：スピードガン")
cl = 2.998e8
for fz, vv in ((24.15e9, 40.0), (10.525e9, 40.0), (24.15e9, 20.0)):
    p(" f", fz, "v", vv, "Δf", 2 * vv * fz / cl, "正確", fz * ((cl + vv) / (cl - vv) - 1))
p("じぶん8：Δf=4.0 kHz から速さ m/s, km/h", 4000 * cl / (2 * 24.15e9), 4000 * cl / (2 * 24.15e9) * 3.6)
p("音の反射板：音 40 kHz・壁に向かって 2 m/s の人（343）", 40e3 * ((343 + 2) / (343 - 2)) - 40e3, "近似", 2 * 2 * 40e3 / 343)

print("== 例題9：血流")
p("Δf", 2 * 5e6 * 0.5 * math.cos(math.radians(60)) / 1540)
p("じぶん9：Δf=2.6 kHz, 3 MHz, 45° の速さ", 2600 * 1540 / (2 * 3e6 * math.cos(math.radians(45))))
p("90° のとき", 2 * 5e6 * 0.5 * math.cos(math.radians(90)) / 1540)

print("== 例題10：マッハ円すい")
for M in (2.0, 1.2, 3.0):
    p(" Ma", M, "半角", math.degrees(math.asin(1 / M)))
p("じぶん10：半角 45° なら Ma", 1 / math.sin(math.radians(45)))
# ブームが聞こえるまで：高さ 10 km、Ma 2、真上を通ってから
h = 10000.0; M = 2.0; c = 295.0
alpha = math.asin(1 / M)
p("高さ10 km・Ma2（295 m/s）真上から何 m 先で聞こえる、何秒後", h / math.tan(alpha), h / math.tan(alpha) / (M * c))
p("船の引き波（ケルビン）の半角", math.degrees(math.asin(1 / 3)))

print("== 例題11：風")
c = 340.0; w = 10.0
p("両方止まって風 10：風下の波長, 風上の波長, 振動数", (c + w) / 960, (c - w) / 960, 960.0)
p("救急車が風下へ近づく（追い風10）", dop(960, c + w, 0, 60 / 3.6), "風なし", dop(960, c, 0, 60 / 3.6))
p("向かい風（風が観測者→救急車）", dop(960, c - w, 0, 60 / 3.6))
p("じぶん11：風 15 m/s、観測者が風上へ 0（止まる）源が止まる", 960.0)
p("じぶん11：救急車が遠ざかる（観測者は風上、風は観測者→救急車へ15）", (c + 15) / (c + 15 + 60 / 3.6) * 960)

print("== 例題12：コウモリ（343）")
fb = 40e3; vb = 5.0; c = 343.0
f_echo = fb * (c + vb) / (c - vb)
p("こだま", f_echo, "ずれ", f_echo - fb, "近似 2vf/c", 2 * vb * fb / c)
p("ずれ 1.2 kHz から速さ", 1200 * c / (2 * fb))
p("じぶん12：83 kHz のこだまに保つ。4 m/s で近づくとき出す音", 83e3 * (c - 4) / (c + 4))
# 正しく：コウモリ(源・観測者)速さ vb で前へ、ガは vm で前へ（遠ざかる）。
vm = 1.0
f_moth = fb * (c - vm) / (c - vb)     # ガが受ける：観測者 vo=vm（遠ざかる）、源 vs=vb（近づく）
f_back = f_moth * (c + vb) / (c + vm)  # ガが源（コウモリから遠ざかる向きに vm で動く → 源の速さ −vm）、コウモリは観測者（近づく vo=−vb）
p("ガ 1 m/s 遠ざかる：受ける, こだま, ずれ", f_moth, f_back, f_back - fb, "近似 2(vb-vm)f/c", 2 * (vb - vm) * fb / c)

print("== シミュレーションのプログラム（⑦）")
c = 340.0; f = 960.0; v = 60 / 3.6
T = 1 / f
# 時刻 t=0.5 s に、0〜0.5 s に出した波面（周期ごと）を調べる
t = 0.5
fronts = []
n = 0
while n * T <= t:
    te = n * T
    xs = v * te
    R = c * (t - te)
    fronts.append((xs + R, xs - R))
    n += 1
front = sorted(x for x, _ in fronts)
back = sorted(x for _, x in fronts)
p("波面の数", float(len(fronts)))
p("前の間隔 m", (front[-1] - front[0]) / (len(front) - 1), "理論 (c-v)/f", (c - v) / f)
p("後ろの間隔 m", (back[-1] - back[0]) / (len(back) - 1), "理論 (c+v)/f", (c + v) / f)
p("聞こえる高さ 前, 後ろ", c / ((front[-1] - front[0]) / (len(front) - 1)), c / ((back[-1] - back[0]) / (len(back) - 1)))

print("== 章末問題")
p("基本1 うなり：512 Hz, 3回, 下げて増えた →", 512.0 - 3)
p("基本2 1372 Hz：λ, 0.375/λ, 0.5/λ", 343 / 1372, 0.375 / (343 / 1372), 0.5 / (343 / 1372))
p("基本3 屈折 0 ℃(331)→30 ℃(349) 40°", math.degrees(math.asin(math.sin(math.radians(40)) * 349 / 331)))
p("基本4 汽笛 500 Hz・30 m/s", dop(500, 343, 0, 30), dop(500, 343, 0, -30))
p("基本5 1 kHz・0.50 m, 光 0.6 µm・0.5 mm", math.degrees(math.asin(0.343 / 0.5)), math.degrees(math.asin(0.6e-6 / 0.5e-3)))
p("基本6 960 Hz・15 m/s と 20 m/s で近づく", dop(960, 340, -20, 15))
p("チャレンジ1 10.525 GHz・30 m/s 遠ざかる Δf", 2 * (-30) * 10.525e9 / 3.00e8)
p("チャレンジ2 4 MHz・0.40 m/s・1 kHz の角", math.degrees(math.acos(1000 * 1540 / (2 * 4e6 * 0.4))))
a = math.asin(1 / 1.5); dd = 9000 / math.tan(a)
p("チャレンジ3 Ma1.5・9 km・300 m/s：角, 距離, 時間", math.degrees(a), dd, dd / 450)
p("例題3 じぶん：343 Hz で振幅 2A cos(π·0.25)", 2 * math.cos(math.pi * 0.25))
p("例題1 じぶん2 などの近似 960×(1±v/c)", 960 * (1 + 16.667 / 340), 960 * (1 - 16.667 / 340))
p("まちがえやすい：観測者が 16.7 m/s で近づく", dop(960, 340, -60 / 3.6, 0))
p("⑤ 120 km/h のずれ", dop(960, 340, 0, 120 / 3.6) - 960)
p("基本7 バイク 600 Hz・72 km/h の前と後ろの波長（343）", (343 - 20) / 600, (343 + 20) / 600)
p("基本8 深さ 2.0 m→0.50 m、入射角 20°", math.degrees(math.asin(math.sin(math.radians(20)) * math.sqrt(0.5 / 2.0))))
p("コラム X-1：Ma1.06 の半角, 時速", math.degrees(math.asin(1 / 1.06)), 1.06 * 295 * 3.6)
