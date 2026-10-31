import matplotlib
matplotlib.use('Agg')
import numpy as np
import matplotlib.pyplot as plt    # 図をかく道具
x = np.linspace(-100, 100, 201)    # -100 から 100 まで、1 m ごとに 201 個
y = np.linspace(-75, 75, 151)      # -75 から 75 まで、1 m ごとに 151 個
X, Y = np.meshgrid(x, y)
H = 100 - 0.01*X**2 - 0.02*Y**2
c = plt.contour(X, Y, H, levels=range(0, 100, 10))  # 0, 10, …, 90 m の等高線
plt.clabel(c)                      # 線に高さの数字をつける
plt.gca().set_aspect('equal')      # 東西と南北の 1 m を同じ長さに
plt.savefig('k3.png')
x = np.arange(-2, 3)               # -2, -1, 0, 1, 2
y = np.arange(-2, 3)
X, Y = np.meshgrid(x, y)
U = -Y                             # 矢印の x 成分（うずの場 (-y, x)）
V = X                              # 矢印の y 成分
plt.figure()
plt.quiver(X, Y, U, V)             # 点 (X, Y) に矢印 (U, V) をかく
plt.gca().set_aspect('equal')
plt.savefig('k4.png')
print(U); print(V)
