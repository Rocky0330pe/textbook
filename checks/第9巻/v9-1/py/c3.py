import numpy as np
from scipy.linalg import expm
print(np.roots([1, 3, 2]))
print(np.roots([1, 2, 5]))
A = np.array([[0, 1],
              [-2, -3]])
print(np.linalg.eigvals(A))
np.set_printoptions(precision=4, suppress=True)
print(expm(A*1.0))
