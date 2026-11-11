import numpy as np
R = 8.314462618
th = 343.0
def C(T):
    x = np.linspace(1e-8, th / T, 4001)
    f = x ** 4 * np.exp(x) / np.expm1(x) ** 2
    return 9 * R * (T / th) ** 3 * np.trapezoid(f, x)
pts = [(T, C(T)) for T in list(range(2, 40, 4)) + list(range(40, 301, 10))]
print(' -- '.join(f'(axis cs:{T},{c:.3f})' for T, c in pts))
thE = 0.806 * th
def CE(T):
    x = thE / T
    return 3 * R * x * x * np.exp(x) / np.expm1(x) ** 2
pts2 = [(T, CE(T)) for T in list(range(4, 40, 4)) + list(range(40, 301, 10))]
print(' -- '.join(f'(axis cs:{T},{c:.3f})' for T, c in pts2))
