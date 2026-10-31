import math
def st(xs,ys):
    n=len(xs); mx=sum(xs)/n; my=sum(ys)/n
    c=sum((x-mx)*(y-my) for x,y in zip(xs,ys))/n
    sx=math.sqrt(sum((x-mx)**2 for x in xs)/n); sy=math.sqrt(sum((y-my)**2 for y in ys)/n)
    return dict(mx=mx,my=my,cov=round(c,4),sx=round(sx,4),sy=round(sy,4),r=round(c/sx/sy,4),a=round(c/sx**2,5),b=round(my-c/sx**2*mx,5))
h=[146,150,153,156,158,162,164,166,169,176]; t=[8.5,8.6,8.9,8.2,7.8,8.2,8.2,8.8,8.1,7.7]
print('main',st(h,t))
print('ex4',st([150,155,160,165,170],[22,23,25,24,26]))
print('ex5',st([150,155,160,165,170],[8.6,8.4,8.0,7.8,8.2]))
print('p3',st([1,2,3,4,5],[9,7,6,4,4]))
print('p7',st([1,2,3,4],[4,7,10,13]))
print('p8',st([1,2,3,4,5],[4,1,0,1,4]))
print('p9',st([1,2,3,4,5],[2,1,4,3,5]))
print('j4',st([2,4,6,8,10],[3,4,6,9,8]))
