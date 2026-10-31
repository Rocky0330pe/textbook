import numpy as np
from scipy.integrate import quad
s = 2
fs = [lambda t: 1, lambda t: t, lambda t: np.exp(-t)]
table = [1/s, 1/s**2, 1/(s+1)]
for f, F in zip(fs, table):
    v = quad(lambda t: f(t)*np.exp(-s*t), 0, np.inf)[0]
    print(round(v, 5), round(F, 5))
