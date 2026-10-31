import math
sx,sy=1.8,0.7   # mm per minute, mm per degC
L=4.2
segs=[]
for i in range(0,11):
    t=6*i
    for T in range(0,91,10):
        s=-0.05*(T-20)
        dx,dy=sx*1,sy*s
        n=math.hypot(dx,dy); dx,dy=dx/n*L/2,dy/n*L/2
        x,y=t*sx,T*sy
        segs.append("(%.2f,%.2f)--(%.2f,%.2f)"%(x-dx,y-dy,x+dx,y+dy))
print(' '.join(segs))
def curve(T0):
    pts=[]
    for k in range(0,61):
        t=k; T=20+(T0-20)*math.exp(-0.05*t)
        pts.append("(%.2f,%.2f)"%(t*sx,T*sy))
    return ' -- '.join(pts)
for T0 in (80,50,10): print(T0, curve(T0))
