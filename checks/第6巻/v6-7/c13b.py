import math
m,k,c,F0=0.5,8,0.4,0.8
al=c/(2*m); wd=math.sqrt(k/m-al*al)
for w in [2,4,8]:
    X=F0/complex(k-m*w*w,c*w)
    P,Q=X.real,-X.imag   # x_p = Re(X e^{jwt}) = P cos + Q sin  (Re((a+bj)(cos+jsin)) = a cos - b sin) -> P=a, Q=-b
    A=-P; B=(al*A-w*Q)/wd
    print(w,'P=%.6f Q=%.6f A=%.6f B=%.6f'%(P,Q,A,B), abs(X))
    # check x(0), v(0)
print('al',al,'wd',wd)
# example eq: x''+2x'+5x=10cos t, x(0)=0,v(0)=0
P,Q=2,1; A=-2; B=(1*A - 1*Q)/2
print('ex B',B)
import numpy as np
f=lambda t: 2*np.cos(t)+np.sin(t)-np.exp(-t)*(2*np.cos(2*t)+1.5*np.sin(2*t))
h=1e-6
print(f(0),(f(h)-f(-h))/2/h)
# verify ODE numerically
t=np.linspace(0,5,11); 
d1=(f(t+h)-f(t-h))/(2*h); d2=(f(t+h)-2*f(t)+f(t-h))/h/h
print(np.max(np.abs(d2+2*d1+5*f(t)-10*np.cos(t))))
# reidai3: cos t + 2 sin t - 2.5e^-t + 1.5 e^-3t for x''+4x'+3x=10cos t
g=lambda t: np.cos(t)+2*np.sin(t)-2.5*np.exp(-t)+1.5*np.exp(-3*t)
d1=(g(t+h)-g(t-h))/(2*h); d2=(g(t+h)-2*g(t)+g(t-h))/h/h
print('r3',g(0),(g(h)-g(-h))/2/h,np.max(np.abs(d2+4*d1+3*g(t)-10*np.cos(t))))
g=lambda t: np.cos(t)+3*np.sin(t)-5*np.exp(-t)+4*np.exp(-2*t)
d1=(g(t+h)-g(t-h))/(2*h); d2=(g(t+h)-2*g(t)+g(t-h))/h/h
print('j3',g(0),(g(h)-g(-h))/2/h,np.max(np.abs(d2+3*d1+2*g(t)-10*np.cos(t))))
g=lambda t: 2*np.cos(t)+4*np.sin(t)-5*np.exp(-t)+3*np.exp(-3*t)
d1=(g(t+h)-g(t-h))/(2*h); d2=(g(t+h)-2*g(t)+g(t-h))/h/h
print('p3',g(0),(g(h)-g(-h))/2/h,np.max(np.abs(d2+4*d1+3*g(t)-20*np.cos(t))))
print('phase', math.degrees(math.atan2(2,1)), math.degrees(math.atan2(4,3)), math.degrees(math.atan2(1.6,1.2)))
print('xp check ex4', abs(2.5-2.5j), 'X ex', abs(3-4j))
# x''+9x = 8cos t -> cos t - cos 3t ; x''+16x=15 cos t
