import numpy as np
A = np.array([[0, 1], [4, 0]])
B = np.array([[0], [1]])
K = np.array([[8, 4]])
print(np.linalg.eigvals(A - B @ K))   # 連続の固有値
for dt in [0.1, 1.2]:
    Ad = np.eye(2) + (A - B @ K) * dt  # 1歩の行列
    x = np.array([0.01, 0])
    for k in range(10):                # 10歩くり返す
        x = Ad @ x
    print(dt, np.linalg.eigvals(Ad).real.round(3), x.round(5))
