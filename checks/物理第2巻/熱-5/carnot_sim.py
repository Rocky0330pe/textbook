# 熱-5 ⑤ の Python（本文の囲みと同じ）。出力は carnot_sim_out.txt
R, g = 8.31, 5/3              # 単原子の理想気体 1 mol
TH, TL = 600.0, 300.0         # 熱源の温度（K）
V1, V2 = 10.0, 20.0           # 体積（L）
V3, V4 = V2*(TH/TL)**1.5, V1*(TH/TL)**1.5  # 断熱の終わり
def work(Va, Vb, T, adi, N=100):   # Va→Vb で気体がする仕事
    W = 0.0
    for i in range(N):
        a, b = Va+(Vb-Va)*i/N, Va+(Vb-Va)*(i+1)/N
        m = (a+b)/2                # まん中の体積
        Tm = T*(Va/m)**(g-1) if adi else T
        W = W + R*Tm/m*(b-a)       # p×ΔV（J）
    return W
w = [work(V1,V2,TH,False), work(V2,V3,TH,True),
     work(V3,V4,TL,False), work(V4,V1,TL,True)]
print([round(x) for x in w])
print('W =', round(sum(w)), ' eta =', round(sum(w)/w[0], 4))
