import numpy as np
fs = 8000                  # 1秒に8000回とる
N = 8000                   # 1秒分の点の数
t = np.arange(N) / fs      # とった時刻
x = (np.sin(2*np.pi*440*t) + 0.5*np.sin(2*np.pi*880*t)
     + 0.25*np.sin(2*np.pi*1320*t))
X = np.fft.rfft(x)                 # FFT（正の周波数の側）
freq = np.fft.rfftfreq(N, 1/fs)    # X[k] の周波数（Hz）
A = 2*np.abs(X)/N                  # 振幅
for k in np.argsort(A)[-3:][::-1]:
    print(freq[k], round(A[k], 3))
