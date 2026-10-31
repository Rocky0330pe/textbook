from math import *
r=10
for n in [4,8,16,32,64,128]:
    print('sect',n, n/2*r*r*sin(2*pi/n), r*cos(pi/n), n/2*2*r*sin(pi/n)/2)
print('pi r2',pi*100)
# grid counting circle r=10, grid size g: count squares fully inside, and squares touching
def cnt(g):
    N=int(round(10/g)); full=0; part=0
    for i in range(-N,N):
        for j in range(-N,N):
            x0,x1=i*g,(i+1)*g; y0,y1=j*g,(j+1)*g
            # farthest corner
            fx=max(abs(x0),abs(x1)); fy=max(abs(y0),abs(y1))
            nx=0 if x0<=0<=x1 else min(abs(x0),abs(x1)); ny=0 if y0<=0<=y1 else min(abs(y0),abs(y1))
            if fx*fx+fy*fy<=100+1e-9: full+=1
            elif nx*nx+ny*ny<100-1e-9: part+=1
    return full*g*g,(full+part)*g*g,full,part
for g in [2,1,0.5,0.25,0.1]:
    print('grid',g,cnt(g))
# pyramid staircase: n layers, layer k (k=1..n) square side a*k/n, thickness h/n, ratio to a^2 h
for n in [5,10,100,1000]:
    s=sum((k/n)**2 for k in range(1,n+1))/n
    s2=sum(((k-1)/n)**2 for k in range(1,n+1))/n
    print('pyr',n,s,s2)
# sphere checks
r=10;y=6
print('slice',pi*(r*r-y*y), pi*r*r-pi*y*y, sqrt(r*r-y*y))
print('V',4/3*pi*1000,'S',4*pi*100)
# examples
P=3.14
print('ex4', 36*P, 6*P, 25*P, 20*P)
print('ex5', 3*4/2*10, 90*P, 6*5/2*8, 20*P)
print('ex6', 36*10/3, 12*P, 25*6/3, 60*P, 1/3*36*5)
print('ex7 r6', 4/3*216, 288*P, 144*P, 'r10', 4000/3*P, 400*P)
print('ex8', 18+30, 48*P, 24*P, 'jib', 8+24, 32*P, sqrt(25+144), 65+25, 90*P)
print('ex9', 1.5*P, 1.5*P*1000, 60*30*36, 'jib',0.5*P*1000, 2*P*1000/4)
print('rot', 36*P, 96*P, 20*P, 12*P)
print('prob', 16*P, 12*P, 200*P, 75*P, 500/3*P, 100*P, 96*P, 80*40*45, 100*P, 90*P, 4500*P, 900*P)
print('quad',10*3/2+10*5/2, 12*4/2+12*2/2, 14*5/2+14*3/2)
# pipe flow
A=pi*(0.013/2)**2; Q=A*2
print('pipe',A, A*1e6, Q, Q*1000, Q*1000*60)
A=pi*5**2; print('bolt',A, 10000/A)
rr=(3/(4*pi))**(1/3); print('sphere vs cube', rr, 4*pi*rr*rr)
print('gas', 4/3*pi*15**3, 4*pi*225)
print('tank', pi*1*1*3, pi*3*1000)
print('cone net angle', 360*3/5)
print('yatte', pi*5, pi*25)
