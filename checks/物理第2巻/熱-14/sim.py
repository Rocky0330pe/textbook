import random, math
random.seed(1)
N = 400                     # 分子の数（平面の上を動く）
vx = []; vy = []
for i in range(N):          # はじめは、みな速さ 1、向きはばらばら
    a = random.uniform(0, 2 * math.pi)
    vx.append(math.cos(a)); vy.append(math.sin(a))
for k in range(20000):      # 2つ選んでぶつける（弾性衝突）
    i, j = random.sample(range(N), 2)
    gx = (vx[i] + vx[j]) / 2    # 重心の速度
    gy = (vy[i] + vy[j]) / 2
    u = math.hypot(vx[i] - vx[j], vy[i] - vy[j]) / 2
    a = random.uniform(0, 2 * math.pi)   # はね返る向き
    vx[i] = gx + u * math.cos(a); vy[i] = gy + u * math.sin(a)
    vx[j] = gx - u * math.cos(a); vy[j] = gy - u * math.sin(a)
cnt = [0] * 6
for i in range(N):
    v = math.hypot(vx[i], vy[i])
    cnt[min(int(v / 0.5), 5)] += 1
for b in range(6):          # 平面の分布の式とくらべる
    v1, v2 = b * 0.5, b * 0.5 + 0.5
    if b < 5:
        th = N * (math.exp(-v1**2) - math.exp(-v2**2))
    else:
        th = N * math.exp(-v1**2)
    print(v1, cnt[b], round(th))
