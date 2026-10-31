from math import *
d=radians
print("yattemiyou table")
for a in range(0,361,30):
    s1=sin(d(a)); s2=sin(d(a+60)); print(a, round(s1,3), round(s2,3), round(s1+s2,3), round(sqrt(3)*sin(d(a+30)),3))
print("sin90 vs sin30+sin60", sin(d(90)), sin(d(30))+sin(d(60)))
print("cos75",cos(d(75)), (sqrt(6)-sqrt(2))/4, .7071*.8660-.7071*.5)
print("sin75",sin(d(75)), (sqrt(6)+sqrt(2))/4)
print("cos15",cos(d(15)),"sin15",sin(d(15)))
print("sin105",sin(d(105)),(sqrt(6)+sqrt(2))/4,"cos105",cos(d(105)),(sqrt(2)-sqrt(6))/4)
from fractions import Fraction as F
def ab(sa,cb):
    ca=sqrt(1-sa**2); sb=sqrt(1-cb**2)
    return sa*cb+ca*sb, ca*cb-sa*sb
for sa,cb in [(F(3,5),F(5,13)),(F(5,13),F(4,5)),(F(8,17),F(3,5))]:
    ca={F(3,5):F(4,5),F(5,13):F(12,13),F(8,17):F(15,17)}[sa]
    sb={F(5,13):F(12,13),F(4,5):F(3,5),F(3,5):F(4,5)}[cb]
    print(sa,cb,"sin(a+b)",sa*cb+ca*sb,"cos(a+b)",ca*cb-sa*sb)
print("2x: s=.6 c=.8", 2*.6*.8, 1-2*.36, .64-.36)
print("s=.8 c=.6", 2*.8*.6, 1-2*.64)
print("s=.28 c=.96", 2*.28*.96, 1-2*.28**2, .96**2-.28**2)
print("sin^2 15",(1-cos(d(30)))/2, sin(d(15))**2, "cos^2 15",(1+cos(d(30)))/2, "sin^2 22.5", (1-cos(d(45)))/2, sin(d(22.5))**2)
for v,a in [(10,30),(10,45),(10,60),(20,15),(20,75),(20,45),(15,30),(15,45),(14,30)]:
    print("proj v",v,"a",a, v*v*sin(d(2*a))/10, "t",v*sin(d(a))/5)
print("synth sin+sqrt3cos -> 2 sin(t+60)", [round(sin(d(t))+sqrt(3)*cos(d(t))-2*sin(d(t+60)),9) for t in (0,40,100)])
print("3sin+4cos alpha", degrees(atan2(4,3)), "4sin+3cos", degrees(atan2(3,4)), "5,12", degrees(atan2(12,5)), 90-degrees(atan2(12,5)))
print("sin - cos", [round(sin(d(t))-cos(d(t))-sqrt(2)*sin(d(t-45)),9) for t in (0,40,100)])
print("sinx+sin(x+60) =", 1.5, sqrt(3)/2, sqrt(2.25+.75), degrees(acos(1.5/sqrt(3))))
print("three phase", [round(sin(d(t))+sin(d(t-120))+sin(d(t-240)),12) for t in (0,30,77)])
print("power", 100*10, 100*10*cos(d(60)), 100*5*cos(d(30)), 200*10*cos(d(60)))
print("beats 440 443:",443-440, (440+443)/2)
print("mohr 45", 50+50*cos(d(90)), -50*sin(d(90)))
