# 原-3 電子は波でもある：例題・じぶんでとこう・章末問題・表・グラフの数値（組 原W2）
# 定数は CODATA 2022（計画書 C-3）。本文の丸め（h=6.63e-34 など）でも計算して、けたが変わらないことを確かめる。
import math
h=6.62607015e-34; hbar=h/(2*math.pi); e=1.602176634e-19; c=299792458.0
me=9.1093837139e-31; mp=1.67262192595e-27; mn=1.67492750056e-27; kB=1.380649e-23
mec2=me*c*c/e  # eV
def lam_e(V, rel=False, m=me):
    E=e*V
    if rel:
        p=math.sqrt(2*m*E*(1+E/(2*m*c*c)))
    else:
        p=math.sqrt(2*m*E)
    return h/p
print('== 表：加速電圧と波長（非相対論・相対論）')
for V in [1,10,54,100,1e3,1e4,5e4,7.5e4,1e5,2e5,3e5]:
    print(f'V={V:>8g} V  λ={lam_e(V)*1e12:9.4f} pm  相対論 {lam_e(V,True)*1e12:9.4f} pm  1.226/√V nm={1.226/math.sqrt(V):.4f}')
print('1.226 の係数 h/sqrt(2 m e) nm:', h/math.sqrt(2*me*e)*1e9)
print('相対論の直し 100 kV: 1+eV/(2mc^2)=',1+1e5/(2*mec2),' 波長の比', lam_e(1e5,True)/lam_e(1e5))
print('mc^2 eV', mec2)
print('== 例題1 100 kV：', lam_e(1e5)*1e12, lam_e(1e5,True)*1e12, '550 nm との比', 550e-9/lam_e(1e5,True), 550e-9/lam_e(1e5))
print('   じぶんでとこう1 50 kV:', lam_e(5e4)*1e12, lam_e(5e4,True)*1e12, 550e-9/lam_e(5e4,True))
print('== 例題2 100 V：λ nm', lam_e(100)*1e9, ' 速さ', math.sqrt(2*e*100/me))
print('   本文の丸めで：', 6.63e-34/math.sqrt(2*9.11e-31*1.60e-19*100)*1e9)
print('   じぶんでとこう2（逆）λ=0.10 nm の電子の運動エネルギー eV', (h/0.10e-9)**2/(2*me)/e)
print('== 例題3 デビソン・ガーマー 54 V, a=0.215 nm：λ', lam_e(54)*1e9,' sinθ', lam_e(54)/0.215e-9, ' θ', math.degrees(math.asin(lam_e(54)/0.215e-9)))
print('   測定50°から λ=a sin50° nm', 0.215*math.sin(math.radians(50)))
print('   じぶんでとこう3 65 V：λ', lam_e(65)*1e9, 'θ', math.degrees(math.asin(lam_e(65)/0.215e-9)))
print('   2倍（n=2）が出る最小の電圧（sinθ=1, 2λ=a → λ=a/2）V=', (h/(0.215e-9/2))**2/(2*me*e))
print('== 例題4 野球 0.145 kg 40 m/s λ', h/(0.145*40))
print('   じぶんでとこう4 自転車の人 70 kg 5 m/s', h/(70*5), '花粉 1e-11 kg?')
print('   ほこり 1μg 1 mm/s', h/(1e-9*1e-3))
EK=0.0253*e
v=math.sqrt(2*EK/mn); print('== 例題5 熱中性子 0.0253 eV：v', v, ' λ nm', h/(mn*v)*1e9, ' 293.6 K の kT eV', kB*293.6/e)
print('   じぶんでとこう5 陽子 100 V：λ pm', lam_e(100,m=mp)*1e12, ' 電子との比', lam_e(100)/lam_e(100,m=mp), 'sqrt(mp/me)', math.sqrt(mp/me))
print('   冷中性子 0.0025 eV?：', h/math.sqrt(2*mn*0.0025*e)*1e9)
lam=lam_e(5e4,True)
print('== 例題6 二重スリット 50 kV d=1 μm L=1 m：λ pm', lam*1e12, 'しま μm', lam*1/1e-6*1e6)
print('   じぶんでとこう6 100 kV d=0.5 μm L=2 m:', lam_e(1e5,True)*2/0.5e-6*1e6)
print('   章末4 λ=5.0 pm d=2.0 μm L=1.5 m:', 5.0e-12*1.5/2.0e-6*1e6)
dx=0.1e-9; dp=hbar/(2*dx)
print('== 例題7 0.1 nm：Δp', dp, 'Δv', dp/me, ' (Δp)^2/2m eV', dp**2/(2*me)/e)
dx2=0.05e-9; dp2=hbar/(2*dx2); print('   Δx 0.05 nm（2倍にせまく）:', dp2**2/(2*me)/e, '（4倍）')
print('   じぶんでとこう7 1 nm（量子ドット）:', (hbar/(2*1e-9))**2/(2*me)/e)
print('== 例題8 ちり 1 μg を 1 μm に：Δv', hbar/(2*1e-9*1e-6))
print('   じぶんでとこう8 電子を 1 μm に: Δv', hbar/(2*me*1e-6))
tau=1/0.616e8
print('== 例題9 Na 3p A=0.616e8 /s：寿命 ns', tau*1e9, ' Δf MHz', 1/(2*math.pi*tau)/1e6, ' ΔE eV', hbar/tau/e, ' f0 Hz', c/589.0e-9, '比', 1/(2*math.pi*tau)/(c/589.0e-9))
print('   じぶんでとこう9 寿命 1.0 μs:', 1/(2*math.pi*1e-6)/1e6, 'MHz')
print('   章末 寿命 10 ns:', 1/(2*math.pi*10e-9)/1e6, 'MHz')
# 例題10 ガウスの波束：数値で Δx Δk
import numpy as np
sx=1e-9  # |ψ|^2 の標準偏差
x=np.linspace(-40e-9,40e-9,2**16); dxg=x[1]-x[0]
psi=np.exp(-x**2/(4*sx**2))*np.exp(1j*5e9*x)
P=abs(psi)**2; P/=P.sum()
Dx=math.sqrt((P*x**2).sum()-(P*x).sum()**2)
k=2*np.pi*np.fft.fftfreq(len(x),dxg); phi=np.fft.fft(psi); Q=abs(phi)**2; Q/=Q.sum()
Dk=math.sqrt((Q*k**2).sum()-(Q*k).sum()**2)
print('== 例題10 ガウス σ_x=1 nm：Δx', Dx, 'Δk', Dk, '積', Dx*Dk, ' 1/(2σ)=', 1/(2*sx))
print('   振幅のはば σ=√2 σx:', math.sqrt(2)*sx, ' 9-4 のはば 1/σ', 1/(math.sqrt(2)*sx), ' 2乗で 1/√2 →', 1/(math.sqrt(2)*sx)/math.sqrt(2))
print('   じぶんでとこう10 Δx=0.5 nm:', 1/(2*0.5e-9))
# 方形（箱）の波束：k の2乗の和は無限だが、半値の幅の積で比べる
print('   Δp 0.1 nm の波束の Δp (ħΔk)', hbar*1/(2*0.1e-9))
for V in [100, 1e3]:
    v=math.sqrt(2*e*V/me)
    print(f'== 例題11 群速度 V={V}: v={v:.4g} 位相の速さ={v/2:.4g}')
# 9 位相の速さが光速をこえる（mc^2 を入れたとき）
p=math.sqrt(2*me*100*e); E=me*c*c+100*e
print('   全エネルギーで書いた位相の速さ/c', (E/p)/c)
lt=lam_e(2e5,True)
print('== 例題12 200 kV：λ pm', lt*1e12, ' 0.61λ/α (α=10 mrad) nm', 0.61*lt/0.010*1e9)
print('   じぶんでとこう12 300 kV α=10 mrad:', lam_e(3e5,True)*1e12, 0.61*lam_e(3e5,True)/0.010*1e9)
print('   ルスカ 75 kV α=2e-2：λ', lam_e(7.5e4,True)*1e12, lam_e(7.5e4)*1e12, ' λ/α nm', lam_e(7.5e4)/0.02*1e9, lam_e(7.5e4,True)/0.02*1e9, ' 0.61λ/α', 0.61*lam_e(7.5e4,True)/0.02*1e9)
print('   光の顕微鏡 550 nm, 0.61λ/NA (NA=1.4):', 0.61*550/1.4, 'nm  NA=0.95', 0.61*550/0.95)
# やってみよう CD・DVD
for d,nm in [(1.6e-6,'CD'),(0.74e-6,'DVD')]:
    for wl in [450e-9,550e-9,650e-9]:
        s=wl/d
        print(nm, wl*1e9, 'sinθ', round(s,3), 'θ', round(math.degrees(math.asin(s)),1) if s<1 else '-')
# 章末問題
print('== 章末 基本1 400 V:', lam_e(400)*1e9)
print('   基本2 54 eV の光子の波長 nm', 1239.84/54, ' 電子', lam_e(54)*1e9, '比', 1239.84/54/(lam_e(54)*1e9))
print('   基本3 λ=0.20 nm の中性子 速さ・エネルギー meV', h/(mn*0.20e-9), 0.5*mn*(h/(mn*0.20e-9))**2/e*1e3)
print('   チャレンジ1 陽子を 2 fm: Δp', hbar/(2*2e-15), ' E MeV', (hbar/(2*2e-15))**2/(2*mp)/e/1e6, ' Δv/c', hbar/(2*2e-15)/mp/c)
v=math.sqrt(2*e*1e3/me); print('   チャレンジ2 1.0 keV：v', v, '位相', v/2, 'λ pm', lam_e(1e3)*1e12)
print('   チャレンジ3 300 kV：', lam_e(3e5)*1e12, lam_e(3e5,True)*1e12, '分解能', 0.61*lam_e(3e5,True)/0.010*1e9)
print('   2倍の図：電圧 4倍 → λ 1/2:', lam_e(400)/lam_e(100))
# ---- 書いたあとで足した数（章末問題の差しかえ・もっと知りたい・③の2倍にすると・表計算）
u=1.66053906892e-27
print('== もっと知りたい C60：m kg', 720*u, ' v m/s', h/(720*u*2.8e-12), ' sinθ', 2.8e-12/100e-9, ' 1 m 先 μm', 2.8e-12/100e-9*1e6)
print('== ③の2倍：108 V の θ', math.degrees(math.asin(lam_e(108)/0.215e-9)), ' λ<a になる電圧', (h/0.215e-9)**2/(2*me*e))
print('== 章末（差しかえ後）基本1 900 V:', lam_e(900)*1e9, ' 基本2 25 eV 電子 nm', lam_e(25)*1e9, ' 光子 nm', 1239.84/25)
print('   基本5 40°：λ nm', 0.215*math.sin(math.radians(40)), ' V', (h/(0.215e-9*math.sin(math.radians(40))))**2/(2*me*e))
print('   チャレンジ2 4.0 kV：λ pm', lam_e(4000)*1e12, ' v', math.sqrt(2*e*4000/me), ' 位相', math.sqrt(2*e*4000/me)/2, ' 相対論の直し', 4000/(2*mec2))
ks=[0.85,0.9,0.95,1.0,1.05,1.1,1.15]
for x in [0,5,10,15,20,30]:
    vv=[math.cos(k*x) for k in ks]; print('== 表計算 x=',x,[round(a,3) for a in vv], round(sum(vv)/7,3))
print('   次に山がそろう x', 2*math.pi/0.05)
print('   電子線回折 R≈Lλ/d の確かめ（2dsinθ=λ, R=L tan2θ）: d=0.2 nm, λ=3.7 pm, L=1 m →', math.tan(2*math.asin(3.7e-12/(2*0.2e-9))), 3.7e-12/0.2e-9)
