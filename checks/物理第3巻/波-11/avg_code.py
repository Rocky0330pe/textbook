# 波-11 ⑦の囲みのプログラム（本文と同じもの）。python3 avg_code.py
import numpy as np
rng = np.random.default_rng(1)
t = np.arange(200) / 1000            # 1秒に1000回、0.2秒分
s = np.sin(2*np.pi*10*t)             # 10 Hz・振幅1 の信号
for K in [1, 16, 100]:
    acc = np.zeros(len(t))
    for k in range(K):
        acc += s + rng.normal(0, 1, len(t))   # 毎回ちがう雑音（標準偏差1）
    acc /= K                                  # K 回の平均
    print(K, round(np.std(acc - s), 3))       # 残った雑音の標準偏差
