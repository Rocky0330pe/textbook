import numpy as np
A = np.array([[0, 1e4], [-10, -200]])  # 例題3の A
print(np.linalg.eigvals(A))
for A in ([[0, 1], [-5, -2]], [[0, 1], [10, 0]]):  # 例題5
    print(np.linalg.eigvals(np.array(A)).round(3))
