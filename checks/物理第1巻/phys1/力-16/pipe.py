import numpy as np
from math import pi
# 円管の層流を、輪に分けて解く（力-14 のつり合いを、輪ごとに書く）。単位をそろえて R=1, mu=1, dp/L=4 → 答え u=1-r^2
for N in [1,2,4,8]:
    dr=1/N; K=np.zeros((N,N)); b=np.zeros(N)
    for i in range(N):
        ri=i*dr; ro=(i+1)*dr; rc=(i+0.5)*dr
        b[i]=4*pi*(ro**2-ri**2)          # 押す力（圧力差×輪の面積）
        if i>0:                           # 内側の面のねばり
            K[i,i]+=2*pi*ri/dr; K[i,i-1]-=2*pi*ri/dr
        if i<N-1:
            K[i,i]+=2*pi*ro/dr; K[i,i+1]-=2*pi*ro/dr
        else:                             # 壁（速さ0）は dr/2 先
            K[i,i]+=2*pi*ro/(dr/2)
    u=np.linalg.solve(K,b)
    rc=(np.arange(N)+0.5)*dr
    Q=sum(u[i]*pi*(((i+1)*dr)**2-(i*dr)**2) for i in range(N))
    print(N, np.round(u,4), "exact", np.round(1-rc**2,4), "Q",round(Q,4),"exactQ",round(pi/2,4), "err%", round((Q-pi/2)/(pi/2)*100,2))
