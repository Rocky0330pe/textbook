import numpy as np
N = 9
for r in [0.25, 0.5, 0.6]:
    A = (np.eye(N)*(1 - 2*r) + np.eye(N, k=1)*r
         + np.eye(N, k=-1)*r)
    lam = np.linalg.eigvalsh(A)
    print(r, lam.min().round(4), lam.max().round(4))
