# -*- coding: utf-8 -*-
"""物理第5巻 巻末「分野で記号がぶつかるもの」の照らし合わせ（第32回、巻を組む組、11月12日）。
各行の記号が、章の原稿（tex/p5-NN.tex）の数式の中に出る章を数え、行に書かれていない章を出す。
出た章は、1つずつ本文を読んで、行に書いた意味と同じか（同じなら足さない）、ちがう意味か（足す）を決める。
単位・立てた字・ことば（\\qty・\\mathrm・\\text）とコメントは数えない。表計算のセル（B2 など）・図の札・専門書の式の引用も数えるので、候補として読む。
使い方: python3 -I checks/物理第5巻/巻末/symtab_ph5.py > checks/物理第5巻/巻末/symtab_ph5_out.txt
"""
import os, re

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'tex')


def strip_comments(t):
    return '\n'.join(re.sub(r'(?<!\\)%.*', '', l) for l in t.split('\n'))


def maths(t):
    segs = re.findall(r'\\\[(.*?)\\\]', t, re.S)
    t2 = re.sub(r'\\\[(.*?)\\\]', ' ', t, flags=re.S)
    segs += re.findall(r'(?<!\\)\$(.*?)(?<!\\)\$', t2, re.S)
    for m in re.finditer(r'\\pheq\{', t2):
        i = m.end(); d = 1; j = i
        while j < len(t2) and d:
            if t2[j] == '{': d += 1
            elif t2[j] == '}': d -= 1
            j += 1
        segs.append(t2[i:j - 1])
    return segs


def clean(s):
    s = re.sub(r'\\(qty|SI)\{[^{}]*\}\{[^{}]*\}', ' NUM ', s)
    s = re.sub(r'\\qtyrange\{[^{}]*\}\{[^{}]*\}\{[^{}]*\}', ' NUM ', s)
    s = re.sub(r'\\(unit|si|num)\{[^{}]*\}', ' NUM ', s)
    for _ in range(2):
        s = re.sub(r'\\(mathrm|text|textrm|mathup|operatorname|textbf|mbox)\{[^{}]*\}', ' ', s)
    s = re.sub(r'\\mathrm\s*[A-Za-z]', ' ', s)
    return s


chap = {}
for i in range(17):
    t = strip_comments(open(os.path.join(root, 'p5-%02d.tex' % i), encoding='utf-8').read())
    chap[i] = [clean(x) for x in maths(t)]


def find(pat):
    rx = re.compile(pat)
    out = {}
    for i, segs in chap.items():
        n = sum(len(rx.findall(s)) for s in segs)
        if n:
            out[i] = n
    return out


def letter(c):
    return r'(?<![A-Za-z\\])' + c + r'(?![A-Za-z])'


def cited(text):
    s = set()
    if '全章' in text:
        s |= set(range(17))
    for m in re.finditer(r'原-(\d+)((?:[・〜]\d+)*)', text):
        prev = int(m.group(1)); nums = [prev]
        for sep, n in re.findall(r'([・〜])(\d+)', m.group(2)):
            n = int(n)
            nums += list(range(prev + 1, n + 1)) if sep == '〜' else [n]
            prev = n
        s |= set(nums)
    if '第1部' in text:
        s |= set(range(8))
    if '第4部' in text:
        s |= {12, 13, 14, 15, 16}
    return s


back = open(os.path.join(root, 'ph5-back.tex'), encoding='utf-8').read()
a = back.index('記号 & この巻での意味')
tab = back[a:back.index('\\end{longtblr}', a)]
for r in [r for r in tab.split('\\\\\n')[1:] if r.strip()]:
    cols = r.split(' & ')
    c = cited(cols[1])
    for sy in re.findall(r'\$([^$]*)\$', cols[0]):
        sy = sy.strip()
        pat = letter(sy) if re.fullmatch(r'[A-Za-z]', sy) else re.escape(sy) + r'(?![A-Za-z])'
        found = find(pat)
        miss = sorted(set(found) - c)
        print('%-12s 出る章 %s ／ 行にない章 %s' % (sy, ' '.join('原-%d' % k for k in sorted(found)), ' '.join('原-%d(%d)' % (k, found[k]) for k in miss) or 'なし'))
