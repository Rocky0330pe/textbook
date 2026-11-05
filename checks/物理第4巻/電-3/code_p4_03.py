import math
k, e0 = 8.99e9, 8.85e-12
Q, h = 20, 5000                 # 雲の電荷（C）、高さ（m）
def E(x):                       # 地面の電場の大きさ（V/m）
    return 2 * k * Q * h / (h**2 + x**2)**1.5
for x in [0, 2500, 5000, 10000]:
    print(x, round(E(x)))
total, dr = 0, 10               # 輪に分けて、地面の電荷を足す
for i in range(500000):         # 半径 5000 km まで
    r = (i + 0.5) * dr
    total += -e0 * E(r) * 2 * math.pi * r * dr
print(round(total, 2))
