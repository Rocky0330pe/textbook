import numpy as np
from scipy import integrate
pi=np.pi
def line(F, r, dr, a, b):
    return integrate.quad(lambda t: np.dot(F(*r(t)), dr(t)), a, b, limit=200)[0]
def seg(F, A, B):
    A=np.array(A,float); B=np.array(B,float)
    return line(F, lambda t: A+t*(B-A), lambda t: B-A, 0, 1)
def poly(F, pts):
    return sum(seg(F, pts[i], pts[i+1]) for i in range(len(pts)-1))
F1=lambda x,y: np.array([y,x]); F2=lambda x,y: np.array([-y,x])
print("== 8-7")
print("道A F2,F1", poly(F2,[(0,0),(1,0),(1,1)]), poly(F1,[(0,0),(1,0),(1,1)]))
print("道B F2,F1", poly(F2,[(0,0),(0,1),(1,1)]), poly(F1,[(0,0),(0,1),(1,1)]))
print("n chords", [n*np.sin(2*pi/n) for n in (4,6,8,12,100)])
print("parabola F1,F2", line(F1,lambda t:(t,t*t),lambda t:np.array([1,2*t]),0,1), line(F2,lambda t:(t,t*t),lambda t:np.array([1,2*t]),0,1))
print("cubic F1,F2", line(F1,lambda t:(t,t**3),lambda t:np.array([1,3*t*t]),0,1), line(F2,lambda t:(t,t**3),lambda t:np.array([1,3*t*t]),0,1))
circ=lambda R:(lambda t:(R*np.cos(t),R*np.sin(t)), lambda t:np.array([-R*np.sin(t),R*np.cos(t)]))
print("circle R3 F2,F1", line(F2,*circ(3),0,2*pi), 18*pi, line(F1,*circ(3),0,2*pi))
print("tri F2,F1", poly(F2,[(0,0),(1,0),(1,1),(0,0)]), poly(F1,[(0,0),(1,0),(1,1),(0,0)]))
G=lambda x,y: np.array([2*y,x])
print("prob1 A,B", poly(G,[(0,0),(1,0),(1,1)]), poly(G,[(0,0),(0,1),(1,1)]), "prob2", seg(G,(0,0),(1,1)), "prob3", line(G,lambda t:(t,t*t),lambda t:np.array([1,2*t]),0,1))
print("prob4 4pi?", line(F2,*circ(2),0,pi), 4*pi, "prob7 tri", poly(G,[(0,0),(1,0),(1,1),(0,0)]), "prob8 sq", poly(G,[(0,0),(1,0),(1,1),(0,1),(0,0)]))
print("wire pi+1", integrate.quad(lambda t:(2+np.sin(t))*0.5,0,pi)[0], pi+1, "prob5", integrate.quad(lambda t:(3+np.sin(t)),0,pi/2)[0])
print("mountain 8330", 50*9.8*(100-83), "prob6", 60*9.8*(100-(100-0.01*1600-0.02*100)))
print("pV straight", integrate.quad(lambda V: 200e3+(100e3-200e3)*(V-1e-3)/2e-3,1e-3,3e-3)[0], integrate.quad(lambda V: 400e3-300e3*(V-1e-3)/3e-3,1e-3,4e-3)[0])
print("== 8-8")
# paraboloid flux F=(x,y,z), z=1-r^2 upward
f=lambda r,t: ((r*np.cos(t))*2*r*np.cos(t)+(r*np.sin(t))*2*r*np.sin(t)+(1-r*r))*r
print("paraboloid", integrate.dblquad(f,0,2*pi,0,1)[0], 3*pi/2)
# hemisphere F=(0,0,z) R=2 via param
R=2
g=lambda th,ph: (R*np.cos(th))*np.cos(th)*R*R*np.sin(th)
print("hemi", integrate.dblquad(g,0,2*pi,0,pi/2)[0], 16*pi/3)
# cube flux (x^2,xy,-z), (xy,y^2,z), (x+y,2y,z^2), (2x,y^2,-z)
def cube(F):
    s=0
    for ax in range(3):
        for side,sg in ((1,1),(0,-1)):
            def h(u,v):
                p=[0,0,0]; others=[i for i in range(3) if i!=ax]; p[ax]=side; p[others[0]]=u; p[others[1]]=v
                return sg*F(*p)[ax]
            s+=integrate.dblquad(h,0,1,0,1)[0]
    return s
print("cube", cube(lambda x,y,z:(x*x,x*y,-z)), cube(lambda x,y,z:(x*y,y*y,z)), cube(lambda x,y,z:(x+y,2*y,z*z)), cube(lambda x,y,z:(2*x,y*y,-z)))
# point charge one face of cube [-1,1]^3 top
one=integrate.dblquad(lambda y,x: 1/(x*x+y*y+1)**1.5,-1,1,-1,1)[0]
print("face", one, 4*pi/6)
print("solid angle", [2*pi*(1-np.cos(np.radians(a))) for a in (30,45,60,90,180)])
print("triangle 2x+y+2z=6", np.cross([-3,6,0],[-3,0,3])/2, np.linalg.norm(np.cross([-3,6,0],[-3,0,3]))/2)
print("x+2y+2z=4", np.cross([-4,2,0],[-4,0,2])/2, "3x+2y+z=6", np.cross([-2,3,0],[-2,0,6])/2, "2x+2y+z=4", np.cross([-2,2,0],[-2,0,4])/2)
print("pipe", pi*0.01**2*0.2/2, pi*0.02**2*0.1/2, pi*0.015**2*0.4/2, pi*0.005**2*0.6/2)
print("window", integrate.dblquad(lambda z,x:1+0.5*z,0,1,0,2)[0], integrate.dblquad(lambda z,x:0.8+0.4*z,0,2,0,1.5)[0])
print("challenge z=2-r^2 F=(x,y,0)", integrate.dblquad(lambda r,t:2*r*r*r,0,2*pi,0,np.sqrt(2))[0], 4*pi)
print("Tokyo noon alt", 90-35.7+23.4, 90-35.7-23.4, np.cos(np.radians(12)), np.cos(np.radians(59)))
print("== 8-11")
print("dome (x,y,z+1)", integrate.dblquad(lambda th,ph:(2*np.sin(th)*np.cos(ph)*np.sin(th)*np.cos(ph)+2*np.sin(th)*np.sin(ph)*np.sin(th)*np.sin(ph)+(2*np.cos(th)+1)*np.cos(th))*4*np.sin(th),0,2*pi,0,pi/2)[0], 20*pi)
print("sphere (2x,3y,z) R1", integrate.dblquad(lambda th,ph:(2*np.sin(th)**2*np.cos(ph)**2+3*np.sin(th)**2*np.sin(ph)**2+np.cos(th)**2)*np.sin(th),0,2*pi,0,pi)[0], 8*pi)
print("cube (x^2,y^2,z^2)", cube(lambda x,y,z:(x*x,y*y,z*z)), "(xy,yz,zx)", cube(lambda x,y,z:(x*y,y*z,z*x)), "(x+y,y+z,z+x)", cube(lambda x,y,z:(x+y,y+z,z+x)))
print("g", 3.986e14/6.371e6**2, 4.90e12/1.737e6**2, 4.28e13/3.39e6**2)
H=lambda x,y: np.array([-3*y,2*x])
print("S1 square", poly(H,[(0,0),(2,0),(2,2),(0,2),(0,0)]), "circle", line(H,*circ(1),0,2*pi), 5*pi)
V=lambda x,y: np.array([-y,x])/(x*x+y*y)
print("S3 square ±1", poly(V,[(1,-1),(1,1),(-1,1),(-1,-1),(1,-1)]), 2*pi, "circle at (3,0)", line(V,lambda t:(3+np.cos(t),np.sin(t)),lambda t:np.array([-np.sin(t),np.cos(t)]),0,2*pi))
sh=lambda P: 0.5*sum(P[i][0]*P[(i+1)%len(P)][1]-P[(i+1)%len(P)][0]*P[i][1] for i in range(len(P)))
print("shoelace", sh([(0,0),(4,0),(4,3)]), sh([(0,0),(5,0),(5,2),(0,4)]), sh([(0,0),(6,0),(0,4)]))
print("Ampere", 4*pi*1e-7*10/(2*pi*0.05), 4*pi*1e-7*2.5/(2*pi*0.001), 4*pi*1e-7*5/(2*pi*0.01))
print("Faraday", pi*0.05**2*0.4, pi*0.05**2*0.4/(2*pi*0.05), pi*0.04*0.05/(2*pi*0.2))
print("buoy", 1000*9.8*4/3*pi*0.1**3, 1000*9.8*4/3*pi*0.2**3, 1000*9.8*4/3*pi*0.05**3)
print("Q/eps0", 1e-9/8.85e-12, 1e-9/8.85e-12/6, 2e-9/8.85e-12/6, 1e-9/8.85e-12/4)
print("hemi rot (0,0,2) R1", integrate.dblquad(lambda th,ph:2*np.cos(th)*np.sin(th),0,2*pi,0,pi/2)[0], 2*pi)
