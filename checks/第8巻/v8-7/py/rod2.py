import numpy as np
T = np.full(11, 20.0)
T[0] = 100
r = 1e-4 * 0.25 / 0.01**2
t = 0
while T[5] < 50:
    U = T.copy()
    U[1:10] = T[1:10] + r*(T[2:11] - 2*T[1:10] + T[0:9])
    U[10] = T[10] + 2*r*(T[9] - T[10])
    T = U
    t = t + 0.25
print(r, t)
print(T.round(1))
