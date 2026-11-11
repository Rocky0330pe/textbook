import random
random.seed(1)
n = 10000              # はじめの原子の数
for k in range(11):
    print(k, n)
    # 1個ずつ、1/6 の確率でこわれる（残るのは 5/6）
    n = sum(1 for i in range(n) if random.random() >= 1/6)
