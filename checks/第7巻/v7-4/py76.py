import numpy as np
th = np.radians(30)
R = np.array([[np.cos(th), -np.sin(th)],
              [np.sin(th),  np.cos(th)]])
P = np.array([[0, 4, 4],
              [0, 0, 4]])
print(np.round(R @ P, 3))
def Rot(deg):
    t = np.radians(deg)
    return np.array([[np.cos(t), -np.sin(t)],
                     [np.sin(t),  np.cos(t)]])
print(np.round(Rot(30) @ Rot(45), 4))
print(np.round(Rot(75), 4))
print(np.round(Rot(30).T @ Rot(30), 4))
print(np.cos(30))
