from math import exp
c1 = 3.742e8     # W·μm^4/m^2（第1放射定数）
c2 = 14388       # μm·K（第2放射定数）
def E(lam, T):   # 波長 lam〔μm〕の所の強さ〔W/(m2·μm)〕
    return c1 / (lam**5 * (exp(c2 / (lam * T)) - 1))
dl = 0.01        # 細い長方形のはば〔μm〕
for T in [300, 600, 1200, 5772]:
    total, best, lbest = 0.0, 0.0, 0.0
    lam = 0.1 + dl / 2
    while lam < 1000:
        e = E(lam, T)
        total = total + e * dl        # 細い長方形をたす
        if e > best:
            best, lbest = e, lam      # いちばん強い所
        lam = lam + dl
    print(T, '%.4g' % total, '%.4g' % (total / T**4), round(lbest, 2), round(lbest * T))
