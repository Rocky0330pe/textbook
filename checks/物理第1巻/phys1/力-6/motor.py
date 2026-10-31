import math
I, N, c = 0.02, 2.0, 0.01     # 慣性モーメント、トルク、摩擦の係数
dt = 0.1                      # 時間のきざみ（s）
w, t = 0.0, 0.0               # 角速度（rad/s）と時間（s）
for k in range(61):
    if k % 10 == 0:           # 1秒ごとに表示する
        ex = N / c * (1 - math.exp(-t * c / I))
        print(round(t, 1), round(w, 1), round(ex, 1))
    w = w + (N - c * w) / I * dt
    t = t + dt
