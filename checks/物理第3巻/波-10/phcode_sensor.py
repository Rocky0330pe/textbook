import math
def H(r, z):                       # ゆれの倍率
    return 1 / math.sqrt((1 - r*r)**2 + (2*z*r)**2)
print('w/wn ', '  '.join(f'z={z}' for z in (0.1, 0.4, 0.7)))
for r in (0.1, 0.2, 0.3, 0.5, 0.7, 1.0):
    s = [f'{H(r, z):5.2f}' for z in (0.1, 0.4, 0.7)]
    print(f'{r:4.1f} ', '  '.join(s))
