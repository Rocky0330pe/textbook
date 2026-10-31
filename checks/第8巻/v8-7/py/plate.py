import numpy as np
T = np.zeros((5, 5))
T[0, 1:4] = 100
for n in range(50):
    U = T.copy()
    U[1:4, 1:4] = (T[0:3, 1:4] + T[2:5, 1:4]
                   + T[1:4, 0:3] + T[1:4, 2:5]) / 4
    T = U
print(T[1:4, 1:4].round(3))
