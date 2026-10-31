import numpy as np
A = np.array([[0, 1], [4, 0]])
B = np.array([[0], [1]])
print(np.linalg.det(np.hstack([B, A @ B])))
