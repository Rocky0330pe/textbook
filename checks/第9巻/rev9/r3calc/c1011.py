import numpy as np
from scipy.linalg import expm
from scipy.optimize import brentq
A=np.array([[0,1],[4,0.]]);B=np.array([[0],[1.]]);K=np.array([[8,4.]])
for dt in [0.1,1.2]:
    Ad=np.eye(2)+(A-B@K)*dt; x=np.array([0.01,0]); seq=[x[0]]
    for k in range(30):
        x=Ad@x; seq.append(x[0])
        if k+1 in (5,10,20,30) : print(dt,k+1,x.round(5))
    print(dt,[round(s,5) for s in seq[:7]])
# DC motor
M=np.array([[-0.1,500],[-50,-1000]]);print(np.linalg.eigvals(M)); print(-np.linalg.solve(M,np.array([0,1000.])))
# 9-11 (I+At/n)^n
As=np.array([[0,1],[-1,0.]])
for n in [63,630,6283]:
    P=np.linalg.matrix_power(np.eye(2)+As*2*np.pi/n,n); print(n,P.round(4))
# heat 9 pts
A9=-2*np.eye(9)+np.eye(9,k=1)+np.eye(9,k=-1)
f=lambda t:(expm(A9*t)@(100*np.ones(9)))[4]-50
print('9pt 50C at',brentq(f,5,15), f(5)+50, f(10)+50)
A3=np.array([[-2,1,0],[1,-2,1],[0,1,-2.]])
print((expm(A3)@[100,100,100]).round(2),(expm(A3)@[0,100,0]).round(2), np.linalg.eigvalsh(A3))
# series 9-1 50C
L=0.1;al=1e-4
g=lambda t:sum(400/(n*np.pi)*np.exp(-al*(n*np.pi/L)**2*t)*np.sin(n*np.pi/2) for n in range(1,400,2))-50
print('series 50C', brentq(g,5,15), g(5)+50, g(10)+50)
# 9-10 sheet euler check at k=5
# transmission
c,s=np.cosh(1),np.sinh(1); print(1.543**2-2.350*0.588)
# RLC 9-10 ex3 peak
from scipy import signal
sysr=signal.lti([1e5*10],[1,200,1e5]); t=np.linspace(0,0.05,50001); tt,y=signal.step(sysr,T=t); print(y.max(), tt[np.argmax(y)])
print(np.linalg.eigvals(np.array([[0,1e6],[-100,-2000.]])))
