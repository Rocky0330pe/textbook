# 電-16 ② の本に載せるプログラム（本文と同じもの）。出力を本文の実行結果と照らす。
f0 = 50.0
H, D, R, Tg = 5.0, 1.0, 0.05, 5.0
dPL = 0.01
dt = 0.1
df, dPg = 0.0, 0.0
for n in range(301):
    if n <= 40 and n % 10 == 0 or n % 100 == 0:
        print(round(n*dt, 1), round(df*f0, 3))
    ddf = (dPg - dPL - D*df) / (2*H)
    ddPg = (-df/R - dPg) / Tg
    df, dPg = df + ddf*dt, dPg + ddPg*dt
