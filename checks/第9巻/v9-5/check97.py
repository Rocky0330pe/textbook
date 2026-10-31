import numpy as np
from scipy import signal
from scipy.integrate import solve_ivp
np.set_printoptions(precision=6, suppress=True)
e = np.exp

def ode(a1, a0, x0, v0, u=lambda t: 0.0, T=10):
    """x'' + a1 x' + a0 x = u(t)"""
    f = lambda t, y: [y[1], u(t) - a1*y[1] - a0*y[0]]
    return lambda ts: solve_ivp(f, (0, max(ts)), [x0, v0], t_eval=ts, rtol=1e-11, atol=1e-13, max_step=0.01).y[0]

def chk(name, num, den, f, ts=(0.5, 1, 2, 3)):
    r, p, k = signal.residue(num, den)
    print('--', name, 'residues', r, 'poles', p, 'k', k)
    ts = np.array(ts)
    return ts

ts = np.array([0.0, 0.5, 1, 2, 3])
# 3-8: 1/((s+1)(s+2)) -> e^-t - e^-2t ; car A x0=0 v0=1
s1 = ode(3, 2, 0, 1)(ts); print('3-8 tataku', s1, e(-ts)-e(-2*ts))
print('3-8 max', max((e(-t)-e(-2*t), t) for t in np.linspace(0, 5, 50001)), 'ln2=', np.log(2))
# car A x0=1 v0=0
sA = ode(3, 2, 1, 0)(ts); print('carA', sA, 2*e(-ts)-e(-2*ts))
print(signal.residue([1, 3], [1, 3, 2]))
# Euler for car A dt=0.1 (explicit and semi-implicit)
for mode in ('explicit', 'semi'):
    x, v, dt = 1.0, 0.0, 0.1
    xs = [x]
    for i in range(30):
        a = -3*v - 2*x
        if mode == 'explicit':
            x, v = x + v*dt, v + a*dt
        else:
            v = v + a*dt; x = x + v*dt
        xs.append(x)
    print(mode, 'x(0.5,1,1.5,2,3)=', [round(xs[i], 5) for i in (5, 10, 15, 20, 30)])
tt = np.array([0.5, 1, 1.5, 2, 3]); print('exact', 2*e(-tt)-e(-2*tt))
# example2: x''+4x'+3x=0, x0=2 v0=0 -> 3e^-t - e^-3t
print('ex2', ode(4, 3, 2, 0)(ts), 3*e(-ts)-e(-3*ts), signal.residue([2, 8], [1, 4, 3]))
print('jb2', ode(5, 6, 1, 0)(ts), 3*e(-2*ts)-2*e(-3*ts), signal.residue([1, 5], [1, 5, 6]))
# RC 10/(s(2s+1))
for t in (1, 2, 4, 6): print('RC', t, 10-10*e(-t/2))
print('RC jibun 6/(s(0.5s+1))', [6-6*e(-2*t) for t in (0.5, 1)])
# double pole (s+3)/(s+1)^2 : x''+2x'+x=0, x0=1, v0=1
print('dbl', ode(2, 1, 1, 1)(ts), e(-ts)+2*ts*e(-ts), signal.residue([1, 3], [1, 2, 1]))
print('dbl jb', ode(4, 4, 1, 0)(ts), e(-2*ts)+2*ts*e(-2*ts), signal.residue([1, 4], [1, 4, 4]))
# thermocouple ramp tau=30 r=1/30: Tm = r(t - tau + tau e^-t/tau) ; lag = r tau(1-e^-t/tau)
tau, r = 30, 1/30
for t in (30, 60, 90, 150): print('tc lag', t, r*tau*(1-e(-t/tau)), 'Tm rise', r*(t-tau+tau*e(-t/tau)))
tau, r = 10, 0.5
for t in (10, 20, 50): print('tc jb lag', t, r*tau*(1-e(-t/tau)))
print(signal.residue([1/30], [30, 1, 0, 0]))
# car B
sB = ode(2, 5, 1, 0)(ts); print('carB', sB, e(-ts)*(np.cos(2*ts)+0.5*np.sin(2*ts)))
print('carB complex resid', signal.residue([1, 2], [1, 2, 5]))
print('jbB', ode(4, 13, 1, 0)(ts), e(-2*ts)*(np.cos(3*ts)+2/3*np.sin(3*ts)))
# car B step: x''+2x'+5x=5 -> 1 - e^-t(cos2t + 0.5 sin2t)
print('Bstep', ode(2, 5, 0, 0, u=lambda t: 5)(ts), 1-e(-ts)*(np.cos(2*ts)+0.5*np.sin(2*ts)))
tg = np.linspace(0, 6, 600001); y = 1-e(-tg)*(np.cos(2*tg)+0.5*np.sin(2*tg)); i = y.argmax(); print('Bstep max', y[i], tg[i], 'pi/2=', np.pi/2, 1+e(-np.pi/2))
print('jb step', ode(4, 13, 0, 0, u=lambda t: 13)(ts), 1-e(-2*ts)*(np.cos(3*ts)+2/3*np.sin(3*ts)))
y = 1-e(-2*tg)*(np.cos(3*tg)+2/3*np.sin(3*tg)); i = y.argmax(); print('jb step max', y[i], tg[i], np.pi/3, 1+e(-2*np.pi/3))
# RLC step
L, C, R, E = 0.01, 1e-6, 20, 10
wn2 = 1/(L*C); sig = R/(2*L); wd = np.sqrt(wn2-sig**2)
print('RLC sigma', sig, 'wd', wd, 'zeta', sig/np.sqrt(wn2))
tm = np.pi/wd; print('RLC tmax', tm*1e3, 'ms', 'vmax', E*(1+e(-sig*tm)), 'overshoot', e(-sig*tm))
f = lambda t, y: [y[1], (E - R*C*y[1] - y[0])/(L*C)]
sol = solve_ivp(f, (0, 0.003), [0, 0], t_eval=np.linspace(0, 0.003, 30001), rtol=1e-10, atol=1e-12, max_step=1e-6)
print('RLC numeric max', sol.y[0].max(), sol.t[sol.y[0].argmax()]*1e3)
for t in (0.316e-3, 0.632e-3, 1e-3, 2e-3, 3e-3): print('RLC v', t*1e3, E*(1-e(-sig*t)*(np.cos(wd*t)+sig/wd*np.sin(wd*t))))
print('RLC resid', signal.residue([E*wn2], [1, 2*sig, wn2, 0]))
# forced 6-13: x''+2x'+5x=10cos t
xf = ode(2, 5, 0, 0, u=lambda t: 10*np.cos(t))(ts)
print('forced', xf, 2*np.cos(ts)+np.sin(ts)-e(-ts)*(2*np.cos(2*ts)+1.5*np.sin(2*ts)))
print('forced resid', signal.residue([10, 0], np.polymul([1, 0, 1], [1, 2, 5])))
xj = ode(2, 2, 0, 0, u=lambda t: 5*np.cos(t))(ts)
print('forced jb', xj, np.cos(ts)+2*np.sin(ts)-e(-ts)*(np.cos(ts)+3*np.sin(ts)))
# resonance x''+4x=cos2t
xr = ode(0, 4, 0, 0, u=lambda t: np.cos(2*t))(ts); print('reso', xr, ts/4*np.sin(2*ts))
xr = ode(0, 9, 0, 0, u=lambda t: 6*np.cos(3*t))(ts); print('reso jb', xr, ts*np.sin(3*ts))
# delayed switch RC: 10 e^{-2s}/(s(2s+1))
for t in (1, 2, 3, 4, 6): print('delay', t, 0 if t < 2 else 10-10*e(-(t-2)/2))
for t in (0.5, 1, 1.5, 2): print('delay jb', t, 0 if t < 1 else 6-6*e(-2*(t-1)))
# G: (2s+5)/(s+2) = 2 + 1/(s+2)
print(signal.residue([2, 5], [1, 2]), signal.residue([3, 4], [1, 1]))
# H: final values
print('H', signal.residue([1], [1, 3, 2, 0]), signal.residue([6], np.polymul([1, 0], [1, 5, 6])))
# I: 4/(s((s+1)^3+4))
for K in (4, 2, 1, 8):
    den = np.polyadd(np.poly([-1, -1, -1]), [K])
    print('K', K, 'roots', np.roots(den))
    r, p, k = signal.residue([K], np.polymul(den, [1, 0]))
    print('   resid', r, p)
    tt = np.array([1, 2, 3, 5, 10])
    y = np.real(sum(ri*e(pi*tt) for ri, pi in zip(r, p))); print('   y', y, 'final', K/(1+K))
# 3-8 sum check: 1/(s(s+1)(s+2)) partial
print(signal.residue([1], [1, 3, 2, 0]))
