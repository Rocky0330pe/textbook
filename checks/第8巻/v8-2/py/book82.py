import numpy as np
np.set_printoptions(precision=2, suppress=True)   # 表示を小数第2位までにする
x = np.arange(28, 33)            # 東へ 28〜32 m
y = np.arange(22, 17, -1)        # 北から南へ 22〜18 m（地図と同じ向き）
X, Y = np.meshgrid(x, y)         # マスごとの x と y の表
H = 100 - 0.01*X**2 - 0.02*Y**2  # 主役の山の高さの表
east = H[:, 1:] - H[:, :-1]      # 右どなり－自分（行にそって差）
north = H[:-1, :] - H[1:, :]     # 上どなり－自分（列にそって差）
print(H[2, 2])                   # 3行め3列め：(30, 20) の高さ
print(east[2])                   # y=20 の行の、東へ1 m の差
print(north[:, 2])               # x=30 の列の、北へ1 m の差
