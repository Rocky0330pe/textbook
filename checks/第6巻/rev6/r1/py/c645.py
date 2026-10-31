import math
e=math.exp
# 6-4 Bortkiewicz
m=0.61
print([round(200*e(-m)*m**k/math.factorial(k),1) for k in range(5)])
print([round(e(-3)*3**k/math.factorial(k),4) for k in range(9)])
for n in [10,100,1000]:
    p=3/n; print(n,(1-p)**n, n*p*(1-p)**(n-1))
print("thermal R",1200/1050, 60/(1200/1050))
print("hatena",20*math.log(2), 10*math.log(3), 20*math.log(4), 12/math.log(4),30/math.log(4),20/math.log(4))
# 6-5 skydiver
v=0;row=[]
for i in range(11):
    a=9.8-0.00325*v*v; row.append((i,round(v,2),round(a,2))); v=v+a
print(row)
vt=math.sqrt(80*9.8/0.26); print("vt",vt, vt*3.6)
def eu(dt,T):
    v=0
    for i in range(round(T/dt)): v+=(9.8-0.00325*v*v)*dt
    return v
print([round(eu(0.1,T),2) for T in [1,2,3,5,10]])
print([round(vt*math.tanh(9.8*T/vt),2) for T in [1,2,3,5,10]])
# raindrop
mm=1000*4/3*math.pi*0.001**3; print("m",mm, math.sqrt(4.2e-6*9.8/9.7e-7))
print("stokes",9*1.8e-5/(2*1000*1e-10))
for d,vv in [(0.02,0.012),(0.2,0.7),(1,4.0),(2,6.5),(5,9.1)]: print(d,1000/vv/60,"min",1000/vv/3600,"h")
print(math.sqrt(2*9.8*1000), math.sqrt(2*9.8*1000)*3.6)
# filter positions: assume quadratic drag reach terminal
for vt_ in [1.06,2.05]:
    k=9.8/vt_**2
    xs=[vt_**2/9.8*math.log(math.cosh(9.8*t/vt_)) for t in [0,0.2,0.3,0.4,0.5,0.6]]
    print(vt_,[round(x,3) for x in xs])
