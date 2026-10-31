import sys, re, collections
sys.path.insert(0, '/home/claude/work/build/phys')
import series_phys as P
for v in P.VOLS:
    cnt = collections.Counter()
    print('== vol', v['no'], v['title'], '|', v['sub'])
    for p in v['parts']:
        for c in p[3]:
            pre = [x for x in c[4].split('・') if x]
            pre2 = [P.S_TO_MATH.get(x, x) for x in pre]
            for x in pre2: cnt[int(x.split('-')[0])] += 1
            nine = [ (x, P.S_TO_MATH.get(x,x)) for x in pre if P.S_TO_MATH.get(x,x).startswith('9-')]
            if nine: print('  ', c[0], c[1], nine)
    print('  vol counts', sorted(cnt.items(), key=lambda t:-t[1]))
