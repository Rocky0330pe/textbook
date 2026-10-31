import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
t, T = np.meshgrid(np.arange(0, 61, 6), np.arange(0, 91, 10))
s = -0.05 * (T - 20)
plt.quiver(t, T, np.ones_like(s), s, angles='xy', pivot='mid', headwidth=1, headlength=0)
tt, TT = [0], [80]
dt = 0.1
for k in range(600):
    TT.append(TT[-1] + (-0.05 * (TT[-1] - 20)) * dt)
    tt.append(tt[-1] + dt)
plt.plot(tt, TT)
plt.savefig('q.png')
print(TT[100], TT[-1])
