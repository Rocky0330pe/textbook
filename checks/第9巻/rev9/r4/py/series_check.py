import sys, re
sys.path.insert(0, '/home/claude/work/build')
import series as S
src = open('/home/claude/work/build/tex/ch9-13.tex').read()
# all chapters
chs = []
for v in S.VOLS:
    n = 0
    for p in v['parts']:
        for c in p[2]:
            chs.append((v['no'], c)); n += 1
    print('vol', v['no'], v['title'], '|', v['sub'], '| chapters', n)
print('total chapters', len(chs))
# stations per route
st = {r: [] for r in range(1, 8)}
for vno, c in chs:
    for r in c[4]:
        st[r].append(c[0])
# extract table from tex
lines = [l for l in src.splitlines() if l.startswith(r'\bkrouteicon{') and '・' in l and '→' not in l]
for l in lines:
    m = re.match(r'\\bkrouteicon\{(\d)\} & (\S+) & (.*) & (\d+) \\\\', l)
    r = int(m.group(1)); lst = m.group(3).split('・'); cnt = int(m.group(4))
    exp = [x for x in st[r] if x != '9-13']
    print(r, S.ROUTES[r]['name'], m.group(2), 'tex', len(lst), 'stated', cnt, 'series(w/o 9-13)', len(exp), 'MATCH' if lst == exp else 'DIFF', set(lst) ^ set(exp), 'order ok' if sorted(lst,key=exp.index if set(lst)<=set(exp) else None)==lst else '')
# route main stations table
for l in src.splitlines():
    m = re.match(r'\\bkrouteicon\{(\d)\} & (\S+) & (.*→.*) & (.*) \\\\', l)
    if m:
        r = int(m.group(1)); ids = re.findall(r'（(\d-\d+)）', m.group(3))
        exp, end = S.ROUTE_STATIONS[r]
        print('main', r, ids == exp, ids, exp, m.group(4).strip(), end, m.group(4).strip() == end)
for r in S.ROUTES: print(r, S.ROUTES[r]['name'], S.ROUTES[r]['sub'])
# which chapters marked with multiple routes
for vno, c in chs:
    if len(c[4]) > 1: print('multi', c[0], c[4])
# endpoints per vol
for r,(lst,end) in S.ROUTE_STATIONS.items(): print('end', r, lst[-1])
