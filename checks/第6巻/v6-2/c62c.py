T=80.0; dt=0.1
for i in range(100):
    T=T+(-0.05*(T-20))*dt
print(T)
T=80.0; t=0.0; dt=0.1
for i in range(100):
    T=T+(-0.05*(T-20))*dt
    t=t+dt
print(t,T)
T=80.0; t=0.0; dt=0.001
for i in range(10000):
    T=T+(-0.05*(T-20))*dt
    t=t+dt
print(t,T)
T=80.0
for i in range(2):
    T=T+(-0.05*(T-20))*0.5
    print(T)
T=60.0
for i in range(4):
    T=T+(-0.1*(T-20))*0.5
    print("j",T)
print(10/0.1, int(10/0.1))
