from fractions import Fraction as F
def solve(a,b,e,c,d,f):
    det=a*d-b*c; return (F(e*d-b*f,det), F(a*f-e*c,det))
# hatena: y=60x, y=-90x+1500
print(solve(-60,1,0, 90,1,1500))
print([60*t for t in range(0,13,2)],[1500-90*t for t in range(0,13,2)])
print(60*4, -90*4+1500)
print(solve(-2,1,-1, 3,2,12))  # y=2x-1 ; 3x+2y=12
print(solve(2,3,420,2,1,300), 2*120+3*60)
print(solve(1,1,7,1,-1,1))
print(solve(1,2,8,3,-1,3))
print(F(1500,160), 70*F(1500,160), F(3,8)*60)
for x in [8,9,10,11,9.3,9.4]: print(x,70*x,1500-90*x,1500-160*x)
# matrix steps
print([2-2,1-3,300-420],[0,1,60],[2-0,3-3,420-180])
# circuit 9,6, R=2,2,2
print(solve(4,2,9,2,4,6))
# 3 var
print("xyz",4+3+2,4-3,3-2)
# reidai
print(solve(-1,1,1, 2,1,7))     # y=x+1, y=-2x+7  -> (2,3)
print(solve(-1,1,2, 1,1,6))     # y=x+2,y=-x+6 -> (2,4)
print(solve(-3,1,-4, 1,1,8))    # y=3x-4, y=-x+8
print(solve(5,-2,8, -1,1,-1))   # 5x-2y=8, y=x-1
print(solve(-2,1,1, 1,1,7))     # y=2x+1, y=-x+7
print(solve(4,-3,9, -1,1,-2))   # 4x-3y=9, y=x-2
print(solve(2,3,13,2,1,7), solve(1,1,7,1,-1,1))
print(solve(3,2,12,3,1,9), solve(1,1,9,1,-1,3))
print(solve(2,1,7,1,-3,-7), solve(2,3,12,3,2,13))
print(solve(1,3,10,2,-1,6), solve(3,2,7,2,3,8))
print(solve(3,2,520,1,3,570))
print(solve(2,1,380,1,3,540))
print(solve(-50,1,0,70,1,1200), solve(-40,1,0,60,1,1500))
print(solve(-2,1,1, 1,1,4))   # (3) y=2x+1,y=-x+4
print(solve(-1,1,3, 2,1,6))   # y=x+3, y=-2x+6
print(solve(4,1,6,1,4,9))   # circuit R8 6V/9V 3,1,3
print(solve(4,1,9,1,4,6))   # jibun 9V/6V
print(solve(1,1,5,3,1,11), solve(2,1,7,4,1,11))
# tsumazuki
print(solve(2,3,13,2,-1,1))
# butsuri
print(solve(1,1,300,1,-2,0)) # FA+FB=300, FA-2FB=0
print(solve(1,1,300,F(1,10),F(1,25),18))
# problems
print(solve(-1,1,3,1,1,5))
print(solve(-2,1,-3,1,1,6), solve(2,-3,1,-1,1,-1))
print(solve(4,3,18,4,1,14), solve(1,1,10,1,-1,4))
print(solve(3,1,10,1,-2,1), solve(2,3,7,3,-2,4))
print(solve(2,3,2600,1,2,1500))
print(solve(-60,1,0,100,1,2000))
print(solve(5,2,9,2,5,12))
print(solve(-1,1,1,2,1,7))
