L, C, R, E = 0.01, 1e-6, 20, 10   # H, F, Ω, V
dt = 1e-6                         # 時間のきざみ（s）
q, i, t = 0.0, 0.0, 0.0           # 電荷・電流・時刻
vmax = 0.0
for k in range(2001):
    if k % 250 == 0:
        print(round(t*1000, 2), round(q/C, 2))   # ms と V
    i = i + (E - R*i - q/C) / L * dt   # 電流を先に進める
    q = q + i * dt                     # 新しい電流で電荷を進める
    t = t + dt
    vmax = max(vmax, q/C)
print("max", round(vmax, 2))
