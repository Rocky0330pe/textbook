import cmath, math
j=1j
print((3+4j)*(1-2j), (1+2j)**2, j*(3+4j))
print(5/(1+2j), (3+4j)/(1-2j), 1/j, (1+3j)/(1+j), 10/(3-j), 2/j)
print((2+3j)*(1+j), (3-j)**2, j*(2-5j))
for p in [3,4,6,10,5,7,8,11,13,22]: print(p, j**p)
print(cmath.sqrt(-4), (-4)**0.5)
import numpy as np
for c in [[1,2,5],[1,4,13],[1,3,2],[1,4,4],[1,1,1],[1,5,6],[1,6,9],[1,2,2],[1,-10,40],[2,-2,1],[1,-4,13],[1,6,10],[1,2,10],[1,-2,5],[4,4,5]]:
    print(c, np.roots(c), c[1]**2-4*c[0]*c[2])
print((2+j)**3, (5+math.sqrt(15)*j)*(5-math.sqrt(15)*j))
# 6-9
for z in [3+4j, -1+math.sqrt(3)*j, -1-1j, -2j, 5-12j, -math.sqrt(3)+j, -2-2j, 3j, 1+j]:
    print(z, abs(z), math.degrees(cmath.phase(z)))
print([ (1+j)**n for n in range(9)])
print((1+j)*(1+math.sqrt(3)*j), (1+j)*(math.sqrt(3)+j), (1+math.sqrt(3)*j)/(1+j))
print((1+j)**8, (1+math.sqrt(3)*j)**6, (1+j)**6, (math.sqrt(3)+j)**3, (1+j)**4)
r=lambda d: complex(math.cos(math.radians(d)), math.sin(math.radians(d)))
print((3+1j)*r(60), (2+2j)*r(30), (2-2j)*r(60), (4+2j)*j, (3-1j)*j)
print(40*r(30)+30*r(90), 40*r(60)+30*r(90), r(30)*(40+30*r(60)))
print(2*r(150), 4*r(-60), 2*r(30)*3*r(60), 6*r(90)/(2*r(30)))
print((2+1j)+(1+3j), abs((4+5j)-(1+1j)), (3-1j)+(-1+2j), abs((2+3j)-(-1-1j)))
for n in [3,4,6]: print(n,[r(360*k/n) for k in range(n)])
