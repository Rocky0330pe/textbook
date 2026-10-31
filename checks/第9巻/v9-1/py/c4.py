import numpy as np
t=np.linspace(0,5e-3,200001)
for name,a in [("fl",[1,0.25,0.08]),("pi",[1,0.55,0.4,0.25,0.15,0.1]),("vo",[0.5,0.8,1,0.45,0.3,0.2])]:
    y=sum(an*np.sin(2*np.pi*440*(n+1)*t) for n,an in enumerate(a))
    print(name, y.max(), y.min())
