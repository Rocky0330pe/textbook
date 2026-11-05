# 本文⑥の Python の囲みと同じプログラム（出力を本文と照らし合わせる）
R = 8.314; Cv = 2.5 * R; N = 1000
def heat(T1, T2, V):        # 体積一定で温める
    Q = S = 0.0
    for i in range(N):
        Ta = T1 + (T2 - T1) * i / N
        Tb = T1 + (T2 - T1) * (i + 1) / N
        dQ = Cv * (Tb - Ta)
        Q += dQ; S += dQ / ((Ta + Tb) / 2)
    return Q, S
def expand(V1, V2, T):      # 温度一定でふくらむ
    Q = S = 0.0
    for i in range(N):
        Va = V1 + (V2 - V1) * i / N
        Vb = V1 + (V2 - V1) * (i + 1) / N
        dQ = R * T / ((Va + Vb) / 2) * (Vb - Va)
        Q += dQ; S += dQ / T
    return Q, S
a1 = heat(300, 600, 0.010); a2 = expand(0.010, 0.020, 600)
b1 = expand(0.010, 0.020, 300); b2 = heat(300, 600, 0.020)
print("A", round(a1[0] + a2[0]), round(a1[1] + a2[1], 2))
print("B", round(b1[0] + b2[0]), round(b1[1] + b2[1], 2))
