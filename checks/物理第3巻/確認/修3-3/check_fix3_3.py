# 修3-3（波-5・波-6）の直しの検算。確認 P3 の指摘（P3-1・P3-10・P3-22・P3-23・P3-24）と、変えた数を確かめる。
import math

print('== P3-1 図6：y=0.02 sin(10πt−5πx) の媒質の動く向き（t=0）')
def y(x, t): return 0.02*math.sin(10*math.pi*t - 5*math.pi*x)
def v(x, t): return 0.02*10*math.pi*math.cos(10*math.pi*t - 5*math.pi*x)
for x in (0.2, 0.4):
    dt = 0.005
    print(f'x={x}: y(0)={y(x,0):+.4f}  dy/dt(0)={v(x,0):+.4f} m/s  y(0.005 s)={y(x,dt):+.5f}  →',
          '上へ' if v(x, 0) > 0 else '下へ')
print('図の破線は t=0.02 s：', [f'{x}:{y(x,0.02):+.5f}' for x in (0.2, 0.4)])

print('\n== P3-10 刻みの上限（X-7：上限は切り捨て）')
E, rho = 205e9, 7850
S, a = 1e-4, 0.005
m = rho*S*a; ks = E*S/a
w = math.sqrt(ks/m); c0 = a*w; wmax = 2*w
print(f'例題11：m={m:.4e} kg  k_s={ks:.3e} N/m  sqrt(k_s/m)={w:.4e}  c0={c0:.1f} m/s  ω_max={wmax:.4e}')
print(f'  Δt<2/ω_max={2/wmax:.4e} s（a/c0={a/c0:.4e}、2/2.044e6={2/2.044e6:.4e}）→ 切り捨て 9.7×10^-7、振動数 ω_max/2π={wmax/2/math.pi/1e3:.1f} kHz')
ca = math.sqrt(69e9/2700)
print(f'アルミニウム合金 c={ca:.1f} m/s')
print(f'じぶんでとこう11：0.001/c={0.001/ca:.4e} s → 切り捨て 1.9×10^-7')
dt3 = 0.002/ca
print(f'章末11：0.002/c={dt3:.4e} s → 切り捨て 3.9×10^-7。回数 0.010/Δt上限={0.010/dt3:.0f}、0.010/3.9e-7={0.010/3.9e-7:.0f}')

print('\n== P3-23 章末 基本6（差しかえ：c=fλ だけで解く）')
f1, l1 = 2.0, 1.5
c = f1*l1
print(f'c={c} m/s、f=3.0 Hz の波長 {c/3.0:.2f} m')

print('\n== P3-22 表7：列の重さ Nm と、弦（線密度 m/a・長さ (N+1)a）の重さ (N+1)m。比は変わらない')
for N in (5, 20):
    # 列：ω_n=2√(ks/m) sin(nπ/(2(N+1)))、弦：c=a√(ks/m)、L=(N+1)a、ω_n=nπc/L
    r = lambda n: 2*math.sin(n*math.pi/(2*(N+1))) / (n*math.pi/(N+1))
    print(f'N={N}: 比 n=1 {r(1):.3f}  n=2 {r(2):.3f}  n=N {r(N):.3f}')

print('\n== P3-24 波-6 例題を3けたで（X-7）')
print(f"例題1：L'=650×2^(-1/12)={650*2**(-1/12):.2f} mm、ナットから {650-650*2**(-1/12):.2f} mm、振動数 {110*2**(1/12):.2f} Hz")
print(f'例題2：{343/1.0:.1f}、{343/2.0:.2f}、{3*343/2.0:.2f} Hz')
print(f'例題4：λ=0.78、c={440*0.78:.1f}、Δ={0.78/4-0.18:.4f}')
print(f"例題5：f1={math.sqrt(129/0.0063)/1.3:.2f} Hz、F'={129*2**(1/6):.2f} N")
h = 5
print(f'例題7：b1={8*h/math.pi**2:.3f}、b3={8*h/math.pi**2/9:.3f}、b5={8*h/math.pi**2/25:.3f} mm')
c9 = math.sqrt(2000/0.25)
print(f'例題9：c={c9:.2f}、f01={2.405*c9/(2*math.pi*0.25):.1f}、f11={3.832*c9/(2*math.pi*0.25):.1f} Hz')
H = 0.006
k12 = math.sqrt(E/rho)*H/math.sqrt(12)
print(f'例題12：√(EI/ρS)={k12:.3f}、f1={4.7300**2/(2*math.pi*0.2**2)*k12:.1f} Hz、f2/f1={(7.8532/4.7300)**2:.3f}、f2={7.8532**2/(2*math.pi*0.2**2)*k12:.0f} Hz')

print('\n== 波-5 例題9・13（3けたで書く）')
print(f'例題9：水 {math.sqrt(2.2e9/998):.1f}、空気 {math.sqrt(101325/1.2):.1f}・{math.sqrt(1.4*101325/1.2):.1f} m/s')
s2 = 1.21
y10 = 1 + s2/2*(0.5-2+0.5); y8 = 0 + s2/2*0.5
y210 = 2*y10 - 1 + s2*(0.5-2*y10+0.5)
print(f'例題13：y1_10={y10:.4f}、y1_8={y8:.4f}、y2_10={y210:.4f}')
