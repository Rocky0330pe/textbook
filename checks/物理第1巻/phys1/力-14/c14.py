# 力-14 の数値（組 P1-8）。g=9.8、水 20℃: rho=998.2(→計算は 1000 も併記), mu=1.002e-3, nu=1.004e-6
import math
g = 9.8
rho_w = 998.2; mu_w = 1.002e-3; nu_w = 1.004e-6
rho_a = 1.204; mu_a = 1.81e-5; nu_a = 15.0e-6
def blasius(Re): return 0.3164 / Re**0.25
def colebrook(Re, eps_d, lam0=0.02, n=30, verbose=False):
    lam = lam0
    for i in range(n):
        lam_new = (-2*math.log10(eps_d/3.7 + 2.51/(Re*math.sqrt(lam))))**-2
        if verbose: print('  iter', i+1, round(lam_new, 5))
        lam = lam_new
    return lam
print('=== やってみよう・はてな：ホース')
d = 0.015; A = math.pi*d**2/4; p0 = 150e3
# 蛇口のζ（ホースの速さ基準）を 30 とおいてモデルで「はかった値」を作る
def hose(L, zf, p0=p0, d=d):
    A = math.pi*d**2/4
    v = 2.0
    for i in range(50):
        Re = v*d/nu_w; lam = blasius(Re)
        K = zf + lam*L/d + 1
        v = math.sqrt(2*p0/rho_w/K)
    return v, lam, Re, v*A
for L in (2, 20):
    v, lam, Re, Q = hose(L, 30)
    print(L, 'm: v=%.3f lam=%.4f Re=%.0f Q=%.4f L/s  10L: %.1f s  x(1m)=%.2f' % (v, lam, Re, Q*1000, 10e-3/Q, v*math.sqrt(2*1/g)))
print('=== 例題12 ホース: 2 m で 19 s から蛇口のζを逆算し、20 m を予想')
Q2 = 10e-3/19; v2 = Q2/A; Re2 = v2*d/nu_w; lam2 = blasius(Re2)
print('v2=%.3f Re=%.0f lam=%.4f lamL/d=%.3f' % (v2, Re2, lam2, lam2*2/d))
Ktot = 2*p0/rho_w/v2**2; zf = Ktot - 1 - lam2*2/d
print('Ktot=%.2f zf=%.2f' % (Ktot, zf))
# 9.8 で書く式: p0/(rho g) = (1+zf+lamL/d) v^2/2g
H0 = p0/(rho_w*g); print('H0=%.2f m' % H0)
v20, lam20, Re20, Q20 = hose(20, zf)
print('20m予想: v=%.3f lam=%.4f Re=%.0f Q=%.4f L/s 10L: %.1f s' % (v20, lam20, Re20, Q20*1000, 10e-3/Q20))
# 本文で手計算できる形: lam=0.022 固定でやる
for lamc in (0.022,):
    zf_c = 2*p0/rho_w/v2**2 - 1 - lamc*2/d
    v20c = math.sqrt(2*p0/rho_w/(1+zf_c+lamc*20/d))
    print('lam固定 %.3f: zf=%.1f v20=%.3f Q=%.3f L/s t=%.1f s' % (lamc, zf_c, v20c, v20c*A*1000, 10e-3/(v20c*A)))

print('=== 例題1 家の水道管 20 mm, 30 m, 20 L/min')
d = 0.020; L = 30; Q = 20e-3/60; A = math.pi*d**2/4; v = Q/A
Re = v*d/nu_w; lam = blasius(Re); hf = lam*L/d*v**2/(2*g); dp = rho_w*g*hf
print('A=%.4e v=%.3f Re=%.0f lam=%.4f v^2/2g=%.4f L/d=%.0f hf=%.3f dp=%.1f kPa' % (A, v, Re, lam, v**2/(2*g), L/d, hf, dp/1e3))
print(' Re^0.25=%.3f' % Re**0.25)
print('=== 例題2 Re: 水 d=20mm v=1m/s, 油 VG46 d=6mm v=0.6, 空気 ダクト d=0.2 v=5, 水 毛細管？')
print('water', 1*0.02/nu_w, 'oil', 0.6*0.006/46e-6, 'air duct', 5*0.2/nu_a, 'honey', 0.01*0.01/(1e-2) )
print('=== 例題3 油圧の細い管 VG46')
nu_o = 46e-6; rho_o = 870; mu_o = rho_o*nu_o; d = 0.006; L = 2; Q = 1e-3/60
A = math.pi*d**2/4; v = Q/A; Re = v*d/nu_o
dp = 128*mu_o*L*Q/(math.pi*d**4); dp2 = 32*mu_o*L*v/d**2
lam = 64/Re; dp3 = lam*L/d*rho_o*v**2/2
print('mu=%.4f A=%.4e v=%.4f Re=%.1f dp=%.0f dp2=%.0f dp3(lam)=%.0f' % (mu_o, A, v, Re, dp, dp2, dp3))
print('=== 例題4 半径2倍 -> 16倍, 半径 0.8倍 -> ', 0.8**4, ' 0.9->', 0.9**4, 'to keep Q, dp x', 1/0.8**4)
print('=== 例題5 鋼管 d=100 mm v=2 eps=0.045 mm')
Re = 2*0.1/1.0e-6; eps_d = 0.045/100
lam = colebrook(Re, eps_d, 0.02, 6, True)
print('Re=%.0f eps/d=%.5f lam=%.4f' % (Re, eps_d, lam))
print(' blasius at 2e5 (範囲外):', blasius(Re))
print(' smooth colebrook:', colebrook(Re, 0, 0.02, 30))
hf = lam*100/0.1*2**2/(2*g); print(' hf per 100 m = %.3f m' % hf)
print('=== 例題6 タンク→タンク: 鋼管 d=0.1 L=100 v=2 lam=0.0185?, 入口0.5, エルボ 0.6 x4, 仕切弁0.15, 出口1.0')
lam = colebrook(Re, eps_d)
zsum = 0.5 + 4*0.6 + 0.15 + 1.0
hv = 2**2/(2*g)
print('zsum=%.2f hv=%.4f lamL/d=%.3f total K=%.3f H=%.3f' % (zsum, hv, lam*100/0.1, lam*1000+zsum, (lam*1000+zsum)*hv))
print(' with glove valve 6 instead of gate:', (lam*1000+zsum-0.15+6)*hv)
Qv = 2*math.pi*0.1**2/4; print(' Q=%.5f m3/s = %.1f L/s' % (Qv, Qv*1000))
print('=== 例題7 ポンプ所要動力 Q=0.01 H=30 eta=0.7', 1000*9.8*0.01*30/0.7, 998.2*9.8*0.01*30/0.7, ' water power', 1000*9.8*0.01*30)
print('=== 例題8 運転点 40-1e5Q^2 = 20+5e4Q^2')
Q = math.sqrt(20/1.5e5); print('Q=%.5f H=%.3f' % (Q, 40-1e5*Q**2))
print(' P(eta 0.7)=', 1000*9.8*Q*(40-1e5*Q**2)/0.7)
print('=== 例題9 NPSH')
pa = 101325; pv = 2339
print('(pa-pv)/rho g =', (pa-pv)/(998.2*9.8), ' with 1000:', (pa-pv)/(1000*9.8), 'NPSHa=', (pa-pv)/(998.2*9.8)-3-1)
print('=== 例題10 水撃', 1000*1200*2, ' with 998.2:', 998.2*1200*2, ' time 2L/a for L=600:', 2*600/1200)
print(' 0.5 m/s:', 1000*1200*0.5)
print('=== 例題11 ホースをつまむ p0=200 kPa K=30 area 1/9')
p0 = 200e3; K = 30; rho = 1000
v_open = math.sqrt(2*p0/rho/(1+K)); vh = math.sqrt(2*p0/rho/(81+K)); ve = 9*vh
print('open v=%.3f h=%.3f; pinched vh=%.3f ve=%.3f h=%.3f; Qratio=%.3f' % (v_open, v_open**2/(2*g), vh, ve, ve**2/(2*g), vh/v_open))
print(' no-loss (K=0): v=', math.sqrt(2*p0/rho), ' h=', 2*p0/rho/(2*g))
print('=== 例題13 油膜の板 m=2 kg A=0.1 m^2 h=0.5 mm mu=0.04 v0=1')
m = 2; Ap = 0.1; h = 0.5e-3; mu = 0.04; v0 = 1
b = mu*Ap/h; print('b=%.3f N s/m  x=%.4f m  tau at v0=%.1f Pa F=%.2f N' % (b, m*v0/b, mu*v0/h, mu*v0/h*Ap))
print('=== 2倍の図: 直径2倍 流量一定 乱流 lam一定: 1/32; blasius: ', 2**-4.75, 1/2**-4.75)
print('=== 管の流速と Re の臨界: 水 d=20mm で Re=2300 になる v =', 2300*nu_w/0.02)
print('=== Q-H 表 (te stage) 家の水道管 d=20mm L=30 m, Q=5..30 L/min')
for qlm in (5,10,15,20,25,30):
    Q = qlm/60000; v = Q/(math.pi*0.02**2/4); Re = v*0.02/nu_w; lam = blasius(Re); hf = lam*1500*v**2/(2*g)
    print(qlm, round(v,3), round(Re), round(lam,4), round(hf,3))
print('=== te: L を変える (d=20mm, 20L/min) / d を変える')
for L in (10,20,30,40,50):
    Q = 20/60000; v = Q/(math.pi*0.02**2/4); Re = v*0.02/nu_w; lam = blasius(Re)
    print('L', L, round(lam*L/0.02*v**2/(2*g),3))
for dd in (0.013, 0.016, 0.020, 0.025, 0.030):
    Q = 20/60000; v = Q/(math.pi*dd**2/4); Re = v*dd/nu_w; lam = blasius(Re)
    print('d', dd, round(v,3), round(Re), round(lam,4), round(lam*30/dd*v**2/(2*g),3))
