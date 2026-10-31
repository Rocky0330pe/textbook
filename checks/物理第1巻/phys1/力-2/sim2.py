# 力-2 ⑨ スカイダイバー（二乗抵抗）をオイラー法とルンゲ・クッタ法で解く（本文の phcode と同じ）
import math
g = 9.8
m = 80.0
c = 0.26          # 抵抗の係数（N·s²/m²）

def f(v):         # 加速度＝dv/dt
    return g - c / m * v * v

dt = 1.0
ve, vr = 0.0, 0.0
for i in range(1, 21):
    ve = ve + f(ve) * dt                    # オイラー法
    k1 = f(vr)
    k2 = f(vr + k1 * dt / 2)
    k3 = f(vr + k2 * dt / 2)
    k4 = f(vr + k3 * dt)
    vr = vr + (k1 + 2 * k2 + 2 * k3 + k4) / 6 * dt   # ルンゲ・クッタ法
    if i % 5 == 0:
        print(i, round(ve, 2), round(vr, 2))
