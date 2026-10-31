import numpy as np
Ad = np.array([[1, 0.2], [-0.8, 0.2]])  # 例題7の1歩の行列
print(abs(np.linalg.eigvals(Ad)).round(3))
x = np.array([0.01, 0])
for k in range(5):                     # 5歩（1秒）
    x = Ad @ x
    print(k + 1, x.round(5))
