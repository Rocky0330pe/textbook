# fig_p3_03_out.txt の点を tex/p3-03.tex の @@…@@ に入れる（一度だけ使う）。リポジトリの根で動かす
L = open('checks/物理第3巻/波-3/fig_p3_03_out.txt').read().split('\n')
def after(tag):
    i = [k for k, l in enumerate(L) if l.startswith('%') and tag in l][0]
    return L[i+1].strip()
d = {'@@NONE@@': after('% なし'), '@@TUNED@@': after('% 同調だけ'), '@@OPT@@': after('% 最適'),
     '@@ENVNONE@@': after('つつみ なし'), '@@ENVOPT@@': after('つつみ 最適'), '@@FRF@@': after('FRF')}
p = 'tex/p3-03.tex'
s = open(p).read()
for k, v in d.items():
    assert s.count(k) == 1, k
    s = s.replace(k, v)
open(p, 'w').write(s)
print('ok')
