import numpy as np
L, al = 0.1, 1e-4
def T(x, t, N=200):
    n = np.arange(1, 2*N, 2)
    return np.sum(400/(n*np.pi) * np.exp(-al*(n*np.pi/L)**2*t) * np.sin(n*np.pi*x/L))
for t in [2, 5, 10, 20]:
    print(t, round(T(L/2, t), 2))
