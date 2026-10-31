import math
f=lambda T: -0.05*(T-20)
T=80; out=[T]
for i in range(10):
    T=T+f(T)*1; out.append(T)
print('euler1', [round(x,4) for x in out])
ex=lambda t:20+60*math.exp(-0.05*t)
print('exact', [round(ex(t),2) for t in range(0,11,2)], ex(10))
# yattemiyou 2-min measurements
ts=list(range(0,11,2)); Ts=[round(ex(t),1) for t in ts]
print(Ts)
for i in range(len(ts)-1):
    sp=(Ts[i]-Ts[i+1])/2; dm=((Ts[i]-20)+(Ts[i+1]-20))/2
    print(ts[i],ts[i+1], 'speed',round(sp,3),'meandiff',round(dm,2),'ratio',round(sp/dm,4))
# slopes
for T in [90,80,70,60,50,40,30,20,10,0]: print(T,f(T))
# wrong sign
T=80; o=[T]
for i in range(5): T=T+0.05*(T-20); o.append(round(T,3))
print('wrong',o)
print('T(t)=50 time', math.log(2)/0.05)
for t in [0,10,20,30,40,60]: print(t, round(ex(t),2), 'slope exact', round(-3*math.exp(-0.05*t),3))
