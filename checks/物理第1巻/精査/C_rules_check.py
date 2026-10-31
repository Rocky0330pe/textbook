# 紙面の決まり（C の項目）の候補を数える。原稿は読むだけ。
import re, sys, json
ROOT = '/home/user/textbook/tex/'
JP = re.compile(r'[\u3040-\u30ff\u4e00-\u9fff]')
def strip_comments(s):
    return re.sub(r'(?<!\\)%.*', '', s)
res = {}
for ch in ['p1-05', 'p1-06', 'p1-07']:
    lines = open(ROOT + ch + '.tex', encoding='utf-8').read().split('\n')
    out = {'inline_dfrac': [], 'inline_matrix': [], 'quad_small': [], 'unit_paren': [],
           'five_digit': [], 'place_ref': [], 'scriptsize': [], 'E_unit': [], 'kanji_ude': []}
    disp = False
    for i, raw in enumerate(lines, 1):
        l = strip_comments(raw)
        if re.search(r'\\\[|\\begin\{(align|equation|gather)', l): disp = True
        segs = []
        if not disp:
            # $...$ を取り出す（\pheq や \phflowrow の引数も別の行として扱う）
            for m in re.finditer(r'(?<!\\)\$(.+?)(?<!\\)\$', l):
                segs.append(m.group(1))
        if re.search(r'\\\]|\\end\{(align|equation|gather)', l): disp = False
        text_wo_math = re.sub(r'(?<!\\)\$(.+?)(?<!\\)\$', '', l)
        has_jp = bool(JP.search(text_wo_math))
        skip = re.search(r'\\pheq|\\phflowrow|\\phk[x]?\{|\\tsl|\\pxfline|\\pxgline|\\bkjans|\\bkpans|bksheet|axis|\\node|\\kotae', l)
        for s in segs:
            if has_jp and not skip and re.search(r'\\dfrac|\\displaystyle', s):
                out['inline_dfrac'].append(i)
            if has_jp and re.search(r'pmatrix', s):
                out['inline_matrix'].append(i)
        if re.search(r'（[12１２]）[^\n]*\\quad[^\n]*（[23２３]）', l) and not re.search(r'\\bk[pj]ans|\\kotae', l):
            out['quad_small'].append(i)
        # 記号と単位を（ ）で並べる： $x$（m） の形（表の見出し・軸は別なので候補）
        for m in re.finditer(r'\$\\?[A-Za-z\\]+[^$]{0,20}\$（(rad/s|m/s|m|s|N|kg|N·m|rad|°)）', l):
            out['unit_paren'].append(i)
        for m in re.finditer(r'(?<![\d.{\\])(\d{5,})(?![\d}])', re.sub(r'\\(num|qty)\{[^}]*\}', '', l)):
            out['five_digit'].append((i, m.group(1)))
        if re.search(r'(右|左|上|下)の(図|表|グラフ)', l):
            out['place_ref'].append(i)
        if re.search(r'\\scriptsize|\\tiny', l):
            out['scriptsize'].append(i)
        if re.search(r'単位行列', l):
            out['E_unit'].append(i)
        if '腕' in l: out['kanji_ude'].append(i)
    res[ch] = out
for ch, o in res.items():
    print('==', ch)
    for k, v in o.items():
        print(f'  {k}: {len(v)}  {v[:40]}')
