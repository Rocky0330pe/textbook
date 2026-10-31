from math import *
# euler dt=1 vs exact at 5,10,20
y=80;vals={}
for n in range(31):
    vals[n]=y; y=y-0.05*(y-20)
for t in (0,5,10,20,30): print(t, round(vals[t],2), round(20+60*exp(-0.05*t),2))
print(0.95**5, exp(-0.25))
# cup thermal
print(4.2*250, 1200/1050)
# chapter-end
print("e1",log(2)/0.1, 25+60*exp(-1))
print("e3",15*log(2), 26-20*exp(-1))
print("e4",50e3*20e-6, 9*exp(-2), log(2))
print("e5",2e3*500e-6, 6*(1-exp(-3)), 6/2e3)
print("e6",0.5/50,10/50,0.2*(1-exp(-1)))
print("e8",15+100*0.1, 2.5e5*0.1/3600, 15+10*(1-exp(-1)))
print("e9",20/log(4))
print("e10",exp(-1.5),1.5*exp(-1.5))
# poisson table lam t =3
for k in range(9): print(k, round(3**k/factorial(k)*exp(-3),4))
# binomial approx n slots
for n in (10,100,1000):
    p=3/n; print(n, (1-p)**n, n*p*(1-p)**(n-1))
# bortkiewicz
m=122/200
print([round(200*m**k/factorial(k)*exp(-m),1) for k in range(5)])
