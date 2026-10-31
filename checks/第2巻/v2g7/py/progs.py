print("--- p1"); x = 3; y = x * 2 + 1; print(y)
print("--- loop money")
money = 3000
for i in range(12):
    money = money + 500
print(money)
if money >= 10000:
    print("たまった")
else:
    print("まだ")
print("--- hatena")
x = 0
for i in range(10):
    x = x + 0.1
    print(x)
print("--- hatena final"); x=0
for i in range(10):
    x = x + 0.1
print(x)
print("--- int count")
n = 0
for i in range(10):
    n = n + 1
x = n / 10
print(x)
print("--- compare")
x=0
for i in range(10): x = x + 0.1
if x == 1:
    print("ぴったり1")
else:
    print("1ではない")
if 0.999999 < x < 1.000001:
    print("ほぼ1")
print("--- close sub")
print(1.1 - 1)
print(100.1 - 100)
print(1000000.1 - 1000000)
print(100000000.1 - 100000000)
print("--- ex1"); a = 4; b = a * 3; a = a + 1; print(a, b)
print("--- j1"); x = 10; y = x - 3; x = y * 2; print(x, y)
print("--- ex2"); s = 0
for i in range(5): s = s + 3
print(s)
print("--- j2"); n = 1
for i in range(4): n = n * 2
print(n)
print("--- ex3"); t = 28
if t >= 25: print("なつび")
else: print("ふつう")
print("--- j3"); score = 55
if score >= 60: print("ごうかく")
else: print("もういちど")
print("--- e1"); a = 7; b = a * 2; a = a + b; print(a)
print("--- e2"); s = 100
for i in range(4): s = s - 15
print(s)
print("--- e3"); n = 3
for i in range(3): n = n * 2
print(n)
print("--- c6"); m = 1000
for i in range(10): m = m + 500
print(m)
print("--- c7"); x = 0
for i in range(4): x = x + 0.25
print(x, x == 1)
print("--- c8"); print(0.5 + 0.25, 0.1 + 0.2, 0.75 - 0.5)
print("--- 5-2")
for h in [0.1, 0.001, 0.00001, 0.00000001]:
    print(h, (5 * (1 + h) ** 2 - 5) / h)
print(0.75*4, 0.375*8, 0.1*3)
x=0
for i in range(3): x = x + 0.1
print(x)
