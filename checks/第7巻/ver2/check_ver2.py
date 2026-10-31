"""第7巻 Ver2：章末問題を小問にまとめた所（全巻にかかる修正事項 No.21・22）の答えの検算。
数は変えていないが、まとめた小問の答えが、もとの問題の答えと同じであることを確かめる。
  python3 checks/第7巻/ver2/check_ver2.py
"""
import numpy as np

ok = True
def check(name, got, want, tol=1e-3):
    global ok
    g = np.array(got, dtype=complex); w = np.array(want, dtype=complex)
    good = np.allclose(g, w, atol=tol)
    ok &= good
    print(('OK ' if good else 'NG ') + name, np.round(g.real, 4).tolist())

# 7-4 基本6（2）：次元解析の行列の行列式
check('7-4 基本6(1) det', np.linalg.det(np.array([[1, 2, 3], [0, 1, 4], [2, 0, 1]])), 11)
check('7-4 基本6(2) det', np.linalg.det(np.array([[1, 0, 0], [-3, 1, 1], [0, -1, 0]])), 1)

# 7-5 基本5（1）（2）：掃き出し法
check('7-5 基本5(1)', np.linalg.solve([[1, 1, 1], [1, 2, -1], [2, -1, 1]], [6, 2, 3]), [1, 2, 3])
check('7-5 基本5(2)', np.linalg.solve([[1, 1, 0], [0, 1, 1], [1, 0, 1]], [3, 5, 4]), [1, 2, 3])
# 7-5 チャレンジ9（1）（2）：最小二乗法
for name, x, y, want in [('7-5 チャレンジ9(1)', [0, 1, 2, 3], [1, 2, 4, 5], [1.4, 0.9]),
                         ('7-5 チャレンジ9(2)', [0, 1, 2], [2, 2, 5], [1.5, 1.5])]:
    A = np.column_stack([x, np.ones(len(x))])
    ab = np.linalg.solve(A.T @ A, A.T @ np.array(y, float))
    check(name, ab, want)
check('7-5 チャレンジ9(2) ずれの和', sum(np.array([2, 2, 5]) - (1.5 * np.array([0, 1, 2]) + 1.5)), 0)
# 7-5 チャレンジ10（1）（2）：ロボットの腕
L1, L2 = 0.30, 0.25
def J(t1, t2):
    t1, t2 = np.radians(t1), np.radians(t2)
    return np.array([[-L1 * np.sin(t1) - L2 * np.sin(t1 + t2), -L2 * np.sin(t1 + t2)],
                     [L1 * np.cos(t1) + L2 * np.cos(t1 + t2), L2 * np.cos(t1 + t2)]])
check('7-5 チャレンジ10(1)', np.linalg.solve(J(30, 45), [0.1, 0.1]), [0.578, -1.351])
J10 = np.array([[-0.3107, -0.1607], [0.4513, 0.1915]])
check('7-5 チャレンジ10(2) det', np.linalg.det(J10), 0.0130, tol=2e-4)
check('7-5 チャレンジ10(2)', np.linalg.solve(J10, [0, 0.1]), [1.23, -2.39], tol=0.02)

# 7-6 基本4（1）（2）：回転行列の逆行列（転置）
def R(d):
    t = np.radians(d); return np.array([[np.cos(t), -np.sin(t)], [np.sin(t), np.cos(t)]])
check('7-6 基本4(1)', R(90).T @ [-3, 5], [5, 3])
check('7-6 基本4(2)', R(45).T @ [0, 2.828], [2, 2], tol=1e-3)

# 7-9 基本1（1）（2）：ななめの物差し
A = np.array([[2, 1], [1, 2]])
for name, p, want in [('7-9 基本1(1)', [2, 4], [8, 10]), ('7-9 基本1(2)', [5, 1], [11, 7])]:
    q = np.linalg.solve([[1, 1], [1, -1]], p)
    check(name, 3 * q[0] * np.array([1, 1]) + q[1] * np.array([1, -1]), want)
    check(name + ' 直接', A @ p, want)
# 7-9 チャレンジ9（1）〜（4）：対角化できるか（固有ベクトルが2本あるか）
for name, M, can in [('(1)', [[4, 1], [0, 4]], False), ('(2)', [[4, 1], [0, 2]], True),
                     ('(3)', [[3, 2], [0, 1]], True), ('(4)', [[5, 0], [2, 5]], False)]:
    w, V = np.linalg.eig(np.array(M, float))
    rank = np.linalg.matrix_rank(V, tol=1e-6)
    good = (rank == 2) == can
    ok &= good
    print(('OK ' if good else 'NG ') + '7-9 チャレンジ9' + name, '固有値', np.round(w, 3).tolist(), '対角化できる' if rank == 2 else 'できない')

print('すべて OK' if ok else 'NG あり')
