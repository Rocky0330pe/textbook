# 第8巻の下調べ：例題案の数の検算（numpy・scipy）
import numpy as np
from math import pi, sqrt, sin, cos, exp
from scipy import integrate as I

def P(*a): print(*a)

P("== 8-1〜8-4 主役の山 h=100-0.01x^2-0.02y^2 ==")
h = lambda x, y: 100 - 0.01*x**2 - 0.02*y**2
hx = lambda x, y: -0.02*x
hy = lambda x, y: -0.04*y
P("h(30,20)=", h(30, 20), " hx=", hx(30, 20), " hy=", hy(30, 20), " |grad|=", np.hypot(hx(30,20), hy(30,20)))
P("dh(全微分, dx=dy=1)=", hx(30,20)+hy(30,20), " 本当の差=", h(31,21)-h(30,20))
P("dx=dy=0.1: 全微分", 0.1*(hx(30,20)+hy(30,20)), " 本当", h(30.1,20.1)-h(30,20))
for deg in [0, 45, 90, 233.13]:
    e = np.array([cos(np.radians(deg)), sin(np.radians(deg))])
    P(f"  方向微分 {deg}°:", np.dot([hx(30,20), hy(30,20)], e))
# 等高線の接線は grad に直角：0.01x^2+0.02y^2=17 の接線 (−hy, hx)
P("登山の仕事 50kg, 83m→100m:", 50*9.8*17, "J")
# 山の体積（楕円の上）
a, b, H = 100, sqrt(100/0.02), 100
P("山の体積 = pi a b H/2 =", pi*a*b*H/2)
v, _ = I.dblquad(lambda r, t: H*(1-r*r)*a*b*r, 0, 2*pi, 0, 1)
P("  楕円座標の数値積分 =", v)

P("\n== 8-3 ロボットのヤコビ行列（物理 力-7 の数）==")
L1, L2, t1, t2 = 0.30, 0.25, np.radians(30), np.radians(45)
x = lambda a, b: L1*cos(a) + L2*cos(a+b)
y = lambda a, b: L1*sin(a) + L2*sin(a+b)
eps = 1e-6
J = np.array([[(x(t1+eps,t2)-x(t1-eps,t2))/(2*eps), (x(t1,t2+eps)-x(t1,t2-eps))/(2*eps)],
              [(y(t1+eps,t2)-y(t1-eps,t2))/(2*eps), (y(t1,t2+eps)-y(t1,t2-eps))/(2*eps)]])
P("手", x(t1,t2), y(t1,t2)); P("J=", J.round(4)); P("det J", np.linalg.det(J), L1*L2*sin(t2))
P("J (0.5,1.0)=", J@np.array([0.5, 1.0]))
# 全微分で手の動き：関節を 0.01 rad ずつ
d = np.array([0.01, 0.01])
P("全微分の予想", J@d, " 本当", x(t1+0.01,t2+0.01)-x(t1,t2), y(t1+0.01,t2+0.01)-y(t1,t2))

P("\n== 8-3 誤差の伝わり方：円柱 r=0.05±0.0005, h=0.2±0.002 ==")
r, hh = 0.05, 0.2
V = pi*r*r*hh
dV = 2*pi*r*hh*0.0005 + pi*r*r*0.002
P("V=", V, " dV=", dV, " 割合", dV/V)
P("  ばらつき(2乗和の根)の割合", sqrt((2*0.0005/0.05)**2 + (0.002/0.2)**2))

P("\n== 8-6 重積分 ==")
f = lambda y, x: 10 + 5*x + 2*y
v, _ = I.dblquad(f, 0, 2, 0, 1); P("板の重さ 0<=x<=2,0<=y<=1, sigma=10+5x+2y:", v)
# タイル（中点）4x2
xs = (np.arange(4)+0.5)*0.5; ys = (np.arange(2)+0.5)*0.5
tile = sum(10+5*X+2*Y for X in xs for Y in ys)*0.25
P("  中点のタイル 4x2:", tile)
xs = (np.arange(4)+0.5)*0.5; ys = (np.arange(2)+0.5)*0.5
left = sum(10+5*X+2*Y for X in np.arange(4)*0.5 for Y in np.arange(2)*0.5)*0.25
P("  左下の角のタイル 4x2:", left)
# 三角形 xy
v, _ = I.dblquad(lambda y, x: x*y, 0, 1, 0, lambda x: x); P("三角形 0<=y<=x<=1 の xy:", v)
v, _ = I.dblquad(lambda x, y: x*y, 0, 1, lambda y: y, 1); P("  順番を変えて:", v)
# 三角形の重心 b=3,h=2
b_, h_ = 3.0, 2.0
A, _ = I.dblquad(lambda y, x: 1, 0, b_, 0, lambda x: h_*(1-x/b_))
Mx, _ = I.dblquad(lambda y, x: x, 0, b_, 0, lambda x: h_*(1-x/b_))
My, _ = I.dblquad(lambda y, x: y, 0, b_, 0, lambda x: h_*(1-x/b_))
P("三角形(0,0)(3,0)(0,2)：面積", A, " 重心", Mx/A, My/A)
# 円板・輪
R = 0.1
v, _ = I.dblquad(lambda r, t: r, 0, 2*pi, 0, R); P("円板の面積 R=0.1:", v, pi*R*R)
d_ = 0.04
v, _ = I.dblquad(lambda r, t: (r*sin(t))**2*r, 0, 2*pi, 0, d_/2); P("円の断面二次モーメント d=0.04:", v, pi*d_**4/64)
# ガウス積分
v, _ = I.dblquad(lambda r, t: exp(-r*r)*r, 0, 2*pi, 0, np.inf); P("∬e^{-(x²+y²)} =", v, " pi=", pi)
v, _ = I.quad(lambda x: exp(-x*x), -np.inf, np.inf); P("∫e^{-x²} =", v, sqrt(pi))
# 球の体積・慣性モーメント
R = 1.0
v, _ = I.tplquad(lambda r, th, ph: r*r*sin(th), 0, 2*pi, 0, pi, 0, R); P("球の体積:", v, 4/3*pi)
Iz, _ = I.tplquad(lambda r, th, ph: (r*sin(th))**2*r*r*sin(th), 0, 2*pi, 0, pi, 0, R)
P("球の I/(M R^2) (rho=1):", Iz/(4/3*pi))
# ハーゲン・ポアズイユ型の流量
R, umax = 0.01, 0.2
v, _ = I.quad(lambda r: umax*(1-r*r/R/R)*2*pi*r, 0, R)
P("管の流量 R=1cm, umax=0.2:", v, "m3/s =", v*1e6, "mL/s =", v*1e3*60, "L/min ; 平均の速さ", v/(pi*R*R))
# 雨量（データ）: 例の数だけ
P("== 8-7 線積分 ==")
def line(F, r, dr, a, b):
    return I.quad(lambda t: np.dot(F(*r(t)), dr(t)), a, b)[0]
F1 = lambda x, y: np.array([y, x]); F2 = lambda x, y: np.array([-y, x])
diag = (lambda t: (t, t), lambda t: np.array([1, 1]))
para = (lambda t: (t, t*t), lambda t: np.array([1, 2*t]))
P("F1 ななめ:", line(F1, *diag, 0, 1), " F1 放物線:", line(F1, *para, 0, 1))
P("F2 ななめ:", line(F2, *diag, 0, 1), " F2 放物線:", line(F2, *para, 0, 1))
# F2 の道A・B（物理 力-4 例題13）
A_ = I.quad(lambda x: F2(x, 0)[0], 0, 1)[0] + I.quad(lambda y: F2(1, y)[1], 0, 1)[0]
B_ = I.quad(lambda y: F2(0, y)[1], 0, 1)[0] + I.quad(lambda x: F2(x, 1)[0], 0, 1)[0]
P("F2 道A:", A_, " 道B:", B_)
circ = (lambda t: (cos(t), sin(t)), lambda t: np.array([-sin(t), cos(t)]))
P("F2 単位円1周:", line(F2, *circ, 0, 2*pi), 2*pi)
P("F1 単位円1周:", line(F1, *circ, 0, 2*pi))
# 半径 R の円 F2: 2*pi*R^2 = rot 2 x 面積
R = 3
P("F2 半径3の円:", line(F2, lambda t: (R*cos(t), R*sin(t)), lambda t: np.array([-R*sin(t), R*cos(t)]), 0, 2*pi), 2*pi*R*R)
# 穴のあるうず (−y,x)/(x²+y²)
F5 = lambda x, y: np.array([-y, x])/(x*x+y*y)
P("(−y,x)/r² 単位円:", line(F5, *circ, 0, 2*pi), " 半径3:", line(F5, lambda t: (3*cos(t), 3*sin(t)), lambda t: np.array([-3*sin(t), 3*cos(t)]), 0, 2*pi))
# 原点を囲まない円（中心(3,0)半径1）
P("  原点を囲まない円:", line(F5, lambda t: (3+cos(t), sin(t)), lambda t: np.array([-sin(t), cos(t)]), 0, 2*pi))
# 物理 力-4 の Python（100本の線分）
N = 100; W = 0
for i in range(N):
    t0, t1_ = 2*pi*i/N, 2*pi*(i+1)/N
    x0, y0, x1, y1 = cos(t0), sin(t0), cos(t1_), sin(t1_)
    xm, ym = (x0+x1)/2, (y0+y1)/2
    W += (-ym)*(x1-x0) + xm*(y1-y0)
P("物理 力-4 の Python:", round(W, 4))
# 針金の重さ（半円 R=0.5, λ=2+sinθ）
v, _ = I.quad(lambda t: (2+sin(t))*0.5, 0, pi); P("半円の針金 λ=2+sinθ:", v, pi+1)
# p-V の道
P("p-V 道1(定圧200kPa→定積):", 200e3*2e-3, " 道2:", 100e3*2e-3, " まっすぐ:", 150e3*2e-3)
# 重力の仕事
P("2kg, 5m の坂:", 2*9.8*5)
# 円運動・アンペール
mu0 = 4*pi*1e-7
P("直線電流 10A, r=5cm の B =", mu0*10/(2*pi*0.05), "T")

P("\n== 8-8 面積分 ==")
P("一様な流れ 2m/s, 網0.5m², 60°:", 2*0.5*cos(np.radians(60)))
v, _ = I.dblquad(lambda z, x: 1+0.5*z, 0, 1, 0, 2); P("窓 1m×2m, v=1+0.5z:", v)
# 放物面 z=1-x²-y² の上向き流束 F=(x,y,z)
v, _ = I.dblquad(lambda r, t: (1+r*r)*r, 0, 2*pi, 0, 1); P("放物面の流束 F=(x,y,z):", v, 1.5*pi)
volp, _ = I.dblquad(lambda r, t: (1-r*r)*r, 0, 2*pi, 0, 1); P("  放物面の下の体積:", volp, " div3×体積:", 3*volp)
# 半球 F=(0,0,z)
R = 2.0
v, _ = I.dblquad(lambda th, ph: (R*cos(th))*cos(th)*R*R*sin(th), 0, 2*pi, 0, pi/2); P("半球 F=(0,0,z), R=2:", v, 2*pi*R**3/3)
# 球面の面積
v, _ = I.dblquad(lambda th, ph: R*R*sin(th), 0, 2*pi, 0, pi); P("球面の面積 R=2:", v, 4*pi*R*R)
# 立方体 F=(x², xy, −z)
faces = {
 'x=1': I.dblquad(lambda z, y: 1.0, 0, 1, 0, 1)[0],
 'x=0': -I.dblquad(lambda z, y: 0.0, 0, 1, 0, 1)[0],
 'y=1': I.dblquad(lambda z, x: x*1, 0, 1, 0, 1)[0],
 'y=0': -I.dblquad(lambda z, x: x*0, 0, 1, 0, 1)[0],
 'z=1': I.dblquad(lambda y, x: -1.0, 0, 1, 0, 1)[0],
 'z=0': -I.dblquad(lambda y, x: -0.0, 0, 1, 0, 1)[0]}
P("立方体 F=(x²,xy,−z) 面ごと:", faces, " 合計", sum(faces.values()))
v, _ = I.tplquad(lambda z, y, x: 3*x-1, 0, 1, 0, 1, 0, 1); P("  div=3x−1 の体積分:", v)
# 屋根の雨：傾きによらない
P("屋根(上から見て 10m×6m), 雨 5mm/h:", 10*6*0.005, "m³/h（傾きによらない）")
# 立体角：円すい半角 α
for al in [30, 60, 90, 180]:
    P(f"  立体角 半角{al}°:", 2*pi*(1-cos(np.radians(al))))
# 点電荷の流束（球）
P("点電荷の流束 ×ε0/Q: 球 =", 1.0)

P("\n== 8-11 ガウスの定理・ストークスの定理 ==")
R = 2.0
P("F=(x,y,z) 球 R=2: 直接 R×4πR² =", R*4*pi*R*R, " div3×体積 =", 3*4/3*pi*R**3)
# 半球 F=(x,y,z+1)
dome, _ = I.dblquad(lambda th, ph: (R + cos(th))*R*R*sin(th), 0, 2*pi, 0, pi/2)
P("半球 F=(x,y,z+1) R=2 のドーム直接:", dome, " 2πR³+πR²=", 2*pi*R**3+pi*R*R, " (底 −πR²、全体 2πR³)")
# 立方体の面：点電荷の 1/6
a = 1.0
face, _ = I.dblquad(lambda y, x: a/2/((x*x+y*y+(a/2)**2)**1.5)/(4*pi), -a/2, a/2, -a/2, a/2)
P("立方体の中心の点電荷：1つの面を通る割合", face, 1/6)
# 点電荷を中心からずらしても6面の合計は1
c = np.array([0.2, -0.1, 0.3])
def face_flux(axis, sign):
    def integrand(v, u):
        p = np.zeros(3); idx = [i for i in range(3) if i != axis]
        p[axis] = sign*a/2; p[idx[0]] = u; p[idx[1]] = v
        d = p - c; n = np.zeros(3); n[axis] = sign
        return np.dot(d, n)/np.linalg.norm(d)**3/(4*pi)
    return I.dblquad(integrand, -a/2, a/2, -a/2, a/2)[0]
tot = sum(face_flux(ax, s) for ax in range(3) for s in (1, -1))
P("  点電荷を (0.2,−0.1,0.3) にずらしたとき6面の合計:", tot)
# 外に出すと0
c = np.array([1.5, 0, 0])
tot = sum(face_flux(ax, s) for ax in range(3) for s in (1, -1))
P("  点電荷が箱の外 (1.5,0,0):", round(tot, 10))
# 地球の重力：中
G, M, Re = 6.674e-11, 5.972e24, 6.371e6
P("地面の g =", G*M/Re**2, " 半分の深さ（一様な球とした）", G*M/Re**2*0.5)
# グリーン：三角形の面積・だ円
pts = [(0,0),(4,0),(4,3)]
s = 0
for (x0,y0),(x1,y1) in zip(pts, pts[1:]+pts[:1]): s += x0*y1 - x1*y0
P("三角形 (0,0)(4,0)(4,3) の面積（くつひもの式）:", s/2)
aa, bb = 3, 2
v = 0.5*I.quad(lambda t: aa*cos(t)*bb*cos(t) - bb*sin(t)*(-aa*sin(t)), 0, 2*pi)[0]
P("だ円 a=3,b=2 の面積（グリーン）:", v, pi*aa*bb)
# ストークス：F=(−y,x,0) の rot=(0,0,2)：半球（R=1）を通る流束
v, _ = I.dblquad(lambda th, ph: 2*cos(th)*sin(th), 0, 2*pi, 0, pi/2)
P("rot(0,0,2) の半球(R=1)の流束:", v, " 円板:", 2*pi)
# 池（2次元）：わき出し Q=4 を囲む道の流束
Q = 4
src, snk = np.array([1.5, 2.5]), np.array([4.5, 1.5])
def vel(p):
    d1 = p - src; d2 = p - snk
    return Q/(2*pi)*(d1/np.dot(d1, d1) - d2/np.dot(d2, d2))
def edge_flux(p0, p1, n):
    return I.quad(lambda s: np.dot(vel(p0 + s*(p1-p0)), n), 0, 1, limit=200)[0]
x0, y0 = 1, 2
right = edge_flux(np.array([x0+1, y0]), np.array([x0+1, y0+1]), np.array([1, 0]))
left = edge_flux(np.array([x0, y0]), np.array([x0, y0+1]), np.array([-1, 0]))
top = edge_flux(np.array([x0, y0+1]), np.array([x0+1, y0+1]), np.array([0, 1]))
bot = edge_flux(np.array([x0, y0]), np.array([x0+1, y0]), np.array([0, -1]))
P("池の蛇口のマス 出る量: 右", round(right,3), " 左", round(left,3), " 上", round(top,3), " 下", round(bot,3), " 合計", round(right+left+top+bot, 4))
P("  （見本の『右 1.22, 左 −0.83, 上 0.91, 下 −1.04』は v_x・v_y の向きの符号つき）")
# 池の外周（6×4）
outer = (edge_flux(np.array([6,0]), np.array([6,4]), np.array([1,0])) + edge_flux(np.array([0,0]), np.array([0,4]), np.array([-1,0]))
         + edge_flux(np.array([0,4]), np.array([6,4]), np.array([0,1])) + edge_flux(np.array([0,0]), np.array([6,0]), np.array([0,-1])))
P("  池の外周の合計:", round(outer, 4))

P("\n== 8-10 rot と 8-9 div の表 ==")
for name, F in [("(x,y)", lambda x,y:(x,y)), ("(−x,−y)", lambda x,y:(-x,-y)), ("(1,0)", lambda x,y:(1,0)),
                ("(−y,x)", lambda x,y:(-y,x)), ("(y,0)", lambda x,y:(y,0)), ("(x,0)", lambda x,y:(x,0))]:
    e = 1e-5; x, y = 0.7, 0.4
    Fx = lambda X, Y: F(X, Y)[0]; Fy = lambda X, Y: F(X, Y)[1]
    div = (Fx(x+e,y)-Fx(x-e,y))/(2*e) + (Fy(x,y+e)-Fy(x,y-e))/(2*e)
    rot = (Fy(x+e,y)-Fy(x-e,y))/(2*e) - (Fx(x,y+e)-Fx(x,y-e))/(2*e)
    P(f"  {name}: div={div:.3f}, rot={rot:.3f}")
P("  川の流れ v=(1−y²,0)（y=−1〜1）の rot = 2y：岸の近くで回る")

P("\n== 8-12 ラプラシアン ==")
# 正方形の板：上だけ100℃
n = 9
T = np.zeros((n, n)); T[0, :] = 100; T[0,0]=T[0,-1]=50
for k in range(5000):
    Tn = T.copy()
    Tn[1:-1,1:-1] = 0.25*(T[:-2,1:-1]+T[2:,1:-1]+T[1:-1,:-2]+T[1:-1,2:])
    T = Tn
P("正方形の板 9×9 の格子（上100、ほか0）中心の温度:", round(T[4,4], 4))
n = 5
T = np.zeros((n, n)); T[0, :] = 100
it = 0
for k in range(200):
    Tn = T.copy(); Tn[1:-1,1:-1] = 0.25*(T[:-2,1:-1]+T[2:,1:-1]+T[1:-1,:-2]+T[1:-1,2:]); T = Tn
P("  5×5（中は3×3）:", T.round(3).tolist())
# ∇²(1/r)=0, ∇²(x²+y²+z²)=6 を数で
def lap(f, p, e=1e-3):
    s = 0
    for i in range(3):
        d = np.zeros(3); d[i] = e
        s += (f(p+d) - 2*f(p) + f(p-d))/e/e
    return s
p = np.array([0.6, -0.3, 0.5])
P("∇²(x²+y²+z²) =", round(lap(lambda q: np.dot(q,q), p), 4), " ∇²(1/r) =", round(lap(lambda q: 1/np.linalg.norm(q), p), 4))
# 球対称の式：(1/r²)(r² f')' で 1/r → 0
P("== 8-13 熱方程式（表計算）==")
alpha, dx = 1e-4, 0.01
for dt in [0.25, 0.5, 0.6]:
    r_ = alpha*dt/dx/dx
    Tr = np.full(11, 20.0); Tr[0] = 100.0
    for k in range(200):
        Tn = Tr.copy(); Tn[1:-1] = Tr[1:-1] + r_*(Tr[2:] - 2*Tr[1:-1] + Tr[:-2]); Tn[-1] = Tn[-2]  # 先は断熱
        Tr = Tn
    P(f"  dt={dt} s (r={r_:.2f}) の200歩後:", Tr.round(1).tolist()[:6], "…")
# 最初の数歩（r=0.25, 両はし100と20固定）
Tr = np.full(11, 20.0); Tr[0] = 100.0
rows = [Tr.copy()]
for k in range(3):
    Tn = Tr.copy(); Tn[1:-1] = Tr[1:-1] + 0.25*(Tr[2:]-2*Tr[1:-1]+Tr[:-2]); Tr = Tn; rows.append(Tr.copy())
for k, rw in enumerate(rows): P(f"  {k}歩め:", rw[:5].round(2).tolist())
# 1歩の数の固有値（7-10 とつなぐ）：最も危ない成分は 1−4r
for r_ in [0.25, 0.5, 0.6]: P(f"  r={r_}: いちばん細かいでこぼこの1歩の倍率 1−4r =", 1-4*r_)
# 波の方程式：弦 c, CFL
P("波 c=100 m/s, dx=0.01 m: dt <=", 0.01/100, "s")
# 物質微分の例
P("物質微分：川 2 m/s、水温 0.5℃/km 上がる、その場で −1℃/h:", -1 + 2*0.5/1000*3600, "℃/h")
P("\n== 8-4 天気図 ==")
P("4 hPa / 200 km の気圧の傾き:", 400/200e3, "Pa/m ; ÷1.2 kg/m³ =", 400/200e3/1.2, "m/s²")
P("熱の流れ 6-3 のかべ: q = −k dT/dx, k=1.6, dT/dx=−100 →", 1.6*100, "W/m²")

P("\n== 追加：熱方程式の1歩の行列の固有値（7-10 とつなぐ）==")
N = 9
for r_ in [0.25, 0.5, 0.6]:
    Amat = np.eye(N)*(1-2*r_) + np.eye(N, k=1)*r_ + np.eye(N, k=-1)*r_
    ev = np.linalg.eigvalsh(Amat)
    P(f"  r={r_}: 固有値の最小 {ev.min():.4f} 最大 {ev.max():.4f}（式 1−4r sin²(kπ/20) の最小 {1-4*r_*sin(9*pi/20)**2:.4f}）")
P("\n== 追加：4-13 の平面 2x+y+2z=6 の三角形を通る一様な流れ (1,1,1) ==")
a_ = np.array([-3, 6, 0]); b_ = np.array([-3, 0, 3]); c_ = np.cross(a_, b_)
P("  外積", c_, " 面積", np.linalg.norm(c_)/2, " 流束", np.dot([1,1,1], c_)/2)
P("\n== 追加：直線電流の磁場 B=(μ0 I/2π)(−y,x)/r² の rot（導線の外）と1周 ==")
k = 2e-7*10
Bf = lambda x, y: k*np.array([-y, x])/(x*x+y*y)
e = 1e-6; x, y = 0.03, 0.04
rotB = (Bf(x+e,y)[1]-Bf(x-e,y)[1])/(2*e) - (Bf(x,y+e)[0]-Bf(x,y-e)[0])/(2*e)
P("  rot B（外）=", rotB, "  1周 =", line(Bf, lambda t: (0.05*cos(t), 0.05*sin(t)), lambda t: np.array([-0.05*sin(t), 0.05*cos(t)]), 0, 2*pi), " μ0 I =", mu0*10)
P("\n== 追加：点電荷の電場 E ∝ r/|r|³ の div（原点の外）==")
Ef = lambda q: q/np.linalg.norm(q)**3
p = np.array([0.3, 0.2, -0.4]); e = 1e-5
dv = sum((Ef(p+e*np.eye(3)[i])[i]-Ef(p-e*np.eye(3)[i])[i])/(2*e) for i in range(3))
P("  div =", round(dv, 6))
P("\n== 追加：剛体の回転 v=ω(−y,x) の rot = 2ω（ω=0.5）:", 2*0.5)
P("== 追加：台風（気圧の傾き）4 hPa/100 km なら", 400/100e3/1.2, "m/s²")
