import numpy as np
h = lambda x, y: 100 - 0.01*x**2 - 0.02*y**2
gx = lambda x, y: -0.02*x
gy = lambda x, y: -0.04*y
print("h(30,20)", h(30, 20), gx(30, 20), gy(30, 20))
# directional table 15 deg
print("dir table (deg, cos, sin, slope, true 1m step)")
for d in range(0, 360, 15):
    c, s = np.cos(np.radians(d)), np.sin(np.radians(d))
    sl = gx(30, 20)*c + gy(30, 20)*s
    tr = h(30+c, 20+s) - h(30, 20)
    print(d, round(c, 3), round(s, 3), round(sl, 3), round(tr, 3))
ang = np.degrees(np.arctan2(-0.8, -0.6)) % 360
print("grad angle", ang)
# 8 directions
for name, d in [("E", 0), ("NE", 45), ("N", 90), ("NW", 135), ("W", 180), ("SW", 225), ("S", 270), ("SE", 315)]:
    c, s = np.cos(np.radians(d)), np.sin(np.radians(d))
    print(name, round(gx(30, 20)*c+gy(30, 20)*s, 3), "true", round(h(30+c, 20+s)-83, 4))
# toward summit direction
v = np.array([-30, -20]); v = v/np.linalg.norm(v)
print("toward summit slope", np.dot([-0.6, -0.8], v), v)
# other points
for p in [(20, 10), (-10, 15), (40, 0), (0, -25), (10, 20), (-20, -10), (20, -15), (0, 30), (-30, 10)]:
    x, y = p
    g = np.array([gx(x, y), gy(x, y)])
    print(p, "h", h(x, y), "grad", g, "|g|", round(np.linalg.norm(g), 4))
# lagrange: x+y=50
y = 50/3; x = 2*y
print("lagr", x, y, h(x, y))
ys = np.linspace(0, 50, 50001); hs = h(50-ys, ys); i = hs.argmax(); print("check", 50-ys[i], ys[i], hs[i])
# zigzag path: slope along direction at angle a from grad: |g| cos a
for a in [0, 30, 45, 60, 75, 80]:
    print("angle", a, round(np.cos(np.radians(a)), 3))
# weather: 4 hPa/200km
print(400/200e3, 400/200e3/1.2, 400/100e3/1.2)
# wall
print(1.6*100)
