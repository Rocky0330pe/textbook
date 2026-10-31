import numpy as np
from scipy.integrate import quad
s = 2
rows = [(lambda t: t**3, 6/s**4),
        (lambda t: np.exp(-t)*np.sin(2*t), 2/((s+1)**2+4)),
        (lambda t: t*np.sin(2*t), 4*s/(s**2+4)**2),
        (lambda t: (t >= 1)*np.exp(-(t-1)), np.exp(-s)/(s+1))]
for f, F in rows:
    v = quad(lambda t: f(t)*np.exp(-s*t), 0, 50, limit=200)[0]
    print(round(v, 5), round(F, 5))
