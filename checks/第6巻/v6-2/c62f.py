import math
x = 0.1
v = 0.0
dt = 0.02
for i in range(1, 251):
    a = -16 * x
    v = v + a * dt
    x = x + v * dt
    if i % 50 == 0:
        print(round(i * dt, 2), round(x, 4), round(0.1*math.cos(4*i*dt),4))
