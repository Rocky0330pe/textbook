import numpy as np
from scipy import signal
from scipy.integrate import solve_ivp
np.set_printoptions(precision=4, suppress=True)
print("== 9-7 Euler car A")
x,v=1.0,0.0; rows=[]
for k in range(11):
    a=-3*v-2*x; rows.append((round(k*0.1,1),round(x,4),round(v,4),round(a,4),round(2*np.exp(-k*0.1)-np.exp(-0.2*k),4))); x,v=x+v*0.1,v+a*0.1
for r in rows: print(r)
x,v=1.0,0.0
for k in range(100): a=-3*v-2*x; x,v=x+v*0.01,v+a*0.01
print("dt=0.01 x(1)=",round(x,4))
# euler points for graph
x,v=1.0,0.0; pts={}
for k in range(31):
    pts[round(k*0.1,1)]=round(x,4); a=-3*v-2*x; x,v=x+v*0.1,v+a*0.1
print([pts[k] for k in [1.1,1.2,1.5,2.0,2.4,3.0]])
print("== residues")
def res(num,den):
    r,p,k=signal.residue(num,den); return np.round(p,4), np.round(r,4), k
print(res([4],np.polymul([1,0],[1,3,3,5])))
print(res([2],np.polymul([1,0],[1,3,3,3])))
print(res([1],np.polymul([1,0],[1,3,3,2])))
# check ex13 y(0)
print("ex13 y0", 0.6667-0.1858-0.4808, " ch15", 0.5-0.1667-0.3333)
print("== RLC peak")
w=np.sqrt(1e8-1e6); tp=np.pi/w; print(w, tp*1e3, 10*(1+np.exp(-1000*tp)), np.exp(-np.pi*0.1/np.sqrt(0.99)))
print("== thermocouple lag", [round(1-np.exp(-t/30),3) for t in [30,60,150]], 5*(1-np.exp(-2)), 4*(1-np.exp(-1)))
# general verification via simulation of several ODE answers
def sim(a1,a0,f,x0,v0,T,ans):
    sol=solve_ivp(lambda t,y:[y[1],f(t)-a1*y[1]-a0*y[0]],[0,T],[x0,v0],rtol=1e-10,atol=1e-12,dense_output=True)
    ts=np.linspace(0,T,7); return np.max(np.abs(sol.sol(ts)[0]-ans(ts)))
cases=[
("ex2",4,3,lambda t:0,2,0,lambda t:3*np.exp(-t)-np.exp(-3*t)),
("j2",5,6,lambda t:0,1,0,lambda t:3*np.exp(-2*t)-2*np.exp(-3*t)),
("ex4",2,1,lambda t:0,1,1,lambda t:(1+2*t)*np.exp(-t)),
("j4",4,4,lambda t:0,1,0,lambda t:(1+2*t)*np.exp(-2*t)),
("ex6",4,13,lambda t:0,1,0,lambda t:np.exp(-2*t)*(np.cos(3*t)+2/3*np.sin(3*t))),
("j6",6,10,lambda t:0,1,0,lambda t:np.exp(-3*t)*(np.cos(t)+3*np.sin(t))),
("ex7",2,5,lambda t:5,0,0,lambda t:1-np.exp(-t)*(np.cos(2*t)+0.5*np.sin(2*t))),
("j7",4,13,lambda t:13,0,0,lambda t:1-np.exp(-2*t)*(np.cos(3*t)+2/3*np.sin(3*t))),
("ex8",2,2,lambda t:5*np.cos(t),0,0,lambda t:np.cos(t)+2*np.sin(t)-np.exp(-t)*(np.cos(t)+3*np.sin(t))),
("j8",4,5,lambda t:8*np.cos(t),0,0,lambda t:np.cos(t)+np.sin(t)-np.exp(-2*t)*(np.cos(t)+3*np.sin(t))),
("ex9",0,4,lambda t:np.cos(2*t),0,0,lambda t:t/4*np.sin(2*t)),
("j9",0,9,lambda t:6*np.cos(3*t),0,0,lambda t:t*np.sin(3*t)),
("6-13",2,5,lambda t:10*np.cos(t),0,0,lambda t:2*np.cos(t)+np.sin(t)-np.exp(-t)*(2*np.cos(2*t)+1.5*np.sin(2*t))),
("p2",6,8,lambda t:0,1,0,lambda t:2*np.exp(-2*t)-np.exp(-4*t)),
("p4",6,9,lambda t:0,1,0,lambda t:(1+3*t)*np.exp(-3*t)),
("p5",2,10,lambda t:0,1,0,lambda t:np.exp(-t)*(np.cos(3*t)+np.sin(3*t)/3)),
("p9",3,2,lambda t:0,0,2,lambda t:2*np.exp(-t)-2*np.exp(-2*t)),
("p10",2,10,lambda t:10,0,0,lambda t:1-np.exp(-t)*(np.cos(3*t)+np.sin(3*t)/3)),
("p11",2,3,lambda t:4*np.cos(t),0,0,lambda t:np.cos(t)+np.sin(t)-np.exp(-t)*(np.cos(np.sqrt(2)*t)+np.sqrt(2)*np.sin(np.sqrt(2)*t))),
("p12",0,16,lambda t:8*np.cos(4*t),0,0,lambda t:t*np.sin(4*t)),
("9-5p10",4,3,lambda t:0,2,0,lambda t:3*np.exp(-t)-np.exp(-3*t)),
("9-5j5",5,6,lambda t:0,1,0,lambda t:3*np.exp(-2*t)-2*np.exp(-3*t)),
]
for c in cases: print(c[0], "%.1e"%sim(*c[1:6],6,c[6]) if False else "%.1e"%sim(c[1],c[2],c[3],c[4],c[5],6,c[6]))
print("ex7 peak", 1+np.exp(-np.pi/2))
# thermocouple first-order ramp check
sol=solve_ivp(lambda t,y:[(t/30-y[0])/30],[0,60],[0],rtol=1e-10,atol=1e-12); print("tc y(60)",sol.y[0,-1], 60/30-1+np.exp(-2))
