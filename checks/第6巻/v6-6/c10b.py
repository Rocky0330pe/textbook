import cmath, math
from math import pi, sqrt
E=cmath.exp
def p(*a): print(*a)
# taylor partial sums theta=1
s=0;t=1
for n in range(8):
    s+= (1j)**n/math.factorial(n); p('taylor',n,round(s.real,4),round(s.imag,4))
p(E(1j*pi/3), E(1j*3*pi/4), 4*E(-1j*pi/2))
p('polar', abs(-1+sqrt(3)*1j), cmath.phase(-1+sqrt(3)*1j)/pi, abs(sqrt(3)-1j), cmath.phase(sqrt(3)-1j)/pi, abs(-2+2j), cmath.phase(-2+2j)/pi)
p('prod', 2*E(1j*pi/6)*3*E(1j*pi/3), 6*E(1j*pi/2)/(2*E(1j*pi/6)))
p('jibun prod', 4*E(1j*pi/12)*2*E(1j*pi/4), 'quot', 10*E(1j*5*pi/6)/(5*E(1j*pi/2)))
p('pow', (sqrt(3)+1j)**6, (1-1j)**4, (1+sqrt(3)*1j)**3)
# phasor sums (vertical shadow / Im)
a=1+E(1j*pi/3); p('sum60',abs(a),math.degrees(cmath.phase(a)))
a=1+E(1j*2*pi/3); p('sum120',abs(a),math.degrees(cmath.phase(a)))
a=3+4j; p('3s4c',abs(a),math.degrees(cmath.phase(a)))
a=4+3j; p('4s3c',abs(a),math.degrees(cmath.phase(a)))
a=50+50j; p('50s50c',abs(a),math.degrees(cmath.phase(a)))
p('3phase', 1+E(-2j*pi/3)+E(-4j*pi/3))
# capacitor
p('Ic50', 2*pi*50*10e-6*100, 'Ic60', 2*pi*60*20e-6*100, 'Ic50_20u', 2*pi*50*20e-6*100)
# decaying
for t in [0,pi/4,pi/2,3*pi/4,pi]:
    p('e-t cos2t',round(t,3), round(math.exp(-t)*math.cos(2*t),4))
p('e-0.5t cos3t at pi/3', math.exp(-0.5*pi/3)*math.cos(pi))
p('e-0.5t cos2t at pi/2', math.exp(-0.5*pi/2)*math.cos(pi))
p('e-0.2t cos t at pi', math.exp(-0.2*pi)*math.cos(pi))
print(cmath.exp(1j*math.pi/3)); print(cmath.exp(1j*math.pi))
