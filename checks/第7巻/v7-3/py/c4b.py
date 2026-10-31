import numpy as np
def area(P):
    P=np.array(P,float); x,y=P[:,0],P[:,1]
    return 0.5*(np.dot(x,np.roll(y,-1))-np.dot(y,np.roll(x,-1)))
H=[(0,0),(2,0),(2,2),(1,3),(0,2)]
A=np.array([[2,1],[1,2]])
print('house',area(H), area([A@np.array(p) for p in H]))
A4=np.array([[2,1,0,0],[1,2,1,0],[0,1,2,1],[0,0,1,2]])
print(repr(np.linalg.det(A4)))
print(repr(np.linalg.det(np.array([[2,1],[1,2]]))), round(np.linalg.det(np.array([[2,1],[1,2]])),6))
B=np.array([[2,0,1],[0,3,1],[0,0,4]]); print(repr(np.linalg.det(B)))
print(np.linalg.det(np.array([[1,2],[2,4]])))
for m in [[[5,2],[3,4]],[[2,5],[3,1]],[[-1,2],[3,-4]],[[2,1],[1,4]],[[1,2],[3,4]],[[1,2,3],[0,1,4],[2,0,1]]]:
    print(m, round(np.linalg.det(np.array(m)),6))
P=np.array([[1,2],[3,4]])@np.array([[2,1],[1,1]]); print(P, np.linalg.det(P), np.linalg.det(3*np.array([[1,2],[3,4]])))
import math
print('rope15', -math.sin(math.radians(30)), 40/(2*math.sin(math.radians(15))))
for t2 in [30,90,0]: print(0.3*0.25*math.sin(math.radians(t2)))
