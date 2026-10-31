from math import sqrt
g = 9.8
A, a = 1.0, 0.0001       # タンクの底面積・穴の面積（m2）
h, t, dt = 2.0, 0.0, 60.0
while h > 0:
    if t % 1200 == 0:
        print(t, round(h, 3))
    v = sqrt(2 * g * h)      # 穴から出る速さ
    h = h - a * v / A * dt   # 1分でへる高さ
    t = t + dt
print('空になる時刻', t)
