# 力-10 手でわかる③④ の表（本棚の板 L=0.8 m、w=367.5 N/m、EI=850.5 N·m²）
g=9.8; L=0.8; w=30*g/L; EI=7e9*0.25*0.018**3/12
RA=w*L/2
print("EI",EI,"RA",RA)
print("③ x, wdx, Q(区間の右はし直後?), M")
dx=0.1
Q=RA; M=0
rows=[]
for i in range(9):
    x=i*dx
    Qx=RA-w*x
    Mx=RA*x-w*x*x/2
    print(f"{x:.1f}  Q={Qx:7.2f}  M={Mx:6.2f}")
# 区間ごとの足し算：M_{i+1}=M_i+(Q_i+Q_{i+1})/2*dx
M=0
for i in range(8):
    x0=i*dx; x1=x0+dx
    Qm=RA-w*(x0+x1)/2
    M+=Qm*dx
    print(f"区間{i+1} Qmid={Qm:7.3f} M({x1:.1f})={M:7.3f}")
print("④ 中央から右へ ds=0.05")
ds=0.05
s=0; th=0; up=0
def Mof(x): return RA*x-w*x*x/2
k_prev=Mof(0.4)/EI
print(f"s=0.00 M={Mof(0.4):.3f} k={k_prev*1000:.3f}e-3 th=0 up=0")
for i in range(8):
    s1=(i+1)*ds
    k1=Mof(0.4+s1)/EI
    th_new=th+(k_prev+k1)/2*ds
    up+= (th+th_new)/2*ds
    th=th_new; k_prev=k1
    print(f"s={s1:.2f} M={Mof(0.4+s1):.3f} k={k1*1000:.3f}e-3 th={th*1000:.3f}mm/m up={up*1000:.4f}mm")
print("exact", 5*w*L**4/(384*EI)*1000, "slope end exact", w*L**3/(24*EI)*1000)
# Python 版：区間を1000に
n=1000; ds=0.4/n; th=0; up=0; kp=Mof(0.4)/EI
for i in range(n):
    s1=(i+1)*ds; k1=Mof(0.4+s1)/EI
    tn=th+(kp+k1)/2*ds; up+=(th+tn)/2*ds; th=tn; kp=k1
print("n=1000", up*1000)
# 左はしから「仮の傾き0」で出発→直線で直す
n=8; dx=0.1; th=0; y=0; kp=Mof(0)/EI; ys=[0]
for i in range(n):
    x1=(i+1)*dx; k1=Mof(x1)/EI
    tn=th-(kp+k1)/2*dx   # y 下向き正: y''=-M/EI
    y+=(th+tn)/2*dx; th=tn; kp=k1; ys.append(y)
c=ys[-1]
print("仮のy:",[round(v*1000,3) for v in ys])
print("直したy:",[round((v-c*i/n)*1000,3) for i,v in enumerate(ys)])
