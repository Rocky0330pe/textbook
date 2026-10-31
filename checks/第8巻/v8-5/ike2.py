import numpy as np
def v(x, y):    # 池の流れの速さ (vx, vy)
    ax, ay = x - 1.5, y - 2.5    # わき出す口から見た場所
    bx, by = x - 4.5, y - 1.5    # 吸いこむ口から見た場所
    a2, b2 = ax**2 + ay**2, bx**2 + by**2
    k = 4.0 / (2 * np.pi)        # Q = 4
    return k*(ax/a2 - bx/b2), k*(ay/a2 - by/b2)
t = (np.arange(100) + 0.5) / 100    # 辺を100こに分けた、まん中の点
for j in [3, 2, 1, 0]:              # 北（上）の段から
    row = ""
    for i in range(6):
        d = (v(i+1, j+t)[0].mean() - v(i, j+t)[0].mean()
             + v(i+t, j+1)[1].mean() - v(i+t, j)[1].mean())
        row += f"{round(d, 1) + 0.0:6.1f}"
    print(row)
