import numpy as np
h = 0.25
y = np.arange(1, -1.01, -h)      # 北の岸から南の岸へ
vx = 1 - y**2
circ = (vx[1:] - vx[:-1]) * h    # 下の辺 − 上の辺
print(circ / h**2)               # 回転

def F(x, y):                     # うずなし流れ
    r2 = x*x + y*y
    return -y/r2, x/r2
for h in [0.1, 0.01]:
    x0, y0 = 1.0, 0.5            # マスの左下の角
    c = (F(x0+h/2, y0)[0] + F(x0+h, y0+h/2)[1]
         - F(x0+h/2, y0+h)[0] - F(x0, y0+h/2)[1]) * h
    print(h, c / h**2)
