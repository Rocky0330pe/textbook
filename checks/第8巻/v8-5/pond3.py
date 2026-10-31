import numpy as np
Q=4.0
S=np.array([1.5,2.5]); K=np.array([4.5,1.5])
def v(x,y):
    p=np.array([x,y]); a=p-S; b=p-K
    return Q/(2*np.pi)*(a/(a@a) - b/(b@b))
lines=[]
for j in range(5):
    for i in range(7):
        vv=v(i,j); s=np.linalg.norm(vv)
        L=0.56*s**0.5
        d=vv/s*L
        lines.append(r"  \draw[kviiij pond] (%.3f,%.3f) -- ++(%.3f,%.3f);"%(i-d[0]/2,j-d[1]/2,d[0],d[1]))
print('\n'.join(lines))
print(min(np.linalg.norm(v(i,j)) for i in range(7) for j in range(5)), max(np.linalg.norm(v(i,j)) for i in range(7) for j in range(5)))
