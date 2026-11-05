# 波-11 の図・表の点の値（python3 fig_data_p3_11.py）
import numpy as np
from math import pi, log10
def fmt(xs, ys, nd=3): return ' '.join('(%s,%s)' % (round(float(a),nd), round(float(b),nd)) for a,b in zip(xs,ys))
print("== 図：サンプリングと量子化（3ビット、1周期に 12 点）")
m=np.arange(13); t=m/12; x=np.sin(2*pi*t)*0.95
q=2/8  # -1..1 を 8 段（3 ビット）：段の中心 -0.875 ... 0.875
xq=np.clip(np.floor(x/q)*q+q/2, -0.875, 0.875)
print("点", fmt(t, x)); print("量子化", fmt(t, xq)); print("誤差", np.round(xq-x,3))
print("== 表計算の DFT 16 点")
N=16; m=np.arange(N); x=np.sin(2*pi*2*m/N)+0.5*np.cos(2*pi*5*m/N)
for k in (1,2,3,5):
    c=np.sum(x*np.cos(2*pi*k*m/N)); s=np.sum(x*np.sin(2*pi*k*m/N))
    print(" k",k," Σx cos",round(c,3)," Σx sin",round(s,3)," 振幅 2|X|/N", round(2*np.hypot(c,s)/N,3))
for i in range(N): print("  m",i," x",round(x[i],3)," cos2",round(np.cos(2*pi*2*i/N),3)," sin2",round(np.sin(2*pi*2*i/N),3)," x cos",round(x[i]*np.cos(2*pi*2*i/N),3)," x sin", round(x[i]*np.sin(2*pi*2*i/N),3))
print("== 分解能の図：440 Hz と 445 Hz（振幅1）、fs=8000、T=0.1 s と 1 s、ハンの窓・補正")
fs=8000
for T in (0.1, 1.0, 0.4):
    N=int(fs*T); t=np.arange(N)/fs; x=np.sin(2*pi*440*t)+np.sin(2*pi*445*t)
    w=0.5-0.5*np.cos(2*pi*np.arange(N)/N); A=2*np.abs(np.fft.rfft(x*w))/N/0.5; f=np.fft.rfftfreq(N,1/fs)
    sel=(f>=410)&(f<=475)
    print(" T",T, fmt(f[sel], A[sel], 3))
print("== もれの図：440.5 Hz、fs=8000、N=8000、dB（窓なし・ハン補正）")
N=8000; t=np.arange(N)/fs; x=np.sin(2*pi*440.5*t)
A0=2*np.abs(np.fft.rfft(x))/N; w=0.5-0.5*np.cos(2*pi*np.arange(N)/N); Aw=2*np.abs(np.fft.rfft(x*w))/N/0.5
ks=np.arange(410,472)
print(" 窓なし", fmt(ks, 20*np.log10(A0[ks]), 1))
print(" ハン", fmt(ks, np.maximum(20*np.log10(Aw[ks]),-100), 1))
print("== 小さな音の図：1000.5 Hz（1）と 1100.5 Hz（0.001）")
x2=np.sin(2*pi*1000.5*t)+0.001*np.sin(2*pi*1100.5*t)
B0=2*np.abs(np.fft.rfft(x2))/N; Bw=2*np.abs(np.fft.rfft(x2*w))/N/0.5
ks=np.arange(960,1141,3)
print(" 窓なし", fmt(ks, 20*np.log10(B0[ks]), 1))
print(" ハン", fmt(ks, np.maximum(20*np.log10(Bw[ks]),-120), 1))
for k in (1099,1100,1101,1102): print("  k",k, round(20*log10(B0[k]),1), round(20*log10(Bw[k]),1))
print("== 平均の図：10 Hz の sin（振幅1）＋雑音（標準偏差 1）、fs=1000、0.2 s を 5 ms ごとに")
rng=np.random.default_rng(1)
t=np.arange(200)/1000; s=np.sin(2*pi*10*t)
res={}
for K in (1,16,100):
    acc=np.zeros_like(t)
    for k in range(K): acc+= s + rng.normal(0,1,len(t))
    acc/=K; res[K]=acc
    print(" K",K," 残りの雑音 σ", round(np.std(acc-s),3))
    print("  ", fmt(t[::4]*1000, acc[::4], 2))
