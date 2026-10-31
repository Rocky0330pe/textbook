import numpy as np
from scipy.integrate import quad
E=np.exp
def L(f,s): return quad(lambda t:f(t)*E(-s*t),0,60,limit=500,points=[1,2,3])[0]
s=2.0
print('tsin2t',L(lambda t:t*np.sin(2*t),s),4*s/(s*s+4)**2)
print('tcos3t',L(lambda t:t*np.cos(3*t),s),(s*s-9)/(s*s+9)**2)
print('e-2t sin3t',L(lambda t:E(-2*t)*np.sin(3*t),s),3/((s+2)**2+9))
print('sin(t-2)H',L(lambda t:np.sin(t-2)*(t>=2),s),E(-2*s)/(s*s+1))
print('pulse3',L(lambda t:3*(t<2),s),3*(1-E(-2*s))/s)
print('pulse5 1-3',L(lambda t:5*((t>=1)&(t<3)),s),5*(E(-s)-E(-3*s))/s)
print('e^{-(t-1)}H',L(lambda t:E(-(t-1))*(t>=1),s),E(-s)/(s+1))
print('t^3',L(lambda t:t**3,s),6/s**4)
print('2+3t2-4cos2t',L(lambda t:2+3*t*t-4*np.cos(2*t),s),2/s+6/s**3-4*s/(s*s+4))
print('tet',L(lambda t:t*E(-t),s),1/(s+1)**2)
# convolution numeric check at t=1
t=1.0
print('conv', quad(lambda u:E(-(t-u))*E(-2*u),0,t)[0], E(-1)-E(-2))
print('conv2', quad(lambda u:1*E(-3*u),0,t)[0], (1-E(-3))/3)
# final value fn
F=lambda s:1/(s*(s+1)*(s+2))
print([s*F(s) for s in (1e-3,1e-6)])
print('1-e-2t', [2/(s+2) for s in (1e-6,1e6)])
