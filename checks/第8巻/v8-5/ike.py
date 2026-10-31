import numpy as np
Q = 4.0
def v(x, y):
    ax, ay = x - 1.5, y - 2.5
    bx, by = x - 4.5, y - 1.5
    a2 = ax**2 + ay**2
    b2 = bx**2 + by**2
    k = Q / (2 * np.pi)
    return k * (ax/a2 - bx/b2), k * (ay/a2 - by/b2)

n = 100
t = (np.arange(n) + 0.5) / n
for j in [3, 2, 1, 0]:
    row = []
    for i in range(6):
        right  = v(i+1, j+t)[0].sum() / n
        left   = v(i,   j+t)[0].sum() / n
        top    = v(i+t, j+1)[1].sum() / n
        bottom = v(i+t, j  )[1].sum() / n
        d = right - left + top - bottom
        row.append(f"{round(d, 1) + 0.0:5.1f}")
    print(" ".join(row))
