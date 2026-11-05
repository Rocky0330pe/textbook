# 第6〜9巻で決めた紙面の決まり（修正事項一覧の C の項目）を、力-0〜2 で機械的に数える。
# 使い方: python3 -I rules_scan.py /home/user/textbook/tex/p1-00.tex ...
import re, sys
pats = {
 'No5 エレベータ（ーなし）': r'エレベータ(?!ー)',
 'No5 モータ（ーなし）': r'モータ(?!ー)',
 'No5 コンピューター': r'コンピューター',
 'No27 \\scriptsize/\\tiny': r'\\(scriptsize|tiny)\b',
 'No1 記号（単位）候補': r'\$[^$]{1,30}\$\s*（(?:[a-zA-Z/^·.\\{}0-9\- ]|\$[^$]*\$)+）',
 'No1 （m）など数式の後': r'\\text\{（[a-zA-Z/^ ]+）\}',
 'No20 5けた以上の素の数': r'(?<![\d.{,\\a-zA-Z])\d{5,}(?![\d}])',
 'No36 場所で指す': r'(右|左|上|下|次)の(図|表|グラフ)',
 'No31 \\quad（2）': r'\\quad\s*[（(]\s*2\s*[）)]',
 'No8 \\oint': r'\\oint',
 'No53 で学ぶ（6〜9巻）': r'[6-9]-\d+\s*で学',
 'No7 \\boldsymbol': r'\\boldsymbol',
 'C-1 W=mg': r'W=mg',
 'C-1 b を減速に': r'加速度\s*\$-b\$|\\dfrac\{v_0\^2\}\{2b\}',
}
for fn in sys.argv[1:]:
    lines = open(fn, encoding='utf-8').read().split('\n')
    print('=====', fn)
    for name, p in pats.items():
        hits=[]
        for i,l in enumerate(lines,1):
            s=l.split('%')[0] if not l.lstrip().startswith('%') else ''
            if not s: continue
            # 5けたの数は \qty{...}・\num{...} の中を除く
            if name.startswith('No20'):
                s2=re.sub(r'\\(qty|num|qtyrange)\{[^}]*\}(\{[^}]*\})?','',s)
                s2=re.sub(r'\\label\{[^}]*\}|\\bkfurref\{[^}]*\}','',s2)
                if re.search(p,s2): hits.append(i)
                continue
            if re.search(p,s): hits.append(i)
        print(f'{name}: {len(hits)}  行 {hits[:25]}')
    # 文中の \dfrac（日本語と同じ行の $…$ の中）
    n=0; ex=[]
    for i,l in enumerate(lines,1):
        if l.lstrip().startswith('%'): continue
        for m in re.finditer(r'(?<!\\)\$([^$]+)\$', l):
            if '\\dfrac' in m.group(1) or '\\displaystyle' in m.group(1):
                if re.search(r'[ぁ-んァ-ヶ一-龥]', l): n+=1; ex.append(i)
    print(f'No28 文中の \\dfrac（候補）: {n}  行 {sorted(set(ex))[:30]}')
