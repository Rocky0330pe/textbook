import numpy as np
import sys
out_dir = sys.argv[1]
rng = np.random.default_rng(7)


def dens_max(dens, L):
    p = rng.uniform(-L, L, (400000, 3))
    r = np.sqrt((p ** 2).sum(1))
    return dens(p, r).max() * 1.05


def sample(dens, L, N, slab):
    out = []
    dm = dens_max(dens, L)
    while len(out) < N:
        p = rng.uniform(-L, L, (200000, 3))
        r = np.sqrt((p ** 2).sum(1))
        keep = rng.random(len(r)) < dens(p, r) / dm
        sel = keep & (np.abs(p[:, 1]) < slab)
        out.extend(p[sel][:, [0, 2]].tolist())
    return np.array(out[:N])


d1 = lambda p, r: np.exp(-2 * r)
d2s = lambda p, r: (2 - r) ** 2 * np.exp(-r)
d2p = lambda p, r: p[:, 2] ** 2 * np.exp(-r)
for name, d, L, N, slab in (("1s", d1, 4, 500, 0.5), ("2s", d2s, 13, 700, 1.5), ("2p", d2p, 13, 700, 1.5)):
    pts = sample(d, L, N, slab)
    s = 16 / L
    with open(f"{out_dir}/cloud_{name}.txt", "w") as f:
        f.write(",".join(f"{x*s:.1f}/{z*s:.1f}" for x, z in pts if abs(x * s) < 16 and abs(z * s) < 16))
    print(name, len(pts), s)
