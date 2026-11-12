# 原-9 ⑫ の囲みのプログラム（本文と同じもの）。例題7の pn 接合の電場と電位を、電荷から順に足して求める。
e, eps = 1.60e-19, 11.7 * 8.85e-14     # C、F/cm
Na = Nd = 1e16                          # cm^-3
xp = xn = 0.2152e-4                     # cm（例題7の空乏層の半分）
N = 1000
dx = (xp + xn) / N
E, phi = 0.0, 0.0
for i in range(N):
    x = -xp + (i + 0.5) * dx            # マスのまん中
    rho = -e * Na if x < 0 else e * Nd  # 空乏層の電荷密度
    E = E + rho / eps * dx              # dE/dx = rho/eps
    phi = phi - E * dx                  # 電位は電場の面積だけ下がる
    if (i + 1) % 250 == 0:
        print(round((x + dx/2) * 1e4, 3), round(E), round(phi, 3))
