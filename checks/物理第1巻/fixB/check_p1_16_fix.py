# 組B の直し（第19回）：力-16 の数の検算。python3 -I で動かす
import math
import numpy as np

# B-21 ③の表：k=648000 N/m（セルの式どおり）、m=1000 kg、Δt=0.01 s、ふつうのオイラー法
m = 1000.0; v0 = 55 / 3.6; k = 648000.0; dt = 0.01
x, v = 0.0, v0
a = 0.0
print('③表 t x v a  （k=648000）')
for n in range(8):
    print('%.2f %.3f %.2f %.0f' % (n * dt, x, v, a))
    x, v = x + v * dt, v + a * dt   # a は今の x から出したもの
    a = -k * x / m

# B-23 ばねではふくらむ：③の車のばね（k=m v0^2/0.6^2）が、かべからはなれずにゆれ続けたとしたら
k2 = m * v0 ** 2 / 0.36; w = math.sqrt(k2 / m); T = 2 * math.pi / w
print('omega', round(w, 3), '周期 T', round(T, 4))
for dt in [0.01, 0.001]:
    for kind in ['ふつう', '速度を先に']:
        x, v = 0.0, v0
        n = int(round(10 * T / dt))
        for i in range(n):
            a = -k2 * x / m
            if kind == 'ふつう':
                x, v = x + v * dt, v + a * dt
            else:
                v = v + a * dt; x = x + v * dt
        A = math.sqrt(x * x + (v / w) ** 2)
        print(' dt', dt, kind, '10周後の大きさ÷はじめ', round(A / (v0 / w), 3))
    print('  1歩の倍率', round(math.sqrt(1 + (w * dt) ** 2), 6), '1周の歩数', round(T / dt, 1),
          '1周の倍率', round((1 + (w * dt) ** 2) ** (T / dt / 2), 4), '10周', round((1 + (w * dt) ** 2) ** (5 * T / dt), 3))

# ⑦ 速度を先に進める形の条件 ωΔt<2 → 要素の大きさ h の棒：ω_max=2c/h → Δt<h/c
E = 205e9; rho = 7850; c = math.sqrt(E / rho)
print('c', round(c), '5 mm の要素', 0.005 / c)
N = 50; h = 1.0 / N; kk = E / h; mm = rho * h
K = np.zeros((N, N))
for i in range(N):
    K[i, i] += kk
    if i + 1 < N:
        K[i, i] += kk; K[i, i + 1] -= kk; K[i + 1, i] -= kk
wmax = math.sqrt(max(np.linalg.eigvalsh(K / mm)))
print('棒を50に分けたときのいちばん速いゆれ wmax', round(wmax), '2c/h', round(2 * c / h), ' 2/wmax', 2 / wmax, ' h/c', h / c)

# B-24 ⑥の管の表：輪の速さは輪のはばのまん中の速さ。となりの輪とは はば h、いちばん外の輪と壁は h/2
def ring(N, wall):
    R = 1.0; h = R / N; mu = 1.0; G = 1.0  # G=Δp/L
    Km = np.zeros((N, N)); F = np.zeros(N)
    for i in range(N):
        r_in = i * h; r_out = (i + 1) * h
        F[i] = G * math.pi * (r_out ** 2 - r_in ** 2)
        if i > 0:
            ci = mu * 2 * math.pi * r_in / h; Km[i, i] += ci; Km[i, i - 1] -= ci
        if i < N - 1:
            co = mu * 2 * math.pi * r_out / h; Km[i, i] += co; Km[i, i + 1] -= co
        else:
            co = mu * 2 * math.pi * r_out / (h * wall); Km[i, i] += co
    u = np.linalg.solve(Km, F)
    Q = sum(u[i] * math.pi * (((i + 1) * h) ** 2 - (i * h) ** 2) for i in range(N))
    return Q / (math.pi * G * R ** 4 / (8 * mu))
for N in [1, 2, 4, 8]:
    q = ring(N, 0.5)
    print('輪', N, '壁まで半分', round(q, 4), 'ずれ%', round((q - 1) * 100, 2), ' 壁まで1つ分', round(ring(N, 1.0), 4))

# B-36 ⑤の太さの変わる棒のずれ
for n in [1, 2, 4, 8]:
    s = sum((1 / n) / (1 + (i + 0.5) / n) for i in range(n))
    print('要素', n, round(s, 4), 'ずれ%', round((s / math.log(2) - 1) * 100, 3))
