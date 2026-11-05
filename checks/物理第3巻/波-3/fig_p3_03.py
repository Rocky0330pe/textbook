# 波-3 の図の点（pgfplots の coordinates）を作る。python3 checks/物理第3巻/波-3/fig_p3_03.py
import numpy as np
from math import sqrt, cos, pi

m1, k1, c1 = 1.0, 100.0, 0.2
mu = 0.05; m2 = mu*m1
wn = 10.0
f_opt = 1/(1+mu); z_opt = sqrt(3*mu/(8*(1+mu)**3))
wa = f_opt*wn; k2o = m2*wa**2; c2o = 2*z_opt*m2*wa
k2u = m2*wn**2

def x1amp(w, k2, c2):
    if k2 == 0:
        return 1/abs(k1-m1*w*w+1j*w*c1)
    A = np.array([[k1+k2-m1*w*w+1j*w*(c1+c2), -(k2+1j*w*c2)],
                  [-(k2+1j*w*c2), k2-m2*w*w+1j*w*c2]])
    return abs(np.linalg.solve(A, np.array([1.0, 0.0]))[0])

def coords(fun, ws, cap=0.6):
    out = []
    for w in ws:
        y = min(fun(w), cap)
        out.append('(%.3f,%.4f)' % (w, y))
    return ' '.join(out)

ws = np.concatenate([np.linspace(6, 8.6, 14), np.linspace(8.65, 11.6, 120), np.linspace(11.7, 14, 12)])
print('% なし'); print(coords(lambda w: x1amp(w, 0, 0), ws))
print('% 同調だけ'); print(coords(lambda w: x1amp(w, k2u, 0.0), ws))
print('% 最適'); print(coords(lambda w: x1amp(w, k2o, c2o), ws))

# 表計算（dt=0.01）でのつつみ
def simulate(m2, k2, c2, w=10.0, T=80.0, dt=0.01):
    x1 = v1 = x2 = v2 = 0.0; t = 0.0; h = []
    n = 0
    while t < T - 1e-9:
        F = cos(w*t)
        a1 = (F - k1*x1 - c1*v1 + k2*(x2-x1) + c2*(v2-v1))/m1
        a2 = (-k2*(x2-x1) - c2*(v2-v1))/m2 if m2 > 0 else 0.0
        v1 += a1*dt; v2 += a2*dt
        x1 += v1*dt; x2 += v2*dt
        n += 1; t = n*dt
        h.append((t, x1, x2))
    return h
for name, (mm, kk, cc) in {'なし': (0.0, 0.0, 0.0), '最適': (m2, k2o, c2o)}.items():
    h = simulate(mm, kk, cc)
    env = []
    for t0 in range(2, 81, 2):
        a = max(abs(x[1]) for x in h if t0-0.63 <= x[0] <= t0)
        env.append('(%d,%.4f)' % (t0, a))
    print('% dt=0.01 つつみ', name); print(' '.join(env))
    a2 = max(abs(x[2]) for x in h if 79.3 <= x[0] <= 80)
    print('%  重りのゆれ（最後の1周期）', a2)
    # 表計算のはじめの行
    print('% はじめの行', [tuple(round(v, 5) for v in x) for x in h[:3]])

# モード解析の図：3層（m=1, k=100）、モードごとの減衰比 0.02、屋上をたたいて屋上で測る
K3 = 100*np.array([[2.0, -1, 0], [-1, 2, -1], [0, -1, 1]])
lam, V = np.linalg.eigh(K3)  # M=I なので V は質量で正規化ずみ
wi = np.sqrt(lam); z = 0.02
def frf(w, j=2, k=2):
    return abs(sum(V[j, i]*V[k, i]/(wi[i]**2 - w*w + 2j*z*wi[i]*w) for i in range(3)))
fs = np.concatenate([np.linspace(0.2, 3.4, 400)])
pts = []
for f in fs:
    w = 2*pi*f
    pts.append('(%.3f,%.4f)' % (f, np.log10(frf(w)*100)))  # 100 倍して log10（静たわみ 1/100... の目安）
print('% FRF log10(100|X/F|) 屋上')
print(' '.join(pts[::4]))
print('% 山の f', wi/2/pi)
for i in range(3):
    print('% 山の高さ log10', np.log10(frf(wi[i])*100))

# ---- 第2版の図の点（\draw plot coordinates 用。ymax をこえる所は線を切る） ----
def segments(fun, ws, ymax):
    pts = [(float(w), float(fun(w))) for w in ws]
    segs, cur = [], []
    for i, (w, y) in enumerate(pts):
        if y <= ymax:
            if not cur and i > 0 and pts[i-1][1] > ymax:
                w0, y0 = pts[i-1]; t = (y0-ymax)/(y0-y); cur.append((w0+(w-w0)*t, ymax))
            cur.append((w, y))
        else:
            if cur:
                w0, y0 = pts[i-1]; t = (ymax-y0)/(y-y0); cur.append((w0+(w-w0)*t, ymax))
                segs.append(cur); cur = []
    if cur: segs.append(cur)
    return segs
def fmt(seg):
    return ' '.join('(%.3f,%.4f)' % p for p in seg)
ws2 = np.concatenate([np.linspace(6, 8.6, 14), np.linspace(8.65, 11.6, 237), np.linspace(11.7, 14, 12)])
for name, fun in [('NONE', lambda w: x1amp(w, 0, 0)), ('TUNED', lambda w: x1amp(w, k2u, 0.0)), ('OPT', lambda w: x1amp(w, k2o, c2o))]:
    for j, sg in enumerate(segments(fun, ws2, 0.4)):
        print('%%SEG %s %d' % (name, j)); print(fmt(sg))
# FRF：静たわみ（K^-1 の 3,3 成分＝0.03）に対する倍率の log10
static = np.linalg.inv(K3)[2, 2]
print('%% static', static)
fs2 = np.linspace(0.2, 3.4, 321)
print('%%SEG FRF 0'); print(' '.join('(%.3f,%.4f)' % (f, np.log10(frf(2*pi*f)/static)) for f in fs2))
for i in range(3):
    ff = np.linspace(wi[i]/2/pi-0.05, wi[i]/2/pi+0.05, 2001)
    vals = [np.log10(frf(2*pi*f)/static) for f in ff]
    print('%% 山 %d f=%.3f 高さ log10=%.3f 倍率=%.1f' % (i+1, ff[int(np.argmax(vals))], max(vals), 10**max(vals)))
