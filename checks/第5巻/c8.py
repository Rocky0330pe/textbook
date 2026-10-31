import math
def euler(v,dt,T,x0=0):
    n=round(T/dt); x=x0; xs=[x]
    for k in range(n):
        x+=v(k*dt)*dt; xs.append(round(x,10))
    return xs
print(euler(lambda t:10*t,0.5,2))
print(euler(lambda t:10*t,0.1,2)[-1], euler(lambda t:10*t,0.01,2)[-1])
print(euler(lambda t:2*t,1,3), euler(lambda t:2*t,0.5,2))
print(euler(lambda t:20-4*t,1,3), 20*3-2*9)
print(euler(lambda t:10-2*t,1,3), 30-9)
print(euler(lambda t:6-2*t,1,2,10), 10+12-4)
print(euler(lambda t:3*t*t,0.5,2))
print(math.sqrt(4.1), math.sqrt(9.2), math.sqrt(16.3), 4+0.3/8, math.sqrt(25.5))
print(1.02**5, 0.99**10, 1/1.02, math.sqrt(1.04), 1/1.05, math.sqrt(1.06), 1/0.96, 1.01**10, 1.01**2, 1.03**4, 1/0.98, math.sqrt(0.96))
print(4/3*math.pi*125, 10*math.pi, 10*math.pi/(4/3*math.pi*125))
print(2.01**3, 10.1**3, 20.2**2-400, 3.1**2)
# relative error example: cube side 20 cm, want volume within 1.5%
