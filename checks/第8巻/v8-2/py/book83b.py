import numpy as np
L1, L2 = 0.30, 0.25
t1, t2 = np.radians(30), np.radians(45)
s1, c1 = np.sin(t1), np.cos(t1)
s12, c12 = np.sin(t1 + t2), np.cos(t1 + t2)
J = np.array([[-L1*s1 - L2*s12, -L2*s12],
              [ L1*c1 + L2*c12,  L2*c12]])
print(J.round(4)); print(round(np.linalg.det(J), 4)); print(J @ np.array([0.01, 0.01]))
