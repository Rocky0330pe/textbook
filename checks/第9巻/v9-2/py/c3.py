import numpy as np
pi=np.pi; k=4/pi
def S(t,N): return k*sum(np.sin((2*j+1)*t)/(2*j+1) for j in range(N))
print('ex1', S(pi/2,3), S(pi/6,3), 'jibun', S(pi/4,3), S(pi/3,3))
print('inner', 1-1/3+1/5, 0.5+1/3+0.1, .7071+.7071/3-.7071/5, .8660-.8660/5)
print('p1 4terms', S(pi/2,4))
print('ex4', 10/pi, 10/(3*pi), 10/(5*pi), 'jibun', 6.6/pi, 6.6/(3*pi), 6.6/(5*pi))
print('p4', 20/pi, 20/(3*pi),20/(5*pi))
d=np.arange(15,360,30); t=np.radians(d); f=np.where(d<180,1,-1)
print('ex5 data', d, np.round(np.sin(t),4), np.sum(f*np.sin(t)), 2*np.mean(f*np.sin(t)))
print('jibun5 b3', np.round(np.sin(3*t),4), np.sum(f*np.sin(3*t)), 2*np.mean(f*np.sin(3*t)))
g=np.where(d<180,1,0); print('p8 b1 0/1', np.sum(g*np.sin(t)), 2*np.mean(g*np.sin(t)), 2/pi)
k1=1e-4*(pi/0.1)**2
for tt in [10,15,20]: print('heat',tt, 400/pi*np.exp(-k1*tt), 400/(3*pi)*np.exp(-9*k1*tt), 400/pi*np.exp(-k1*tt)-400/(3*pi)*np.exp(-9*k1*tt))
for T in [50,25,30]: print('time',T, np.log(400/pi/T), np.log(400/pi/T)/k1, T/(400/pi))
print('string', 2*0.65*110, 143/(2*0.325), 2*0.65*82, 3*82, 106.6/(2*0.325), 4*110, 143/(2*0.5))
print(np.exp(-k1*10), np.exp(-9*k1*10))
