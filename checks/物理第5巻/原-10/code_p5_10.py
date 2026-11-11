# 原-10 ⑫ の囲みのプログラム（本文と同じもの）。電池 5 V・抵抗 1 kΩ・ダイオードの回路を、ニュートン法で解く。
import math
E, R, Is, VT = 5.0, 1000.0, 1e-14, 0.0259
for V in [0.7, 0.6]:                       # はじめの値を2通り
    print("はじめ", V)
    for k in range(1, 6):
        f = Is * (math.exp(V / VT) - 1) - (E - V) / R      # 電流のずれ
        df = Is / VT * math.exp(V / VT) + 1 / R            # その傾き
        V = V - f / df                                      # 接線で0になる所へ
        print(k, round(V, 5), round((E - V) / R * 1000, 3))
