# 力-5 の数値の検算（例題・じぶんでとこう・章末問題・図・プログラム）
from math import *
import numpy as np
g = 9.8
def chk(name, got, want, tol=0.006):
    ok = abs(got - want) <= tol * max(1, abs(want))
    print(f"{'OK ' if ok else 'NG '} {name}: 計算 {got:.6g} / 本文 {want}")
# ① 蛇口 M
chk('蛇口 M', 20*0.06, 1.2)
# 平行な2力
chk('合力の作用線', 6*0.9/9, 0.6)
# はり 6 m
RB = (2*1+4*4)/6; chk('はり RB', RB, 3); chk('はり RA', 6-RB, 3)
# はしご
for mu, w in [(0.25,63),(0.5,45),(1,27)]: chk(f'はしご μ={mu}', degrees(atan(1/(2*mu))), w, 0.01)
# 正三角形トラス（節点法）
NAC = -5/sin(radians(60)); chk('NAC', NAC, -5.77); chk('NAB', -0.5*NAC, 2.89)
# 行列で
A = np.array([[0.5,0,1,1,0,0],[0.866,0,0,0,1,0],[0,-0.5,-1,0,0,0],[0,0.866,0,0,0,1],[-0.5,0.5,0,0,0,0],[-0.866,-0.866,0,0,0,0]])
b = np.array([0,0,0,0,0,10.]); print('行列の解', np.round(np.linalg.solve(A,b),2))
# ワーレントラス（本文のプログラムをそのまま）
def warren(W):
    r3 = 3**0.5
    P = {'A':(0,0),'B':(2,0),'C':(4,0),'D':(6,0),'E':(1,r3),'F':(3,r3),'G':(5,r3)}
    M = ['AB','BC','CD','EF','FG','AE','EB','BF','FC','CG','GD']
    R = [('A',0),('A',1),('D',1)]
    nd = list(P); K = np.zeros((2*len(nd), len(M)+len(R))); bb = np.zeros(2*len(nd))
    for j,(i,k) in enumerate(M):
        e = np.subtract(P[k],P[i]); e = e/np.hypot(e[0],e[1])
        a,c = 2*nd.index(i), 2*nd.index(k); K[a:a+2,j] += e; K[c:c+2,j] -= e
    for j,(i,d) in enumerate(R): K[2*nd.index(i)+d, len(M)+j] = 1
    for i,f in W.items():
        a = 2*nd.index(i); bb[a:a+2] = -np.array(f)
    x = np.linalg.solve(K,bb)
    return dict(zip(M+['RAx','RAy','RD'], np.round(x,2)))
print('ワーレン 12,6:', warren({'B':(0,-12),'C':(0,-6)}))
print('ワーレン 6,12:', warren({'B':(0,-6),'C':(0,-12)}))
print('ワーレン 9,9:', warren({'B':(0,-9),'C':(0,-9)}))
print('ワーレン 6,6:', warren({'B':(0,-6),'C':(0,-6)}))
print('ワーレン 12,12:', warren({'B':(0,-12),'C':(0,-12)}))
print('ワーレン 10,10:', warren({'B':(0,-10),'C':(0,-10)}))
# 例題
chk('例1', 30/0.2, 150); chk('じ1', 40/0.25, 160)
chk('例3 x', 30*2/60, 1.0); chk('例3 R', 90*g, 882); chk('じ3 R', 70*g, 686)
chk('例4 T', 200/(2*sin(radians(30))), 200); chk('2倍 15°', 200/(2*sin(radians(15))), 386, 0.003)
chk('じ4', 300/(2*sin(radians(45))), 212)
chk('例6(1)', degrees(atan(1/0.8)), 51.3); chk('例6(2)', degrees(atan((1-0.16)/0.8)), 46.4)
chk('じ6(2)', degrees(atan(0.75)), 37, 0.01)
chk('例7', 0.2/1.2, 0.17, 0.02)
chk('例8', 60*g/2, 294); chk('例8', 60*g/4, 147)
chk('例9', 30*g*0.05/0.3, 49)
chk('例10 xG', (400*20+300*5)/700, 13.6); chk('例10 yG', (400*5+300*25)/700, 13.6)
chk('例11 NAC', -5/sin(radians(45)), -7.07)
a = atan(2/3); chk('じ11 N', -6/sin(a), -10.8); chk('じ11 下', 6/tan(a), 9.0)
chk('例12 BC', 18/sqrt(3), 10.4)
chk('例15 m', 24*3.5/7, 12); chk('例15 倒す', 2*g*7, 137, 0.01); chk('例15 もどす', 24*g*3.5, 823, 0.01)
chk('R=20', 84/17, 4.9, 0.01); chk('じ15', 84/5, 16.8); chk('じ15 比', 823.2/(3*g*5), 5.6)
d = sqrt(0.25**2-0.2**2); chk('例16 d', d, 0.15); chk('例16(1)', 50*g*d/0.2, 368, 0.003); chk('例16(2)', 50*g*d/0.25, 294)
chk('例16 角', degrees(asin(0.15/0.25)), 37, 0.01)
d = sqrt(0.3**2-0.24**2); chk('じ16 (1)', 40*g*d/0.24, 294); chk('じ16 (2)', 40*g*d/0.3, 235)
# 章末
chk('問 はしご0.3', degrees(atan(1/0.6)), 59, 0.01)
chk('問 車輪', 30*g*0.3/0.4, 220.5)
chk('入試1', degrees(atan((1-0.09)/0.6)), 57, 0.01)
d = sqrt(0.2**2-0.16**2); chk('入試2 水平', 588*d/0.16, 441); chk('入試2 最小', 588*d/0.2, 353, 0.003)
# 工学：トラス橋
M = 50*60**2/8; chk('橋 M', M, 22500); chk('部材力', M/8, 2800, 0.01); chk('断面積 mm2', M/8*1e3/(245/2), 23000, 0.02)
print('参考：40 cm×6 cm =', 400*60, 'mm2')
# 回転するいすの図・単位の確かめ
