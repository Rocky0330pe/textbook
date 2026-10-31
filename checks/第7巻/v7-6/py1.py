import numpy as np
A = np.array([[2, 1], [1, 2]])
x = np.array([1, 0])
for n in range(5):
    x = A @ x
    print(x)
print(np.linalg.matrix_power(A, 5))
print(A ** 2)
S = np.array([[1, 0.1], [-0.1, 1]])
lam = np.linalg.eigvals(S)
print(lam)
print(abs(lam))
print(abs(lam[0]) ** 63)
T = np.array([[0.99, 0.1], [-0.1, 1]])
print(np.linalg.eigvals(T))
print(abs(np.linalg.eigvals(T)))
M = np.array([[0.8, 0.4], [0.2, 0.6]])
p = np.array([1, 0])
for n in range(3):
    p = M @ p
    print(p)
print(np.linalg.matrix_power(M, 30) @ np.array([1, 0]))
B = np.array([[3, 1], [1, 3]])
x = np.array([1, 0])
for n in range(3):
    x = B @ x
    print(x)
print(B**2, B@B)
