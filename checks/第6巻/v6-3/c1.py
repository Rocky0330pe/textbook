from math import *
T=lambda t:20+60*exp(-0.05*t)
print("cool", [round(T(t),2) for t in range(0,35,5)])
print("t50", log(2)/0.05, "t35", log(2)/0.05)
# euler dt=1 table
y=80
for n in range(11):
    if n in (0,1,2,3,10): print(n,round(y,3))
    y=y+(-0.05*(y-20))*1
# yattemiyou data noisy
d=[80.0,66.8,56.3,48.4,42.0,37.3,33.3]
diff=[x-20 for x in d]
print([round(diff[i+1]/diff[i],3) for i in range(6)], exp(-0.25))
print("log10 diff",[round(log10(x),3) for x in diff])
for k in range(1,6): print(k, round(exp(-k),4), round(1-exp(-k),4))
print("ln2",log(2),"ln3",log(3),"ln4",log(4))
# warming example
print("warm", 10*log(3), 20*log(4), 20*log(2))
# jibun1
print("j1",log(2)/0.04)
# soldering iron
P=20;R=18;C=5;tau=C*R; print("iron",tau, 20+P*R, 20+P*R*(1-exp(-2)), 20+P*R*(1-exp(-3)))
# cpu
P=50;R=0.8;C=100;tau=C*R; print("cpu",tau,25+P*R,25+P*R*(1-exp(-2)))
# thermometer
print("thermo", log(115), 60*log(115)/60)
# RC
print("RC", 20e3*100e-6, 10*exp(-1), 2*log(2), 10/20e3)
print("RCj", 10e3*470e-6, 12*exp(-1), 4.7*log(2))
print("charge", 10*(1-exp(-3)),10*(1-exp(-5)))
print("chargej", 5*(1-exp(-3)), 5/1000)
print("RL",0.2/400,12/400, 30*(1-exp(-2)))
print("RLj",0.1/20,6/20,0.3*(1-exp(-1)))
print("tau from data", 12/log(4), 30/log(4), 7/log(2))
lam=0.3; print("pois", exp(-3), 3*exp(-3), 1/lam, exp(-1.5), 9/2*exp(-3))
print("poisj", exp(-2), 2*exp(-2), exp(-1), 2*exp(-2))
