x=0
for i in range(10):
    x=x+0.1
    print(x)
print(1.1-1); print(1000.1-1000); print(1000000000.1-1000000000)
for h in [0.1,0.001,1e-5,1e-8, 0.00000001]:
    x=5*(1+h)**2
    print(h,(x-5)/h)
a=4;b=a*3;a=a+1;print(a,b)
x=10;y=x-3;x=y*2;print(x,y)
s=0
for i in range(5): s=s+3
print(s)
n=1
for i in range(4): n=n*2
print(n)
a=7;b=a*2;a=a+b;print(a)
s=100
for i in range(4): s=s-15
print(s)
n=3
for i in range(3): n=n*2
print(n)
m=1000
for i in range(10): m=m+500
print(m, m>=5000)
x=0
for i in range(4): x=x+0.25
print(x==1)
n=0
for i in range(10): n=n+1
print(n/10)
money=3000
for i in range(12): money=money+500
print(money)
x=0
for i in range(10): x=x+0.1
print(0.999999 < x < 1.000001, x==1)
from fractions import Fraction
def tobin(fr, n=20):
    s=''
    for i in range(n):
        fr*=2
        if fr>=1: s+='1'; fr-=1
        else: s+='0'
    return s
print(tobin(Fraction(1,10)), tobin(Fraction(3,8),5), tobin(Fraction(5,8),5))
