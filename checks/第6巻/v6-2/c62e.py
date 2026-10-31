import math
def run(dt,n,mode):
    x=0.1;v=0;pts=[(x,v/4)]
    for i in range(n):
        a=-16*x
        if mode=='ord': x,v=x+v*dt,v+a*dt
        else: v=v+a*dt; x=x+v*dt
        pts.append((x,v/4))
    return pts
S=250 # mm per unit
o=run(0.02,157,'ord')
print("ORD", " ".join("(%.1f,%.1f)"%(S*a,S*b) for a,b in o[::3]))
s=run(0.02,157,'semi')
print("SEMI", " ".join("(%.1f,%.1f)"%(S*a,S*b) for a,b in s[::3]))
print(o[-1], math.hypot(*o[-1]))
