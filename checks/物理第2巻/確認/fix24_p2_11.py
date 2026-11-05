"""修2-4（第23回）：熱-11 の直しで変えた数・説明の検算。
Q4-25 差分の誤差の説明（マス 20・40・80）、Q4-20・Q4-21 表3、Q4-28 熱拡散率の比。"""
from math import pi, exp, sin

print('--- Q4-25：差分（マス N）と級数。t がちょうど 1・2・5 s になるか')
L, a = 0.02, 1.4e-5


def series(t):
    return sum(400/(n*pi)*exp(-a*(n*pi/L)**2*t)*sin(n*pi/2) for n in range(1, 400, 2))


for N in (20, 40, 80):
    dx = L/N
    dt = 0.4*dx**2/a
    T = [0.0] + [100.0]*(N-1) + [0.0]
    t = 0.0
    k = 0
    out = []
    for goal in [1, 2, 5]:
        while t < goal - 1e-9:
            T = [T[0]] + [T[i] + 0.4*(T[i-1]-2*T[i]+T[i+1]) for i in range(1, N)] + [T[N]]
            t += dt
            k += 1
        out.append((goal, k, t - goal, T[N//2], series(goal)))
    print('N=%d dt=%.6f s' % (N, dt))
    for o in out:
        print('  goal %d  steps %d  t-goal %+.1e  diff %.2f  series %.2f' % o)

print('--- Q4-20・Q4-21：表3（外断熱、dt=60 s）')
k_c, k_g = 1.6, 0.04
C = [2300*880*0.05]*3 + [16*840*0.05]*2
half = [0.025/k_c]*3 + [0.025/k_g]*2
Rb = [half[i] + half[i+1] for i in range(4)]
T = [20.0]*5
rows = {}
for step in range(0, 1441):
    if step in (0, 1, 2, 3, 60, 240, 480, 1440):
        rows[step] = [round(x, 4) for x in T] + [round(T[4]/half[4], 3)]
    q = []
    for i in range(5):
        left = (20 - T[i])/half[0] if i == 0 else (T[i-1]-T[i])/Rb[i-1]
        right = (0 - T[i])/half[4] if i == 4 else (T[i+1]-T[i])/Rb[i]
        q.append(left + right)
    T = [T[i] + 60*q[i]/C[i] for i in range(5)]
for s in sorted(rows):
    print('  表の行 %d（%d 分）' % (s + 2, s), rows[s])

print('--- Q4-28：熱拡散率の比（20 ℃）')
a_w = 0.598/(998.2*4182)
a_air = 0.0259/(1.204*1006)
print('  水 %.3e  空気 %.3e  空気/水 = %.0f' % (a_w, a_air, a_air/a_w))
