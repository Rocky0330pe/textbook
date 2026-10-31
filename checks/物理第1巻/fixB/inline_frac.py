# 組B（第19回）：文中の大きな分数（\dfrac・\displaystyle）の候補を出す。python3 -I inline_frac.py tex/p1-03.tex
import re, sys
skip_env = ('tikzpicture', 'bktable', 'phflow', 'taisetsu', 'phcode', 'phcodeout', 'bkhenkei')
for path in sys.argv[1:]:
    lines = open(path, encoding='utf-8').read().split('\n')
    depth = {e: 0 for e in skip_env}
    indisp = False
    n = 0
    for i, L in enumerate(lines, 1):
        if L.lstrip().startswith('%'):
            continue
        for e in skip_env:
            depth[e] += L.count('\\begin{%s}' % e) - L.count('\\end{%s}' % e)
        busy = any(depth[e] > 0 for e in skip_env) or L.lstrip().startswith('\\phflowrow') or '\\bksheet' in L
        # \[ … \] と \pheq を取りのぞく
        t = re.sub(r'\\\[.*?\\\]', '', L)
        t = re.sub(r'\\pheq\{.*', '', t)
        if '\\[' in t and '\\]' not in t:
            indisp = True
        if indisp:
            if '\\]' in t:
                indisp = False
            continue
        if busy:
            continue
        segs = re.findall(r'(?<!\\)\$(.+?)(?<!\\)\$', t)
        for sg in segs:
            if '\\dfrac' in sg or '\\displaystyle' in sg:
                n += 1
                num = all(re.fullmatch(r'[0-9.]+', a) and re.fullmatch(r'[0-9.]+', b)
                          for a, b in re.findall(r'\\dfrac\{([^{}]*)\}\{([^{}]*)\}', sg)) and '\\displaystyle' not in sg
                print('%s:%d:%s %s' % (path, i, '数' if num else '式', sg[:110]))
    print('#', path, n)
