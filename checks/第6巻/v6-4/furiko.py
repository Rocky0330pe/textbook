import math
g, L = 9.8, 1.0           # 重力加速度、糸の長さ
dt = 0.001                # Δt（秒）
for deg in [10, 30, 60, 90, 120, 150]:
    th = math.radians(deg)  # はじめの角（ラジアン）
    om = 0.0                # はじめの角速度
    t = 0.0
    while True:
        a = -g / L * math.sin(th)   # 角の加速度
        om = om + a * dt            # 速度を先に新しくする
        th_new = th + om * dt       # 新しい速度で角を進める
        t = t + dt
        if th > 0 and th_new <= 0:  # 0を下向きに通ったら
            break
        th = th_new
    print(deg, "度：周期", round(4 * t, 2), "秒")
