from math import sqrt, acos, atan2, degrees
L1, L2 = 0.30, 0.25  # うでの長さ（m）
x = 0.40  # 手を動かす線 x = 0.40
for i in range(7):
    y = 0.05 * i
    d = sqrt(x**2 + y**2)  # 肩から手までの距離
    c = (L1**2 + L2**2 - d**2) / (2 * L1 * L2)
    t2 = 180 - degrees(acos(c))  # ひじの角
    b = (L1**2 + d**2 - L2**2) / (2 * L1 * d)
    t1 = degrees(atan2(y, x)) - degrees(acos(b))  # 肩の角
    print(round(y, 2), round(t1, 1), round(t2, 1))
