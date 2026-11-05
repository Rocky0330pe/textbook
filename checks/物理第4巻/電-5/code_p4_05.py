# 電-5 ⑩の囲みのプログラム（本文と同じもの）。出力を本文の phcodeout に写した。
import numpy as np
R = np.array([[3, -2, 0],
              [-2, 9, -4],
              [0, -4, 9]])        # 網目の抵抗の行列（Ω）
E = np.array([10, 0, 0])          # 起電力（V）
I = np.linalg.solve(R, E)         # 網目電流（A）
print(I)
print(R @ I)                      # 確かめ（E にもどるか）
print('----')
def nyuguchi(n):                  # n 段のはしご（どの抵抗も 1 Ω）
    G = np.zeros((n, n))
    Is = np.zeros(n)
    for k in range(n):
        G[k, k] += 1              # 節点 k から電位0へ 1 Ω
        if k == 0:
            G[0, 0] += 1          # 電池（10 V）から 1 Ω
            Is[0] = 10 / 1
        else:
            G[k, k] += 1; G[k-1, k-1] += 1   # となりの節点と 1 Ω
            G[k, k-1] -= 1; G[k-1, k] -= 1
    phi = np.linalg.solve(G, Is)  # 節点の電位
    return 10 / (10 - phi[0])     # 入口から見た抵抗
for n in [1, 2, 3, 6, 10, 100]:
    print(n, round(nyuguchi(n), 6))
