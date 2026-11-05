# 波-8 ⑦ のシミュレーション（本文の phcode と同じプログラム）：動く音源の波面を数える
c = 340.0              # 音の速さ m/s
f = 960.0              # サイレンの振動数 Hz
v = 60 / 3.6           # 救急車の速さ m/s
t = 0.5                # この時刻に、波面の位置を調べる s
T = 1 / f              # 1つの波面を出す間かく s
mae = []               # 前の波面の位置（m）
ato = []               # 後ろの波面の位置（m）
n = 0
while n * T <= t:
    xs = v * n * T         # 波面を出したときの救急車の位置
    R = c * (t - n * T)    # その波面の、今の半径
    mae.append(xs + R)
    ato.append(xs - R)
    n = n + 1
kmae = (mae[0] - mae[-1]) / (n - 1)
kato = (ato[-1] - ato[0]) / (n - 1)
print("波面の数", n)
print("前", round(kmae, 4), "m", round(c / kmae, 1), "Hz")
print("後ろ", round(kato, 4), "m", round(c / kato, 1), "Hz")
