from math import *
d=radians
print("table 30deg r=10:",[round(10*sin(d(a)),1) for a in range(0,361,30)])
print("cos:",[round(cos(d(a)),3) for a in range(0,361,30)])
print("sin:",[round(sin(d(a)),3) for a in range(0,361,30)])
for a in [750,-120,1000,-45,840,-210]: print(a, a%360, a//360)
for a in [210,315,480,240,-60,390,225,-30,510,126,135]:
    print(a, round(cos(d(a)),4), round(sin(d(a)),4))
# ferris
print("7min", 50-50*cos(d(126)), "105min", 105/20, 50-50*cos(d(18*105)))
print("jibun 40m 16min: deg/min",360/16, 40-40*cos(d(22.5*6)), 50/16, 40-40*cos(d(22.5*50)))
print("chal 30m 12min",30-30*cos(d(120)),50/12, 30-30*cos(d(30*50)))
print("omega 50m 1200s", 2*pi/1200, 50*2*pi/1200)
# fan
for rpm,r in [(1200,0.15),(600,0.25),(180,0.33)]:
    f=rpm/60; T=1/f; w=2*pi*f; print(rpm,r,"f",f,"T",T,"w",w,"v",r*w, r*w*3.6)
print("asin .8",degrees(asin(.8)),180-degrees(asin(.8)))
print("asin .3",degrees(asin(.3)),180-degrees(asin(.3)))
print("asin .6",degrees(asin(.6)),180-degrees(asin(.6)))
print("earth", 2*pi/86400, 6.4e6*2*pi/86400, 6400000*2*pi/86400*3.6)
for name,T in [("byoushin",60),("choushin",3600),("tanshin",43200),("earth",86400)]:
    print(name, 2*pi/T)
print("sqrt3/2",sqrt(3)/2, sqrt(2)/2)
print("50Hz w",2*pi*50, 2*pi*60, 100*sqrt(2))
