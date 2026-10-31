import numpy as np
x = np.arange(0, 60, 10)          # 東へ 0, 10, …, 50（m）
y = np.arange(40, -10, -10)       # 北へ 40, 30, …, 0（m）
X, Y = np.meshgrid(x, y)
H = 100 - 0.01*X**2 - 0.02*Y**2
print(H)
print(X)
print(Y)
