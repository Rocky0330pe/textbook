# 波-3（tex/p3-03.tex）の数値の検算。python3 checks/物理第3巻/波-3/calc_p3_03.py
# 注（第25回の確認のあと）：TMD の c2 は 0.127 に直した。今の値は checks/物理第3巻/確認/p2_1_tmd.py を見る。
import numpy as np
from math import sqrt, pi, sin, cos, atan2

def eig_MK(M, K):
    """K v = w^2 M v を解く（M^-1 K の固有値）。小さい順に w と、1つめの成分を1にしたモード"""
    M = np.array(M, float); K = np.array(K, float)
    lam, V = np.linalg.eig(np.linalg.inv(M) @ K)
    idx = np.argsort(lam.real)
    lam = lam.real[idx]; V = V.real[:, idx]
    V = V / V[0, :]
    return np.sqrt(lam), V

def p(*a):
    print(*a)

p('==== ① ② ③ 6-14 の台車 m=1, k=100, k_c=10')
m, k, kc = 1.0, 100.0, 10.0
w1, w2 = sqrt(k/m), sqrt((k+2*kc)/m)
p('w1, w2 =', w1, round(w2, 4), ' f =', round(w1/2/pi, 3), round(w2/2/pi, 3))
p('うなりの周期 2pi/(w2-w1) =', round(2*pi/(w2-w1), 3), ' 移りきる時間 pi/(w2-w1) =', round(pi/(w2-w1), 3))
p('ふつうの周期 2pi/((w1+w2)/2) =', round(2*pi/((w1+w2)/2), 4))
# 2倍の図：k_c を 5, 10, 20, 40
for kk in [5, 10, 20, 40]:
    ww2 = sqrt(k+2*kk)
    p('  k_c=%d: w2=%.3f うなりの周期 %.2f s' % (kk, ww2, 2*pi/(ww2-w1)))

p('==== ③ 表計算（速度を先に進めるオイラー法）dt=0.01')
dt = 0.01
x1, v1, x2, v2 = 0.1, 0.0, 0.0, 0.0
rows = []
t = 0.0
hist = []
for n in range(0, 1001):
    if n <= 3 or n in (329, 330, 658, 659):
        rows.append((n, round(t, 2), round(x1, 5), round(v1, 4), round(x2, 5), round(v2, 4)))
    hist.append((t, x1, x2))
    a1 = (-k*x1 + kc*(x2-x1))/m
    a2 = (-k*x2 - kc*(x2-x1))/m
    v1 += a1*dt; v2 += a2*dt
    x1 += v1*dt; x2 += v2*dt
    t += dt
for r in rows:
    p('  row', r)
# 3.3 s 付近の台車1のゆれの大きさ（つつみ）
def envelope(hist, idx, t0, t1):
    return max(abs(h[idx]) for h in hist if t0 <= h[0] <= t1)
p('  3.0〜3.6 s の |x1| の最大', round(envelope(hist, 1, 3.0, 3.6), 4), ' |x2| の最大', round(envelope(hist, 2, 3.0, 3.6), 4))
p('  6.3〜6.9 s の |x1| の最大', round(envelope(hist, 1, 6.3, 6.9), 4))
# 厳密な答えとくらべる
for tt in [0.01, 0.02, 0.03, 3.29, 6.58]:
    e1 = 0.05*(cos(w1*tt)+cos(w2*tt)); e2 = 0.05*(cos(w1*tt)-cos(w2*tt))
    p('  厳密 t=%.2f x1=%.5f x2=%.5f' % (tt, e1, e2))
# 同じ向き・反対向きにずらす
p('  同じ向き 0.1,0.1 → 周期', round(2*pi/w1, 3), ' 反対向き → 周期', round(2*pi/w2, 3))

p('==== ③ 後半：重りのあるビル（表計算）')
m1, k1, c1 = 1.0, 100.0, 0.2
wn = sqrt(k1/m1); z1 = c1/(2*sqrt(k1*m1))
p('ビル wn=', wn, ' zeta=', z1, ' 静たわみ F0/k =', 1/k1, ' 共振の倍率 1/(2z)=', 1/(2*z1), ' 共振のゆれ', 1/(c1*wn))
mu = 0.05
m2 = mu*m1
def resp(w, m2, k2, c2):
    # ビルに F0=1 cos wt。複素振幅
    A = np.array([[k1+k2-m1*w*w+1j*w*(c1+c2), -(k2+1j*w*c2)],
                  [-(k2+1j*w*c2), k2-m2*w*w+1j*w*c2]])
    X = np.linalg.solve(A, np.array([1.0, 0.0]))
    return X
# 同調だけ（減衰なし）
k2u = m2*wn**2
f_opt = 1/(1+mu); z_opt = sqrt(3*mu/(8*(1+mu)**3))
wa = f_opt*wn
k2o = m2*wa**2; c2o = 2*z_opt*m2*wa
ws = np.linspace(6, 14, 8001)
none = [1/abs(k1-m1*w*w+1j*w*c1) for w in ws]
und = [abs(resp(w, m2, k2u, 0.0)[0]) for w in ws]
opt = [abs(resp(w, m2, k2o, c2o)[0]) for w in ws]
p('重りなし 最大 %.4f m（w=%.3f）' % (max(none), ws[int(np.argmax(none))]))
p('同調・減衰なし w=10 のビル %.6f m、重り %.4f m' % (abs(resp(10, m2, k2u, 0.0)[0]), abs(resp(10, m2, k2u, 0.0)[1])))
# 減衰なしの山の位置
from numpy import roots
r2 = np.roots([1, -(2+mu), 1]); p('同調・減衰なしの2つの山 w/wn =', np.sqrt(np.sort(r2)))
p('最適 f=%.4f zeta=%.4f  k2=%.4f c2=%.4f' % (f_opt, z_opt, k2o, c2o))
p('最適 最大 %.4f m（静たわみの %.2f 倍）、w=10 で %.4f m' % (max(opt), max(opt)/0.01, abs(resp(10, m2, k2o, c2o)[0])))
p('  デン・ハルトフの見積もり sqrt(1+2/mu)=', sqrt(1+2/mu))
p('  最適の重りのゆれ w=10:', abs(resp(10, m2, k2o, c2o)[1]))
# グラフの点（共振曲線の図）
for w in [6, 7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14]:
    p('  w=%.1f なし %.4f 同調 %.4f 最適 %.4f' % (w, 1/abs(k1-m1*w*w+1j*w*c1), abs(resp(w, m2, k2u, 0)[0]), abs(resp(w, m2, k2o, c2o)[0])))
# 表計算：時間で追う（ゆすり w=10、はじめ静止）。60 s 後のゆれの大きさ
def simulate(m2, k2, c2, w=10.0, T=60.0, dt=0.002):
    x1 = v1 = x2 = v2 = 0.0; t = 0.0
    amp = []
    while t < T:
        F = cos(w*t)
        a1 = (F - k1*x1 - c1*v1 + k2*(x2-x1) + c2*(v2-v1))/m1
        a2 = (-k2*(x2-x1) - c2*(v2-v1))/m2 if m2 > 0 else 0.0
        v1 += a1*dt; v2 += a2*dt
        x1 += v1*dt; x2 += v2*dt
        t += dt
        amp.append((t, x1, x2))
    return amp
for name, (mm, kk, cc) in {'なし': (0.0, 0.0, 0.0), '最適': (m2, k2o, c2o)}.items():
    h = simulate(mm, kk, cc)
    for t0 in [10, 20, 40, 60]:
        a = max(abs(x[1]) for x in h if t0-0.7 <= x[0] <= t0)
        p('  時間で追う %s t=%d s までの1周期のビルのゆれ %.4f' % (name, t0, a))
# 図用：つつみ（10 s ごと）
for name, (mm, kk, cc) in {'なし': (0.0, 0.0, 0.0), '最適': (m2, k2o, c2o)}.items():
    h = simulate(mm, kk, cc, T=80)
    env = []
    for t0 in range(2, 81, 2):
        a = max(abs(x[1]) for x in h if t0-0.63 <= x[0] <= t0)
        env.append((t0, round(a, 4)))
    p('  つつみ', name, env)

p('==== ④ 例題2・3 とじぶんでとこう')
p('じぶんで2：m=0.5, 両側 k=8 → w=sqrt(2k/m)=', sqrt(2*8/0.5))
p('じぶんで3：棒の先とまん中に m、l=1：w^2=6g/(5l)=', 6*9.8/5, ' w=', sqrt(6*9.8/5), ' T=', 2*pi/sqrt(6*9.8/5))
p('参考：糸のふりこ l=1 T=', 2*pi/sqrt(9.8))

p('==== 例題4 2重ふりこ l=1')
g = 9.8
for l in [1.0, 0.5]:
    M = [[2*l*l, l*l], [l*l, l*l]]; K = [[2*g*l, 0], [0, g*l]]
    w, V = eig_MK(M, K)
    p('  l=%.1f w=' % l, np.round(w, 3), ' T=', np.round(2*pi/w, 3), ' モード', np.round(V[1], 3))

p('==== 例題5 2層の建物')
w, V = eig_MK([[1, 0], [0, 1]], [[2, -1], [-1, 1]])
p('  w/sqrt(k/m)=', np.round(w, 4), ' モード', np.round(V[1], 4))
mm, kk = 1.0e4, 1.0e7
p('  m=1e4,k=1e7: sqrt(k/m)=', sqrt(kk/mm), ' w=', np.round(w*sqrt(kk/mm), 2), ' f=', np.round(w*sqrt(kk/mm)/2/pi, 2), ' T=', np.round(2*pi/(w*sqrt(kk/mm)), 3))
w, V = eig_MK([[1, 0], [0, 1]], [[3, -1], [-1, 1]])
p('  じぶんで5（1階 2k）w/sqrt(k/m)=', np.round(w, 4), ' モード', np.round(V[1], 4))

p('==== 例題6・12 M=diag(2,1), K=[[300,-100],[-100,100]]')
M = np.diag([2.0, 1.0]); K = np.array([[300.0, -100], [-100, 100]])
w, V = eig_MK(M, K)
p('  w=', np.round(w, 4), ' モード', V)
v1, v2 = V[:, 0], V[:, 1]
p('  v1^T M v2=', v1 @ M @ v2, ' v1.v2=', v1 @ v2, ' v1^T K v2=', v1 @ K @ v2)
for v in (v1, v2):
    Mt, Kt = v @ M @ v, v @ K @ v
    p('  モード質量 %.3f モードこわさ %.3f w^2=%.3f' % (Mt, Kt, Kt/Mt))
p('  M^-1 K =', np.linalg.inv(M) @ K)
M2 = np.diag([1.0, 2.0])
w, V = eig_MK(M2, K)
p('  じぶんで6 M=diag(1,2): w=', np.round(w, 3), ' モード', np.round(V[1], 4), ' lam=', np.round(w**2, 2))
u1, u2 = V[:, 0], V[:, 1]
p('  じぶんで12 直交 u1^T M u2=', round(u1 @ M2 @ u2, 6), ' （丸めた値で）', 1+2*round(V[1,0], 3)*round(V[1,1], 3))

p('==== 例題7 3層の建物 m=1,k=100')
K3 = 100*np.array([[2.0, -1, 0], [-1, 2, -1], [0, -1, 1]])
w, V = eig_MK(np.eye(3), K3)
p('  w=', np.round(w, 3), ' f=', np.round(w/2/pi, 3))
p('  モード（1階を1）', np.round(V, 3))
p('  モード（いちばん大きい成分を1）', np.round(V/np.abs(V).max(axis=0), 3))
lam, VV = np.linalg.eigh(K3)
p('  np.linalg.eigh の出力 lam=', lam)
p('  sqrt=', np.sqrt(lam))
K3b = 100*np.array([[2.0, -1, 0], [-1, 2, -1], [0, -1, 2]])
lam, VV = np.linalg.eigh(K3b)
p('  じぶんで7（両側に壁）lam=', np.round(lam, 2), ' w=', np.round(np.sqrt(lam), 3), ' 2-√2..', (2-sqrt(2))*100)

p('==== 例題8・9 動吸振器')
for mu_ in [0.05, 0.02, 0.10]:
    r2 = np.sort(np.roots([1, -(2+mu_), 1]).real)
    p('  mu=%.2f 同調・減衰なしの2つ r=' % mu_, np.round(np.sqrt(r2), 4))
for mu_ in [0.05, 0.02, 0.03]:
    f = 1/(1+mu_); z = sqrt(3*mu_/(8*(1+mu_)**3))
    p('  mu=%.2f f_opt=%.4f zeta_opt=%.4f 山の高さ sqrt(1+2/mu)=%.2f' % (mu_, f, z, sqrt(1+2/mu_)))
# 例題9：周期 6.0 s のビル → ふりこの長さ
for T_b, mu_ in [(6.0, 0.05), (5.0, 0.02)]:
    f = 1/(1+mu_); Ta = T_b/f; l = g*(Ta/(2*pi))**2
    p('  T_b=%.1f mu=%.2f: Ta=%.3f s, l=%.3f m' % (T_b, mu_, Ta, l))
# 例題8：m=1,k=100 の値
p('  例題8 wn=10 → ', np.round(10*np.sqrt(np.sort(np.roots([1, -2.05, 1]).real)), 3))

p('==== 例題10 ロボットの腕（1リンク）')
m1_, l1, mL = 1.0, 0.30, 0.50
I1 = m1_*l1**2/3
J = I1 + mL*l1**2
G = (m1_/2 + mL)*g*l1
p('  I1=%.4f mL l^2=%.4f J=%.4f  重力の係数=%.4f' % (I1, mL*l1**2, J, G))
p('  水平で止める τ=%.3f、水平から 10 rad/s^2 τ=%.3f、真下から 10 rad/s^2 τ=%.3f' % (G, J*10+G, J*10))
m1_, l1, mL = 0.8, 0.25, 0.30
I1 = m1_*l1**2/3; J = I1 + mL*l1**2; G = (m1_/2 + mL)*g*l1
p('  じぶんで10 J=%.5f G=%.4f τ水平=%.3f τ(8 rad/s^2)=%.3f' % (J, G, G, G+8*J))
# 小さなふれの周期（ぶら下がり）
p('  例題10 のぶら下がりの小さなゆれ w=', sqrt((0.5+0.5)*g*0.30/(0.03+0.045)), ' T=', 2*pi/sqrt((0.5+0.5)*g*0.30/(0.03+0.045)))

p('==== 例題11 片方だけ引く')
p('  はじめて台車1が止まる t=pi/(w2-w1)=', pi/(sqrt(120)-10))
p('  じぶんで11 x1=0.1,x2=0.05: q1=0.075 q2=0.025 → 台車1のつつみ 0.1〜0.05')

p('==== ⑨ クレーン（台車＋つり荷）')
for l, r in [(20.0, 0.0), (20.0, 1.0), (20.0, 0.5), (10.0, 2.0)]:
    w = sqrt(g/l*(1+r))
    p('  l=%.0f m/M=%.1f w=%.4f T=%.3f' % (l, r, w, 2*pi/w))

p('==== 章末問題')
p('基本1 k_c=5: w2=', sqrt(110), ' うなりの周期', 2*pi/(sqrt(110)-10))
p('基本2 転がる円柱 m=2,k=300: w=sqrt(2k/3m)=', sqrt(2*300/(3*2)), ' T=', 2*pi/10)
w, V = eig_MK([[1, 0], [0, 1]], [[2, -1], [-1, 1]])
p('基本3 2層 m=2e4,k=3.2e7: sqrt(k/m)=', sqrt(3.2e7/2e4), ' w=', np.round(w*40, 2), ' f=', np.round(w*40/2/pi, 2))
r2 = np.sort(np.roots([1, -2.1, 1]).real); p('基本4 mu=0.10:', np.round(np.sqrt(r2), 3), ' wn=8 →', np.round(8*np.sqrt(r2), 2))
p('基本5 mu=0.03 f=', 1/1.03, ' z=', sqrt(0.09/(8*1.03**3)))
# 基本6：モード質量
M = np.diag([3.0, 1.0]); K = np.array([[400.0, -100], [-100, 100]])
w, V = eig_MK(M, K)
p('基本6 M=diag(3,1) K=[[400,-100],[-100,100]]: w=', np.round(w, 4), ' V=', np.round(V, 4))
for v in V.T:
    p('   モード質量', v @ M @ v, ' こわさ', v @ K @ v, ' 比', (v @ K @ v)/(v @ M @ v))
p('   直交', V[:, 0] @ M @ V[:, 1])
# チャレンジ1：2重ふりこ（上 2m、下 m）
M = np.array([[3.0, 1.0], [1.0, 1.0]]); K = g*np.array([[3.0, 0], [0, 1.0]])
w, V = eig_MK(M, K)
p('チャレンジ1 上2m 下m l=1: w=', np.round(w, 3), ' モード', np.round(V[1], 3), ' T=', np.round(2*pi/w, 3))
# チャレンジ2：クレーン
for l, M_, m_ in [(20.0, 4000.0, 2000.0)]:
    w = sqrt(g/l*(1+m_/M_))
    p('チャレンジ2 l=20 M=4t m=2t: w=%.4f T=%.3f（台車を止めると T=%.3f）' % (w, 2*pi/w, 2*pi/sqrt(g/l)))
# チャレンジ3：3層 上の階が半分
K3 = 100*np.array([[2.0, -1, 0], [-1, 2, -1], [0, -1, 1]])
w, V = eig_MK(np.diag([1, 1, 0.5]), K3)
p('チャレンジ3 M=diag(1,1,0.5): w=', np.round(w, 3), ' モード', np.round(V, 3))
# チャレンジ4：レイリー商
v = np.array([1.0, 2.0, 3.0])
K3 = 100*np.array([[2.0, -1, 0], [-1, 2, -1], [0, -1, 1]])
R = v @ K3 @ v / (v @ v)
p('チャレンジ4 (1,2,3) のレイリー商 w^2=', R, ' w=', sqrt(R), ' 厳密 4.450')
v = np.array([1.0, 1.0, 1.0]); R = v @ K3 @ v / (v @ v)
p('   (1,1,1) w^2=', R, ' w=', sqrt(R))

p('==== ⑥ Python の囲み（本文のプログラムと同じ）')
m1, k1, c1 = 1.0, 100.0, 0.2
m2, k2, c2 = 0.05, 4.54, 0.121
for w in [9.0, 10.0, 11.0]:
    A = np.array([[k1+k2-m1*w**2+1j*w*(c1+c2), -(k2+1j*w*c2)],
                  [-(k2+1j*w*c2), k2-m2*w**2+1j*w*c2]])
    X = np.linalg.solve(A, [1.0, 0.0])
    print(w, round(abs(X[0]), 4), round(abs(X[1]), 4))
