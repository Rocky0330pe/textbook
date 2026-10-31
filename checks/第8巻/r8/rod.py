import numpy as np
def run(dx, dt, alpha=1e-4, L=0.1, right='insulated'):
    n = int(round(L/dx))+1
    T = np.full(n, 20.0); T[0] = 100.0
    r = alpha*dt/dx/dx; mid = n//2; t = 0.0
    while T[mid] < 50:
        Tn = T.copy(); Tn[1:-1] = T[1:-1] + r*(T[2:]-2*T[1:-1]+T[:-2])
        if right == 'insulated': Tn[-1] = T[-1] + 2*r*(T[-2]-T[-1])
        T = Tn; t += dt
    return t, r
for right in ['insulated', 'fixed20']:
    print(right, '表計算 dx=0.01 dt=0.25:', run(0.01, 0.25, right=right), ' 細かく dx=0.001 dt=0.002:', run(0.001, 0.002, right=right))
