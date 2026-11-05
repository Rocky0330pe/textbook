# 電-14 の数値の確かめ（本文の丸め：eps0=8.85e-12、mu0=4πe-7、c=3.00e8）
import math
eps0=8.85e-12; mu0=4*math.pi*1e-7; c=3.00e8
print("== ③ 例題1 円い極板 R=5cm, 1 A")
R=0.05; I=1.0
print("B(R)=",mu0*I/(2*math.pi*R)); print("B(2.5cm)=",mu0*I*(0.025/R)**2/(2*math.pi*0.025))
print("B(10cm)=",mu0*I/(2*math.pi*0.10))
print("jibun: I=0.5A R=4cm:",mu0*0.5/(2*math.pi*0.04), " r=2cm:",mu0*0.5*(0.02/0.04)**2/(2*math.pi*0.02))
print("== 例題2 平行板 10cm角 1mm, dV/dt=1000 V/s")
A=0.01; d=1e-3; C=eps0*A/d; print("C=",C," I=C dV/dt=",C*1000)
print("dE/dt=",1000/d," Id=eps0*A*dE/dt=",eps0*A*1000/d)
print("jibun: 20cm角 2mm 500V/s:", eps0*0.04/2e-3, eps0*0.04/2e-3*500)
print("== 例題3 海水 sigma=4.3, epsr=80")
for f in (50,1e6,1e9):
    print(f, "ratio=",2*math.pi*f*80*eps0/4.3, "1/ratio=",4.3/(2*math.pi*f*80*eps0))
print("jibun: 川の水 sigma=0.01 1MHz:",2*math.pi*1e6*80*eps0/0.01)
print("== 例題4 エネルギー密度")
print("uE(1e6 V/m)=",0.5*eps0*1e12," uB(1T)=",1/(2*mu0)," ratio=",(1/(2*mu0))/(0.5*eps0*1e12))
print("E for same as 1T:",math.sqrt(2*(1/(2*mu0))/eps0))
print("jibun: 3e6 V/m:",0.5*eps0*9e12," 0.5 T:",0.25/(2*mu0))
print("== 例題5 ヒーター線 100V 12A 長さ0.5m 半径0.5mm")
V=100; I=12; l=0.5; a=0.5e-3
E=V/l; H=I/(2*math.pi*a); S=E*H; Aside=2*math.pi*a*l
print("E=",E,"H=",H,"S=",S,"Aside=",Aside,"P=",S*Aside)
print("jibun 1.5V 0.3A l=0.1 a=0.1mm:", 1.5/0.1, 0.3/(2*math.pi*1e-4), 1.5/0.1*0.3/(2*math.pi*1e-4), 1.5*0.3)
print("== 例題6 同軸 a=0.45mm b=1.6mm, 10 V, 50 Ω")
a=0.45e-3; b=1.6e-3; V=10; Z=50; I=V/Z; L=math.log(b/a)
print("ln(b/a)=",L,"I=",I,"P=",V*I)
for r in (a,1e-3,b):
    E=V/(r*L); H=I/(2*math.pi*r); print(" r=",r,"E=",E,"H=",H,"S=",E*H)
# 数値で積分
N=100000; s=0
for k in range(N):
    r=a+(b-a)*(k+0.5)/N; s+= V/(r*L)*I/(2*math.pi*r)*2*math.pi*r*(b-a)/N
print("integral=",s)
print("Z0=60/sqrt(2.3)*ln=",60/math.sqrt(2.3)*L, " exact:", math.sqrt(mu0/(eps0*2.3))/(2*math.pi)*L)
print("jibun: 5 V, 75 Ω, a=0.5mm b=2.0mm?", )
a2=0.5e-3;b2=2.0e-3; L2=math.log(b2/a2); V2=5; I2=5/75
print(" P=",V2*I2," S(1mm)=",V2/(1e-3*L2)*I2/(2*math.pi*1e-3))
print("== 例題7 コンデンサーに入るエネルギー R=5cm d=1mm V=100 I=1")
R=0.05; d=1e-3; V=100; I=1
C=eps0*math.pi*R**2/d; E=V/d; H=I/(2*math.pi*R); S=E*H; side=2*math.pi*R*d
print("C=",C,"E=",E,"H=",H,"S=",S,"side=",side,"P=",S*side,"VI=",V*I)
print("dV/dt=",I/C)
print("jibun V=200 I=0.5:", 200/d*0.5/(2*math.pi*R)*side)
print("== 例題8 動く棒 v=2 B=0.1 l=0.5")
print("E'=",2*0.1," V=",2*0.1*0.5)
print("jibun: v=5, B=0.2, l=0.3:",5*0.2,5*0.2*0.3)
print("== 例題9 時間で変わらない: 1nC 0.1m, 10A 5cm")
print("E=",8.99e9*1e-9/0.01," B=",mu0*10/(2*math.pi*0.05))
print("jibun 2nC 0.2 m:",8.99e9*2e-9/0.04," 20A 10cm:",mu0*20/(2*math.pi*0.1))
print("== 例題10 水の中の点電荷 1 nC 0.1m epsr=80")
D=1e-9/(4*math.pi*0.01); print("D=",D,"E=",D/(80*eps0),"vacuum E=",D/eps0)
print("jibun: 油 epsr 2.3:",D/(2.3*eps0))
print("== 例題11 B(r) profile R=5cm I=1A")
for r in (0.01,0.02,0.03,0.04,0.05,0.06,0.08,0.10):
    B = mu0*I*r/(2*math.pi*R**2) if r<=R else mu0*I/(2*math.pi*r)
    print(" r=",r,"B=",B)
print("jibun: wire I=2A loop r=3cm:", mu0*2/(2*math.pi*0.03))
print("== 例題12 FDTD dx=1cm")
dx=0.01; print("dt max=",dx/c, " 100 steps distance=",100*dx)
print("jibun dx=2mm:",2e-3/c," 300 steps:",300*2e-3)
print("eta0=",math.sqrt(mu0/eps0))
