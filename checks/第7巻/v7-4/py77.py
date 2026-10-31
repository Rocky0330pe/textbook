import numpy as np
def Rx(deg):
    t = np.radians(deg); c, s = np.cos(t), np.sin(t)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
def Rz(deg):
    t = np.radians(deg); c, s = np.cos(t), np.sin(t)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
ex = np.array([1, 0, 0])
print(np.round(Rz(90) @ Rx(90) @ ex, 3) + 0)
print(np.round(Rx(90) @ Rz(90) @ ex, 3) + 0)
print(np.round(Rz(90) @ Rx(90), 3) + 0)
