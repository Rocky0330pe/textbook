#!/usr/bin/env python3
"""修D（R3-8・K-6）：力-8〜11 の文中の分数の一覧を作る。
使い方: python3 checks/物理第1巻/委員確認/D_frac_list.py [tex/p1-08.tex ...]
文中の $…$ の中にある \\tfrac・\\frac・\\dfrac を拾い、
  num  … 分子・分母が数だけ（そのままでよい）
  simple … 文字だけの簡単な分数（a/b に）
  big  … 添字・指数・和差・根号・2段など（別の行に出す）
に分けて、行の番号と前後の文を出す。図（tikzpicture）の中は数えない。
"""
import re, sys, os

def braced(s, i):
    """s[i]=='{' から対応する } までを返す（中身, 次の位置）"""
    assert s[i] == '{'
    d = 0
    for j in range(i, len(s)):
        if s[j] == '{':
            d += 1
        elif s[j] == '}':
            d -= 1
            if d == 0:
                return s[i + 1:j], j + 1
    return s[i + 1:], len(s)

def arg(s, i):
    while i < len(s) and s[i] == ' ':
        i += 1
    if s[i] == '{':
        return braced(s, i)
    if s[i] == '\\':
        m = re.match(r'\\[A-Za-z]+', s[i:])
        return m.group(0), i + len(m.group(0))
    return s[i], i + 1

NUM = re.compile(r'^\s*[0-9.]+\s*$')
SIMPLE = re.compile(r'^\s*(\\?[A-Za-z]+|[0-9.]*\s*\\?[A-Za-z]+(\s*\\?[A-Za-z]+)?|\\pi|[0-9.]+\\pi)\s*$')

def kind(a, b):
    if NUM.match(a) and NUM.match(b):
        return 'num'
    bad = re.compile(r'[_^+\-]|\\sqrt|\\frac|\\tfrac|\\dfrac|\\left|\\qty|\\mathrm|\\text|\(')
    if not bad.search(a) and not bad.search(b) and len(a) <= 12 and len(b) <= 12:
        return 'simple'
    return 'big'

def scan(path):
    src = open(path, encoding='utf-8').read()
    lines = src.split('\n')
    out = []
    intikz = 0
    for ln, line in enumerate(lines, 1):
        code = re.sub(r'(?<!\\)%.*', '', line)
        if r'\begin{tikzpicture}' in code:
            intikz += 1
        if intikz:
            if r'\end{tikzpicture}' in code:
                intikz -= 1
            continue
        # 行の中の $…$（$$ はない前提）。\[ \] の行はとばす
        segs = re.findall(r'(?<!\\)\$(.+?)(?<!\\)\$', code)
        for seg in segs:
            for m in re.finditer(r'\\[td]?frac', seg):
                i = m.end()
                try:
                    a, i = arg(seg, i)
                    b, i = arg(seg, i)
                except Exception:
                    a = b = '?'
                if m.group(0) == r'\frac' and len(a) == 1 and len(b) == 1 and a.isdigit() and b.isdigit():
                    k = 'num'
                else:
                    k = kind(a, b)
                out.append((ln, k, m.group(0), a, b, seg))
    return out

if __name__ == '__main__':
    files = sys.argv[1:] or ['tex/p1-%02d.tex' % n for n in (8, 9, 10, 11)]
    tot = {}
    for f in files:
        r = scan(f)
        c = {}
        for ln, k, cmd, a, b, seg in r:
            c[k] = c.get(k, 0) + 1
            if k != 'num':
                print('%s:%d\t%s\t%s{%s}{%s}\t$%s$' % (os.path.basename(f), ln, k, cmd, a, b, seg[:90]))
        print('# %s  %s' % (os.path.basename(f), c))
