def h(x, y):                       # 主役の山の高さ（m）
    return 100 - 0.01*x**2 - 0.02*y**2
for d in [1, 0.1, 0.01]:           # 東へも北へも d m 進む
    approx = -0.6*d + (-0.8)*d     # 東の坂×d ＋ 北の坂×d
    real = h(30 + d, 20 + d) - h(30, 20)   # 本当の変化
    print(d, round(approx, 6), round(real, 6), round(real - approx, 6))
