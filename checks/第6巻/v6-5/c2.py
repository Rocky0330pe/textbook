import cmath, math
z = 3+1j
print(abs(z))
print(math.degrees(cmath.phase(z)))
r = cmath.rect(1, math.radians(60))
print(z * r)
