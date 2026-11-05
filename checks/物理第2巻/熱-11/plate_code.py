from math import pi, exp, sin
L, a = 0.02, 1.4e-5          # 鋼の板の厚さ〔m〕、熱拡散率〔m²/s〕
N = 20; dx = L/N             # 20 マスに分ける
dt = 0.4*dx**2/a             # r = 0.4（こわれない）
T = [0.0] + [100.0]*(N-1) + [0.0]   # はじめ100、両面0
t = 0.0
for goal in [1, 2, 5]:
    while t < goal - 1e-9:
        T = [T[0]] + [T[i] + 0.4*(T[i-1]-2*T[i]+T[i+1])
                      for i in range(1, N)] + [T[N]]
        t += dt
    s = sum(400/(n*pi)*exp(-a*(n*pi/L)**2*goal)*sin(n*pi/2)
            for n in range(1, 400, 2))
    print(goal, round(T[N//2], 1), round(s, 1))
