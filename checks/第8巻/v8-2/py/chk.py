import numpy as np, math
rng=np.random.default_rng(1)
def d1(f,p,i,h=1e-6):
    p=np.array(p,float); e=np.zeros_like(p); e[i]=h
    return (f(*(p+e))-f(*(p-e)))/(2*h)
def d2(f,p,i,j,h=1e-4):
    return d1(lambda *q: d1(f,q,j,h), p, i, h)
def check(name,f,parts,second=None,n=2):
    ok=True
    for _ in range(5):
        p=rng.uniform(0.3,1.7,n)
        for i,g in enumerate(parts):
            if abs(d1(f,p,i)-g(*p))>1e-5*max(1,abs(g(*p))): ok=False; print("NG",name,i,p,d1(f,p,i),g(*p))
        if second:
            for (i,j),g in second.items():
                if abs(d2(f,p,i,j)-g(*p))>1e-3*max(1,abs(g(*p))): ok=False; print("NG2",name,i,j,p,d2(f,p,i,j),g(*p))
    print(name,"OK" if ok else "NG")
