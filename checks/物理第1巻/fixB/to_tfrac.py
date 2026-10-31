# 組B（第19回）：指定した行の、文中の $…$ の中の \dfrac を \tfrac にする（\[ \] と \pheq は変えない）。
# python3 -I to_tfrac.py tex/p1-16.tex 207 222 …
import re, sys
path = sys.argv[1]; rows = set(int(a) for a in sys.argv[2:])
lines = open(path, encoding='utf-8').read().split('\n')
def fix(seg):
    return seg.replace('\\dfrac', '\\tfrac')
for i in rows:
    L = lines[i - 1]
    # \[ … \] と \pheq{…}{…} の部分を守る
    parts = re.split(r'(\\\[.*?\\\]|\\pheq\{.*$)', L)
    out = []
    for k, p in enumerate(parts):
        if k % 2 == 1:
            out.append(p); continue
        out.append(re.sub(r'(?<!\\)\$(.+?)(?<!\\)\$', lambda m: '$' + fix(m.group(1)) + '$', p))
    lines[i - 1] = ''.join(out)
open(path, 'w', encoding='utf-8').write('\n'.join(lines))
