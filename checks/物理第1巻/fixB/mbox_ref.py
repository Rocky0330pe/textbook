# 組B（第19回）：数学の章の指し方「（4-14②）」が、行の終わりで「4-14」と「②」に分かれないようにする。
# 本文の「N-M①…」を \mbox{N-M①…} でくるむ（コメント行・すでにくるんだ所・物理の章「力-N」は変えない）。
import re, sys
pat = re.compile(r'(?<![\w\-{])(?<!力-)([3-9]-[0-9]{1,2}[①-⑳]+(?:・?[①-⑳]+)*)')
for path in sys.argv[1:]:
    out = []; n = 0
    for L in open(path, encoding='utf-8').read().split('\n'):
        if L.lstrip().startswith('%'):
            out.append(L); continue
        L2, k = pat.subn(r'\\mbox{\1}', L)
        n += k; out.append(L2)
    open(path, 'w', encoding='utf-8').write('\n'.join(out))
    print(path, n)
