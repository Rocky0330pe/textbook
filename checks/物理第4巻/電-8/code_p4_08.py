import math
sig, f, Bm, rho = 2.0e6, 50, 1.5, 7650   # 導電率、周波数、磁場の山、密度
for dmm in [1.0, 0.5, 0.35, 0.23]:      # 板の厚さ（mm）
    d = dmm / 1000
    p = math.pi**2 * sig * f**2 * Bm**2 * d**2 / 6   # W/m3
    print(dmm, round(p), round(p / rho, 2))       # 1 kg あたりは W/kg
