# 波-4 ③の Python の囲みと同じプログラム（部屋の比例＋積分の制御）。python3 checks/物理第3巻/波-4/room_pi.py
R, C = 0.05, 72000.0
Kp, Ki = 180.0, 3.0          # W/K、W/(K・分)
th, S = 35.0, 0.0            # 室温〔℃〕、ずれのたまり〔K・分〕
for n in range(61):          # 1 分ずつ 60 分
    e = th - 26
    P = Kp*e + Ki*S
    if n % 10 == 0:
        print(n, round(th, 2), round(P))
    th = th + 60/C*((35-th)/R - P)
    S = S + e
