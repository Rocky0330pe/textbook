# 第2版：pgfplots の \addplot coordinates を \draw plot coordinates に置きかえる（nullfont の警告をなくす）。リポジトリの根で動かす
import re
L = open('checks/物理第3巻/波-3/fig_p3_03_out.txt').read().split('\n')
seg = {}
for k, l in enumerate(L):
    m = re.match(r'^%+SEG (\w+) (\d+)', l)
    if m:
        seg.setdefault(m.group(1), []).append(L[k+1].strip())
p = 'tex/p3-03.tex'
s = open(p).read()
lines = s.split('\n')
out = []
for l in lines:
    if l.startswith('  \\addplot[bkcurve2, line width=1.2pt, dash pattern=on 4pt off 2pt, smooth] coordinates {(0,0)'):
        l = l.replace('\\addplot[bkcurve2, line width=1.2pt, dash pattern=on 4pt off 2pt, smooth] coordinates', '\\draw[bkOrange, line width=1.2pt, dash pattern=on 4pt off 2pt] plot[smooth] coordinates')
    elif l.startswith('  \\addplot[bkcurve, line width=1.4pt, smooth] coordinates {(0,0)'):
        l = l.replace('\\addplot[bkcurve, line width=1.4pt, smooth] coordinates', '\\draw[bkBlue, line width=1.4pt] plot[smooth] coordinates')
    elif l.startswith('  \\addplot[bkGray, line width=1.1pt, dash pattern=on 4pt off 2pt] coordinates'):
        l = '\n'.join('  \\draw[bkGray, line width=1.1pt, dash pattern=on 4pt off 2pt] plot coordinates {%s};' % c for c in seg['NONE'])
    elif l.startswith('  \\addplot[bkcurve2, line width=1.1pt, dash pattern=on 1.2pt off 1.2pt] coordinates'):
        l = '\n'.join('  \\draw[bkOrange, line width=1.1pt, dash pattern=on 1.2pt off 1.2pt] plot coordinates {%s};' % c for c in seg['TUNED'])
    elif l.startswith('  \\addplot[bkcurve, line width=1.5pt] coordinates'):
        l = '\n'.join('  \\draw[bkBlue, line width=1.5pt] plot coordinates {%s};' % c for c in seg['OPT'])
    elif l.startswith('  \\addplot[bkcurve, line width=1.2pt, smooth] coordinates {(0.200'):
        l = '  \\draw[bkBlue, line width=1.2pt] plot coordinates {%s};' % seg['FRF'][0]
    out.append(l)
s2 = '\n'.join(out)
assert s2.count('\\addplot') == s.count('\\addplot') - 6, (s.count('\\addplot'), s2.count('\\addplot'))
open(p, 'w').write(s2)
print('ok')
