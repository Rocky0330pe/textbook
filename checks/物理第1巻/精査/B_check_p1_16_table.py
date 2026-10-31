# 力-16 ③の表を、k の値（648000 と 正確な値）で比べる
m=1000; v0=55/3.6
for k in (648000, m*v0**2/0.36):
    x,v,a=0.0,v0,0.0; print("k=",round(k))
    for n in range(8):
        print(" ", round(n*0.01,2), f"{x:.4f}", f"{v:.3f}", f"{a:.1f}")
        x,v = x+v*0.01, v+a*0.01
        a=-k*x/m
