e, m, tau = 1.60e-19, 9.11e-31, 2.4e-14   # e、電子の質量、τ（例題13）
E = 0.10                  # 電場（V/m）：例題2の銅線の中
dt = tau / 10             # 1歩の時間
v = 0.0                   # 流れの向きの速さ（はじめは0）
for step in range(1, 61):
    a = (-e * E - m * v / tau) / m      # 運動方程式から加速度
    v = v + a * dt
    if step % 10 == 0:
        print(f"{step * dt:.1e}", round(v * 1000, 3))   # s と mm/s
print(round(-e * tau * E / m * 1000, 3))                # 落ち着いた速さ
