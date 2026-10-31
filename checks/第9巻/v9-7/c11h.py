import numpy as np
from scipy.linalg import expm
A = -2*np.eye(9) + np.eye(9, k=1) + np.eye(9, k=-1)
lam, V = np.linalg.eigh(A)
print(lam.round(4))
v = V[:, -1]
print((v / v[4]).round(3))
T0 = 100 * np.ones(9)
for t in [5, 10]:
    print(t, (expm(A*t) @ T0)[4].round(2))
