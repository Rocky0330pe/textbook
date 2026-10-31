from statistics import mean,pstdev
def r_(x,y):
    mx,my=mean(x),mean(y); c=sum((a-mx)*(b-my) for a,b in zip(x,y))/len(x)
    return c/(pstdev(x)*pstdev(y)), c
v=[1.2,1.8,2.1,2.5,2.9,3.4,3.8,4.3,4.9,5.6,6.2,7.0]
T=[42,48,44,51,47,55,50,58,56,63,60,71]
print(r_(v,T))
t=[0,20,40,60,80,100]; R=[100.0,107.8,115.3,123.2,130.7,138.5]
print(r_(t,R))
# foot in mm
x=[1500,1550,1600,1650,1700]; y=[22,23,25,24,26]; print(r_(x,y))
x=[2,4,6,8,10]; y=[300,400,600,900,800]; print(r_(x,y))
x=[1,2,3,4]; y=[4,7,10,13]; print(r_(x,y))
x=[-2,-1,0,1,2]; y=[4,1,0,1,4]; print(r_(x,y))
