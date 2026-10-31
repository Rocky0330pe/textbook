from statistics import mean, pstdev
import math, random
def stats(x,y):
    mx,my=mean(x),mean(y)
    cov=sum((a-mx)*(b-my) for a,b in zip(x,y))/len(x)
    sx,sy=pstdev(x),pstdev(y)
    return dict(mx=mx,my=my,cov=cov,sx=sx,sy=sy,vx=sx*sx,vy=sy*sy,r=cov/(sx*sy))
H=[147,151,154,156,158,161,163,165,168,177]
T=[8.8,8.1,8.9,8.3,8.7,7.8,8.5,8.6,7.6,7.7]
s=stats(H,T);print(s)
print([round(h-160,1) for h in H],[round(t-8.3,2) for t in T],[round((h-160)*(t-8.3),2) for h,t in zip(H,T)])
# quadrant counts
q={'RU':0,'LD':0,'LU':0,'RD':0}
for h,t in zip(H,T):
    if h>160 and t>8.3: q['RU']+=1
    elif h<160 and t<8.3: q['LD']+=1
    elif h<160 and t>8.3: q['LU']+=1
    elif h>160 and t<8.3: q['RD']+=1
print(q)
# temps hot drinks
x=[5,8,12,15,20,25]; y=[48,41,35,30,22,12]; print('hot',stats(x,y))
x=[18,22,25,28,30,33]; y=[12,20,26,31,40,44]; print('ice',stats(x,y))
# jibun2/3
x=[2,4,6,8,10]; y=[3,4,6,9,8]; print('j',stats(x,y))
# outlier
x=[1,2,3,4,5]; y=[3,1,4,2,3]; print('noc',stats(x,y))
print('noc+out',stats(x+[12],y+[12]))
x=[-2,-1,0,1,2]; y=[v*v for v in x]; print('para',stats(x,y))
