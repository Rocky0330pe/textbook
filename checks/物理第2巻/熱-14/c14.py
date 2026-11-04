# 熱-14 温度の正体：気体分子運動論 の数値の検算（組 熱W7）
from math import sqrt, pi, exp, erf, erfc, log
kB = 1.380649e-23; NA = 6.02214076e23; R = kB * NA
p0 = 101325.0
def p(*a): print(*a)
def vrms(M, T): return sqrt(3 * R * T / M)
def vbar(M, T): return sqrt(8 * R * T / (pi * M))
def vp(M, T): return sqrt(2 * R * T / M)
MN2, MO2, MH2, MHe, MAr, Mair = 0.028014, 0.031998, 0.002016, 0.0040026, 0.039948, 0.028965
p('R =', R)
p('=== 例1 N2 20℃', vrms(MN2, 293.15), vbar(MN2, 293.15), vp(MN2, 293.15))
p('比 vp:vbar:vrms', 1, sqrt(4 / pi), sqrt(1.5))
p('じぶん O2 20℃', vrms(MO2, 293.15), vbar(MO2, 293.15), vp(MO2, 293.15))
p('音速 20℃ 343 / vbar', 343 / vbar(MN2, 293.15))
p('N2 300K', vrms(MN2, 300), vbar(MN2, 300), vp(MN2,300), ' 1000K', vrms(MN2,1000), vp(MN2,1000))
p('He 300K', vrms(MHe,300), vp(MHe,300))
p('=== 例2 数密度')
n = p0 / (kB * 293.15); p('n', n, ' 間かく nm', n**(-1/3) * 1e9)
p('じぶん 富士山頂 63 kPa 0℃(273.15)', 63000 / (kB * 273.15), (63000/(kB*273.15))**(-1/3)*1e9)
p('水 1 mol 18 cm3：間かく', (18e-6 / NA)**(1/3) * 1e9)
p('基本2 1 L 0℃ 1atm', 1e-3 * p0 / (kB * 273.15))
p('=== 例3 He 1 mol 300 K', 1.5 * R * 300, ' じぶん Ar 2 mol 400 K', 1.5 * 2 * R * 400)
p('基本3 Ne 0.5 mol 400 K', 1.5*0.5*R*400)
p('He 1 mol 10 K 定積で', 1.5*R*10)
p('=== 例4 比熱', 1.5 * R, 2.5 * R, 3 * R, 3.5*R, ' γ', 5/3, 7/5)
for name, M in [('Fe', 0.055845), ('Cu', 0.063546), ('Al', 0.026982), ('Pb', 0.2072), ('Ag',0.10787)]:
    p(name, 3 * R / M)
p('=== 例5 H2 1000K', vrms(MH2, 1000), ' He 1000K', vrms(MHe, 1000), ' 基本1 Ar 300K', vrms(MAr, 300))
p('N2 1000 K', vrms(MN2,1000))
p('=== 例6 平均自由行程')
d = 0.37e-9
def lam(T, pp, d=d): return kB * T / (sqrt(2) * pi * d**2 * pp)
L = lam(300, p0); p('λ 300K 1atm', L, ' 回数', vbar(Mair, 300) / L, ' vbar air 300', vbar(Mair,300))
p('じぶん 0.10 atm', lam(300, 0.1*p0))
p('例7 1 Pa', lam(300, 1.0), ' じぶん 1e-4 Pa', lam(300, 1e-4), ' 基本5 0.01 Pa', lam(300, 0.01))
for pp in [p0, 1e3, 1, 1e-3, 1e-6]:
    p('表 p=%g λ=%.3g m' % (pp, lam(300, pp)))
p('=== 例8 粘度')
rho = p0 * Mair / (R * 300)
mu = rho * vbar(Mair, 300) * L / 3
p('ρ', rho, ' μ', mu)
m = Mair / NA
p('μ = m vbar /(3√2 π d^2) =', m * vbar(Mair, 300) / (3 * sqrt(2) * pi * d**2))
p('=== 例9 熱伝導率 cv=718', rho * 718 * vbar(Mair, 300) * L / 3, ' 実際 0.0264/(μ cv) 比', 0.026384/(1.8537e-5*718))
p('=== 例10 拡散', vbar(Mair, 300) * L / 3, ' 1 m: t=x^2/(2D) h', 1 / (2 * vbar(Mair, 300) * L / 3) / 3600)
D = vbar(Mair, 300) * L / 3
p('じぶん 10 cm: t s', 0.01 / (2 * D), ' min', 0.01/(2*D)/60)
p('=== 例11 UF6')
M235 = 235.0439 + 6 * 18.9984; M238 = 238.0508 + 6 * 18.9984
p(M235, M238, sqrt(M238 / M235))
p('段の数の目安：3%まで 0.72%→3% ln(3/0.72... ) 分離係数の積', log((0.03/0.97)/(0.0072/0.9928))/log(sqrt(M238/M235)))
p('じぶん H2/O2', sqrt(MO2 / MH2))
p('=== 例12 v>2vp')
def frac(x): return erfc(x) + 2 * x / sqrt(pi) * exp(-x * x)
p('x=2', frac(2), ' x=1', frac(1), ' erfc(2)', erfc(2), ' 2x/√π e^-x^2', 4/sqrt(pi)*exp(-4))
x = 1000 / vp(MN2, 293.15); p('チャレンジ 1000 m/s N2 20℃: x', x, frac(x), erfc(x), 2*x/sqrt(pi)*exp(-x*x))
for xx in [0.5, 1.0, 1.5, 2.0, 2.4, 2.5, 3.0]:
    p('erf(%.1f)=%.5f' % (xx, erf(xx)))
p('=== 積分 I_n a=1', sqrt(pi)/2, 0.5, sqrt(pi)/4, 0.5, 3*sqrt(pi)/8)
# 数値で
h=1e-4; xs=[ (i+0.5)*h for i in range(int(8/h))]
for nn in range(5):
    p('I_%d 数値' % nn, sum(x**nn*exp(-x*x) for x in xs)*h)
p('erf(1) 細い長方形 10 本：', 2/sqrt(pi)*sum(exp(-((i+0.5)*0.1)**2) for i in range(10))*0.1)
p('=== ⑦ ブラウン運動：直径 1 μm 水 20℃ μ=1.0e-3')
Db = kB * 293.15 / (6 * pi * 1.0e-3 * 0.5e-6); p('D', Db, ' 1s rms x', sqrt(2 * Db * 1))
Db2 = kB * 293.15 / (6 * pi * 1.0e-3 * 1.0e-6); p('チャレンジ 直径2 μm D', Db2, ' 10 μm に t', (10e-6)**2 / (2 * Db2))
p('=== チャレンジ7 分子の直径を粘度から')
vb = vbar(Mair, 293.15)
dd = sqrt(m * vb / (3 * sqrt(2) * pi * 1.82e-5)); p('20℃ μ=1.82e-5: vbar', vb, ' d', dd)
vb3 = vbar(Mair, 300)
p('300K μ=1.85e-5: d', sqrt(m * vb3 / (3 * sqrt(2) * pi * 1.85e-5)))
p('=== 2倍：粘度 T 2倍 √2', sqrt(2))
p('=== 大気の脱出の目安：v_esc/vrms', 11200/ vrms(MH2,1000), 11200/vrms(MN2,1000))
p('=== 分布のグラフの山の高さ（N2 300K, 1000K, He 300K） F(vp)=4/√π / vp * e^-1')
for M,T in [(MN2,300),(MN2,1000),(MHe,300)]:
    v=vp(M,T); p(M,T,v, 4/sqrt(pi)/v*exp(-1)*1000, '(1/(km/s))')
