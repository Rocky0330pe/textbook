import cmath, math
import numpy as np
P=print
P("=== 6-8")
z,w=3+4j,1-2j
P(z+w,z*w,z/w,(1+2j)**2, 5/(1+2j), (3+4j)/(1-2j), 2/1j, j10:=1j**10 if False else None)
P("j powers",[1j**n for n in (3,8,10,13,5,7,12,22,6,9,15,20)])
P("roots s^2+2s+5",np.roots([1,2,5]),"s^2+4s+13",np.roots([1,4,13]),"s^2-4s+13",np.roots([1,-4,13]))
P("x^2-10x+40",np.roots([1,-10,40]), (5+math.sqrt(15)*1j)*(5-math.sqrt(15)*1j))
P("Bombelli",(2+1j)**3, 4**3, 15*4+4)
P("jibun", (2+3j)*(1+1j),(3-1j)**2,1j*(4-3j),10/(3-1j),(1+3j)/(1+1j),3/1j, (2-5j)+(-1+3j),(2-5j)-(-1+3j),3*(2-5j)+2*(-1+3j))
P("problems",(1+3j)*(2-1j),(2+1j)**2,1j*(1-4j),5/(2+1j),(4+2j)/(1+1j),4/1j,np.roots([1,7,12]),np.roots([1,2,10]),np.roots([1,6,10]),np.roots([1,-4,5]),(5+2j)+(-2+1j),(5+2j)-(-2+1j),2*(5+2j)+3*(-2+1j))
P("=== 6-9")
def pol(z): return abs(z), math.degrees(cmath.phase(z))
for zz in [3+4j,-1+math.sqrt(3)*1j,-1-1j,-2j,5-12j,-math.sqrt(3)+1j,-2-2j,3j,-3+3j,1-math.sqrt(3)*1j,-4,-1+1j,1-1j]:
    P(zz, pol(zz))
P("table uzu",[ ( (1+1j)**n, pol((1+1j)**n)) for n in range(9)])
P("(1+j)(1+√3j)",(1+1j)*(1+math.sqrt(3)*1j), pol((1+1j)*(1+math.sqrt(3)*1j)))
P("(1+√3j)/(1+j)",(1+math.sqrt(3)*1j)/(1+1j))
P("rot 3+j 60",(3+1j)*cmath.exp(1j*math.pi/3))
def arm(L1,L2,t1,t2): return cmath.exp(1j*math.radians(t1))*(L1+L2*cmath.exp(1j*math.radians(t2)))
P("arm",arm(40,30,30,60),arm(40,30,60,30),arm(40,30,90,-90))
P("rot",(4+2j)*1j,(2+2j)*cmath.exp(1j*math.pi/6),(3-1j)*1j,(2-2j)*cmath.exp(1j*math.pi/3),(-2+4j)*cmath.exp(1j*math.pi/4),(5+1j)*1j)
P("pow",(1+1j)**6,(math.sqrt(3)+1j)**3,(1+math.sqrt(3)*1j)**3,(1+1j)**10,(-1+math.sqrt(3)*1j)**3,(1+math.sqrt(3)*1j)**6,(1+1j)**4)
z=2*cmath.exp(1j*math.radians(30)); P("z^2,3,6",z**2,z**3,z**6)
P("=== 6-10")
for n in [1,2,4,10,100,10000]:
    v=(1+1j/n)**n; P(n,v,abs(v),cmath.phase(v))
pts=[1+0j]
for k in range(10): pts.append(pts[-1]*(1+0.1j))
P("sheet",[ (round(p.real,4),round(p.imag,4)) for p in pts])
s=0; terms=[1,1j,-0.5,-1j/6,1/24,1j/120,-1/720]
acc=[]; 
for t in terms: s+=t; acc.append((round(s.real,4),round(s.imag,4)))
P("taylor",acc)
P("phasor",100+100*cmath.exp(1j*math.pi/3),pol(100+100*cmath.exp(1j*math.pi/3)),pol(100+100*cmath.exp(2j*math.pi/3)),pol(100+100*cmath.exp(-1j*math.pi/3)),pol(3+4j),pol(4+3j),pol(50+50j))
P("cap",2*math.pi*50*10e-6*100,2*3.14*60*20e-6*100,314*20e-6*100)
P("e^-pi/2",math.exp(-math.pi/2),math.exp(-math.pi/6),math.exp(-math.pi/4))
P("=== 6-11")
for x in [0.5,1,1.5,2,3]: P(x,math.cosh(x),math.sinh(x),math.tanh(x))
from scipy.optimize import brentq
a=brentq(lambda a:a*(math.cosh(10/a)-1)-15,1,50); P("necklace a",a,[round(a*(math.cosh(x/a)-1),2) for x in (2,4,6,8,10)],[0.15*x*x for x in (2,4,6,8)])
vt=math.sqrt(80*9.8/0.26); P("vt",vt,[vt*math.tanh(9.8*t/vt) for t in (1,2,3,5,10)])
v=0;dt=0.1;out={}
for i in range(1,101):
    v+= (9.8-0.26/80*v*v)*dt
    t=round(i*dt,6)
    if t in (1,2,3,5,10): out[t]=v
P("euler skydiver",out)
P("atanh 0.9",math.atanh(0.9),1.4722*vt/9.8, math.atanh(0.95),math.atanh(0.95)*vt/9.8, math.tanh(0.535),math.tanh(0.892),vt*math.tanh(9.8*5/vt))
vt2=math.sqrt(70*9.8/0.25);P("70kg",vt2,vt2*math.tanh(9.8*4/vt2))
P("catenary",50*(math.cosh(1)-1),100*math.sinh(1),50*(math.cosh(0.5)-1),27.154*0.25,625*(math.cosh(50/625)-1),500*(math.cosh(25/500)-1),100*(math.cosh(.5)-1),200*math.sinh(.5),20*(math.cosh(1)-1),40*math.sinh(1),40*(math.cosh(.5)-1),80*math.sinh(.5))
P("fin",40/math.cosh(1))
P("=== 6-12")
def semi(a_fn,x0,v0,dt,T):
    x,v=x0,v0; res={}
    n=int(round(T/dt))
    for i in range(1,n+1):
        a=a_fn(x,v); v=v+a*dt; x=x+v*dt
        t=round(i*dt,6)
        res[t]=x
    return res
for name,f in [("A",lambda x,v:-3*v-2*x),("B",lambda x,v:-2*v-5*x)]:
    r=semi(f,1,0,0.01,3); P(name,[round(r[t],3) for t in (0.5,1,2,3)])
    r=semi(f,1,0,0.001,3); P(name,"dt.001",[round(r[t],3) for t in (0.5,1,2,3)])
P("exact A",[round(2*math.exp(-t)-math.exp(-2*t),3) for t in (0.5,1,2,3)],"B",[round(math.exp(-t)*(math.cos(2*t)+0.5*math.sin(2*t)),3) for t in (0.5,1,2,3)])
P("eps table",[(math.exp(-2+e)-math.exp(-2-e))/(2*e) for e in (0.5,0.1,0.01)],math.exp(-2))
P("(1+2t)e-2t",[ (1+2*t)*math.exp(-2*t) for t in (0.5,1,2)])
P("c=10 roots",np.roots([1,20,16]))
# settling table
def resp(z,t,wn=4):
    if z<1:
        a=z*wn; wd=wn*math.sqrt(1-z*z); return math.exp(-a*t)*(math.cos(wd*t)+a/wd*math.sin(wd*t))
    if z==1: return (1+wn*t)*math.exp(-wn*t)
    r=np.roots([1,2*z*wn,wn*wn]); s1,s2=r; A=s2/(s2-s1); B=-s1/(s2-s1); return A*math.exp(s1*t)+B*math.exp(s2*t)
for z in [0.2,0.4,0.7,1,2.5]:
    ts=np.arange(0,10,0.0005); xs=np.array([resp(z,t) for t in ts])
    over=-xs.min() if xs.min()<0 else 0
    outside=np.where(abs(xs)>0.05)[0]; ts_settle=ts[outside[-1]+1] if len(outside) else 0
    P("zeta",z,"overshoot",round(over*100,1),"settle",round(ts_settle,2))
P("car ex", math.sqrt(30000/300), 1800/(2*math.sqrt(300*30000)), 2*math.pi/(10*math.sqrt(0.91)), math.exp(-3*2*math.pi/(10*math.sqrt(.91))))
P("RLC f",1e4*math.sqrt(.99)/(2*math.pi), 5e4*math.sqrt(.99)/(2*math.pi), 1e4*math.sqrt(.75)/(2*math.pi))
P("=== 6-13")
for w in [1,2,3,3.5,3.8,4,4.2,4.5,5,6,8]:
    P(w, round(0.8/math.sqrt((8-0.5*w*w)**2+(0.4*w)**2),3))
# half power width
from scipy.optimize import brentq as bq
amp=lambda w:1/math.sqrt((1-(w/4)**2)**2+(0.2*w/4)**2)
pk=max(amp(w) for w in np.arange(3,5,0.0001))
lo=bq(lambda w:amp(w)-pk/math.sqrt(2),3,3.96); hi=bq(lambda w:amp(w)-pk/math.sqrt(2),3.96,5)
P("halfpower",pk,lo,hi,hi-lo,4/(hi-lo))
for z in [0.05,0.1,0.2,0.5]: P("peak",z,math.sqrt(1-2*z*z),1/(2*z*math.sqrt(1-z*z)))
P("phase",math.degrees(math.atan2(0.8,6)),180-math.degrees(math.atan(3.2/24)))
P("trans",math.sqrt(1+.16)/math.sqrt(9+.16),math.sqrt(1+.36)/math.sqrt(64+.36))
P("AM",1/((2*math.pi*1e6)**2*200e-6),1/((2*math.pi*531e3)**2*200e-6),1/((2*math.pi*1602e3)**2*200e-6),1/((2*math.pi*8e5)**2*250e-6),1/((2*math.pi*6e5)**2*200e-6))
def I(f,L=0.01,C=1e-6,R=20,V=1): w=2*math.pi*f; return V/math.sqrt(R*R+(w*L-1/(w*C))**2)
P("I",I(1000),I(2000),I(1/(2*math.pi*1e-4)))
P("f",1/(2*math.pi*2e-5),1/(2*math.pi*1e-5),1/(2*math.pi*math.sqrt(4e-9)))
# forced sim with semi-implicit check amplitude at w=2 after
P("pend",2*math.pi*math.sqrt(0.3/9.8))
P("=== 6-14")
for dt in (1,0.5,0.1):
    h1,h2=20,0
    for i in range(int(round(10/dt))):
        d=h1-h2; h1,h2=h1-0.1*d*dt,h2+0.1*d*dt
    P("h1@10",dt,h1)
P("exact",10+10*math.exp(-2))
x1,x2,v1,v2=0.1,0,0,0;dt=0.01
rows=[]
for i in range(2):
    a1=-110*x1+10*x2;a2=10*x1-110*x2
    v1+=a1*dt;v2+=a2*dt;x1+=v1*dt;x2+=v2*dt
    rows.append((x1,x2,v1,v2,-110*x1+10*x2,10*x1-110*x2))
P(rows)
P("modes",math.sqrt(120),(math.sqrt(120)-10)/2,math.pi/2/((math.sqrt(120)-10)/2))
P("table hatena",[round(10+10*math.exp(-0.2*t),1) for t in (1,2,3,4,5,6,8)])
P("TC",math.log(0.11533/0.010512)/(0.11533-0.010512), math.log(2)/66, math.log(2)/6.01)
# lorenz divergence
def lor(s,dt=0.001):
    x,y,z=s
    return np.array([10*(y-x), x*(28-z)-y, x*y-8/3*z])
def rk4(s,dt):
    k1=lor(s);k2=lor(s+dt/2*k1);k3=lor(s+dt/2*k2);k4=lor(s+dt*k3);return s+dt/6*(k1+2*k2+2*k3+k4)
a=np.array([1.,1.,1.]);b=np.array([1.,1.001,1.]);dt=0.001
for i in range(30001):
    if abs(a[0]-b[0])>5: P("diverge t",i*dt);break
    a=rk4(a,dt);b=rk4(b,dt)
P("=== 6-15")
P(1155/60, 2*math.pi/(1e4*math.sqrt(.99))*1000, 6-6*math.exp(-3))
