# 力-8 の数値（組 P1-5）。g=9.8、E 鋼205GPa、アルミ69、銅117、コンクリート23、木7（巻末の表）
from math import pi, sqrt
g=9.8
Es=205e3; Ea=69e3; Ec=23e3  # MPa
def A(d): return pi*d*d/4
print("== はじめ（①）ピアノ線 d0.5 L2m 2kg")
a=A(0.5); F=2*g; s=F/a; e=s/Es; print(a,F,s,e,e*2000)
print("== 例題1 鋼 d10 L1m 10kN")
a=A(10); s=10000/a; e=s/Es; print(a,s,e,e*1000)
print("   2倍の表：d,L")
for d in (10,20):
  for L in (1,2):
    print(d,L, 10000*L*1000/(Es*A(d)))
print("   じぶん1 アルミ d10 L2 5kN")
s=5000/A(10); e=s/Ea; print(s,e,e*2000)
print("== 例題2 最小二乗 (3-16 データ)")
eps=[0.0005,0.0010,0.0015,0.0020]; sig=[101,199,302,398]
P=sum(x*x for x in eps); Q=sum(x*y for x,y in zip(eps,sig)); print(P,Q,Q/P)
print("   じぶん2 アルミ")
eps=[0.001,0.002,0.003,0.004]; sig=[70,137,208,276]
P=sum(x*x for x in eps); Q=sum(x*y for x,y in zip(eps,sig)); print(P,Q,Q/P)
print("== 例題3 安全率 245/3, 20kN")
sa=245/3; Ar=20000/sa; d=sqrt(4*Ar/pi); print(sa,Ar,d)
print("   じぶん3 245/4, 10kN")
sa=245/4; Ar=10000/sa; d=sqrt(4*Ar/pi); print(sa,Ar,d)
al=1.2e-5
print("== 例題4 レール25m 30K, すきま")
print(al*25000*30, "mm ; (2) すきま5mm、ΔT=40")
free=al*25000*40; print(free, (free-5)/25000*Es)
print("   じぶん4: 鉄橋の桁? 50m, 40K ; (2) すきま 15mm, ΔT=50")
print(al*50000*40); free=al*50000*50; print(free,(free-15)/50000*Es)
print("== 例題5 ロングレール ΔT30 E205 α1.2e-5, 60kgレール 7750mm2")
s=Es*al*30; print(s, s*7750/1000,"kN")
print("   じぶん5 アルミ 両端固定 ΔT20 α2.3e-5")
print(Ea*2.3e-5*20)
print("== 例題6 ボルト d12 10kN 1面、2面")
print(10000/A(12), 10000/(2*A(12)))
print("   じぶん6 ピン d8 3kN")
print(3000/A(8), 3000/(2*A(8)))
print("== 例題7 パンチ t2 d10 300MPa")
print(pi*10*2, pi*10*2*300)
print("   じぶん7 t1 d20 250")
print(pi*20*1*250)
print("== 例題8 ポアソン：鋼棒 例題1 ε, ν0.3, d10 ; ゴム ε0.02 ν0.5 幅20mm")
e=10000/A(10)/Es; print(e, 10*0.3*e, e*(1-2*0.3))
print(0.02*0.5*20, (1.02)*(0.99)**2)
print("   じぶん8 アルミ d20 ε0.001 ν0.33")
print(20*0.33*0.001, 0.001*(1-0.66))
print("== 例題9 ばね k1=20 k2=30 N/m, m=0.30kg")
k1,k2=20,30; F=0.3*g
ks=1/(1/k1+1/k2); kp=k1+k2; print(F, F/ks, F/k1, F/k2, F/kp, ks, kp)
print("   (3) 軽い棒 l=0.50m 両はしを k1,k2 でつる 水平：a=k2 l/(k1+k2) from k1 side")
l=0.5; a=k2*l/(k1+k2); print(a, F/kp)
print("   じぶん9 k1=40,k2=60, m=0.48kg, l=0.40")
k1,k2=40,60; F=0.48*g; ks=1/(1/k1+1/k2); print(F,ks,F/ks, F/(k1+k2), k2*0.4/(k1+k2))
print("== 例題10 段付き棒 鋼 L0.6 d20 + アルミ L0.4 d20, 20kN")
a=A(20); d1=20000*600/(Es*a); d2=20000*400/(Ea*a); print(a, 20000/a, d1,d2,d1+d2)
k1=Es*a/600; k2=Ea*a/400; print(k1,k2, 1/(1/k1+1/k2), 20000/(1/(1/k1+1/k2)))
print("   じぶん10 鋼 L1.0 d10 + 銅 L0.5 d10, 5kN")
a=A(10); d1=5000*1000/(Es*a); d2=5000*500/(117e3*a); print(d1,d2,d1+d2)
print("== 例題11 RC柱 300x300, 4-D19(286.5mm2), 1000kN")
As=4*286.5; Ac=300*300-As; EA=Ec*Ac+Es*As; e=1e6/EA; print(As,Ac,EA,e, Ec*e, Es*e, Es*As/EA, As/90000)
print("   じぶん11 250x250 4本 As=4*198.6(D16) 600kN")
As=4*198.6; Ac=250*250-As; EA=Ec*Ac+Es*As; e=600e3/EA; print(As,Ac,e,Ec*e,Es*e, Es*As/EA)
print("== 例題12 自重ケーブル 1000m 鋼 ρ7850 ; 切れる長さ σB400")
rho=7850; E=205e9
print(rho*g*1000**2/(2*E), rho*g*1000/1e6, 400e6/(rho*g))
print("   表計算 10区切り")
n=10; L=1000; dx=L/n; tot=0
for i in range(n):
  x=(i+0.5)*dx  # 下からの？
  w=rho*g*(L-(i+0.5)*dx)  # 上から i 番目の区切りの下にある長さ
  tot+= w/E*dx
print(tot)
tot=0
for i in range(n):
  below=L-(i+1)*dx
  tot+= rho*g*below/E*dx
print("下の端で計算",tot)
print("   じぶん12 アルミ 500m, 耐力270 ρ2700")
print(2700*g*500**2/(2*69e9), 270e6/(2700*g))
print("== 例題13 穴 W200 t5 d10 F40kN")
print(40000/(200*5), 3*40000/(200*5), 40000/((200-10)*5))
print("   じぶん13 W120 t4 d6 F24kN")
print(24000/(120*4), 3*24000/(120*4))
print("== 原子のばね r0=0.25nm E=205GPa → k0=E r0")
print(205e9*0.25e-9)
print("== 入試1 k1=k2... (直列) ") 
