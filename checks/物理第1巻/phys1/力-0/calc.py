g=9.8; m=2000
print("T static", m*g, "T a=0.5", m*(g+0.5), "ratio", (g+0.5)/g)
print("M center 10m", m*g*10/1000, "20m", m*g*20/1000, "kN.m")
for R in [10,20]: print("tip load (力-5 model)", R, 24*3.5/(R-3.0), "inverse-prop", 120/R)
print("restore/overturn 2t", 24*9.8*3.5/(2*9.8*7))
print("power 0.5 m/s", m*g*0.5/1000, "kW")
import math; print("hydraulic", 30e6*math.pi*0.12**2/4/1000, "kN")
# ruler crane: eraser 20 g at 8 cm behind edge, ruler 15 g center at 5 cm beyond edge; radius from mark 3 cm behind edge
for Rr in [10,20]:
    x=Rr-3; print("coins", Rr, (20*8-15*5)/x)
