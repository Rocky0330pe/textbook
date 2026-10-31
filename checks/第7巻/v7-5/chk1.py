import numpy as np, math
np.set_printoptions(precision=4, suppress=True)
A=np.array([[2,1],[1,2]])
print("yattemiyou table")
for th in range(0,181,15):
    r=math.radians(th); v=np.array([math.cos(r),math.sin(r)]); w=A@v
    ang=math.degrees(math.atan2(w[1],w[0]))
    print(th, round(v[0],3), round(v[1],3), round(w[0],3), round(w[1],3), round(ang,1), round(ang-th,1), round(np.linalg.norm(w),3))
print(np.linalg.eig(A))
for M in ([[4,1],[2,3]],[[3,1],[2,2]],[[1,2],[2,1]],[[5,2],[2,2]],[[2,2],[2,5]],[[-150,50],[50,-150]],[[-26,10],[10,-26]],[[0,1],[-3,-4]],[[0,1],[-2,-3]],[[0,1],[-10,-2]],[[0,1],[-13,-4]],[[50,20],[20,20]],[[30,-20],[-20,0]],[[-110,10],[10,-110]],[[-0.1,0.1],[0.1,-0.1]],[[0,1],[-16,-0.8]],[[80,30],[30,-20]],[[0,1],[-2,-3]],[[0,1],[-5,-2]]):
    M=np.array(M,float); w,V=np.linalg.eig(M); print(M.tolist(), w, V.tolist())
# power iteration
v=np.array([1,0])
for i in range(7):
    print(i, v, math.degrees(math.atan2(v[1],v[0])), (np.linalg.norm(A@v)/np.linalg.norm(v)))
    v=A@v
