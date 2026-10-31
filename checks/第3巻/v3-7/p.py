from fractions import Fraction as F
import math, statistics as st
# 30 measurements of 10 swings (s)
P=[14.38,14.12,14.26,14.31,14.18, 14.07,14.22,14.15,14.29,14.21,
   14.13,14.24,13.96,14.19,14.27, 14.10,14.33,14.17,14.23,14.05,
   14.16,14.25,14.20,14.11,14.28, 14.02,14.19,14.42,14.14,14.18]
print(len(P), round(sum(P),2), round(sum(P)/len(P),4))
m=sum(P)/len(P)
for k in [1,3,5,10,20,30]:
    print(k, round(sum(P[:k])/k,4))
s=math.sqrt(sum((x-m)**2 for x in P)/len(P)); print('sigma',s)
print('in m±s', sum(1 for x in P if m-s<=x<=m+s))
bins=[13.9+0.1*i for i in range(7)]
fr=[sum(1 for x in P if round(bins[i],2)<=x<round(bins[i+1],2)) for i in range(6)]
print(fr)
print(sorted(P))
print('median', st.median(P), 'range', max(P)-min(P))
