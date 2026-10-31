import numpy as np
pi=np.pi
def S(t,N,h=4/pi): return h*sum(np.sin((2*k+1)*t)/(2*k+1) for k in range(N))
def fmt(xs,ys,nd=3): return ' '.join(f'({x:.{nd}f},{y:.3f})' for x,y in zip(xs,ys))
out={}
# Gibbs zoom: t in degrees 0..60 , N=10 and N=50
d=np.linspace(0,60,241); t=np.radians(d)
out['g10']=fmt(d,S(t,10),2); out['g50']=fmt(d,S(t,50),2)
d=np.linspace(0,360,361); t=np.radians(d)
out['full10']=fmt(d,S(t,10),1)
# sawtooth partial sums N=5 on -180..180
d=np.linspace(-180,180,361); t=np.radians(d)
saw=sum(2*(-1)**(n+1)/n*np.sin(n*t) for n in range(1,6))
out['saw5']=fmt(d,saw,1)
saw20=sum(2*(-1)**(n+1)/n*np.sin(n*t) for n in range(1,21))
out['saw20']=fmt(d,saw20,1)
# heat profiles
L=0.1;al=1e-4
x=np.linspace(0,0.1,41)
def T(x,t): return sum(400/(n*pi)*np.exp(-al*(n*pi/L)**2*t)*np.sin(n*pi*x/L) for n in range(1,400,2))
for tt in [1,2,5,10,20]:
    out[f'h{tt}']=fmt(x*100,T(x,tt),2)  # x in cm
# midpoint vs time
ts=np.linspace(0.05,30,200)
out['mid']=fmt(ts,[T(0.05,t) for t in ts],2)
ts1=np.linspace(0.9,30,120)
out['mid1']=fmt(ts1,400/pi*np.exp(-al*(pi/L)**2*ts1),2)
for k,v in out.items():
    open(k+'.dat','w').write(v)
print({k:len(v) for k,v in out.items()})
print(T(0.05,1), 400/pi*np.exp(-al*(pi/L)**2*0.9))
