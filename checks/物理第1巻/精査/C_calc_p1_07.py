# 力-7 の数値の検算
from math import *
import numpy as np
g = 9.8
def chk(name, got, want, tol=0.006):
    ok = abs(got - want) <= tol * max(1, abs(want))
    print(f"{'OK ' if ok else 'NG '} {name}: 計算 {got:.6g} / 本文 {want}")
def fk(L1, L2, t1, t2):
    t1, t2 = radians(t1), radians(t2)
    return L1*cos(t1)+L2*cos(t1+t2), L1*sin(t1)+L2*sin(t1+t2)
def ik(L1, L2, x, y):
    d = hypot(x, y); oep = degrees(acos((L1**2+L2**2-d**2)/(2*L1*L2))); t2 = 180-oep
    b = degrees(acos((L1**2+d**2-L2**2)/(2*L1*d))); a = degrees(atan2(y, x))
    return d, (L1**2+L2**2-d**2)/(2*L1*L2), t2, a, b, (a-b, t2), (a+b, -t2)
# やってみよう
print('厚紙 fk', np.round(fk(15,12,30,45),2)); print('厚紙 ik', np.round(ik(15,12,20,10)[5:],1))
# ② 図
print('図 ik', [np.round(v,2) for v in ik(0.30,0.25,0.40,0.20)])
# ③ 表
for t1 in range(0, 91, 15): print('   表', t1, np.round(fk(0.30,0.25,t1,45),3))
print('   円の半径', hypot(*fk(0.30,0.25,0,45)), '開始角', degrees(atan2(fk(0.30,0.25,0,45)[1], fk(0.30,0.25,0,45)[0])))
# プログラム
for i in range(7):
    y = 0.05*i; r = ik(0.30,0.25,0.40,y); print('   prog', round(y,2), round(r[5][0],1), round(r[5][1],1))
# 自転車
chk('ω', 5/0.33, 15.15); chk('毎分', 5/0.33*60/(2*pi), 145, 0.01)
# 斜面
for nm,k in [('球',0.4),('円柱',0.5),('輪',1)]:
    a = 4.9/(1+k); t = sqrt(4/a); print(f'   {nm} a={a:.3f} t={t:.3f} v={a*t:.3f}')
chk('すべり k=0 t', sqrt(4/4.9), 0.90)
chk('μ≥ 2/7 tan30', 2/7*tan(radians(30)), 0.165)
for nm,k in [('球',0.4),('輪',1)]:
    a = 9.8*0.342/(1+k); print(f'   じ2 {nm} a={a:.3f} t={sqrt(6/a):.3f}')
# ボウリング
t = 16/(7*0.2*9.8); v = 8-1.96*t; s = 8*t-0.98*t**2; chk('t', t, 1.17); chk('v', v, 5.71); chk('s', s, 8.0); chk('割合', (32-0.7*v**2)/32, 2/7)
t = 12/(7*0.25*9.8); chk('じ3 t', t, 0.70); chk('じ3 s', 6*t-0.5*0.25*9.8*t**2, 3.6, 0.01)
# 糸巻き
I = 1e-4+0.1*0.05**2; al = 0.3*0.03/I; chk('α', al, 25.7); chk('a', 0.05*al, 1.3, 0.02)
f = 0.1*0.05*al - 0.3; chk('f', f, -0.17, 0.02); print('   必要な μ = |f|/(mg) =', abs(f)/(0.1*9.8))
chk('境の角', degrees(acos(0.4)), 66, 0.01)
I = 1.6e-4+0.2*0.04**2; al = 0.5*0.025/I; chk('じ4 a', 0.04*al, 1.0, 0.05)
# 例5
E = (0.30*cos(radians(30)), 0.30*sin(radians(30))); P = fk(0.30,0.25,30,45); print('   例5 E', np.round(E,4), 'P', np.round(P,4), '|OP|', round(hypot(*P),4))
print('   じ5', np.round((0.4*cos(radians(20)),0.4*sin(radians(20))),4), np.round(fk(0.4,0.3,20,50),4))
print('   じ6', [np.round(v,2) for v in ik(0.4,0.3,0.5,0.3)])
print('   チャ1', [np.round(v,2) for v in ik(0.3,0.25,0.3,0.3)])
# 例7 同次変換
def A(t, L):
    t = radians(t); return np.array([[cos(t),-sin(t),L*cos(t)],[sin(t),cos(t),L*sin(t)],[0,0,1]])
print('   例7', np.round(A(30,0.3)@A(45,0.25),4)[:,2]); print('   じ7', np.round(A(90,0.4)@A(-90,0.3),4)[:,2])
# 例8 ヤコビ
def J(L1,L2,t1,t2):
    t1,t2 = radians(t1),radians(t2); t12=t1+t2
    return np.array([[-L1*sin(t1)-L2*sin(t12), -L2*sin(t12)],[L1*cos(t1)+L2*cos(t12), L2*cos(t12)]])
j = J(0.3,0.25,30,45); v = j@[0.5,1.0]; print('   例8 J', np.round(j,4), 'v', np.round(v,4), np.round(np.linalg.norm(v),4), 'det', round(np.linalg.det(j),4))
j = J(0.4,0.3,20,50); v = j@[0.4,0.5]; print('   じ8 J', np.round(j,4), 'v', np.round(v,4), round(np.linalg.norm(v),4))
j = J(0.3,0.25,0,90); print('   チャ5', np.round(j@[1,0],3), round(np.linalg.norm(j@[1,0]),3))
# ピストン
r, l = 0.040, 0.14
th = np.radians(np.arange(0, 360, 0.1)); x = r*np.cos(th)+np.sqrt(l**2-r**2*np.sin(th)**2)
wv = 3000*2*pi/60; vx = -r*wv*np.sin(th)*(1+r*np.cos(th)/np.sqrt(l**2-r**2*np.sin(th)**2))
i = np.argmax(np.abs(vx)); print('   ピストン 最大の速さ', round(abs(vx[i]),2), 'の角', round(degrees(th[i]),1), ' 90°の x-l (mm)', round((sqrt(l**2-r**2)-l)*1e3,2))
chk('平均', 4*r*50, 8.0); chk('90°の x', sqrt(l**2-r**2), 0.134); chk('じ9', sqrt(0.12**2-0.035**2), 0.115)
# 4節リンク
a,b,c,d = 2,5,4,6
def psi(ph):
    A_ = np.array([a*cos(radians(ph)), a*sin(radians(ph))]); e = np.hypot(A_[0]-d, A_[1])
    dl = degrees(atan2(A_[1], A_[0]-d)) % 360; gm = degrees(acos((c**2+e**2-b**2)/(2*c*e))); return (dl-gm) % 360, e, dl, gm
print('   4節', [round(psi(p)[0],1) for p in range(0,360,30)])
ps = [psi(p/10)[0] for p in range(3600)]; print('   ψ の範囲', round(min(ps),2), round(max(ps),2))
print('   φ=90', [round(v,2) for v in psi(90)], ' φ=180', [round(v,2) for v in psi(180)], ' φ=0', [round(v,2) for v in psi(0)])
# 歯車・自転車
chk('例11 P', 0.5*3000*2*pi/60, 157, 0.01); chk('効率', 4.5*0.95**2, 4.1, 0.01)
w2 = 2*pi*44/16; chk('例12 v', 0.33*w2, 5.7, 0.01); chk('km/h', 0.33*w2*3.6, 21, 0.03); chk('22歯', 0.33*2*pi*2, 4.1, 0.02)
w2 = 80*2*pi/60*4; chk('じ12', 0.33*w2, 11, 0.01)
# 回転台・トラック
w = sqrt(0.4*9.8/0.2); chk('例13', w*60/(2*pi), 42, 0.01); chk('じ13', sqrt(49)*60/(2*pi), 67, 0.01)
chk('例14 倒', sqrt(9.8*1*50/1.5), 18.1); chk('例14 す', sqrt(0.7*9.8*50), 18.5); chk('じ14 倒', sqrt(9.8*0.75*50/0.55), 26, 0.01)
# コリオリ
om = 2*pi/86164; chk('ω地球', om, 7.29e-5, 0.002)
chk('例15', 2*7.29e-5*100*sin(radians(35)), 0.0084, 0.01); chk('じ15', 2*7.29e-5*50*sin(radians(45)), 0.0052, 0.01)
# 歳差
O = 2*9.8*0.2/(0.1*30); chk('例16 Ω', O, 1.3, 0.01); chk('T', 2*pi/O, 4.8, 0.01); chk('じ16', 1.5*9.8*0.15/2, 1.1, 0.01)
# 脱水
w = 800*2*pi/60; chk('脱水', 0.25*w**2, 1750, 0.003); chk('g倍', 0.25*w**2/9.8, 180, 0.01)
# フーコー
for nm, lat in [('パリ', 48.85), ('東京', 35.68)]: print('   フーコー', nm, round(86164/3600/sin(radians(lat)),1), 'h')
# 章末
chk('問2 t', sqrt(8/(9.8*0.259/1.4)), 2.1, 0.01); chk('問2 v', sqrt(2*9.8*4*0.259/1.4), 3.8, 0.01)
chk('バス倒', sqrt(9.8*40/1.2), 18, 0.01); chk('バスす', sqrt(0.6*9.8*40), 15, 0.03)
chk('入試3 倒', sqrt(9.8*0.05/(0.4*0.15)), 2.9, 0.02)
# 桁
chk('精度 角', 0.02e-3/0.5, 4e-5); chk('0.1°', 0.5*radians(0.1)*1e3, 0.9, 0.04)
