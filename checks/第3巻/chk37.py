from fractions import Fraction as F
V=[20,16,12,10,8,5]; p=[101,125,168,201,249,402]
print([v*q for v,q in zip(V,p)], [2000/v for v in V])
f=lambda x: F(12)/x
for x in [1,2,3,4,6,12,F(1,2),F(1,10),F(1,100),24,120,1200, F(3,2),5]: print(x, f(x))
print('polyline 1.5:', (12+6)/2, ' 5:', (3+2)/2)
xs=[1,2,3,4,6,12]
for a,b in zip(xs,xs[1:]): print(a,b,(f(b)-f(a))/(b-a), F(-12,a*b))
# ex1
a=3*8; print('ex1',a, F(a,6), F(a,-4), F(a,2))
a=4*-3; print('jibun1',a, F(a,2), F(a,-6), F(a,6))
print('ex2',[F(-8,x) for x in [-8,-4,-2,-1,1,2,4,8]])
print('jibun2',[F(6,x) for x in [-6,-3,-2,-1,1,2,3,6]])
print('ex3', 2*5, 4*2.5, -5*2)
print('jibun3', 3*-4, -6*2, 2*6)
g=lambda x:F(12,x); print('ex4',(g(3)-g(1))/2,(g(6)-g(3))/3)
g=lambda x:F(24,x); print('jibun4',(g(4)-g(2))/2,(g(8)-g(4))/4)
print('ex5', 30*100, F(3000,20), F(3000,300))
print('jibun5', 40*100, F(4000,25), F(4000,400))
print('ex6', [x*y for x,y in [(10,6),(20,3),(30,2),(40,1.5)]], 60/25)
print('jibun6', [x*y for x,y in [(2,3),(3,2),(4,1.5),(6,1)]], 6/12)
# problems
print('p1', 2*9, F(18,-3), F(18,4))
print('p2', [F(-12,x) for x in [-6,-4,-3,-2,2,3,4,6]])
print('p3', [x*y for x,y in [(4,5),(-2,-10),(5,-4),(0.5,40)]])
g=lambda x:F(18,x); print('p4',(g(3)-g(1))/2,(g(6)-g(3))/3)
print('p5', 50*100, F(5000,20), F(5000,125))
print('p6', [x*y for x,y in [(10,60),(20,30),(30,20),(40,15)]], F(600,24))
print('c1', 3*4, F(12,6), F(12,-2))
print('c2', 500*100, F(50000,50), F(50000*1,F(500,12)))
print('c3', F(120,40), F(120,60), F(120,F(3,2)))
print('engine adiabatic', 10**1.4*100)
