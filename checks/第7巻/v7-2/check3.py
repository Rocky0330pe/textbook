import numpy as np
from math import *
M=lambda *r: np.array(r,dtype=complex if any(isinstance(x,complex) for row in r for x in row) else float)
S=M([2,0],[0,1]); R=M([0,-1],[1,0]); H=M([1,1],[0,1]); F=M([1,0],[0,-1]); A=M([2,1],[1,2])
house=np.array([[0,0],[2,0],[2,2],[1,3],[0,2]]).T
print('SR',S@R,'RS',R@S)
print('SR house',(S@R@house).T.tolist()); print('RS house',(R@S@house).T.tolist())
print('R house',(R@house).T.tolist(),'S house',(S@house).T.tolist())
print('SR(1,0)',S@R@[1,0],'RS(1,0)',R@S@[1,0])
print('r1',M([1,2],[3,-1])@M([2,0],[1,4]),'j1',M([3,1],[0,2])@M([1,-1],[2,5]))
print('r2 AB',H@S,'BA',S@H,'j2',R@F,F@R)
print('r3',R@S,(R@S)@[1,1],'j3',F@H,(F@H)@[1,2])
print('A2',A@A,'A3',A@A@A,'H2',H@H,'H3',H@H@H)
P=M([1,2,0],[0,1,1],[1,0,1]);Q=M([2,0,1],[1,1,0],[0,3,1]);print('3x3',P@Q,'QP',Q@P)
P2=M([1,0,2],[2,1,0],[0,1,1]);Q2=M([1,1,0],[0,2,1],[3,0,1]);print('3x3j',P2@Q2)
print('assoc',(S@R)@H,S@(R@H))
print('rot',R@R)
# ABCD
ser=lambda z: M([1,z],[0,1]); sh=lambda y: M([1,0],[y,1])
print('ABCD1',ser(2)@sh(0.5),'rev',sh(0.5)@ser(2),np.linalg.det(ser(2)@sh(0.5)))
print('ABCD1 out1V',(ser(2)@sh(0.5))@[1,0],(sh(0.5)@ser(2))@[1,0])
print('ABCDj',ser(1)@sh(0.25),'rev',sh(0.25)@ser(1),(ser(1)@sh(0.25))@[4,0],(sh(0.25)@ser(1))@[4,0])
for w in (1000,20000,30000,5000,10000):
  L=10e-3;C=1e-6
  Z=1j*w*L;Y=1j*w*C
  T=ser(Z)@sh(Y); print('LC w',w,T, 'V2/V1',1/T[0,0], np.linalg.det(T))
# with load? R load 100 ohm at w=1000
# lens
d=0.1;f=0.05
print('lens',sh(-1/f)@ser(d))
# loaded ABCD check example: series 2 then shunt 2 then load 2 ohm
T=ser(2)@sh(0.5); V2=1;I2=V2/2; print('load',T@[V2,I2])
# 2x3 times 3x2
print(M([1,0,2],[0,1,1])@M([1,2],[0,1],[3,0]))
# composition column view
B=R; print('AB col1 = A(Bcol1)',S@B[:,0])
# rotation two 30? not needed
# general check AB letters
