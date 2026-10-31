import numpy as np
h=lambda x,y:100-0.01*x**2-0.02*y**2
print("h(30,20)",h(30,20))
for d in [1,0.1,0.01,0.001]:
    print(d,"east fwd",(h(30+d,20)-h(30,20))/d,"north fwd",(h(30,20+d)-h(30,20))/d,"central",(h(30+d,20)-h(30-d,20))/(2*d),(h(30,20+d)-h(30,20-d))/(2*d))
# contour crossings along y=20 and x=30
import math
for c in [95,90,85,80,75,70]:
    xs=92-c; ys=91-c
    print(c, "x on y=20:", math.sqrt(xs/0.01) if xs>0 else None, " y on x=30:", math.sqrt(ys/0.02) if ys>0 else None)
# table grid around
xs=[28,29,30,31,32]; ys=[22,21,20,19,18]
for y in ys: print(y,[round(h(x,y),2) for x in xs])
print("east diffs row20",[round(h(x+1,20)-h(x,20),2) for x in xs[:-1]])
print("north diffs col30",[round(h(30,y+1)-h(30,y),2) for y in [18,19,20,21]])
# example1 point (40,10)
print("ex1", h(40,10), h(41,10)-h(40,10), h(40,11)-h(40,10), h(39,10), h(40,9))
# with step 0.1 table for ex1
for p in [(40,10),(10,30),(-20,10),(20,-10),(50,-20)]:
    x,y=p; print(p,"h",h(x,y),"dx",-0.02*x,"dy",-0.04*y)
