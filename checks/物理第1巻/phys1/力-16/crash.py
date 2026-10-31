m = 1000                  # 車の質量（kg）
v0 = 55 / 3.6             # ぶつかる速さ（m/s）
k = m * v0**2 / 0.6**2    # 0.6 m つぶれて止まるばね（N/m）
for dt in [0.01, 0.005, 0.001, 0.0001]:
    x, v, xmax, amax = 0.0, v0, 0.0, 0.0
    while v > 0:          # 前へ進んでいる間
        a = -k * x / m    # ばねの力 ÷ 質量
        x = x + v * dt
        v = v + a * dt
        xmax = max(xmax, x)
        amax = max(amax, -a)
    print(dt, round(xmax, 3), round(amax))
