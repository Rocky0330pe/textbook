from math import *
print("== tanks equal, rule 0.1, h1=20,h2=0, dt=1")
h1,h2=20.0,0.0
for n in range(11):
    ex1=10+10*exp(-0.2*n)
    print(n, round(h1,3), round(h2,3), "sum",round(h1+h2,3),"exact",round(ex1,3),round(20-ex1,3))
    d=h1-h2; h1,h2=h1-0.1*d, h2+0.1*d
print("dt=0.5 at t=10:")
for dt in [1,0.5,0.1]:
    h1,h2=20.0,0.0
    for n in range(int(round(10/dt))):
        d=h1-h2; h1,h2=h1-0.1*d*dt, h2+0.1*d*dt
    print(dt, round(h1,4), round(h2,4))
print("wrong order (GS):")
h1,h2=20.0,0.0
for n in range(4):
    print(n, round(h1,3), round(h2,3), round(h1+h2,3))
    h1=h1-0.1*(h1-h2); h2=h2+0.1*(h1-h2)
print("half time",5*log(2))
print("== unequal tanks A1=100,A2=300, k=10")
for t in [0,2,5,7.5,10,15,20]:
    print(t, round(5+15*exp(-t/7.5),3), round(5-5*exp(-t/7.5),3))
print("== Ex1: 0.2, h=30,10, dt 0.5")
h1,h2=30.,10.
for n in range(3):
    print(n,h1,h2); d=h1-h2; h1,h2=h1-0.2*d*0.5,h2+0.2*d*0.5
print("jibun1: 0.1, 25,5, dt1")
h1,h2=25.,5.
for n in range(3):
    print(n,h1,h2); d=h1-h2; h1,h2=h1-0.1*d,h2+0.1*d
print("prob1: 0.3, 50,10, dt .5")
h1,h2=50.,10.
for n in range(3):
    print(n,round(h1,4),round(h2,4)); d=h1-h2; h1,h2=h1-0.3*d*0.5,h2+0.3*d*0.5
print("== Ex2 spring 2nd->1st: a=-16x-0.8v, x=.1,v=0,dt=.1")
x,v=0.1,0.
for n in range(3):
    a=-16*x-0.8*v; print(n,round(x,5),round(v,5),round(a,5)); v=v+a*0.1; x=x+v*0.1
print("jibun2 a=-9x-0.2v x=.2")
x,v=0.2,0.
for n in range(3):
    a=-9*x-0.2*v; print(n,round(x,5),round(v,5),round(a,5)); v=v+a*0.1; x=x+v*0.1
print("prob2 a=-25x-0.5v x=.1")
x,v=0.1,0.
for n in range(3):
    a=-25*x-0.5*v; print(n,round(x,5),round(v,5),round(a,5)); v=v+a*0.1; x=x+v*0.1
print("== Ex3: 0.2, 30,10:", "D half t", log(2)/0.4, "h1(5)",20+10*exp(-2))
print("jibun3: 0.05, 40,0:", 10*log(2), 20+20*exp(-1))
print("prob3: 0.1, 12,4:", 5*log(2), "h1(5)", 8+4*exp(-1))
print("== heat ex4: C1=840@80,C2=2520@20,R=.5")
C1,C2,R=840,2520,0.5
Tinf=(C1*80+C2*20)/(C1+C2); tau=R*C1*C2/(C1+C2); print(Tinf,tau, Tinf+45*exp(-1), Tinf-15*exp(-1))
print("jibun4: C1=420@90, C2=1260@10, R=1")
C1,C2,R=420,1260,1
Tinf=(C1*90+C2*10)/(C1+C2); tau=R*C1*C2/(C1+C2); print(Tinf,tau, Tinf+60*exp(-1), Tinf-20*exp(-1))
print("prob5: C1=840@60, C2=1680@15, R=.5")
C1,C2,R=840,1680,0.5
Tinf=(C1*60+C2*15)/(C1+C2); tau=R*C1*C2/(C1+C2); print(Tinf,tau, Tinf+30*exp(-1), Tinf-15*exp(-1))
print("== caps text: 100u@10, 100u@0, 20k:", 20e3*50e-6)
print("ex5: 100u@10, 400u@0, 10k:", (100*10)/500, 10e3*80e-6, 2+8*exp(-1), 2-2*exp(-1))
print("jibun5: 200u@9, 100u@0, 15k:", 1800/300, 15e3*(200*100/300)*1e-6, 6+3*exp(-1), 6-6*exp(-1))
print("prob7: 100u@6, 50u@0, 30k:", 600/150, 30e3*(100*50/150)*1e-6)
print("energy text: before",0.5*100e-6*100,"after",2*0.5*100e-6*25)
print("== modes")
print("k=100,K=100,m=1:", sqrt(100), sqrt(300), 2*pi/10, 2*pi/sqrt(300))
print("k=100,K=10:", sqrt(120), (sqrt(120)-10)/2, pi/(sqrt(120)-10), 2*pi/(sqrt(120)-10))
print("ex6 m=2,k=200,K=100:", sqrt(100), sqrt(200), 2*pi/10, 2*pi/sqrt(200))
print("jibun6 m=1,k=16,K=10:", sqrt(16), sqrt(36), 2*pi/4, 2*pi/6)
print("prob4 m=.5,k=50,K=25:", sqrt(100), sqrt(200))
print("== cascade ex7 tau4 h0=40: hmax", 40/e, " h2(2)",10*2*exp(-.5)," h2(8)",80*exp(-2))
print("jibun7 tau2 h0=30:", 30/e)
print("prob6 tau5 h0=50:", 50/e)
print("== parent ex8: tmax",2*log(2), "N2max",1000*(0.5-0.25), "N2(1)",1000*(exp(-.5)-exp(-1)), "N2(4)", 1000*(exp(-2)-exp(-4)))
print("jibun8: B max 100 at", 2*log(2))
print("prob8: 450(e^-1-e^-3)=",450*(exp(-1)-exp(-3)), "tmax", 1.5*log(3), 450*(3**-0.5-3**-1.5))
print("== Mo/Tc tmax", log((log(2)/6.01)/(log(2)/65.94))/((log(2)/6.01)-(log(2)/65.94)))
print("== 2stage RC roots", (-3+sqrt(5))/2, (-3-sqrt(5))/2)
