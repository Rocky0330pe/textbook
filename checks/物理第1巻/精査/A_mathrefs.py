# 力-0〜2 が指す数学の章（数学 N-M と丸数字）を一覧にし、指す先の章の節見出しを出す。
import re, sys, glob, os
T='/home/user/textbook/tex/'
refs={}
for fn in ['p1-00.tex','p1-01.tex','p1-02.tex']:
    for i,l in enumerate(open(T+fn,encoding='utf-8'),1):
        if l.lstrip().startswith('%'): continue
        for m in re.finditer(r'数学\s?(\d)-(\d+)([①-⑳]?)', l):
            key=(int(m.group(1)),int(m.group(2)),m.group(3))
            refs.setdefault(key,[]).append(f'{fn[:5]}:{i}')
def subsecs(v,c):
    f=T+f'ch{v}-{c:02d}.tex'
    if not os.path.exists(f): return None
    s=open(f,encoding='utf-8').read()
    return re.findall(r'\\bksubsection\{(\d+)\}\{([^}]*)\}', s)
for k in sorted(refs):
    v,c,n=k
    ss=subsecs(v,c)
    tgt=''
    if ss is None: tgt='(ファイルなし)'
    elif n:
        idx='①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳'.index(n)+1
        hit=[t for (a,t) in ss if int(a)==idx]
        tgt=hit[0] if hit else f'(節{idx}なし: 節の数{len(ss)})'
    else:
        tgt=' / '.join(t for a,t in ss[:12])
    print(f'{v}-{c}{n}  {refs[k]}  →  {tgt}')
