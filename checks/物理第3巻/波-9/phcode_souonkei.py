import math
f = [63, 125, 250, 500, 1000, 2000, 4000, 8000]   # 高さ（Hz）
L = [78, 75, 72, 70, 68, 65, 60, 55]               # はかった dB
def A(f):                                           # A 特性の補正（規格の式）
    f2 = f * f
    r = 12194**2 * f2**2 / ((f2 + 20.6**2) * (f2 + 12194**2)
        * math.sqrt((f2 + 107.7**2) * (f2 + 737.9**2)))
    return 20 * math.log10(r) + 2.00
def tasu(Ls):                                       # 強さにもどしてたす
    return 10 * math.log10(sum(10**(x / 10) for x in Ls))
print('補正なし', round(tasu(L), 1), 'dB')
LA = [x + A(fi) for x, fi in zip(L, f)]
print('A 特性 ', round(tasu(LA), 1), 'dB(A)')
# 章末問題の検算
print('問1', 340*4.0, '問2', 331.5+0.6*25, (331.5+15)/440)
print('問4', 20*math.log10(0.002/2e-5), 2e-5*1e6)
print('問5', 85+10*math.log10(4), 85+10*math.log10(1.1))
print('問6', 110-20*math.log10(30)-11)
print('問7', 20*math.log10(math.pi*500*20/413.3), 20*math.log10(20/12.5))
print('問8', 0.161*6000/900)
d = 1.0/(1/343-1/5100); print('C1', d)
print('C2', 10*math.log10(10**8.8-10**8.4))
A6 = 0.161*189/0.6; print('C3', A6, A6-30, 0.02+(A6-30)/63)
u = 1/413.3; print('C4', math.sqrt(2)*u/(2*math.pi*100)*1e3, 'mm')
print('ex13 部屋', 75-33.5, 'jibun12', 10*math.log10(10**9+10**7), 10*math.log10(10**6.38+10**7))
print('ex10 W', 1e-12*10**10)
