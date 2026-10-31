import numpy as np, math
n=np.linalg.norm
def ang(a,b): a=np.array(a,float);b=np.array(b,float); return math.degrees(math.acos(a@b/n(a)/n(b)))
print("dist", n([2,3,6]), n(np.array([5,0,7])-[1,-2,3]), n([1,4,8]), n(np.array([4,-2,5])-[2,1,-1]))
a=np.array([1,2,2]);b=np.array([3,0,-4]); print("ex3", a+b, 2*a-b, n(a),n(b),n(2*a-b))
print("AB", np.array([3,2,3])-[1,0,2], n([2,2,1]))
# search jibun for ex3
for a in [(2,1,2),(2,-1,2),(1,2,2),(2,2,1),(1,-2,2)]:
  for b in [(0,3,4),(3,4,0),(4,0,-3),(0,-4,3),(4,3,0),(-3,0,4),(2,-6,3),(6,2,-3)]:
    A=np.array(a);B=np.array(b)
    v=2*A-B
    if abs(n(v)-round(n(v)))<1e-9: print("cand",a,b,v,n(v), A+B)
print("ex4", ang([1,1,0],[0,1,1]), ang([1,1,1],[1,0,0]), 1/math.sqrt(3), np.dot([1,2,3],[3,0,-1]))
print("j4", ang([2,1,-1],[1,2,1]), ang([1,2,2],[2,-1,2]), 4/9, np.dot([2,-1,3],[1,5,1]))
print("ex5", np.dot([4,3,20],[10,0,5]), np.dot([0,0,-20],[10,0,5]), np.dot([5,-2,30],[6,4,2]), np.dot([0,0,-30],[6,4,2]))
print("ex6", n([2,3,6]), math.degrees(math.acos(6/7)), math.degrees(math.acos(2/7)), math.degrees(math.acos(3/7)))
print("j6", n([1,4,8]), math.degrees(math.acos(8/9)))
print("ex7", 1+2+2, 3+0+2, 3*2+0+2*1, 0+2+6)
print("p2", n([4,4,7]), n(np.array([1,5,6])-[-1,2,0]))
print("p4", ang([1,-1,0],[1,0,-1]))
print("p5", n([2,-6,3]))
print("p6", 2*1-2+3)
print("p7", n([30,40,120]), math.degrees(math.acos(120/130)))
print("p8", np.dot([3,-4,25],[20,10,4]), np.dot([0,0,-25],[20,10,4]))
print("p9", ang([1,1,1],[-1,1,1]))
print("Si", math.sqrt(3)/4*0.543)
