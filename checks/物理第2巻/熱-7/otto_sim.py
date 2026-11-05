# 熱-7 ⑨ の Python（本文の囲みと同じ）。出力は otto_sim_out.txt
g, cv, R = 1.4, 0.718, 0.287   # 空気（kJ/(kg K)）
def otto(eps, T1=300.0, q=1500.0, N=2000):
    V1 = R*T1/100.0             # 1 kg の体積（m3）。100 kPa
    V2 = V1/eps
    T = T1; w = 0.0
    for i in range(N):          # 1→2 断熱圧縮を区切る
        V = V1 + (V2-V1)*i/N; dV = (V2-V1)/N
        dw = R*T/(V+dV/2)*dV    # p dV（負：された仕事）
        T = T - dw/cv; w = w + dw
    T = T + q/cv                # 2→3 定積で q を受けとる
    for i in range(N):          # 3→4 断熱膨張を区切る
        V = V2 + (V1-V2)*i/N; dV = (V1-V2)/N
        dw = R*T/(V+dV/2)*dV
        T = T - dw/cv; w = w + dw
    return w/q                  # 熱効率
for eps in (5, 10, 15, 20):
    print(eps, round(otto(eps), 3), round(1-eps**(1-g), 3))
