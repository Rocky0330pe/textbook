import cmath, math
# yattemiyou: (1+0.1j)^k, k=0..10 ; and (1+0.01j)^100
z=1
for k in range(11):
    print(k, round(z.real,4), round(z.imag,4), round(abs(z),4), round(math.degrees(cmath.phase(z)),2), round(cmath.phase(z),4))
    z*=1+0.1j
print('e^j1', math.cos(1), math.sin(1))
for n in [1,2,4,10,100,1000,10000]:
    w=(1+1j/n)**n
    print(n, round(w.real,5), round(w.imag,5), round(abs(w),5), round(cmath.phase(w),5))
print('atan0.1',math.atan(0.1), abs(1+0.1j))
# theta = pi/2 version
for n in [1,2,4,10,100,1000]:
    w=(1+1j*math.pi/2/n)**n; print('pi/2',n, round(w.real,4), round(w.imag,4), round(abs(w),4))
