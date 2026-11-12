#!/usr/bin/env python3
"""アニメーションの各項目が、本の何ページの図に当たるかの表を作る（専用ビューアの側でボタンを置くため）。

使い方:
  python3 anim/build/mk_pagemap.py PDFのフォルダ
    PDF のフォルダには、ホームページの最新版の PDF（第1巻_…_Ver4.pdf … 物理第5巻_原子_Ver1.pdf）を置く。
出力:
  anim/pagemap.json                                        … 機械で読む形（ビューアの側で使う）
  docs/補助教材_アニメーション/アニメーションとページの対応.md … 人が読む形

しくみ: 候補の表（docs/補助教材_アニメーション/候補_*.md）の「場所」にある原稿の行（例 ch5-09:204、p5-15:283）から、
その図の説明（\\bkfigcaption）の文を取り出し、PDF の中でさがして、ページと位置を得る。図の説明がない所は、近くの本文の文でさがす。
"""
import glob
import json
import os
import re
import sys

import pymupdf

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CAND = os.path.join(ROOT, 'docs', '補助教材_アニメーション')
# 本の ID（ホームページの data/textbooks.js の id）と、PDF の名前の頭
BOOKS = {**{f'vol{n}': f'第{n}巻_' for n in range(1, 10)}, **{f'phys{n}': f'物理第{n}巻_' for n in range(1, 6)}}
VOLNAME = {**{f'vol{n}': f'数学 第{n}巻' for n in range(1, 10)}, **{f'phys{n}': f'物理 第{n}巻' for n in range(1, 6)}}
PHYS = {'1': '力学', '2': '熱学', '3': '波動', '4': '電磁気学', '5': '原子'}


def book_of(fname):
    m = re.match(r'ch(\d)-', fname)
    if m: return 'vol' + m.group(1)
    m = re.match(r'p(\d)-', fname)
    return 'phys' + m.group(1)


def refs_of(row):
    """表の1行から (ファイル, 行) を順に取り出す。'ch7-02:292・359' のように、同じファイルの行が続く書き方もある"""
    out = []
    for m in re.finditer(r'((?:ch\d|p\d)-\d\d)(?:\.tex)?:\s*(\d+(?:-\d+)?(?:・\d+(?:-\d+)?)*)', row):
        f = m.group(1)
        for n in re.findall(r'(\d+)(?:-\d+)?', m.group(2)):
            if int(n) >= 20:
                out.append((f, int(n)))
    return out


def clean(s):
    s = re.sub(r'%.*', '', s)
    s = re.sub(r'\\R\{([^}]*)\}\{[^}]*\}', r'\1', s)         # ルビ \R{漢字}{よみ} → 漢字
    s = re.sub(r'\$[^$]*\$', ' ', s)
    s = re.sub(r'\\(?:qty|SI|num)\{([^}]*)\}(?:\{[^}]*\})?', r'\1', s)
    s = re.sub(r'\\[a-zA-Z@]+\*?(\[[^\]]*\])?', ' ', s)
    s = re.sub(r'[{}~\\]', '', s)
    return s


def frags(text):
    """PDF の中でさがす文の切れはし（長いものから）"""
    t = clean(text)
    parts = [p.strip() for p in re.split(r'[、。．，：:；;（）()「」・\s]+', t) if len(p.strip()) >= 4]
    parts.sort(key=lambda p: -len(p))
    return [p[:14] for p in parts[:6]]


def caption_near(lines, ln):
    """行 ln（1から）の近くの図の説明。なければ近くの本文"""
    for k in range(max(0, ln - 3), min(len(lines), ln + 80)):
        if '\\bkfigcaption' in lines[k]:
            return 'caption', lines[k].split('bkfigcaption', 1)[1]
        if k > ln + 2 and re.match(r'\s*\\(bksection|bksubsection|phstage)', lines[k]):
            break
    # 図の説明がない：近くの本文（日本語が多い行）
    for d in range(0, 25):
        for k in (ln - 1 + d, ln - 1 - d):
            if 0 <= k < len(lines):
                c = clean(lines[k])
                if len(re.findall(r'[ぁ-んァ-ヶ一-龠]', c)) >= 10:
                    return 'text', lines[k]
    return None, None


_PAGES = {}


def page_index(doc):
    """ページごとに、ルビ（小さい字）をのぞいた本文と、字ごとの位置を作る（第1〜3巻はルビが本文の間に入るため）"""
    key = id(doc)
    if key in _PAGES: return _PAGES[key]
    out = []
    for pg in doc:
        spans = [sp for b in pg.get_text('dict')['blocks'] for l in b.get('lines', []) for sp in l['spans'] if sp['text'].strip()]
        sizes = sorted(sp['size'] for sp in spans)
        med = sizes[len(sizes) // 2] if sizes else 10
        text, boxes = '', []
        for sp in spans:
            if sp['size'] < 0.72 * med: continue          # ルビ
            t = sp['text'].replace(' ', '')
            text += t; boxes += [sp['bbox']] * len(t)
        out.append((text, boxes))
    _PAGES[key] = out
    return out


PHK = {'1': '力', '2': '熱', '3': '波', '4': '電', '5': '原'}


def chapter_pages(doc, fname):
    """tex のファイル名（ch5-09・p1-03）から、PDF のしおりでその章のページの範囲（0から）を出す"""
    m = re.match(r'ch(\d)-(\d\d)', fname)
    code = f'{m.group(1)}-{int(m.group(2))}' if m else None
    if not m:
        m = re.match(r'p(\d)-(\d\d)', fname); code = f'{PHK[m.group(1)]}-{int(m.group(2))}'
    toc = doc.get_toc()
    for k, (lv, title, pg) in enumerate(toc):
        if title.split('\u3000')[0].strip() == code:
            nxt = [t[2] for t in toc[k + 1:] if t[2] > pg]
            return range(pg - 1, (nxt[0] - 1) if nxt else len(doc))
    return range(len(doc))


def find(doc, kind, text, fname=None):
    idx = page_index(doc)
    rng = chapter_pages(doc, fname) if fname else range(len(doc))
    for f in frags(text):
        f = f.replace(' ', '')
        if len(f) < 4: continue
        for p in rng:
            t, boxes = idx[p]
            i = t.find(f)
            if i >= 0:
                return p, pymupdf.Rect(boxes[i]), f
    return None


def item_meta(cid):
    """anim/items/<id>.js から題と場面（key・名前）を読む"""
    p = os.path.join(ROOT, 'anim', 'items', cid + '.js')
    if not os.path.exists(p): return {}
    src = open(p, encoding='utf-8').read()
    m = re.search(r'^//\s*@title\s+(.*)$', src, re.M)
    title = re.sub(r'《([^|》]+)\|[^》]+》', r'\1', m.group(1).strip()) if m else ''
    scenes = []
    for k, lab in re.findall(r"key:\s*'([^']+)'\s*,\s*label:\s*'([^']*)'", src):
        scenes.append({'key': k, 'label': re.sub(r'《([^|》]+)\|[^》]+》', r'\1', lab)})
    return {'title': title, 'scenes': scenes}


def main():
    pdfdir = sys.argv[1]
    docs = {}
    for b, head in BOOKS.items():
        fs = glob.glob(os.path.join(pdfdir, head + '*.pdf'))
        if fs:
            docs[b] = (pymupdf.open(fs[0]), os.path.basename(fs[0]))
    texcache = {}
    items = []
    for cf in sorted(glob.glob(os.path.join(CAND, '候補_*.md'))):
        for row in open(cf, encoding='utf-8'):
            m = re.match(r'\| ([MP]\d-\d\d) \|', row)
            if not m: continue
            cid = m.group(1).lower()
            cols = [c.strip() for c in row.strip().strip('|').split('|')]
            what = cols[2] if len(cols) > 2 else ''
            locs, seen = [], set()
            for f, ln in refs_of(cols[1]):
                b = book_of(f)
                if b not in docs: continue
                if f not in texcache:
                    p = os.path.join(ROOT, 'tex', f + '.tex')
                    texcache[f] = open(p, encoding='utf-8').read().splitlines() if os.path.exists(p) else []
                kind, text = caption_near(texcache[f], ln)
                if not text: continue
                doc, pdfname = docs[b]
                r = find(doc, kind, text, f)
                if not r: locs.append({'book': b, 'tex': f'{f}:{ln}', 'found': False}); continue
                p, rect, frag = r
                key = (b, p, round(rect.y0))
                if key in seen: continue
                seen.add(key)
                W, H = doc[p].rect.width, doc[p].rect.height
                locs.append({'book': b, 'pdf': pdfname, 'tex': f'{f}:{ln}', 'page': p + 1, 'label': doc[p].get_label() or str(p + 1),
                             'by': kind, 'match': frag,
                             'rect': [round(rect.x0 / W, 4), round(rect.y0 / H, 4), round(rect.x1 / W, 4), round(rect.y1 / H, 4)],
                             'found': True})
            meta = item_meta(cid)
            items.append({'id': cid, 'title': meta.get('title', ''), 'file': cid + '.html', 'scenes': meta.get('scenes', []), 'what': what, 'locations': locs})
    out = {'note': 'アニメーションの項目（id）と、本の図の場所。page は PDF のページ（1から。ビューアの ?page=）、label は本のノンブル。'
                   'rect は図の説明（または近くの文）の位置で、ページの幅・高さを1とした [左, 上, 右, 下]。by=caption は図の説明で、text は近くの本文で見つけたもの。',
           'books': {b: v[1] for b, v in docs.items()}, 'items': items}
    with open(os.path.join(ROOT, 'anim', 'pagemap.json'), 'w', encoding='utf-8') as fp:
        json.dump(out, fp, ensure_ascii=False, indent=1)
    write_md(out)
    n = sum(len(i['locations']) for i in items); ok = sum(1 for i in items for l in i['locations'] if l['found'])
    miss = [i['id'] for i in items if not any(l['found'] for l in i['locations'])]
    print(f'項目 {len(items)}、場所 {n}（見つかった {ok}）。1か所も見つからない項目：{miss}')


def write_md(out):
    L = ['# アニメーションとページの対応', '',
         '専用のビューア（ホームページの `textbooks/viewer/?id=<本>&page=<PDFのページ>`）で、アニメーションのボタンを置く場所の一覧。',
         '`anim/build/mk_pagemap.py` が、ホームページの最新版の PDF から自動で作った（機械で読む形は `anim/pagemap.json`）。',
         '', '- 「PDF」はビューアの `page=`（1から数える）、「ノンブル」は本に印刷されたページ。',
         '- 「目じるし」は、PDF の中で見つけた文（図の説明の頭、または近くの本文）。ボタンはこの文の近く（図の説明の横）に置く。',
         '- 「アニメーション」の名前は、アニメーションのファイル名（`<名前>.html`）。場面の指定は `#<場面>`。',
         '- 「△」は図の説明が見つからず、近くの本文で見つけたもの（同じ章の、同じか近いページ。ずれることがある）。「×」は見つからなかったもの（ビューアの側で場所を決める）。', '',
         '使った PDF：' + '、'.join(sorted(set(out['books'].values()))), '']
    # 項目ごとの主な場所（図の説明で見つけたものを先に）
    L += ['## 項目ごとの主な場所（169項目）', '', 'ビューアで最初にボタンを置く1か所。ほかの場所は、下の巻ごとの表にある。', '',
          '| アニメーション | 題 | 本（id） | PDF | ノンブル | 目じるし | 場面（#key） | ほかの場所の数 |', '| --- | --- | --- | --- | --- | --- | --- | --- |']
    for it in out['items']:
        fl = [l for l in it['locations'] if l['found']]
        if not fl:
            L.append(f"| {it['id']} | {it.get('title', '')} | × | × | × | （見つからない） | | 0 |"); continue
        fl.sort(key=lambda l: (l['by'] != 'caption',))
        l = fl[0]
        L.append(f"| {it['id']} | {it.get('title', '')} | {VOLNAME[l['book']]}（`{l['book']}`） | {l['page']} | {l['label']} | {'' if l['by'] == 'caption' else '△ '}{l['match']} | {', '.join(sc['key'] for sc in it.get('scenes', []))} | {len(fl) - 1} |")
    L.append('')
    order = list(BOOKS)
    for b in order:
        rows = []
        for it in out['items']:
            for l in it['locations']:
                if l['book'] != b: continue
                if l['found']:
                    rows.append((l['page'], f"| {it['id']} | {l['page']} | {l['label']} | {'' if l['by'] == 'caption' else '△ '}{l['match']} | `{l['tex']}` | {it['what'][:60]} |"))
                else:
                    rows.append((99999, f"| {it['id']} | × | × | （見つからない） | `{l['tex']}` | {it['what'][:60]} |"))
        if not rows: continue
        L += [f'## {VOLNAME[b]}（id: `{b}`）', '', '| アニメーション | PDF | ノンブル | 目じるし | 原稿 | 動かすもの |', '| --- | --- | --- | --- | --- | --- |']
        L += [r for _, r in sorted(rows)] + ['']
    with open(os.path.join(CAND, 'アニメーションとページの対応.md'), 'w', encoding='utf-8') as fp:
        fp.write('\n'.join(L) + '\n')


if __name__ == '__main__':
    main()
