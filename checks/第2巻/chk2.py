from fractions import Fraction as R
class Eq:
    def __init__(s,l,r): s.l=l; s.r=r
    def __repr__(s): return 'eq'
def solve(e):
    f0=e.l(R(0))-e.r(R(0)); f1=e.l(R(1))-e.r(R(1))
    if f1==f0: return 'none' if f0!=0 else 'all'
    return -f0/(f1-f0)
print("2-14")
print(1200/4, 50-5, (50-5)/3, 17-12, 21-6, 150/30, 3/0.1, (86-32)/1.8, (50-10)/2)
print([solve(Eq(lambda x:x+8,lambda x:15)), solve(Eq(lambda x:x-6,lambda x:4)), solve(Eq(lambda x:5*x,lambda x:35)), solve(Eq(lambda x:x/3,lambda x:7))])
print(3000/5, 12/0.5, (70-30)/4, 1.8*25+32, 2/3.14, (10-6)/2, 30/40*60, 1/0.02, (20/5)**0.5)
print("2-15")
print(30/2*8, 40*0.05, 3/40, 12/3*10, 25*0.12, 2/25, 6/20, 20*0.5, 1200/6, 4.5/50, 50*0.2, 30*4/20)
print(10/4*10, 50*0.04, 3/50, 3/10, 10*1.2, 36/12, 36/2, 2/0.04, 3/50, 3/0.6, 6/5, 150/30000)
import math
print("pendulum 1s L=", 9.80665/(4*math.pi**2), " 2s L=", 9.80665*4/(4*math.pi**2))
print("F/x table", [f/xx for f,xx in [(0.5,0.02),(1.0,0.04),(1.5,0.06),(2.0,0.08)]], [v/i for v,i in [(1.5,0.03),(3,0.06),(4.5,0.09),(6,0.12)]])
print("2-16")
for eq in [Eq(lambda t:4*t,lambda t:10+2*t),Eq(lambda t:1.5*t,lambda t:10+2*t),Eq(lambda x:3*x-7,lambda x:x+5),Eq(lambda x:5*x-3,lambda x:2*x+9),Eq(lambda x:3*(x+4),lambda x:5*x+2),Eq(lambda x:7*x+2,lambda x:4*x+17),Eq(lambda x:2*(x-3),lambda x:x+4),Eq(lambda x:150*x,lambda x:60*(x+3)),Eq(lambda x:10+2*x,lambda x:40-x),Eq(lambda x:1.5*x,lambda x:x+4),Eq(lambda x:5+3*x,lambda x:25+x),Eq(lambda x:x/4+3,lambda x:x-6),Eq(lambda x:R(2,10)*x+1,lambda x:R(5,10)*x-2),Eq(lambda t:20*t,lambda t:30+15*t),
  Eq(lambda x:x+9,lambda x:4),Eq(lambda x:6*x,lambda x:-18),Eq(lambda x:3*x-4,lambda x:x+8),Eq(lambda x:2*(x+5),lambda x:4*x),Eq(lambda x:x/3+2,lambda x:x-4),Eq(lambda x:5*x-4,lambda x:2*x+5),Eq(lambda x:210*x,lambda x:70*(x+5)),Eq(lambda x:20+4*x,lambda x:80-2*x),Eq(lambda t:3*t,lambda t:12+t),Eq(lambda t:25*t,lambda t:40+15*t),Eq(lambda x:3*x+8,lambda x:5*x-6)]:
    print(eq, solve(eq))
print(7*5+2, 4*5+17, 2*7, 10+4, 0.2*10+1, 0.5*10-2, 3*7+8)
print("2-17")
print(int('11010',2), int('100110',2), bin(45), bin(27), 64/256, 512/1024, hex(0b10110100), 0xB4, hex(0b11100101), 0xE5, int('1011',2))
print(bin(7),bin(18),bin(50), 2**5, 2**12, 128/256, hex(0b11110000), 0xF0, 0x80, 5/1024, 2**24, 16/256, 0xFF)
print([3.6+3*math.sin(xx*0.62) for xx in [i*0.5 for i in range(22)]])
print([round(3.6+3*math.sin(xx*0.62)) for xx in [i*0.5 for i in range(22)]])
print("2-18")
print((10000-3000)/500, 3000+500*120, [80-6*k for k in range(6)], 0.98*5, 2000+150*4, 7*3, 2.5*8, 100*2**6, 2.5*150, 72/3.6)
T=80; L=[T]
for k in range(10): T=T-0.05*(T-20); L.append(T)
print([round(v,2) for v in L])
T=80; L=[T]
for k in range(3): T=T-0.1*(T-20); L.append(T)
print([round(v,4) for v in L])
