import numpy as np
E=np.exp
for dt in (0.1,0.01):
    tt=np.arange(0,10+dt/2,dt); b=E(-2*tt)
    vals=[np.trapezoid(f*b,tt) for f in (np.ones_like(tt),tt,E(-tt),np.sin(3*tt))]
    print(dt,[round(v,5) for v in vals])
tt=np.arange(0,10.05,0.1)
for t in (0,0.1,0.2,0.3,9.9,10):
    b=E(-2*t); print(t, f"{b:.5f} {1*b:.5f} {t*b:.5f} {E(-t)*b:.5f} {np.sin(3*t)*b:.5f}")
for t in (0,0.1,0.2,0.3,9.9,10):
    f=1/(1+t); print(t,f"{f:.5f} {E(-t):.5f} {f*E(-t):.5f}  sq {f*f:.5f} {f*f*E(-t):.5f}")
g=lambda u:1/(1+u); g2=lambda u:1/(1+u)**2
for dt in (0.1,0.01): t2=np.arange(0,10+dt/2,dt); print(dt,np.trapezoid(g(t2)*E(-t2),t2),np.trapezoid(g2(t2)*E(-t2),t2))
from scipy import integrate
print(integrate.quad(lambda u:g2(u)*E(-u),0,np.inf))
# sum and trap formula check
tt=np.arange(0,10.05,0.1); y=E(-2*tt); print(y.sum(), 0.1*(y.sum()-(y[0]+y[-1])/2))
# coffee
print(25+65*E(-0.4), 20+50*E(-0.5), 5-5*E(-3), 20+40*E(-0.5), 12-12*E(-2))
