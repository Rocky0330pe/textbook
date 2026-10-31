import math
g=9.8; rho=1.2; nu=1.5e-5; mu=1.8e-5
def morrison(Re):
    return (24/Re + 2.6*(Re/5)/(1+(Re/5)**1.52) + 0.411*(Re/2.63e5)**-7.94/(1+(Re/2.63e5)**-8)+ 0.25*(Re/1e6)/(1+Re/1e6))
# 例題4 くり返し表（グラフから読む C_D を2けたに丸める）
d=2e-3; K=4*1000*g*d/(3*rho)
v=6.0
print('K=',K)
for i in range(3):
    Re=v*d/nu; cd=round(morrison(Re),2); vn=math.sqrt(K/cd); print(i+1, round(v,2), round(Re), cd, round(vn,2)); v=vn
# シミュレーション C_D=0.5
m=1000*math.pi*d**3/6; A=math.pi*d**2/4; c=0.5*rho*0.5*A
print('m',m,'A',A,'c',c,'c/m',c/m, 'vt', math.sqrt(m*g/c))
v=0;t=0;dt=0.1
for i in range(15):
    v=v+(g-c/m*v*v)*dt; t+=dt
    print(round(t,1), round(v,2))
# 例題1 (2) 水中の模型 F_m=1130 N
vp=100/3.6; Lp=4.5; vm=vp*10*1.0e-6/1.5e-5; Lm=0.45
for Fm in (1130,):
    Fp=Fm*(1.2*vp**2*Lp**2)/(1000*vm**2*Lm**2); print('vm',vm,'Fp',Fp)
# 逆にCD0.3, A=2.2 の本物 305.6N から模型の力
Fp=305.6; print('Fm for 305.6:', Fp*(1000*vm**2*Lm**2)/(1.2*vp**2*Lp**2))
# 例題12: vt=6.6, v=3.3
print(g*(1-0.25))
# 章末: 
print('ship 1/20, 8 m/s ->', 8/math.sqrt(20))
print('car 80 km/h C_D 0.3 A 2.2:', 0.5*1.2*0.3*2.2*(80/3.6)**2, 0.5*1.2*0.3*2.2*(80/3.6)**3)
print('tennis ball d=0.067 v=30 Re', 30*0.067/nu)
print('fan 90%', 0.9**3)
print('wire d=20 mm v=15 f', 0.2*15/0.02)
print('small plane 1200 kg S=16 v=35:', 2*1200*9.8/(1.2*16*35**2))
print('ship model 1/50, real 15 m/s:', 15/math.sqrt(50))
print('Stokes CD 24/Re check:', 'F=6pi mu r v -> CD=F/(0.5 rho v^2 pi r^2)=12 mu/(rho v r)=24/Re')
print('ex10 jibun', 5*0.3/math.sqrt(5*0.3/nu)*1000, 5*0.3/nu)
# fall time t from h, g: t = sqrt(2h/g), h=4.9 -> 1 s
print('mist 5um', (1000*4/3*math.pi*(5e-6)**3)*g/(6*math.pi*mu*5e-6))
print('C_L vs alpha: 0.1/deg; stall')
print('golf Re 70 m/s', 70*0.0427/nu, ' 30 m/s', 30*0.0427/nu)
print('sphere CD Re 1e4..2e5 approx', morrison(1e4), morrison(1e5))
# 平板の摩擦 vs 圧力：省略
# 模型の電線 St: 
print('wave lambda 10 ->', math.sqrt(g*10/(2*math.pi)), 'lambda 40 ->', math.sqrt(g*40/(2*math.pi)))
