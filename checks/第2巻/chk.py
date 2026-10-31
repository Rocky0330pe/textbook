from sympy import symbols, solve, Eq, Rational as R, sqrt, nsimplify
x,t,a=symbols('x t a')
print("2-14")
print(1200/4, 50-5, (50-5)/3, 17-12, 21-6, 150/30, 3/0.1, (86-32)/1.8, (50-10)/2)
print([solve(Eq(x+8,15)), solve(Eq(x-6,4)), solve(Eq(5*x,35)), solve(Eq(x/3,7))])
print(3000/5, 12/0.5, (70-30)/4, 1.8*25+32, 2/3.14, (10-6)/2, 30/40*60, 1/0.02, (20/5)**0.5)
print("2-15")
print(30/2*8, 40*0.05, 3/40, 12/3*10, 25*0.12, 2/25, 6/20, 20*0.5, 1200/6, 4.5/50, 50*0.2, 30*4/20)
print(10/4*10, 50*0.04, 3/50, 3/10, 10*1.2, 36/12, 36/2, 2/0.04, 3/50, 3/0.6, 6/5, 150/30000)
import math
print("pendulum 1s L=", 9.80665/(4*math.pi**2), " 2s L=", 9.80665*4/(4*math.pi**2))
print("F/x table", [f/xx for f,xx in [(0.5,0.02),(1.0,0.04),(1.5,0.06),(2.0,0.08)]], [v/i for v,i in [(1.5,0.03),(3,0.06),(4.5,0.09),(6,0.12)]])
print("2-16")
for eq in [Eq(4*t,10+2*t),Eq(1.5*t,10+2*t),Eq(3*x-7,x+5),Eq(5*x-3,2*x+9),Eq(3*(x+4),5*x+2),Eq(7*x+2,4*x+17),Eq(2*(x-3),x+4),Eq(150*x,60*(x+3)),Eq(10+2*x,40-x),Eq(1.5*x,x+4),Eq(5+3*x,25+x),Eq(x/4+3,x-6),Eq(R(2,10)*x+1,R(5,10)*x-2),Eq(20*t,30+15*t),
  Eq(x+9,4),Eq(6*x,-18),Eq(3*x-4,x+8),Eq(2*(x+5),4*x),Eq(x/3+2,x-4),Eq(5*x-4,2*x+5),Eq(210*x,70*(x+5)),Eq(20+4*x,80-2*x),Eq(3*t,12+t),Eq(25*t,40+15*t),Eq(3*x+8,5*x-6)]:
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
