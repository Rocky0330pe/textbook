import numpy as np
from math import *
from scipy import integrate as I

print("== 8-6 ==")
sig = lambda x, y: 10+5*x+2*y
for nx, ny in [(4,2),(8,4),(16,8),(40,20),(400,200)]:
    hx, hy = 2/nx, 1/ny
    ll = sum(sig(i*hx, j*hy)*hx*hy for i in range(nx) for j in range(ny))
    mid = sum(sig((i+.5)*hx, (j+.5)*hy)*hx*hy for i in range(nx) for j in range(ny))
    print(nx, ny, "左下", round(ll, 4), "中点", round(mid, 4))
# 4x2 table
xs = [0.25, 0.75, 1.25, 1.75]; ys = [0.25, 0.75]
for y in ys:
    row = [sig(x, y) for x in xs]; w = [s*0.25 for s in row]
    print("y=", y, "sigma", row, "重さ", w, "行の合計", sum(w))
for x in xs:
    print("x=", x, "列の合計", sum(sig(x, y)*0.25 for y in ys))
# corner table
for y in [0, 0.5]:
    print("角 y=", y, [sig(x, y) for x in [0, .5, 1, 1.5]], sum(sig(x, y)*0.25 for x in [0, .5, 1, 1.5]))
print("内側 x で: ∫0^2 (10+5x+2y)dx = 20+10+4y = 30+4y ; ∫0^1 (30+4y)dy =", 30+2)
print("内側 y で: ∫0^1 (10+5x+2y)dy = 11+5x ; ∫0^2 =", 22+10)
print("jibun1 8+3x+4y:", I.dblquad(lambda y, x: 8+3*x+4*y, 0, 2, 0, 1)[0])
print("prob1 12+4x+6y [0,3]x[0,1]:", I.dblquad(lambda y, x: 12+4*x+6*y, 0, 3, 0, 1)[0])
print("A' xy^2 [0,2]x[0,3]:", I.dblquad(lambda y, x: x*y*y, 0, 2, 0, 3)[0])
print("jibun2 x^2 y [0,3]x[0,4]:", I.dblquad(lambda y, x: x*x*y, 0, 3, 0, 4)[0])
print("prob2 x^2y^2 [0,3]x[0,1]:", I.dblquad(lambda y, x: x*x*y*y, 0, 3, 0, 1)[0])
def tri(a, b):
    A = I.dblquad(lambda y, x: 1, 0, a, 0, lambda x: b-b*x/a)[0]
    Mx = I.dblquad(lambda y, x: x, 0, a, 0, lambda x: b-b*x/a)[0]
    My = I.dblquad(lambda y, x: y, 0, a, 0, lambda x: b-b*x/a)[0]
    return A, Mx, My, Mx/A, My/A
print("tri 3,2", tri(3, 2)); print("tri 6,3", tri(6, 3)); print("tri 4,3", tri(4, 3))
print("xy 0<=y<=x<=1", I.dblquad(lambda y, x: x*y, 0, 1, 0, lambda x: x)[0], I.dblquad(lambda x, y: x*y, 0, 1, lambda y: y, 1)[0])
print("xy 0<=y<=x<=2", I.dblquad(lambda y, x: x*y, 0, 2, 0, lambda x: x)[0], I.dblquad(lambda x, y: x*y, 0, 2, lambda y: y, 2)[0])
print("y 0<=y<=x<=3", I.dblquad(lambda y, x: y, 0, 3, 0, lambda x: x)[0], I.dblquad(lambda x, y: y, 0, 3, lambda y: y, 3)[0])
for d in [0.04, 0.06, 0.1]:
    R = d/2; print("円 d=", d, "I=pi d^4/64", pi*d**4/64, "polar J", pi*R**4/2, "area", pi*R*R)
for D, d in [(0.04, 0.03), (0.06, 0.04), (0.05, 0.04)]:
    print("中空", D, d, pi*(D**4-d**4)/64, "比", (D**4-d**4)/D**4, "面積比", (D*D-d*d)/D**2)
for R, um in [(0.01, 0.2), (0.02, 0.5), (0.005, 0.4)]:
    Q = I.quad(lambda r: um*(1-r*r/R/R)*2*pi*r, 0, R)[0]
    print("管", R, um, "Q", Q, "mL/s", Q*1e6, "L/min", Q*6e4, "平均", Q/(pi*R*R))
print("gauss", I.dblquad(lambda y, x: exp(-x*x-y*y), -10, 10, -10, 10)[0], sqrt(pi))
def hill(H, ca, cb):
    a = sqrt(H/ca); b = sqrt(H/cb)
    V = I.dblquad(lambda y, x: max(H-ca*x*x-cb*y*y, 0), -a, a, -b, b)[0]
    return a, b, pi*a*b, V, pi*a*b*H/2
print("山 100", hill(100, 0.01, 0.02)); print("山 40", hill(40, 0.01, 0.04)); print("山 60", hill(60, 0.01, 0.04))
print("A(z) 主役 z=50:", pi*sqrt(50/0.01)*sqrt(50/0.02))
# sphere
R = 1; rho = 1
Vs = I.tplquad(lambda r, th, ph: r*r*sin(th), 0, 2*pi, 0, pi, 0, R)[0]
Iz = I.tplquad(lambda r, th, ph: r**4*sin(th)**3, 0, 2*pi, 0, pi, 0, R)[0]
print("球 V", Vs, 4*pi/3, "Iz/(MR^2)", Iz/Vs)
Vh = I.tplquad(lambda r, th, ph: r*r*sin(th), 0, 2*pi, 0, pi/2, 0, R)[0]
Ih = I.tplquad(lambda r, th, ph: r**4*sin(th)**3, 0, 2*pi, 0, pi/2, 0, R)[0]
print("半球 V", Vh, "Iz/(MR^2)", Ih/Vh)
print("int sin^3 0..pi", I.quad(lambda t: sin(t)**3, 0, pi)[0], "0..pi/2", I.quad(lambda t: sin(t)**3, 0, pi/2)[0])
for R, rho in [(0.05, 7850), (0.1, 7850)]:
    M = rho*4/3*pi*R**3; print("鉄球 R", R, "M", M, "I", 0.4*M*R*R)
for g in [[10,20,30,20,30,40,30,40,50],[5,10,15,10,20,25,15,25,35],[10,15,20,25,30,35]]:
    print("雨", sum(g), sum(g)*1000, "m3", "平均", sum(g)/len(g))
# 8-7
print("== 8-7 ==")
F1 = lambda x, y: (y, x); F2 = lambda x, y: (-y, x); F3 = lambda x, y: (2*x, 2*y); F4 = lambda x, y: (y, -x); F5 = lambda x, y: (2*y, x)
def line(F, r, dr, a, b):
    return I.quad(lambda t: np.dot(F(*r(t)), dr(t)), a, b)[0]
seg = lambda P, Q: (lambda t: (P[0]+t*(Q[0]-P[0]), P[1]+t*(Q[1]-P[1])), lambda t: (Q[0]-P[0], Q[1]-P[1]))
def path(F, pts):
    return sum(line(F, *seg(pts[i], pts[i+1]), 0, 1) for i in range(len(pts)-1))
for nm, F in [("F1", F1), ("F2", F2), ("F3", F3), ("F4", F4), ("F5=(2y,x)", F5)]:
    print(nm, "道A", path(F, [(0,0),(1,0),(1,1)]), "道B", path(F, [(0,0),(0,1),(1,1)]), "ななめ", path(F, [(0,0),(1,1)]),
          "(1,0)->(0,1)", path(F, [(1,0),(0,1)]),
          "y=x^2", line(F, lambda x: (x, x*x), lambda x: (1, 2*x), 0, 1), "y=x^3", line(F, lambda x: (x, x**3), lambda x: (1, 3*x*x), 0, 1),
          "三角A+戻り", path(F, [(0,0),(1,0),(1,1),(0,0)]), "三角B+戻り", path(F, [(0,0),(0,1),(1,1),(0,0)]),
          "正方形1", path(F, [(0,0),(1,0),(1,1),(0,1),(0,0)]), "正方形2", path(F, [(0,0),(2,0),(2,2),(0,2),(0,0)]))
for Rr in [1, 2, 3]:
    print("円 R", Rr, "F2", line(F2, lambda t: (Rr*cos(t), Rr*sin(t)), lambda t: (-Rr*sin(t), Rr*cos(t)), 0, 2*pi), "F1", line(F1, lambda t: (Rr*cos(t), Rr*sin(t)), lambda t: (-Rr*sin(t), Rr*cos(t)), 0, 2*pi),
          "半円F2", line(F2, lambda t: (Rr*cos(t), Rr*sin(t)), lambda t: (-Rr*sin(t), Rr*cos(t)), 0, pi))
for n in [4, 6, 8, 12, 100]:
    s = 0
    for k in range(n):
        a = (cos(2*pi*k/n), sin(2*pi*k/n)); b = (cos(2*pi*(k+1)/n), sin(2*pi*(k+1)/n))
        m = ((a[0]+b[0])/2, (a[1]+b[1])/2); s += np.dot(F2(*m), (b[0]-a[0], b[1]-a[1]))
    print("多角形 n", n, s, n*sin(2*pi/n))
print("針金 半円", I.quad(lambda t: (2+sin(t))*0.5, 0, pi)[0], "1/4円 R2", I.quad(lambda t: (1+cos(t))*2, 0, pi/2)[0], "1/4円 R1 3+sin", I.quad(lambda t: (3+sin(t))*1, 0, pi/2)[0])
print("摩擦 10kg 0.3:", 0.3*98, 0.3*98*5, 0.3*98*7, " 5kg 0.4:", 0.4*49, 0.4*49*2*pi, 0.4*49*4, " 20kg 0.25:", 0.25*196, 0.25*196*14, 0.25*196*10)
print("山", 50*9.8*17, "(40,10) h", 100-0.01*1600-0.02*100, 60*9.8*18)
print("pV", 200e3*2e-3, 100e3*2e-3, 150e3*2e-3, "|", 300e3*3e-3, 100e3*3e-3, 200e3*3e-3, "|", 400e3*3e-3, 100e3*3e-3, 250e3*3e-3)
print("U=-xy (1,2)->(3,1):", -1*2-(-3*1), path(F1, [(1,2),(3,1)]))
print("F2 道A 4歩表:", [(-0)*0.25 for _ in range(4)], [1*0.25 for _ in range(4)])
print("ななめ4歩 F1 中点:", [0.5*m for m in [0.125,0.375,0.625,0.875]], sum(0.5*m for m in [0.125,0.375,0.625,0.875]))
