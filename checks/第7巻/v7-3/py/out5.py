import numpy as np
print("=== code1")
A = np.array([[4, 2],
              [2, 4]])
b = np.array([9, 6])
print(np.linalg.inv(A))
print(np.linalg.inv(A) @ b)
print(np.linalg.solve(A, b))
print("=== code2")
k = 100
K = np.array([[2*k, -k, 0],
              [-k, 2*k, -k],
              [0, -k, k]])
F = np.array([0.98, 0.98, 0.98])
u = np.linalg.solve(K, F)
print(u)
print(K @ u)
print("=== code3")
A = np.array([[1, 2],
              [2, 4]])
try:
    np.linalg.solve(A, np.array([3, 6]))
except Exception as e:
    print(type(e).__module__, type(e).__name__, e)
print("=== code4")
x = np.array([0, 1, 2, 3, 4, 5, 6])
y = np.array([0, 1.6, 2.9, 4.6, 5.9, 7.6, 8.9])
A = np.column_stack([x, np.ones(7)])
print(A.T @ A)
print(A.T @ y)
print(np.linalg.solve(A.T @ A, A.T @ y))
print(np.linalg.lstsq(A, y, rcond=None)[0])
print("=== code5 truss")
T = np.array([[0.5,0,1,1,0,0],[0.866,0,0,0,1,0],[0,-0.5,-1,0,0,0],[0,0.866,0,0,0,1],[-0.5,0.5,0,0,0,0],[-0.866,-0.866,0,0,0,0]])
print(np.linalg.solve(T,[0,0,0,0,0,10]))
print(np.__version__)
