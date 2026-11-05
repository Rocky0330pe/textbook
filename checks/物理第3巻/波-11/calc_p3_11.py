# 波-11 音を数字にする：信号とスペクトル の数値の検算（python3 calc_p3_11.py）
import math, numpy as np
from math import pi, log2, log10, sqrt
def p(*a): print(*a)
p("== ① サンプリングと量子化")
p("CD データ量 bit/s", 44100*16*2, " 4分の曲 MB", 44100*16*2*240/8/1e6)
p("電話 8 kHz・8 bit bit/s", 8000*8)
p("16 bit の段の数", 2**16, " 8 bit", 2**8, " 24 bit", 2**24)
p("±1 V を 16 bit：きざみ q V", 2/2**16, " µV", 2/2**16*1e6)
p("== ② エイリアシング")
def alias(f, fs):
    r = f % fs
    return min(r, fs-r)
p("車輪 1コマの角", 2.75*360/24, " -> 見かけ", 2.75*360/24-45, " 1秒", (2.75*360/24-45)*24, "°/s")
for f in (1000, 7000, 9000, 15000, 5000, 3000): p("見かけ f=%d fs=8000 ->"%f, alias(f, 8000))
p("例題3 じぶん 44.1kHz で 30kHz ->", alias(30000, 44100), " 25 kHz ->", alias(25000,44100))
# 扇風機 3 枚羽根・100 Hz
p("止まって見える回転数 rpm", 100/3*60)
w = 1980/60*360/100
p("1980 rpm 1回の光の間の角", w, " ずれ", w-120, " °/s", (w-120)*100, " rpm", (w-120)*100/360*60)
w = 1000/60*360/100; p("1000 rpm: 1回の角", w)
# 60 Hz 地域 120 Hz
p("120 Hz なら止まって見える rpm", 120/3*60)
w = 2400/60*360/120; p("じぶん 2420 rpm/120 Hz", 2420/60*360/120, 2420/60*360/120-120, (2420/60*360/120-120)*120/360*60)
p("== ③ DFT と分解能")
p("10.24 kHz・1024 点 Δf", 10240/1024, " 時間", 1024/10240)
p("44.1 kHz・4096 点 Δf", 44100/4096, " 時間", 4096/44100)
p("8000 点 8 kHz Δf", 8000/8000)
# 表計算の DFT：N=16, fs=16 Hz? -> 例：x = sin(2π·2m/16) + 0.5 cos(2π·5 m/16)
N=16; m=np.arange(N); x=np.sin(2*pi*2*m/N)+0.5*np.cos(2*pi*5*m/N)
X=np.fft.fft(x); A=2*np.abs(X)/N
p("16点の表 x", np.round(x,3)); p("振幅", np.round(A[:9],3))
p("== ④ 窓関数")
fs=8000; Nn=8000; t=np.arange(Nn)/fs
x=np.sin(2*pi*440.5*t)
A0=2*np.abs(np.fft.rfft(x))/Nn
w=0.5-0.5*np.cos(2*pi*np.arange(Nn)/Nn)
Aw=2*np.abs(np.fft.rfft(x*w))/Nn
for k in range(434,448): p(k, round(A0[k],4), round(Aw[k],4), round(Aw[k]/0.5,4), " dB", round(20*log10(A0[k]),1), round(20*log10(Aw[k]/0.5),1))
p("440 Hz ちょうど 窓なし／ハン", [round(v,4) for v in (2*np.abs(np.fft.rfft(np.sin(2*pi*440*t)))/Nn)[438:443]], [round(v,4) for v in (2*np.abs(np.fft.rfft(np.sin(2*pi*440*t)*w))/Nn)[438:443]])
# 遠くのもれ
for k in (450, 460, 480, 540, 640): p("440.5 Hz からはなれた所", k, " 窓なし dB", round(20*log10(A0[k]),1), " ハン dB", round(20*log10(Aw[k]/0.5),1))
# 大きい音と小さい音
x2 = np.sin(2*pi*1000.5*t) + 0.001*np.sin(2*pi*1100.5*t)
B0=2*np.abs(np.fft.rfft(x2))/Nn; Bw=2*np.abs(np.fft.rfft(x2*w))/Nn/0.5
p("1000.5 Hz と 1100.5 Hz(-60 dB)：1100 Hz の所 窓なし", round(20*log10(B0[1100]),1), round(20*log10(B0[1101]),1), " ハン", round(20*log10(Bw[1100]),1), round(20*log10(Bw[1101]),1), " ハンの1080Hz", round(20*log10(Bw[1080]),1), " 窓なし1080", round(20*log10(B0[1080]),1))
# 窓の形の値（表）N=8
N8=8; p("ハン N=8", np.round(0.5-0.5*np.cos(2*pi*np.arange(N8)/N8),3))
N16=16; p("ハン N=16", np.round(0.5-0.5*np.cos(2*pi*np.arange(N16)/N16),3))
# 窓をかけて平均の値 0.5
p("ハンの平均", w.mean())
# ハンの山の幅（メインローブ）：0 になる点 ±2 bins
p("ハン：k=440 の山 rel", [round(v,4) for v in Aw[438:444]/0.5])
p("== ⑤ サンプリング定理")
p("CD 22.05 kHz、20 kHz との間", 22050-20000)
p("96 kHz -> 48 kHz")
p("== ⑥ フィルター")
tau=1e3*0.1e-6; fc=1/(2*pi*tau); p("RC τ", tau, " fc", fc)
for f in (100, 1000, fc, 2000, 10000, 16000, 20000):
    g=1/sqrt(1+(f/fc)**2); p(" f", round(f,1), " |G|", round(g,4), " dB", round(20*log10(g),2), " 位相°", round(-math.degrees(math.atan(f/fc)),1))
p("2段（バッファーあり） 16 kHz dB", 2*20*log10(1/sqrt(1+(16000/fc)**2)))
p("100 Hz RC τ", 1/(2*pi*100))
# じぶん: 10 kΩ・0.01 µF
tau2=10e3*0.01e-6; p("10kΩ・0.01µF fc", 1/(2*pi*tau2))
# 移動平均
fs=1000; M=20
p("移動平均 fs=1000, M=20 0 になる周波数", fs/M)
for f in (5, 10, 25, 50, 75, 100, 150):
    H=abs(np.sin(pi*f*M/fs)/(M*np.sin(pi*f/fs))); p(" f", f, " |H|", round(H,4), " dB", round(20*log10(H+1e-300),1))
# 50 Hz のハム： fs=1000, M=20 で 50Hz 消える, 60 Hz 地域では M?
p("60 Hz を消す M (fs=1200)", 1200/60)
# 3点の移動平均の例
x=[2,5,3,6,4,7,5]; p("3点平均", [round(sum(x[i-2:i+1])/3,2) for i in range(2,len(x))])
p("== ⑦ 雑音と平均")
for K in (4, 16, 100, 10000): p("K", K, " 雑音 1/√K", 1/sqrt(K), " 改善 dB", 20*log10(sqrt(K)))
rng=np.random.default_rng(1)
t=np.arange(200)/1000; s=np.sin(2*pi*10*t)
for K in (1, 16, 100):
    acc=np.zeros_like(t)
    for k in range(K): acc+= s + rng.normal(0,1,len(t))
    acc/=K
    p(" K", K, " 残った雑音の標準偏差", round(np.std(acc-s),3))
# S/N dB の例
p("信号 1 V rms 雑音 0.01 V rms: S/N dB", 20*log10(1/0.01))
p("S/N 20 dB → 100 回平均で", 20+20)
p("1000 回平均 dB", 20*log10(sqrt(1000)), " 30 dB にするには", 10**(30/10))
p("== ⑧ 量子化 S/N")
for b in (8, 12, 16, 24): p(" b", b, " S/N", round(6.02*b+1.76,1), " 正確", round(10*log10(1.5*4**b),2))
p("1.76 = 10log1.5", 10*log10(1.5), " 6.02 = 20log2", 20*log10(2))
# シミュレーションで確かめ
for b in (8,16):
    t=np.arange(100000); x=np.sin(2*pi*0.01234567*t); q=2/2**b
    xq=np.round(x/q)*q; e=xq-x
    p(" sim b",b," S/N dB", round(10*log10(np.mean(x**2)/np.mean(e**2)),2), " 誤差の2乗平均/(q²/12)", round(np.mean(e**2)/(q*q/12),4))
p("一様分布の分散 q²/12 の確かめ（q=1）", np.mean((np.random.default_rng(2).random(1000000)-0.5)**2))
p("== ⑨ 情報量")
for name,P in (("コイン",2),("サイコロ",6),("26文字",26),("8面",8),("トランプ52",52),("英数62",62)): p(name, round(log2(P),3))
def H(ps): return -sum(q*log2(q) for q in ps if q>0)
for q in (0.5, 0.9, 0.99, 0.75, 0.6): p(" 2値 p=",q," H", round(H([q,1-q]),4))
p("4つ 1/2,1/4,1/8,1/8 の H", H([.5,.25,.125,.125]), " 平均の符号の長さ", .5*1+.25*2+.125*3*2)
p("天気 晴れ0.5 くもり0.25 雨0.25 H", H([.5,.25,.25]))
p("じぶん 1/2,1/4,1/4 平均長", .5*1+.25*2+.25*2)
p("サイコロ 1/6 6つ H", H([1/6]*6))
p("2値 p=0.9 の確率で 1000 個 → ビット", 1000*H([.9,.1]))
p("k_B ln2", 1.380649e-23*math.log(2), " 1ビット 300K の熱", 1.380649e-23*300*math.log(2))
p("ln2", math.log(2), " log2 e", 1/math.log(2))
# 英語の文字の頻度は 〔要確認〕：単語の頻度表から H≈4.1 ビットとされる
p("== ⑩ 通信路容量")
def C(B, snr_db): return B*log2(1+10**(snr_db/10))
p("3 kHz・30 dB", C(3000,30))
p("3 kHz・40 dB", C(3000,40), " 6 kHz・30 dB", C(6000,30), " 3 kHz・33 dB", C(3000,33))
p("20 MHz・20 dB", C(20e6,20)/1e6, "Mb/s")
p("1 MHz・0 dB", C(1e6,0))
p("3.1 kHz 35 dB", C(3100,35))
for db in (0,10,20,30,40,50,60): p(" S/N", db, " log2(1+S/N)", round(log2(1+10**(db/10)),3))
p("== 例題11 FFT")
for N in (1024, 8192, 65536):
    p(" N",N," N^2",N*N," N log2 N", N*log2(N), " 比", N*N/(N*log2(N)))
p("== 2倍の図")
p("fs 2倍：上限", 44100/2, 88200/2)
p("N 2倍：Δf", 44100/1024, 44100/2048)
p("== 章末")
# 基本1: 48 kHz・24 bit・2ch のデータ量
p("48k×24×2 bit/s", 48000*24*2, " 1分 MB", 48000*24*2*60/8/1e6)
# 基本2: fs 1 kHz で 1.2 kHz, 600 Hz, 2.3 kHz の見かけ
for f in (600, 1200, 2300, 950): p(" fs 1000 で", f, "->", alias(f,1000))
# 基本3: 44.1k・2^14 点 Δf と時間
p("44.1k 16384 点 Δf", 44100/16384, " 時間", 16384/44100)
# 基本4: 12 bit S/N
p("12 bit", 6.02*12+1.76)
# 基本5: 確率 1/4×4 の情報量・2値 p=0.8
p("p=0.8 H", H([.8,.2]))
# チャレンジ1: RC 2段 + 移動平均
p("RC 2段 fc=1.59k で 10 kHz", 2*20*log10(1/sqrt(1+(10000/fc)**2)))
# チャレンジ2: 3 kHz で 30 kb/s を 60 kb/s にするのに必要な S/N
need = 2**(60000/3000)-1; p("60 kb/s 3kHz に要る S/N", need, 10*log10(need))
# チャレンジ3: 8 bit 量子化 + 100 回平均（ディザ） → 
p("8bit S/N", 6.02*8+1.76, " +100 回平均 +20 dB", 6.02*8+1.76+20)
# 車輪 じぶん: 24 コマ・スポーク 6 本・2 回転/s
w=2*360/24; p("6 本 2 回転/s 24 コマ 1コマ", w, " 60°おき -> ", w-60 if w>30 else w, " °/s", (w-60)*24)
w=3*360/30; p("8 本 3 回転/s 30 コマ", w, (w-45), (w-45)*30)
