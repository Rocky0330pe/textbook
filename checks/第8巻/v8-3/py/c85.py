import numpy as np, re
# pond: check data file against free-space source+sink
Q = 4.0
S = np.array([1.5, 2.5]); K = np.array([4.5, 1.5])
def v(p):
    p = np.array(p, float)
    a = p - S; b = p - K
    return Q/(2*np.pi)*(a/(a@a) - b/(b@b))
txt = open('/home/claude/work/build/tex/ch8-9-data.tex', encoding='utf-8').read()
arr = re.findall(r'\\draw\[bk pond arrow\] \(([-\d.]+),([-\d.]+)\) -- \+\+\(([-\d.]+),([-\d.]+)\)', txt)
rat = []
for x, y, u, w in arr[:12]:
    x, y, u, w = map(float, (x, y, u, w))
    c = (x+u/2, y+w/2)
    vv = v(c)
    print(c, (u, w), vv, np.hypot(u, w)/np.hypot(*vv) if np.hypot(*vv) > 0 else None)
# edge fluxes of source cell [1,2]x[2,3]
from scipy.integrate import quad
R = quad(lambda y: v((2, y))[0], 2, 3)[0]
L = quad(lambda y: v((1, y))[0], 2, 3)[0]
U = quad(lambda x: v((x, 3))[1], 1, 2)[0]
D = quad(lambda x: v((x, 2))[1], 1, 2)[0]
print('edges R,L,U,D', R, L, U, D, 'net', R-L+U-D)
# speeds at some points
for p in [(3, 2), (1.5, 3.5), (0.5, 0.5), (3, 4), (5.5, 0.5)]:
    print(p, v(p), np.hypot(*v(p)))
# point charge
k = 8.99e9; q = 1e-9
for r in [0.1, 0.2, 0.5, 1, 2]:
    print('E', r, k*q/r**2)
GM = 3.986e14; R = 6.371e6
for hgt in [0, 400e3, R, 35786e3]:
    print('g', hgt, GM/(R+hgt)**2)
# drone rotation: wind (3,4) in ground; drone axes rotated 30 deg ccw
th = np.radians(30)
Rm = np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]])
print('drone comps', Rm.T@np.array([3, 4]), np.linalg.norm(Rm.T@[3, 4]))
th = np.radians(90); Rm = np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]])
print('drone 90', Rm.T@np.array([3, 4]))
th = np.radians(60); Rm = np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]])
print('drone 60 (2,0)', Rm.T@np.array([2, 0]), Rm.T@np.array([0, 2]), Rm.T@np.array([4, 2]))
th = np.radians(45); Rm = np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]])
print('45 (1,1)', Rm.T@np.array([1, 1]), Rm.T@np.array([2, 0]))
# table for (-y,x) etc
for f, name in [(lambda x, y: (-y, x), 'uzu'), (lambda x, y: (x - y, x + y), 'mix')]:
    for p in [(1, 0), (0, 1), (-1, 0), (0, -1), (1, 1), (2, 1)]:
        print(name, p, f(*p))
# gradient field of mountain: -grad h = (0.02x, 0.04y)
for p in [(30, 20), (40, 0), (0, 30), (-20, 20)]:
    print('-grad', p, (0.02*p[0], 0.04*p[1]))
