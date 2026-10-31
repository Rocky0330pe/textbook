from statistics import mean, pstdev
import math
def stats(x,y):
    mx,my=mean(x),mean(y)
    cov=sum((a-mx)*(b-my) for a,b in zip(x,y))/len(x)
    sx,sy=pstdev(x),pstdev(y)
    return mx,my,cov,sx,sy,cov/(sx*sy)
H=[148,152,155,157,160,161,163,166,168,172]
T=[8.9,8.2,8.8,8.1,8.6,7.9,8.4,7.6,8.3,7.7]
print('class',stats(H,T))
x=[150,155,160,165,170]; y=[22,23,25,24,26]
print('foot',stats(x,y))
y2=[8.6,8.4,8.0,7.8,8.2]
print('run5',stats(x,y2))
H=[147,151,154,156,158,161,163,165,168,177]
T=[8.8,8.1,8.9,8.3,8.7,7.8,8.5,8.6,7.6,7.7]
print('class2',stats(H,T), sum(H), sum(T))
