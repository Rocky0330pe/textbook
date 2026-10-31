import numpy as np
from scipy import integrate, signal
pi=np.pi; P=print
P("=== 半波整流（最大1） ===")
f=lambda t: max(np.sin(t),0)
a0=integrate.quad(f,-pi,pi,points=[0])[0]/pi
P("a0/2 (平均) = %.5f, 1/pi = %.5f" % (a0/2,1/pi))
for n in range(1,5):
    a=integrate.quad(lambda t:f(t)*np.cos(n*t),-pi,pi,points=[0])[0]/pi
    b=integrate.quad(lambda t:f(t)*np.sin(n*t),-pi,pi,points=[0])[0]/pi
    P("n=%d a=%.5f b=%.5f  式 a_n=-2/(pi(n^2-1)) 偶数: %s" % (n,a,b, "%.5f"%(-2/(pi*(n*n-1))) if n%2==0 else "-"))
P("全波整流 |sin t|: 平均 2/pi = %.5f, a2 = %.5f (式 -4/(3pi) = %.5f)" % (2/pi, integrate.quad(lambda t:abs(np.sin(t))*np.cos(2*t),-pi,pi,points=[0])[0]/pi, -4/(3*pi)))
P("=== 両側指数 e^{-|t|} ===")
for w in [0,1,2]:
    P("w=%g F=%.5f, 2/(1+w^2)=%.5f"%(w, 2*integrate.quad(lambda t: np.exp(-t)*np.cos(w*t),0,np.inf)[0], 2/(1+w*w)))
P("=== 無限に長い棒の熱（ガウス）幅 sqrt(2 alpha t) ===")
for t in [1,10,100]: P("t=%d s: %.4f m" % (t, np.sqrt(2*1e-4*t)))
P("=== 車のサスペンション（1/4 車体） m=250, k=16000, c=2000 ===")
m,k,c=250.,16000.,2000.
wn=np.sqrt(k/m); z=c/(2*np.sqrt(m*k)); P("wn=%.3f rad/s = %.3f Hz, zeta=%.3f" % (wn, wn/2/pi, z))
P("極", np.roots([m,c,k]), "行きすぎ %.1f %%" % (100*np.exp(-pi*z/np.sqrt(1-z*z))))
# 段差 5 cm を通る：路面 x_r ステップ 0.05、車体 G=(cs+k)/(ms^2+cs+k)
tt=np.linspace(0,3,3001); _,y,_=signal.lsim(([c,k],[m,c,k]),0.05*np.ones_like(tt),tt)
P("段差 0.05 m: 車体の最大 %.4f m at %.3f s" % (y.max(), tt[y.argmax()]))
for cc in [1000.,2000.,4000.,8000.]:
    zz=cc/(2*np.sqrt(m*k)); _,y,_=signal.lsim(([cc,k],[m,cc,k]),0.05*np.ones_like(tt),tt)
    P("  c=%g zeta=%.3f 最大 %.4f m" % (cc,zz,y.max()))
P("=== エアコン（比例制御）===")
Tout,Tset=35.,26.
for RKp in [1,4,9,19]:
    T=(Tout+RKp*Tset)/(1+RKp); P("R Kp=%d: 落ち着く温度 %.2f 度（ずれ %.2f）、時定数 RC/(1+RKp) = %.1f 分 (RC=60分)" % (RKp,T,T-Tset,60/(1+RKp)))
P("=== ラプラス：むだ時間・パルス ===")
P("幅1秒・高さ1のパルス：(1-e^{-s})/s, s=2: %.5f vs 数値 %.5f" % ((1-np.exp(-2))/2, integrate.quad(lambda t: np.exp(-2*t),0,1)[0]))
P("=== 1次おくれ2つの直列：1/((s+1)(s+2)) のステップ応答 ===")
P("部分分数 1/(s(s+1)(s+2)):", signal.residue([1],[1,3,2,0]))
P("=== 最終値の定理チェック ===")
tt=np.linspace(0,20,2001);_,y,_=signal.lsim(([1],[1,3,2]),np.ones_like(tt),tt);P("1/(s^2+3s+2) ステップの最後 %.4f"%y[-1])
P("=== DC モーターの 1次モデル例 ===")
P("G=10/(0.5 s+1): 1 V で 10 rad/s = %.1f rpm" % (10*60/(2*pi)))
P("=== 弦 c ===")
P("ギター 1弦 E4 329.63 Hz, L=0.648: c=%.1f"%(2*0.648*329.63))
P("=== 音: 440 Hz 周期 ===",1/440)
P("=== 方形波 50 Hz のフーリエ：基本 50 Hz, 3倍 150, 5倍 250 ===")
P("=== 6-13 RC: (1+j w tau)V=V0 ===")
P("=== 8 点 DFT 手計算 ===")
x=np.array([1,0,-1,0,1,0,-1,0.]);P(np.round(np.fft.fft(x),4))
P("=== THD of triangle wave ===", np.sqrt(sum((8/(pi*pi*n*n))**2/2 for n in range(3,20001,2)))/ (8/(pi*pi)/np.sqrt(2)))
P("=== exp(-t) sin(10t) のフーリエ変換の山 ===")
w=np.linspace(0,20,2001); F=np.abs(10/((1+1j*w)**2+100)); P("山 at w=%.2f, |F|=%.3f"%(w[F.argmax()],F.max()))
