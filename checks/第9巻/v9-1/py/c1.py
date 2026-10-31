import numpy as np
fs = 8000
t = np.arange(fs) / fs
x = (np.sin(2*np.pi*440*t) + 0.5*np.sin(2*np.pi*880*t)
     + 0.25*np.sin(2*np.pi*1320*t))
X = np.fft.rfft(x)
freq = np.fft.rfftfreq(len(x), 1/fs)
A = 2*np.abs(X)/len(x)
print(len(x), len(X))
print(freq[A > 0.1])
print(np.round(A[A > 0.1], 3))
print(freq[:4], freq[-1])
# table values t in ms
for tm in np.arange(0, 2.5, 0.25):
    s = tm/1000
    a=np.sin(2*np.pi*440*s); b=0.5*np.sin(2*np.pi*880*s); c=0.25*np.sin(2*np.pi*1320*s)
    print(f"{tm:.2f} {a:.3f} {b:.3f} {c:.3f} {a+b+c:.3f}")
print(1000/440)
# max of sum
tt=np.linspace(0,1/440,100001); y=np.sin(2*np.pi*440*tt)+0.5*np.sin(2*np.pi*880*tt)+0.25*np.sin(2*np.pi*1320*tt)
print("max",y.max(), tt[y.argmax()]*1000, "min", y.min(), tt[y.argmin()]*1000)
# hot water
for tm in [0,5,10,20,30,60]:
    print(tm, 20+60*np.exp(-0.05*tm))
# Euler dt=1
T=80
for k in range(10): T=T+(-0.05*(T-20))
print("euler",T)
print(340/440, 2*np.pi*440, 1/np.sqrt(4*np.pi*1e-7*8.854e-12))
