from fractions import Fraction as F
def slope(p,q): return F(str(q[1]-p[1]))/F(str(q[0]-p[0]))
def line2(p,q):
    a=slope(p,q); b=p[1]-a*p[0]; assert q[1]==a*q[0]+b; return a,b
def pt(m,p): m=F(m); return m, p[1]-m*p[0]
# yattemiyou
print(30/360,16/30,120/240, F(30,360))
# hatena
print(2/20,1/5)
# subsection fig
print(slope((1,2),(5,4)), slope((1,2),(3,3)), slope((5,4),(1,2)))
print(slope((1,1.5),(2,3.5)), slope((1,3.2),(3,1.2)))
# tank
print([2*x+5 for x in range(6)], 2*3+5, 2*10+5, slope((1,7),(4,13)), slope((0,5),(5,15)))
print([-20*x+100 for x in range(6)])
print(F(1,2)*2+1)
# x-t
print(slope((0,0),(200,1000)), slope((500,1000),(750,0)))
# spring
print(line2((2,14),(5,20)), pt(2,(2,14)), pt(2,(-1,3)))
# vt
print(5*200)
# naisou
print(18+2*(10-9), 18+2*(21-9))
# futou
print((15-5)/2, (30-100)/-20, -20*4+100, -20*3+100)
# reidai
print(slope((1,3),(4,9)), slope((-2,5),(2,-3)), slope((2,1),(5,10)), slope((-3,4),(1,-4)))
f=lambda x:-3*x+6; print(f(1),f(4),f(4)-f(1))
g=lambda x:2*x-4; print(g(1),g(5),g(5)-g(1))
print(F(1,2)*2-1, -2*1+3, F(1,3)*3+1, -1+2)
print(slope((0,0),(300,600)), slope((300,600),(500,1400)), slope((0,0),(200,800)), slope((300,800),(500,0)))
print(line2((1,5),(3,11)), line2((-1,7),(2,1)), line2((2,7),(4,11)), line2((-2,8),(1,2)))
print(pt(3,(2,5)), pt(F(-1,2),(-2,4)), pt(2,(3,4)), pt(F(-1,3),(-3,5)))
a,b=line2((4,16),(10,13)); print(a,b, -b/a)
a,b=line2((2,32),(5,20)); print(a,b, -b/a)
a=slope((2,32),(6,52)); print(a, 32+a*1, 32+a*3)
a=slope((6,12),(10,20)); print(a, 12+a, 12+3*a)
print((21-6)/3, (30-100)/-20, (19-3)/4, (20-60)/-5)
# tsumazuki
print(-2*0, -2*-4)
# problems
print(slope((1,2),(4,11)), slope((-1,6),(3,-2)))
h=lambda x:-2*x+7; print(h(2),h(5),h(5)-h(2))
print(3*1-2, F(-1,2)*2+3)
print(slope((0,0),(40,10)), slope((100,10),(140,0)))
print(line2((3,7),(5,11)), line2((-2,9),(2,1)))
print(pt(4,(1,3)), pt(F(-1,2),(-4,5)))
a=slope((1,24),(5,40)); print(a, 24+a*2)
print((11+4)/5, -9/-3)
a,b=line2((3,26),(7,34)); print(a,b,(40-b)/a)
print((20-80)/-15)
# steam
m=(143.38-101.42)/10; print(m, 101.42+m*5, 101.42+m*5-120.90)
print(4*25000)
