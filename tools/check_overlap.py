#!/usr/bin/env python3
"""組んだ PDF から、図の中の「字と線」「字と字」「字と点・矢じり」の重なりの候補を見つける（第19回編集委員会）。

使い方:
  python3 tools/check_overlap.py 組んだPDF [--pages 10-40] [--out 画像のフォルダ] [--first 本のページ番号]
    → 重なりの候補をページごとに表示する。--out を指定すると、候補の所に赤い枠をつけた
      ページの画像（候補のあるページだけ）と、一覧 report.md を書き出す。
      --first は PDF の1ページめのノンブル（tryv の PDF は章の始まりのページ。省略すると PDF のページ番号）。

見つけるもの（どれも「候補」。最後は画像を見て決める）:
  線と字   : 線（グラフの線・軸・矢印の軸・枠の線など）が字の形の内側を通る
  字と字   : ちがう語の字の形どうしが重なる
  点と字   : 小さな塗りの図形（点・矢じり）が字の形にかかる
  字がかくれる: あとから塗った図形（白い地のラベルなど）が、前に置いた字の一部をかくす
  図形と図形: 枠のある図形（四角・ひし形・丸）どうしが、入れ子でなく重なる
  白地     : 白い地（fill=white）で線をかくし、その上に字を置いている（FIX-ver2-common 3 で「やめる」と決めた形）
  うすい線 : うすい色の線（方眼の線など）が字を通る（軽い候補として分けて出す）

しくみ: PyMuPDF（pip install pymupdf）で、字は字形の正確な枠（TEXT_ACCURATE_BBOXES）、線と図形は
get_drawings() で読む。字の枠を少し内側に縮めて（字の形にふれるだけの線は数えない）、線分が通るかを調べる。
本文の表の罫線・囲みの枠・分数の線は、字の形の内側を通らないので候補にならない。
"""
import argparse
import os
import sys

try:
    import pymupdf as fitz
except ImportError:  # 古い版
    import fitz

INSET = 0.35        # 字の枠を内側に縮める量（pt）
GLYPH_OVERLAP = 0.12  # 字と字：小さいほうの字の面積のこの割合をこえて重なったら候補
SMALL_FILL = 40.0   # 点・矢じりとみなす塗りの面積の上限（pt^2）
LIGHT = 0.80        # 線の色の明るさ（0〜1）がこれ以上なら「うすい線」
CELL = 12.0
SHAPE_MIN, SHAPE_MAX = 150.0, 40000.0  # 図形と図形で調べる図形の大きさ（pt^2）
SHAPE_OVERLAP = 0.04  # 小さいほうの図形のこの割合をこえて重なったら候補
BIGOP = set('∫∬∭∮∯∰∑∏∐⋃⋂√∛∜⨀⨁⨂') | {chr(c) for c in range(0x239B, 0x23B4)}  # 大きなかっこの部品も
PUNCT = set('、。，．・：；「」『』（）〔〕［］｛｝〈〉《》【】“”‘’()[]{}')         # 速く調べるための升目の大きさ（pt）


def lum(c):
    if not c:
        return 0.0
    if len(c) == 1:
        return c[0]
    if len(c) == 3:
        return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]
    if len(c) == 4:  # CMYK
        k = c[3]
        return 1 - min(1, 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2] + k)
    return 0.0


def is_white(c):
    return c is not None and lum(c) > 0.97


def seg_hits_rect(p, q, r):
    """線分 pq が長方形 r（x0,y0,x1,y1）の内側を通るか（Liang–Barsky）。"""
    x0, y0, x1, y1 = r
    dx, dy = q[0] - p[0], q[1] - p[1]
    t0, t1 = 0.0, 1.0
    for pp, qq in ((-dx, p[0] - x0), (dx, x1 - p[0]), (-dy, p[1] - y0), (dy, y1 - p[1])):
        if pp == 0:
            if qq < 0:
                return False
        else:
            t = qq / pp
            if pp < 0:
                if t > t1:
                    return False
                t0 = max(t0, t)
            else:
                if t < t0:
                    return False
                t1 = min(t1, t)
    return t0 <= t1


def clip_seg(s, r):
    """線分 s を長方形 r の中の部分だけにする（外なら None）。"""
    (px, py), (qx, qy) = s
    dx, dy = qx - px, qy - py
    t0, t1 = 0.0, 1.0
    for pp, qq in ((-dx, px - r.x0), (dx, r.x1 - px), (-dy, py - r.y0), (dy, r.y1 - py)):
        if pp == 0:
            if qq < 0:
                return None
        else:
            t = qq / pp
            if pp < 0:
                if t > t1:
                    return None
                t0 = max(t0, t)
            else:
                if t < t0:
                    return None
                t1 = min(t1, t)
    return ((px + t0 * dx, py + t0 * dy), (px + t1 * dx, py + t1 * dy))


def is_closed(d):
    """閉じた図形か（closePath の印か、はじめの点と終わりの点が同じ）。"""
    if d.get('closePath'):
        return True
    it = d['items']
    if not it:
        return False
    if len(it) == 1 and it[0][0] in ('re', 'qu'):
        return True
    p0 = it[0][1]
    p1 = it[-1][-1]
    try:
        return abs(p0.x - p1.x) < 0.5 and abs(p0.y - p1.y) < 0.5
    except AttributeError:
        return False


def point_in(p, poly):
    """点 p が多角形 poly（点の列）の内側か。"""
    x, y = p
    inside = False
    n = len(poly)
    for k in range(n):
        x1, y1 = poly[k]
        x2, y2 = poly[(k + 1) % n]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1 + 1e-12) + x1:
            inside = not inside
    return inside


def segs_cross(e, f):
    """2つの線分がはっきり交わるか（ふれるだけ・重なるだけは数えない）。"""
    (ax, ay), (bx, by) = e
    (cx, cy), (dx, dy) = f
    def orient(px, py, qx, qy, rx, ry):
        return (qx - px) * (ry - py) - (qy - py) * (rx - px)
    o1 = orient(ax, ay, bx, by, cx, cy)
    o2 = orient(ax, ay, bx, by, dx, dy)
    o3 = orient(cx, cy, dx, dy, ax, ay)
    o4 = orient(cx, cy, dx, dy, bx, by)
    eps = 0.05
    return ((o1 > eps and o2 < -eps) or (o1 < -eps and o2 > eps)) and ((o3 > eps and o4 < -eps) or (o3 < -eps and o4 > eps))


def bezier(p0, p1, p2, p3, n=10):
    pts = []
    for i in range(n + 1):
        t = i / n
        a = (1 - t) ** 3
        b = 3 * (1 - t) ** 2 * t
        c = 3 * (1 - t) * t ** 2
        d = t ** 3
        pts.append((a * p0.x + b * p1.x + c * p2.x + d * p3.x, a * p0.y + b * p1.y + c * p2.y + d * p3.y))
    return pts


def path_segments(d):
    segs = []
    for it in d['items']:
        k = it[0]
        if k == 'l':
            segs.append(((it[1].x, it[1].y), (it[2].x, it[2].y)))
        elif k == 'c':
            pts = bezier(*it[1:5])
            segs += list(zip(pts, pts[1:]))
        elif k == 're':
            r = it[1]
            c = [(r.x0, r.y0), (r.x1, r.y0), (r.x1, r.y1), (r.x0, r.y1)]
            segs += list(zip(c, c[1:] + c[:1]))
        elif k == 'qu':
            qd = it[1]
            c = [(qd.ul.x, qd.ul.y), (qd.ur.x, qd.ur.y), (qd.lr.x, qd.lr.y), (qd.ll.x, qd.ll.y)]
            segs += list(zip(c, c[1:] + c[:1]))
    return segs


def cells(r):
    x0, y0, x1, y1 = r
    for i in range(int(x0 // CELL), int(x1 // CELL) + 1):
        for j in range(int(y0 // CELL), int(y1 // CELL) + 1):
            yield (i, j)


def page_glyphs(page):
    """字（空白以外）の枠と、語（span）の番号。"""
    out = []
    raw = page.get_text('rawdict', flags=fitz.TEXT_ACCURATE_BBOXES | fitz.TEXT_PRESERVE_WHITESPACE)
    sid = 0
    for b in raw['blocks']:
        if b['type'] != 0:
            continue
        for ln in b['lines']:
            for sp in ln['spans']:
                sid += 1
                for ch in sp['chars']:
                    c = ch['c']
                    if not c.strip():
                        continue
                    x0, y0, x1, y1 = ch['bbox']
                    if x1 - x0 < 0.5 or y1 - y0 < 0.5:
                        continue
                    out.append({'c': c, 'r': (x0, y0, x1, y1), 'span': sid, 'size': sp['size']})
    return out


def visible_drawings(page):
    """線と図形を、そのときの切り取りの範囲（clip）つきで返す（pgfplots などは枠の外の線をかくす）。"""
    out = []
    stack = []  # (level, rect)
    for d in page.get_drawings(extended=True):
        lv = d.get('level', 0)
        while stack and stack[-1][0] >= lv:
            stack.pop()
        if d['type'] == 'clip':
            r = fitz.Rect(d['scissor']) if d.get('scissor') else None
            if r is not None and stack:
                r = r & stack[-1][1]
            if r is not None:
                stack.append((lv, r))
            continue
        if d['type'] not in ('f', 's', 'fs'):
            continue
        d = dict(d)
        d['clip'] = stack[-1][1] if stack else None
        out.append(d)
    return out


def check_page(page):
    found = []
    glyphs = page_glyphs(page)
    if not glyphs:
        return found
    drawings = visible_drawings(page)
    # 線分を升目に入れる
    grid = {}
    smallfills = []
    whitefills = []
    fills = []  # あとから塗った図形は、その下の線をかくす
    for di, d in enumerate(drawings):
        if d.get('fill') is not None and d['type'] in ('f', 'fs') and (d.get('fill_opacity') or 1) > 0.5:
            fills.append((di, d['rect']))
        if d.get('fill') is not None and d['type'] in ('f', 'fs'):
            r = d['rect']
            area = r.width * r.height
            if is_white(d['fill']):
                whitefills.append((di, r, d.get('seqno', di)))
            elif area <= SMALL_FILL:
                smallfills.append((di, r))
        if d['type'] in ('s', 'fs') and d.get('color') is not None:
            light = lum(d['color']) >= LIGHT
            if is_white(d['color']):
                continue
            for s in path_segments(d):
                if d.get('clip') is not None:
                    s = clip_seg(s, d['clip'])
                    if s is None:
                        continue
                sr = (min(s[0][0], s[1][0]), min(s[0][1], s[1][1]), max(s[0][0], s[1][0]), max(s[0][1], s[1][1]))
                for cl in cells(sr):
                    grid.setdefault(cl, []).append((s, di, light))
    # 線と字・うすい線
    for g in glyphs:
        x0, y0, x1, y1 = g['r']
        ins = (x0 + INSET, y0 + INSET, x1 - INSET, y1 - INSET)
        if ins[2] <= ins[0] or ins[3] <= ins[1]:
            continue
        seen = set()
        for cl in cells(ins):
            for s, di, light in grid.get(cl, ()):
                if di in seen:
                    continue
                if seg_hits_rect(s[0], s[1], ins):
                    seen.add(di)
                    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
                    if any(dj > di and r.x0 <= ins[0] and r.x1 >= ins[2] and r.y0 <= ins[1] and r.y1 >= ins[3]
                           for dj, r in fills):
                        continue  # 線は、あとから塗った地の下にかくれている
                    found.append({'kind': 'うすい線' if light else '線と字', 'r': g['r'], 'text': g['c'], 'span': g['span'],
                                  'other': drawings[di]['rect']})
        for di, r in smallfills:
            if r.x0 < ins[2] and r.x1 > ins[0] and r.y0 < ins[3] and r.y1 > ins[1]:
                found.append({'kind': '点と字', 'r': g['r'], 'text': g['c'], 'span': g['span'], 'other': r})
    # 字と字（ちがう語どうし）
    bucket = {}
    for gi, g in enumerate(glyphs):
        for cl in cells(g['r']):
            bucket.setdefault(cl, []).append(gi)
    done = set()
    for cl, lst in bucket.items():
        for a in range(len(lst)):
            for b in range(a + 1, len(lst)):
                i, j = lst[a], lst[b]
                if (i, j) in done:
                    continue
                done.add((i, j))
                gi, gj = glyphs[i], glyphs[j]
                if gi['span'] == gj['span']:
                    continue
                r1, r2 = gi['r'], gj['r']
                w = min(r1[2], r2[2]) - max(r1[0], r2[0])
                h = min(r1[3], r2[3]) - max(r1[1], r2[1])
                if w <= 0 or h <= 0:
                    continue
                small = min((r1[2] - r1[0]) * (r1[3] - r1[1]), (r2[2] - r2[0]) * (r2[3] - r2[1]))
                hmin = min(r1[3] - r1[1], r2[3] - r2[1])
                wmin = min(r1[2] - r1[0], r2[2] - r2[0])
                same_line = abs((r1[1] + r1[3]) - (r2[1] + r2[3])) / 2 < 0.45 * max(r1[3] - r1[1], r2[3] - r2[1])
                if gi['c'] in BIGOP or gj['c'] in BIGOP:
                    continue  # 積分・和などの大きな記号と、その範囲の字（正しい組み方）
                if gi['c'] in PUNCT or gj['c'] in PUNCT:
                    continue  # 句読点・かっこは、つめて組むので隣の字と枠がかかる
                if same_line and w < 0.4 * wmin:
                    continue  # 同じ行で隣り合う字（斜体のはみ出し・かっこ）が少しかかるだけ
                if h < 0.25 * hmin:
                    continue  # 上下の字がふれるだけ（添え字など）
                if small > 0 and w * h / small > GLYPH_OVERLAP:
                    found.append({'kind': '字と字', 'r': r1, 'text': gi['c'] + '／' + gj['c'], 'span': gi['span'], 'other': fitz.Rect(r2)})
    # 白地で線をかくしている（白い塗りが線の上にあり、その中に字がある）
    for di, r, seq in whitefills:
        if r.width * r.height > 4000:  # 大きな白い地（ページ・囲みの地）は数えない
            continue
        inside = [g for g in glyphs if r.x0 - 0.5 <= g['r'][0] and g['r'][2] <= r.x1 + 0.5 and r.y0 - 0.5 <= g['r'][1] and g['r'][3] <= r.y1 + 0.5]
        if not inside:
            continue
        rr = (r.x0, r.y0, r.x1, r.y1)
        under = set()
        for cl in cells(rr):
            for s, dj, light in grid.get(cl, ()):
                if dj < di and seg_hits_rect(s[0], s[1], rr):
                    under.add(dj)
        if under:
            found.append({'kind': '白地', 'r': rr, 'text': ''.join(g['c'] for g in inside)[:20], 'span': inside[0]['span'], 'other': r})
    # 字がかくれる：あとから塗った図形（白い地など）が、前に置いた字にかかる
    try:
        trace = page.get_texttrace()
    except Exception:
        trace = []
    for sp in trace:
        sq = sp.get('seqno', 0)
        sb = fitz.Rect(sp['bbox'])
        if sb.is_empty or sp.get('type', 0) == 3:  # 見えない字
            continue
        text = ''.join(chr(c[0]) for c in sp.get('chars', ()) if c[0] > 32)
        if not text.strip():
            continue
        for d in drawings:
            if d.get('fill') is None or d.get('seqno', -1) <= sq or d['type'] not in ('f', 'fs'):
                continue
            r = d['rect']
            if r.width * r.height > 4000 or r.contains(sb):
                continue
            ix = sb & r
            if ix.is_empty:
                continue
            if ix.width * ix.height > 0.15 * sb.width * sb.height and ix.height > 0.3 * sb.height:
                found.append({'kind': '字がかくれる', 'r': (sb.x0, sb.y0, sb.x1, sb.y1), 'text': text[:20], 'span': 10**6 + sq, 'other': r})
                break
    # 図形と図形：枠のある図形（四角・ひし形・丸など）どうしが、入れ子でなく重なる
    shapes = []
    style_count = {}
    for di, d in enumerate(drawings):
        r = d['rect']
        area = r.width * r.height
        if d['type'] in ('s', 'fs') and is_closed(d) and SHAPE_MIN <= area <= SHAPE_MAX \
                and min(r.width, r.height) >= 10 and not (d.get('color') and lum(d['color']) >= LIGHT):
            key = (tuple(round(c, 2) for c in (d.get('color') or ())), tuple(round(c, 2) for c in (d.get('fill') or ())))
            style_count[key] = style_count.get(key, 0) + 1
            pts = [p for sgm in path_segments(d) for p in sgm]
            shapes.append((di, r, key, pts, path_segments(d)))
    shapes = [x for x in shapes if style_count[x[2]] <= 25]  # 網の目（立体の面・方眼）は数えない
    if len(shapes) > 60:  # 面を細かく分けた立体の図など
        shapes = [x for x in shapes if x[1].width * x[1].height >= 600]
    for a in range(len(shapes)):
        for b in range(a + 1, len(shapes)):
            da, ra, _, pa, sa = shapes[a]
            db, rb, _, pb, sb2 = shapes[b]
            ix = fitz.Rect(ra) & fitz.Rect(rb)
            if ix.is_empty or ix.width < 0.8 or ix.height < 0.8:
                continue
            if all(point_in(p, pa) for p in pb[::2]) or all(point_in(p, pb) for p in pa[::2]):
                continue  # 入れ子の枠
            if any(segs_cross(e, f) for e in sa for f in sb2):
                found.append({'kind': '図形と図形', 'r': (ix.x0, ix.y0, ix.x1, ix.y1), 'text': '', 'span': -(a * 1000 + b) - 1, 'other': rb})
    return found


def merge(found):
    """同じ語・同じ種類の候補を1つにまとめる。"""
    out = {}
    for f in found:
        key = (f['kind'], f['span'])
        if key in out:
            o = out[key]
            o['r'] = (min(o['r'][0], f['r'][0]), min(o['r'][1], f['r'][1]), max(o['r'][2], f['r'][2]), max(o['r'][3], f['r'][3]))
            if f['text'] not in o['text'] and len(o['text']) < 24:
                o['text'] += f['text']
        else:
            out[key] = dict(f)
    order = {'線と字': 0, '字と字': 1, '字がかくれる': 2, '点と字': 3, '図形と図形': 4, '白地': 5, 'うすい線': 6}
    return sorted(out.values(), key=lambda f: (order[f['kind']], f['r'][1], f['r'][0]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('pdf')
    ap.add_argument('--pages', default='')
    ap.add_argument('--out', default='')
    ap.add_argument('--first', type=int, default=1)
    ap.add_argument('--light', action='store_true', help='うすい線・白地も表示する（ふだんは数だけ）')
    a = ap.parse_args()
    doc = fitz.open(a.pdf)
    pages = range(doc.page_count)
    if a.pages:
        s, e = (int(x) for x in a.pages.split('-'))
        pages = range(s - a.first, e - a.first + 1)
    if a.out:
        os.makedirs(a.out, exist_ok=True)
    report = ['# 重なりの候補：' + os.path.basename(a.pdf), '',
              '| ページ | 種類 | 字 | 画像 |', '| --- | --- | --- | --- |']
    total = {}
    for pi in pages:
        if pi < 0 or pi >= doc.page_count:
            continue
        page = doc[pi]
        found = merge(check_page(page))
        if not found:
            continue
        folio = pi + a.first
        strong = [f for f in found if f['kind'] in ('線と字', '字と字', '字がかくれる', '点と字', '図形と図形')]
        for f in found:
            total[f['kind']] = total.get(f['kind'], 0) + 1
        show = found if a.light else strong
        for f in show:
            print(f"p.{folio}\t{f['kind']}\t{f['text']}\t({f['r'][0]:.0f},{f['r'][1]:.0f})")
        if a.out and strong:
            img = os.path.join(a.out, f'p{folio:04d}.png')
            for f in found:
                col = (1, 0, 0) if f['kind'] in ('線と字', '字と字', '字がかくれる', '点と字', '図形と図形') else (0, 0.4, 1)
                r = fitz.Rect(f['r']) + (-1.5, -1.5, 1.5, 1.5)
                page.draw_rect(r, color=col, width=0.8)
            page.get_pixmap(dpi=110).save(img)
            for f in show:
                report.append(f"| {folio} | {f['kind']} | {f['text']} | p{folio:04d}.png |")
    summary = '、'.join(f'{k} {v}' for k, v in total.items()) or 'なし'
    print('候補の数：' + summary, file=sys.stderr)
    if a.out:
        report.insert(2, '候補の数：' + summary + '（赤い枠＝線と字・字と字・点と字、青い枠＝白地・うすい線）')
        report.insert(3, '')
        with open(os.path.join(a.out, 'report.md'), 'w', encoding='utf-8') as fh:
            fh.write('\n'.join(report) + '\n')


if __name__ == '__main__':
    main()
