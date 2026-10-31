import math
def morrison(Re):
    return (24/Re + 2.6*(Re/5)/(1+(Re/5)**1.52) + 0.411*(Re/2.63e5)**-7.94/(1+(Re/2.63e5)**-8)
            + 0.25*(Re/1e6)/(1+Re/1e6))
pts=[]; x=-1.0
while x<=6.0001:
    pts.append('(%.2f,%.4f)'%(x, math.log10(morrison(10**x)))); x+= 0.1 if (x<5 or x>5.8) else 0.05
print(' '.join(pts))
print([(v, round(math.log10(v),4)) for v in (0.05,0.1,0.2,0.5,1,2,5,10,100)])
for name, Re in (('rain', 803), ('baseball', 1.947e5), ('fog', 0.0161)):
    print(name, math.log10(Re), morrison(Re))
