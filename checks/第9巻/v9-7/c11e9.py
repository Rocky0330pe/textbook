import numpy as np
from scipy.linalg import expm
A = np.array([[-2, 1, 0],
              [1, -2, 1],
              [0, 1, -2]])               # 3つの点の熱の行列
print(np.linalg.eigvalsh(A).round(3))  # 固有値
print((expm(A*1.0) @ [100, 100, 100]).round(2))  # 1秒後
