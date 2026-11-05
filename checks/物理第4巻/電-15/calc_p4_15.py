# 電-15 の数値の確かめ（本文の丸め：eps0=8.85e-12、mu0=4πe-7、c=3.00e8）
import math
from scipy.special import sici
eps0 = 8.85e-12; mu0 = 4*math.pi*1e-7; c = 3.00e8
eta0 = math.sqrt(mu0/eps0)
print("eta0=", eta0, " 1/sqrt(mu0 eps0)=", 1/math.sqrt(mu0*eps0))
print("CODATA eta0=", 1.25663706127e-6*299792458)
print("== ① 家族の表")
for name, f in [("3 THz", 3e12), ("可視380nm", c/380e-9), ("可視780nm", c/780e-9), ("1 mm", c/1e-3)]:
    print(name, f, c/f)
print("== ② 身の回り")
for name, f in [("IH 20.05k", 20.05e3), ("IH 100k", 100e3), ("AM 526.5k", 526.5e3), ("AM 1000k", 1e6),
                ("AM 1606.5k", 1606.5e3), ("IC 13.56M", 13.56e6), ("FM 76M", 76e6), ("FM 80M", 80e6),
                ("FM 95M", 95e6), ("TV 470M", 470e6), ("TV 710M", 710e6), ("WiFi 2.4G", 2.4e9),
                ("MW 2.45G", 2.45e9), ("WiFi 5G", 5e9)]:
    print(name, "lambda=", c/f)
print("== 例題1 2.45GHz:", c/2.45e9, " half:", c/2.45e9/2, " jibun 5GHz:", c/5e9)
print("== 例題2 FM80M AM1M WiFi2.4G:", c/80e6, c/1e6, c/2.4e9, " jibun IC 13.56M:", c/13.56e6, " TV 600M:", c/600e6)
print("== ④ E=cB: E0=1 V/m -> B0=", 1/c)
print("== 例題3 太陽 1361")
I = 1361; E0 = math.sqrt(2*I/(c*eps0)); print("E0=", E0, "B0=", E0/c)
# 地球の磁場は電-6 ⑫ の 4.6e-5 T にそろえる（まとめ役の決定 Z-6。整合の組）
print("地球の磁場 4.6e-5 T と B0 の比:", 4.6e-5/(E0/c), " ④の 1 V/m の B0 との比:", 4.6e-5/(1/c))
print("jibun レーザー 1mW, 1mm^2:", 1e-3/1e-6, math.sqrt(2*1e3/(c*eps0)), math.sqrt(2*1e3/(c*eps0))/c)
print("== 例題4 放射圧")
p_abs = I/c; p_ref = 2*I/c
print("p_abs=", p_abs, "p_ref=", p_ref, "F(200m2)=", p_ref*200, " area diag20:", 20**2/2)
print("a with 310 kg:", p_ref*200/310)
print("jibun 黒い板 1 m2:", p_abs*1, " 地球:", p_abs*math.pi*6.371e6**2)
print("== 例題5 平面波 E0=1 V/m")
print("H0=", 1/eta0, " I=", 0.5*1/eta0)
print("jibun E0=10 V/m: H0=", 10/eta0, " I=", 0.5*100/eta0)
print("== 例題6 ラーモア")
e = 1.60e-19; me = 9.11e-31; mp = 1.67e-27
E = 1e6; ae = e*E/me; ap = e*E/mp
P = lambda q, a: q*q*a*a/(6*math.pi*eps0*c**3)
print("ae=", ae, "ap=", ap, "Pe=", P(e, ae), "Pp=", P(e, ap), "ratio=", P(e, ae)/P(e, ap), (mp/me)**2)
print("jibun E=3e6: Pe=", P(e, e*3e6/me), " ratio to 1e6:", 9)
print("== 例題7 空の青", (700/450)**4, (700/550)**4, " jibun", (650/400)**4)
print("== 例題8 反射率")
for n in (1.5, 1.333, 2.42, 1.38):
    r = (1-n)/(1+n); print(n, "r=", r, "R=", r*r)
print("== 例題9 ブルースター")
for n in (1.5, 1.333, 2.42):
    print(n, math.degrees(math.atan(n)))
def fres(n, th):
    ti = math.radians(th); st = math.sin(ti)/n; ct = math.sqrt(1-st*st); ci = math.cos(ti)
    rs = (ci-n*ct)/(ci+n*ct); rp = (n*ci-ct)/(n*ci+ct); return rs*rs, rp*rp
for th in (0, 30, 45, 56.3, 60, 70, 80, 85, 89):
    print(th, fres(1.5, th))
print("== 例題10 水:", math.sqrt(80), math.sqrt(80.2), 1.333**2)
print("== 例題11 表皮深さ 銅 sigma=5.8e7")
sig = 5.8e7
d = lambda f, s, mur=1: math.sqrt(2/(2*math.pi*f*mur*mu0*s))
for f in (50, 60, 1e6, 2.45e9, 13.56e6, 100e6):
    print(f, d(f, sig))
print("海水 4.3 S/m: 50 Hz, 1 kHz, 10 kHz, 1 MHz:", d(50, 4.3), d(1e3, 4.3), d(1e4, 4.3), d(1e6, 4.3))
print("== 例題12 網の穴 d=1mm 厚さ1mm")
lam = c/2.45e9
for dh, t in ((1e-3, 1e-3), (2e-3, 1e-3), (1e-3, 0.5e-3), (3e-3, 1e-3)):
    lc = math.pi*dh/1.8412
    alpha = 2*math.pi/lc*math.sqrt(1-(lc/lam)**2)
    amp = math.exp(-alpha*t)
    print("d=", dh, "t=", t, "lambda_c=", lc, "alpha=", alpha, "amp=", amp, "power=", amp**2, "dB=", -20*math.log10(amp), "1/power=", 1/amp**2,
          " approx 2pi/lc*t=", 2*math.pi/lc*t)
print("== 例題13 アンテナ")
lam = c/2.4e9; print("lambda=", lam, "lambda/4=", lam/4, "lambda/2=", lam/2)
x = 2*math.pi; si, ci = sici(x); gamma = 0.5772156649
for et in (eta0, 376.730313):
    print("R_rad =", et/(4*math.pi)*(gamma+math.log(x)-ci))
print("P for 1A rms:", 73*1, " jibun 0.5 A rms:", 73*0.25, " FM 80MHz half:", c/80e6/2)
print("== 例題14 1 W 10 m")
S = 1/(4*math.pi*100); print("S=", S, "mW/cm2=", S*1e3/1e4, " limit 10 W/m2 ratio=", 10/S)
print("E rms at 10 W/m2=", math.sqrt(10*eta0), " H=", math.sqrt(10/eta0))
print("jibun 0.2 W at 1 m:", 0.2/(4*math.pi), " ratio:", 10/(0.2/(4*math.pi)))
print("distance 1W reaches 10 W/m2:", math.sqrt(1/(4*math.pi*10)))
print("== ∫sin^2 dΩ =", 8*math.pi/3)
print("== c CODATA:", 1/math.sqrt(1.25663706127e-6*8.8541878188e-12))
print("== 水・ガラスの中の光の速さ", c/1.333, c/1.5)
print("== ⑨ 透過 t=2/(1+n) n=1.5:", 2/2.5, " n^1 * t^2 =", 1.5*0.8**2)
print("== 例題6 補足: 電子 1e6 V/m 1 ns で得る運動エネルギーとくらべる")
v = ae*1e-9; print("v=", v, "KE=", 0.5*me*v*v, "radiated in 1ns=", P(e, ae)*1e-9)
