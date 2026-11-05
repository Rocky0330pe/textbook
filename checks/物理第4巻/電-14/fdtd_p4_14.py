# 電-14 ⑩ 1次元 FDTD（s = cΔt/Δx = 1）。E は電場、h は η0×磁場の強さ（同じ単位にそろえた）。
# 本文のプログラムと同じもの（出力を本文の表に写した）。
def run(init, steps=3, N=10, fmt='%2d'):
    E = [0]*N
    h = [0]*N          # h[i] は E[i] と E[i+1] の間の点
    for k, v in init.items():
        E[k] = v
    def show(n):
        print(n, ' '.join(fmt % v for v in E), '|', ' '.join(fmt % v for v in h))
    show(0)
    for n in range(1, steps+1):
        for i in range(N-1):
            h[i] = h[i] - (E[i+1] - E[i])
        for i in range(1, N):
            E[i] = E[i] - (h[i] - h[i-1])
        show(n)

print("--- 本文の表：山（2、4、2）")
run({4: 2, 5: 4, 6: 2})
print("--- 章末問題：山（1、2、1）")
run({4: 1, 5: 2, 6: 1})

print("--- 右へだけ進む山（はじめに h[i] = E[i+1] とおく）")
N = 12
E = [0]*N; h = [0]*N
E[2], E[3], E[4] = 2, 4, 2
for i in range(N-1):
    h[i] = E[i+1]
for n in range(0, 5):
    print(n, ' '.join('%2d' % v for v in E))
    for i in range(N-1):
        h[i] = h[i] - (E[i+1] - E[i])
    for i in range(1, N):
        E[i] = E[i] - (h[i] - h[i-1])
