import numpy as np
from scipy import signal
from scipy.integrate import solve_ivp
np.set_printoptions(precision=6, suppress=True)
e = np.exp
# car
m, b = 1000, 50
print('car tau', m/b, 'final', 500/b, 'm/s', 500/b*3.6, 'km/h')
for t in (5, 10, 20, 40, 60, 80, 100): print(' car v', t, 10*(1-e(-0.05*t)))
# euler dt=1 for yattemiyou
v = 0; vs = [0]
for i in range(100):
    v = v + (500 - 50*v)/1000*1; vs.append(v)
print(' euler dt=1', [round(vs[i], 3) for i in (1, 2, 5, 10, 20, 40, 60, 100)])
v = 0; vs = [0]
for i in range(20):
    v = v + (500 - 50*v)/1000*5; vs.append(v)
print(' euler dt=5', [round(x, 3) for x in vs[:13]])
# car jibun m=1500 b=75 600N
print('car jb tau', 1500/75, 'final', 600/75)
# engine + car series: G1=5000/(0.5s+1), G2=1/(1000s+50); pedal 0.1
r, p, k = signal.residue([500], np.polymul(np.polymul([0.5, 1], [1000, 50]), [1, 0]))
print('series step resid', r, p)
for t in (1, 5, 20, 60): print('  ', t, sum(ri*e(pi*t) for ri, pi in zip(r, p)).real, 10*(1-e(-0.05*t)))
print('  series den', np.polymul([0.5, 1], [1000, 50]))
# speaker crossover
tau = 1/(2*np.pi*2000)
print('crossover tau', tau)
for f in (200, 2000, 20000):
    w = 2*np.pi*f; G1 = 1/(1+1j*w*tau); G2 = 1j*w*tau/(1+1j*w*tau)
    print('  f', f, abs(G1), abs(G2), G1+G2, 20*np.log10(abs(G1)), 20*np.log10(abs(G2)))
# motor
for Kp in (0.1, 1, 10):
    pole = -(1+10*Kp)/0.5; fin = 10*Kp/(1+10*Kp)
    print('motor Kp', Kp, 'pole', pole, 'tau', -1/pole, 'final', fin, 'zure', 1-fin)
print('motor open: 1V->10 rad/s =', 10*60/(2*np.pi), 'rpm')
# aircon
for RK in (1, 4, 9, 19):
    print('aircon RK', RK, 'T', (35+26*RK)/(1+RK), 'tau', 60/(1+RK))
# state space car A
A = np.array([[0, 1], [-2, -3.]]); B = np.array([[0], [1.]]); C = np.array([[1, 0.]])
print(signal.ss2tf(A, B, C, [[0]]))
A2 = np.array([[0, 1], [-5, -2.]]); print(signal.ss2tf(A2, B, C, [[0]]))
# impulse RC 1/(2s+1) -> 0.5 e^{-t/2}
# spring frequency response
mm, kk, cc, F0 = 0.5, 8, 0.4, 0.8
for w in (1, 2, 3, 4, 5, 8):
    G = 1/(kk - mm*w**2 + 1j*cc*w)
    print('spring w', w, '|G|', abs(G), 'amp', F0*abs(G), 'lag', -np.degrees(np.angle(G)), 'dB', 20*np.log10(abs(G)), '6-13G(w)', (kk-mm*w*w)**2+(cc*w)**2, 1/abs(G)**2)
# RC lowpass 100 Hz
tau = 1/(2*np.pi*100); print('tau100', tau)
for f in (10, 100, 300, 1000, 10000):
    G = 1/(1+1j*2*np.pi*f*tau)
    print('LP f', f, '|G|', abs(G), 'dB', 20*np.log10(abs(G)), 'deg', np.degrees(np.angle(G)), '2stage dB', 40*np.log10(abs(G)), 'deg2', 2*np.degrees(np.angle(G)), 'amp2', abs(G)**2)
# 3-12 formula
print(-10*np.log10(1+(1000/100)**2))
# motor data: step 1V, y=10(1-e^{-t/0.5})
for t in (0.1, 0.25, 0.5, 1, 1.5, 2, 3): print('motor data', t, 10*(1-e(-t/0.5)))
# thermocouple data: 20->80, tau 30
for t in (0, 10, 20, 30, 60, 90, 120, 150): print('tc data', t, 20+60*(1-e(-t/30)))
# suspension road input
ms, ks, cs = 250, 16000, 2000
wn = np.sqrt(ks/ms); z = cs/(2*np.sqrt(ms*ks)); print('susp wn', wn, wn/2/np.pi, 'zeta', z, 'poles', np.roots([ms, cs, ks]))
for c in (1000, 2000, 4000, 8000):
    sys = signal.lti([c, ks], [ms, c, ks]); t = np.linspace(0, 3, 30001); _, y = signal.step(sys, T=t)
    i = y.argmax(); print('  c', c, 'max', 5*y[i], 'cm at', t[i], 'zeta', c/(2*np.sqrt(ms*ks)), 'e-formula', 5*(1+e(-np.pi*(c/(2*np.sqrt(ms*ks)))/np.sqrt(1-(c/(2*np.sqrt(ms*ks)))**2))))
# car A step via G: 1/(s(s+1)(s+2)) final 0.5
# heater/tank? series example check : parallel jibun
print(signal.residue([5, 7], [1, 3, 2]))
# dB sums for 2-stage at 100Hz
print(20*np.log10(1/np.sqrt(2)), 2*20*np.log10(1/np.sqrt(2)))
