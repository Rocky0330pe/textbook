rho, g, E, L = 7850, 9.8, 205e9, 1000.0
for n in [1, 2, 5, 10, 100]:
    dx = L / n
    top = mid = 0.0
    for i in range(n):
        top += rho * g * (L - i * dx) / E * dx          # 区間の上のはしの応力で
        mid += rho * g * (L - (i + 0.5) * dx) / E * dx  # 区間のまん中の応力で
    print(n, round(top * 1000, 1), round(mid * 1000, 1))
