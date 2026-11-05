# 修3-5（波-10〜12）：直した所・足した所の数の検算
from math import sqrt, acos, asin, degrees, log10, log2, radians, sin

print('== 波-10 ==')
Zw, Zs, Za, Zb, Zg = 1.48e6, 4.63e7, 413, 1.63e6, 1.5e6
rp = lambda Z1, Z2: (Z2 - Z1) / (Z2 + Z1)       # 音圧で数えた反射係数 r_押（波-7 ④）
r = lambda Z1, Z2: (Z1 - Z2) / (Z1 + Z2)        # 変位・速さで数えた r（波-7 ④）
print(f'X-3 水→鋼 r_押={rp(Zw, Zs):+.4f}  r={r(Zw, Zs):+.4f}  r²={rp(Zw, Zs)**2:.4f}  入る {1-rp(Zw, Zs)**2:.4f}')
print(f'X-3 鋼→空気 r_押={rp(Zs, Za):+.6f}')
print(f'X-3 体→空気 r_押={rp(Zb, Za):+.5f}  ゼリー→体 r_押={rp(Zg, Zb):+.4f}（強さ {rp(Zg, Zb)**2*100:.2f} %）')
T = 1 - rp(Zw, Zs)**2
print(f'P5-4 章末問題（水の中の板、底面は鋼→水）：{T:.4f}×{rp(Zs, Zw)**2:.4f}×{T:.4f} = {T*rp(Zs, Zw)**2*T*100:.2f} %')
print(f'      時間：表面 {2*0.030/1480*1e6:.1f} µs、底面 {2*0.030/1480*1e6 + 2*0.020/5900*1e6:.1f} µs')
H = lambda x, z: 1 / sqrt((1 - x*x)**2 + (2*z*x)**2)
print(f'P5-18 H(0.6, 0.7)={H(0.6, 0.7):.4f}（くるい {100*(1-H(0.6, 0.7)):.1f} %）')
u = (0.04 + sqrt(0.0016 + 4*(1/0.95**2 - 1))) / 2
print(f'P5-18 H=0.95 になる ω/ωn = {sqrt(u):.4f}（切り捨て 0.59）')
print(f'P5-19 ζ=0、ω/ωn=1/3：H = {1/(1-1/9):.4f}')
print(f'新しい章末問題（水→空気）：r_押={rp(Zw, Za):+.5f}、r²={rp(Zw, Za)**2:.4f}')
for f in (2.0, 0.5):
    print(f'新しい章末問題（変位計 fn=1 Hz、ζ=0.7）：{f} Hz で |z|/Y = {f*f*H(f, 0.7):.4f}')
print(f'例題11 の確かめ：1+0.5^4={1+0.5**4}、H={1/sqrt(1.0625):.4f}')

print('== 波-11 ==')
print(f'P5-28 40000/3000={40000/3000:.4f}、2^13.3-1={2**13.3-1:.0f}、2^13.33-1={2**13.33-1:.0f}、2^(40/3)-1={2**(40/3)-1:.0f}、'
      f'10log10={10*log10(2**(40/3)-1):.2f} dB')

print('== 波-12 ==')
for n in (1.333, 1.331, 1.343):
    c2 = (n*n - 1) / 3
    t1 = degrees(acos(sqrt(c2)))
    t2 = degrees(asin(sin(radians(t1)) / n))
    print(f'P5-3 n={n}: cos²θ1={c2:.4f}  cosθ1={sqrt(c2):.4f}  θ1={t1:.2f}°  θ2={t2:.2f}°  φ={4*t2-2*t1:.2f}°')
print(f'逃げ水 α=√(2×3e-5)={sqrt(6e-5):.5f} rad = {degrees(sqrt(6e-5)):.3f}°')
