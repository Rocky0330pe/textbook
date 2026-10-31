import numpy as np
e=1e-5
def rot2(F,x,y): return (F(x+e,y)[1]-F(x-e,y)[1])/(2*e)-(F(x,y+e)[0]-F(x,y-e)[0])/(2*e)
def div2(F,x,y): return (F(x+e,y)[0]-F(x-e,y)[0])/(2*e)+(F(x,y+e)[1]-F(x,y-e)[1])/(2*e)
def rot3(F,p):
    p=np.array(p,float); J=np.zeros((3,3))
    for j in range(3):
        d=np.zeros(3); d[j]=e; J[:,j]=(np.array(F(*(p+d)))-np.array(F(*(p-d))))/(2*e)
    return np.array([J[2,1]-J[1,2],J[0,2]-J[2,0],J[1,0]-J[0,1]])
fields={'spread':lambda x,y:(x,y),'gather':lambda x,y:(-x,-y),'uniform':lambda x,y:(1,0),'vortex':lambda x,y:(-y,x),
'shear':lambda x,y:(y,0),'gutter':lambda x,y:(x,0),'river':lambda x,y:(1-y*y,0),'F1':lambda x,y:(y,x),'F3':lambda x,y:(2*x,2*y),'F4':lambda x,y:(y,-x),
'irrot':lambda x,y:(-y/(x*x+y*y),x/(x*x+y*y))}
for k,F in fields.items():
    print(k,'div %.4f rot %.4f'%(div2(F,0.7,0.4),rot2(F,0.7,0.4)))
def circ(F,x0,y0,h):
    b=F(x0+h/2,y0)[0]*h; r=F(x0+h,y0+h/2)[1]*h; t=-F(x0+h/2,y0+h)[0]*h; l=-F(x0,y0+h/2)[1]*h
    return round(b,4),round(r,4),round(t,4),round(l,4),round(b+r+t+l,4)
for k in ['spread','gather','uniform','vortex','shear','gutter','F1','F3','F4']:
    print(k,circ(fields[k],0,0,1.0))
for yb in np.arange(-1,1,0.25):
    s=circ(fields['river'],0,yb,0.25)[-1]; print('river %.2f-%.2f circ %.5f rot %.3f'%(yb,yb+0.25,s,s/0.0625))
print(rot3(lambda x,y,z:(y,z,x),(1,2,3)), rot3(lambda x,y,z:(y*z,x*z,x*y),(1,2,3)))
w=np.array([1.,2.,3.]); print('rigid',rot3(lambda x,y,z: tuple(np.cross(w,[x,y,z])),(0.3,0.5,0.7)))
print('gradrot',rot2(lambda x,y:(2*x*y,x*x+3*y*y),0.3,0.9))
