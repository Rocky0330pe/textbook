import numpy as np
d=np.radians
def R(t): t=d(t); return np.array([[np.cos(t),-np.sin(t)],[np.sin(t),np.cos(t)]])
np.set_printoptions(precision=4, suppress=True)
print("R30",R(30)); print("R45",R(45)); print("R30R45",R(30)@R(45)); print("R75",R(75))
print("3+j 60:",R(60)@[3,1])
print("(4,2) 30:",R(30)@[4,2])
for t in [0,30,60,90,120,150,180]:
    print(t,"A",R(t)@[4,0],"B",R(t)@[4,4])
print("R20R40",R(20)@R(40), "cos/sin 20,40",np.cos(d(20)),np.sin(d(20)),np.cos(d(40)),np.sin(d(40)))
print("tri 30",R(30)@np.array([[0,4,4],[0,0,4]]))
print("tri 60",R(60)@np.array([[0,4,4],[0,0,4]]))
L1,L2=0.30,0.25
print("arm 30,45", R(30)@[L1,0], R(75)@[L2,0], R(30)@[L1,0]+R(75)@[L2,0])
print("arm 45,45", R(45)@[L1,0]+R(90)@[L2,0])
print("arm 60,-30", R(60)@[L1,0]+R(30)@[L2,0])
print("slope30 g", R(30).T@[0,-9.8], "slope 20", R(20).T@[0,-9.8])
print("R45^2",R(45)@R(45)); print("R30^3",np.linalg.matrix_power(R(30),3))
print("R90^2",R(90)@R(90))
print("inv R30",np.linalg.inv(R(30)), R(-30))
print("back", R(-60)@[0.634,3.098], R(-30)@[2.464,3.732])
print(np.cos(30), np.cos(np.radians(30)))
