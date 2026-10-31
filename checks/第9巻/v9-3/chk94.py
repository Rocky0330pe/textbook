import numpy as np
from scipy.integrate import quad
pi=np.pi
def FT(f,w,a=-np.inf,b=np.inf):
    re=quad(lambda t: f(t)*np.cos(w*t),a,b,limit=500)[0]
    im=quad(lambda t: -f(t)*np.sin(w*t),a,b,limit=500)[0]
    return re+1j*im
pulse=lambda t: 1.0 if abs(t)<1 else 0.0
for w in [0,0.5,1,pi/2,2,pi,4,2*pi]:
    print("pulse",round(w,4), np.round(FT(pulse,w,-1,1),4), 2*np.sin(w)/w if w else 2)
# narrow pulse a=0.5 height 1
for w in [0,pi,2*pi]: print("pulse a=.5",w, np.round(FT(lambda t:1.0,w,-0.5,0.5),4))
# midpoint sum for F(1): dt=0.1 20 points
dt=0.1; tm=np.arange(-1+dt/2,1,dt); print("mid sum F(1)", np.sum(np.cos(1*tm))*dt, len(tm))
dt=0.25; tm=np.arange(-1+dt/2,1,dt); print("mid sum dt.25 F(1)", np.sum(np.cos(1*tm))*dt, len(tm), tm)
for w in [0,1,2,3]:
    print("e^-2t", w, np.round(FT(lambda t: np.exp(-2*t),w,0,np.inf),4), 1/(2+1j*w), abs(1/(2+1j*w)))
for w in [0,1,2,3]:
    print("e^-|t|", w, np.round(FT(lambda t: np.exp(-abs(t)),w),4), 2/(1+w*w))
for w in [0,1,2,3]:
    print("gauss", w, np.round(FT(lambda t: np.exp(-t*t/2),w),4), np.sqrt(2*pi)*np.exp(-w*w/2))
# gauss sigma=2
for w in [0,0.5,1]:
    print("gauss s=2", w, np.round(FT(lambda t: np.exp(-t*t/8),w),4), 2*np.sqrt(2*pi)*np.exp(-4*w*w/2))
# shifted pulse 1<t<3
for w in [0,1,pi/2]:
    F=FT(pulse,w,-1,1); Fs=FT(lambda t:1.0,w,1,3); print("shift",w,np.round(Fs,4),np.round(np.exp(-2j*w)*F,4),abs(Fs))
# modulation: e^{-t^2/2} cos 10t
for w in [0,5,9,10,11]:
    F=FT(lambda t: np.exp(-t*t/2)*np.cos(10*t),w); print("mod",w,np.round(F,4), 0.5*np.sqrt(2*pi)*(np.exp(-(w-10)**2/2)+np.exp(-(w+10)**2/2)))
# pulse train c_n*T, T=4
for T in [4,8,16]:
    w0=2*pi/T
    print("T",T,"w0",w0,[ (round(n*w0,3), round(2*np.sin(n*w0)/(n*w0) if n else 2,3)) for n in range(0,6)])
# DFT 8 points
m=np.arange(8)
x=np.sin(2*pi*2*m/8); print("x",np.round(x,4)); print(np.round(np.fft.fft(x),4))
x=np.array([1,0,-1,0,1,0,-1,0]); print(np.round(np.fft.fft(x),4))
x=np.cos(2*pi*1*m/8); print("cos1",np.round(np.fft.fft(x),4))
x=1+np.cos(2*pi*m/8)*2; print("1+2cos", np.round(np.fft.fft(x),4))
# FFT 440...
fs=8000; t=np.arange(fs)/fs
s=np.sin(2*pi*440*t)+0.5*np.sin(2*pi*880*t)+0.25*np.sin(2*pi*1320*t)
X=np.fft.rfft(s); f=np.fft.rfftfreq(len(s),1/fs); A=2*abs(X)/len(s)
idx=np.argsort(A)[-4:]; print([(f[i],round(A[i],4)) for i in idx])
print("N=1024", 1024**2, 1024*10, 1024**2/(1024*10), (1024/2)*10)
# aliasing
m=np.arange(8); print(np.round(np.cos(2*pi*7000*m/8000),4), np.round(np.cos(2*pi*1000*m/8000),4))
print("sin",np.round(np.sin(2*pi*7000*m/8000),4), np.round(np.sin(2*pi*1000*m/8000),4))
# wheel
deg=2.75*360/24; print("deg per frame",deg, deg-45, (deg-45)*24)
# heat infinite rod width
for t in [1,10,100]: print(t, np.sqrt(2*1e-4*t))
# e^{-t} sin 10t peak
w=np.linspace(0,20,200001); F=10/((1+1j*w)**2+100); print("peak", w[np.argmax(abs(F))])
