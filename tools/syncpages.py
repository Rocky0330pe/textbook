#!/usr/bin/env python3
"""組んだ結果のページ数を pages_actual.json に書く（第11回編集委員会：ページ制限をなくした）。
使い方:  python3 tools/syncpages.py 2   （tex/vol2.log を読む）
         python3 tools/syncpages.py p1  （第13回：物理シリーズ第1巻。tex/ph1.log → phys/pages_actual_phys.json。そのあと python3 phys/gen_phys.py）
  そのあと python3 gen.py で、もくじ・カバー（背幅）を作り直し、もう一度組む。
  章の長さ＝次の章（または巻末）のはじまり−この章のはじまり（あいだに部扉があれば2を引く）。
  前の章が奇数ページで終わったときに入るメモのページは、前の章の長さに入る。
"""
import json, os, re, sys
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, '..')
sys.path.insert(0, root)
n = sys.argv[1]
# 第13回編集委員会（物理第1巻）：「p1」で物理シリーズ第1巻（tex/ph1.log → phys/pages_actual_phys.json の "1"。phys/series_phys.py が読む）
phys = n.startswith('p')
if phys:
    n = n[1:]
log = open(os.path.join(root, 'tex', ('ph%s.log' if phys else 'vol%s.log') % n), encoding='utf-8', errors='replace').read().replace('\n', '')
chap = {}
backs = []
colophon = None
for kind, name, pg in re.findall(r'BKPAGE (chap|back|colophon) ?(\S*) (\d+)', log):
    if kind == 'chap':
        chap[name] = int(pg)
    elif kind == 'back':
        backs.append((name, int(pg)))
    else:
        colophon = int(pg)
path = os.path.join(root, 'phys', 'pages_actual_phys.json') if phys else os.path.join(root, 'pages_actual.json')
try:
    data = json.load(open(path, encoding='utf-8'))
except OSError:
    data = {}
if phys:
    sys.path.insert(0, os.path.join(root, 'phys'))
    import series_phys as S
    missing = re.findall(r'BKPAGE missing p\d+-(\d\d)', log)
    if missing:
        print('注意：まだない章があります（%d章）。組んだ章のページだけを書きます。ない章は計画のページのまま' % len(missing))
else:
    import series as S
v = S.VOLS[int(n) - 1]
data.pop(n, None)
S.ACTUAL.pop(n, None)
out, back_plan, _ = S.layout(v)
items = []  # (種類, 名前)
for o in out:
    items.append(('part', None) if o[0] == 'part' else ('chap', o[1][0]))
lens = {}
for i, (k, cid) in enumerate(items):
    if k != 'chap' or cid not in chap:
        continue
    st = chap[cid]
    nxt = None; parts = 0
    for k2, c2 in items[i + 1:]:
        if k2 == 'part':
            parts += 1
        elif c2 in chap:
            nxt = chap[c2]; break
    if nxt is None:
        nxt = backs[0][1] if backs else None
    if nxt is not None:
        lens[cid] = nxt - st - 2 * parts
names = [b[0] for b in back_plan]
blens = {}
if len(backs) != len(names):
    print('注意：巻末の項目の数が計画（%d）と組んだ結果（%d）でちがいます' % (len(names), len(backs)))
for i, (nm, pg) in enumerate(backs[:len(names)]):
    end = backs[i + 1][1] if i + 1 < len(backs) else colophon
    if end is not None:
        blens[names[i]] = end - pg
data[n] = {'chap': lens, 'back': blens, 'total': colophon}
if phys and lens and len(lens) < sum(1 for k, _ in items if k == 'chap'):
    # 物理：まだない章があるときは、巻末と奥付は書かない（計画のページのまま。章がそろってから合わせる）
    blens = {}; colophon = None
    data[n] = {'chap': lens, 'back': blens, 'total': colophon}
elif phys and not lens:
    data.pop(n, None)
    print('組んだ章がないので、計画のページのままにします')
tmp = path + '.tmp'
json.dump(data, open(tmp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)
os.replace(tmp, path)
odd = [c for c, l in lens.items() if l % 2]
print('%s第%s巻：章 %d、巻末 %d 項目、奥付 p.%s' % ('物理' if phys else '', n, len(lens), len(blens), colophon))
if odd:
    print('奇数ページの章（ありえない。部扉・章が偶数から始まっていない）:', odd)
