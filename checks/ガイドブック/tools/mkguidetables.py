#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ガイドブック『保護者・先生のための本』の巻末の付録（第16回編集委員会 No.12：表は機械で作る。組 G-C、頭文字 kgc）

  付録A（10）学習指導要領の項目 → シリーズの章  … tools/guide-taiou.md の 1節の表から
  付録B（11）全152章の一覧                       … 章名・★・路線は series.py、学年は guide-taiou.md の 2節の表から

使い方:
  python3 tools/mkguidetables.py          → 照らし合わせの結果を表示し、tex/guide-p2b.tex を書く
  python3 tools/mkguidetables.py --check  → 照らし合わせだけ（ファイルは書かない）

材料（guide-taiou.md・series.py）を直したら、このプログラムを動かし直せば表が作り直される。
tex/guide-p2b.tex は自動生成なので、手で直さない（文や表の形を変えるときは、このプログラムを直す）。

確かめること（--check でも同じ）:
  ・guide-taiou.md 2節の章の一覧が、series.py の152章と1対1に合うか（足りない章・余分な章・重なり）
  ・2節の★が series.py の★と同じか、序章・読みもの・終章の印が series.py の種類と合うか
  ・2節の巻の見出し（書名・学年の目安）が series.py と同じか
  ・1節（指導要領 → 章）に出てくる章番号が series.py にあるか
  ・tools/guide-series.md の全152章の表の章名が series.py の章名（ルビの親字）と同じか
"""
import os, re, sys, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
sys.path.insert(0, ROOT)
import series as S  # noqa: E402

TAIOU = os.path.join(HERE, 'guide-taiou.md')
GSERIES = os.path.join(HERE, 'guide-series.md')
OUT = os.path.join(ROOT, 'tex', 'guide-p2b.tex')

# ------------------------------------------------------------------
# series.py から：章の一覧（番号 → 題名・★・路線・種類）
# ------------------------------------------------------------------
def strip_ruby(s):
    """\\R{親字}{よみ} を親字だけにする（入れ子はない）"""
    return re.sub(r'\\R\{([^{}]*)\}\{[^{}]*\}', r'\1', s)

CHAPS = {}      # '1-0' -> dict
ORDER = []
for v in S.VOLS:
    for plabel, pname, chs in v['parts']:
        for cid, title, hook, stars, routes, kind in chs:
            CHAPS[cid] = dict(vol=v['no'], title=strip_ruby(title), stars=stars, routes=routes, kind=kind)
            ORDER.append(cid)
KIND_MD = {'J': '序', 'R': '読', 'E': '終', 'C': ''}
KIND_TEX = {'J': '序章', 'R': '読みもの', 'E': '終章', 'C': ''}

def ckey(cid):
    a, b = cid.split('-'); return (int(a), int(b))

# ------------------------------------------------------------------
# Markdown の表を読む
# ------------------------------------------------------------------
def md_tables(text):
    """(見出し, [行のセルのリスト]) を順に返す。見出しは直前の ### の文字列"""
    out = []
    head = None
    rows = None
    for line in text.split('\n'):
        if line.startswith('### '):
            head = line[4:].strip()
        if line.startswith('|'):
            cells = [c.strip() for c in line.strip().strip('|').split('|')]
            if rows is None:
                rows = [cells]
            else:
                rows.append(cells)
        else:
            if rows is not None:
                body = [r for r in rows[1:] if not all(re.fullmatch(r':?-{3,}:?', c) for c in r)]
                out.append((head, rows[0], body))
                rows = None
    if rows is not None:
        body = [r for r in rows[1:] if not all(re.fullmatch(r':?-{3,}:?', c) for c in r)]
        out.append((head, rows[0], body))
    return out

def section(text, start, end):
    i = text.index(start)
    j = text.index(end, i + len(start))
    return text[i:j]

TA = open(TAIOU, encoding='utf-8').read()
SEC0 = section(TA, '## 0.', '## 1.')
SEC1 = section(TA, '## 1.', '## 2.')
SEC2 = section(TA, '## 2.', '## 3.')

# 扱い方の記号（0-2 の表）
LEGEND = []
for head, hdr, body in md_tables(SEC0):
    if hdr[:2] == ['記号', '意味']:
        for r in body:
            LEGEND.append((r[0].strip('*'), r[1]))

# 1節：学年・科目ごとの表
GRADES = []     # (見出し, [(番号, 項目, 章, 扱い, メモ)])
for head, hdr, body in md_tables(SEC1):
    m = re.match(r'1-\d+\s+(.*)', head or '')
    if not m or len(hdr) != 5:
        continue
    GRADES.append((m.group(1), [tuple(r + [''] * (5 - len(r)))[:5] for r in body]))
# 並べる順：小1〜小6、中1〜中3、数Ⅰ・数A・数Ⅱ・数B・数Ⅲ・数C（ガイドブックの約束）
SUBJ_ORDER = ['数学Ⅰ', '数学A', '数学Ⅱ', '数学B', '数学Ⅲ', '数学C']
def grade_key(g):
    h = g[0]
    if h.startswith('小学校'): return (0, int(re.search(r'第(\d)', h).group(1)))
    if h.startswith('中学校'): return (1, int(re.search(r'第(\d)', h).group(1)))
    for i, s in enumerate(SUBJ_ORDER):
        if s in h: return (2, i)
    return (3, 0)
GRADES.sort(key=grade_key)

# 2節：巻ごとの表
VOLTAB = {}     # vol -> (見出し, rows)
for head, hdr, body in md_tables(SEC2):
    m = re.match(r'第(\d)巻', head or '')
    if m:
        VOLTAB[int(m.group(1))] = (head, body)

# ------------------------------------------------------------------
# 照らし合わせ
# ------------------------------------------------------------------
PROBLEMS = []
def problem(msg):
    PROBLEMS.append(msg)

def stars_md(st):
    a, b = st
    return '★' * a if a == b else '★' * a + '〜' + '★' * b

def check():
    # 152章
    n = len(ORDER)
    if n != 152:
        problem('series.py の章の数が %d（152 のはず）' % n)
    if len(set(ORDER)) != n:
        problem('series.py に重なった章番号がある')
    seen = []
    for vol in range(1, 10):
        if vol not in VOLTAB:
            problem('guide-taiou.md 2節に第%d巻の表がない' % vol); continue
        head, rows = VOLTAB[vol]
        v = S.VOLS[vol - 1]
        vt = strip_ruby(v['title'])
        if vt not in head:
            problem('第%d巻の書名：guide-taiou「%s」／series.py「%s」' % (vol, head, vt))
        for r in rows:
            m = re.match(r'(\d-\d+)\s*(序|読|終)?$', r[0])
            if not m:
                problem('guide-taiou 2節の章の欄が読めない：%r' % r[0]); continue
            cid, k = m.group(1), m.group(2) or ''
            seen.append(cid)
            if cid not in CHAPS:
                problem('guide-taiou 2節の %s は series.py にない' % cid); continue
            c = CHAPS[cid]
            if c['vol'] != vol:
                problem('%s が第%d巻の表にある' % (cid, vol))
            if KIND_MD[c['kind']] != k:
                problem('%s の種類：guide-taiou「%s」／series.py「%s」' % (cid, k or '章', KIND_MD[c['kind']] or '章'))
            if r[1] != stars_md(c['stars']):
                problem('%s の★：guide-taiou「%s」／series.py「%s」' % (cid, r[1], stars_md(c['stars'])))
    dup = sorted({c for c in seen if seen.count(c) > 1}, key=ckey)
    if dup:
        problem('guide-taiou 2節で重なっている章：' + '、'.join(dup))
    miss = [c for c in ORDER if c not in seen]
    if miss:
        problem('guide-taiou 2節にない章：' + '、'.join(miss))
    extra = sorted(set(seen) - set(ORDER), key=ckey)
    if extra:
        problem('guide-taiou 2節にだけある章：' + '、'.join(extra))
    # 1節の章番号
    for g, rows in GRADES:
        for r in rows:
            for cid in re.findall(r'(?<![\d.\-/A-Za-z(（])(\d-\d{1,2})(?![\d\-.])', r[2] + ' ' + r[4]):
                if cid not in CHAPS:
                    problem('guide-taiou 1節（%s %s）の章番号 %s は series.py にない' % (g, r[0], cid))
    # guide-series.md の章名
    gs = open(GSERIES, encoding='utf-8').read()
    gsec = section(gs, '## 2.', '## 3.')
    names = {}
    for head, hdr, body in md_tables(gsec):
        if hdr[:2] != ['章', '章名']:
            continue
        for r in body:
            m = re.match(r'(\d-\d+)', r[0])
            if m:
                names[m.group(1)] = r[1]
    # 式の書き方（$y=ax^2$ と y＝ax²）と、空白・分かち書きのちがいは数えない
    norm = lambda s: re.sub(r'[\s　$^{}]|\\,', '', unicodedata.normalize('NFKC', s))
    nd = 0
    for cid in ORDER:
        if cid not in names:
            problem('guide-series.md の表に %s がない' % cid); continue
        if norm(names[cid]) != norm(CHAPS[cid]['title']):
            nd += 1
            problem('章名のちがい %s：guide-series「%s」／series.py「%s」' % (cid, names[cid], CHAPS[cid]['title']))
    return len(seen), len(names)

# ------------------------------------------------------------------
# 文字列を TeX にする
# ------------------------------------------------------------------
# そのままでは組めない書き方（式）を、先に置きかえる
SPECIAL = [
    ("s＝∫√(1＋y'²)dx", r"$s=\int\!\sqrt{1+y'^{2}}\,dx$"),
    ('λⁿ＝rⁿe^{jnθ}', r'$\lambda^{n}$\allowbreak$=r^{n}e^{jn\theta}$'),
    ('y_{n＋1}', r'$y_{n+1}$'),
    ('1²＋2²＋…＋n²＝n(n＋1)(2n＋1)/6', r'$1^{2}+2^{2}+\dots+n^{2}$\allowbreak$=n(n+1)(2n+1)/6$'),
    ('1＋x＋x²＋…＝1/(1－x)', r'$1+x+x^{2}+\dots$\allowbreak$=1/(1-x)$'),
    ('(x－a)²＋(y－b)²＝r²', r'$(x-a)^{2}+(y-b)^{2}$\allowbreak$=r^{2}$'),
    ('p⃗＝p⃗₀＋tv⃗', r'$\vec{p}=\vec{p}_{0}+t\vec{v}$'),
    ('(1＋1/n)ⁿ', r'$(1+1/n)^{n}$'),
    ('σ/√n', r'$\sigma/\sqrt{n}$'),
    ('ε-δ', r'$\varepsilon$-$\delta$'),
    ('{rⁿ}', r'$\{r^{n}\}$'),
    ('ₙPᵣ', r'${}_{n}\mathrm{P}_{r}$'),
    ('ₙCᵣ', r'${}_{n}\mathrm{C}_{r}$'),
    ('logₐx', r'$\log_{a}x$'),
    ('a×10ⁿ', r'$a\times10^{n}$'),
    ('√2', r'$\sqrt{2}$'),
    ('ẋ', r'$\dot{x}$'), ('ẍ', r'$\ddot{x}$'),
    ('μ', r'$\symup{\mu}$'),
]
SUP = {'²': '2', '³': '3', '¹': '1', '⁰': '0', '⁻': '-', 'ⁿ': 'n'}
SUB = {'₀': '0', 'ₐ': 'a', 'ₙ': 'n', 'ᵣ': 'r'}
GREEK = {'Δ': r'\Delta', 'Σ': r'\Sigma', 'δ': r'\delta', 'ε': r'\varepsilon', 'θ': r'\theta',
         'λ': r'\lambda', 'π': r'\pi', 'σ': r'\sigma', 'ω': r'\omega'}

def tex(s, chapids=True):
    ph = []
    def keep(t):
        ph.append(t); return '\x00%d\x00' % (len(ph) - 1)
    for a, b in SPECIAL:
        s = s.replace(a, keep(b))
    # **太字**
    s = re.sub(r'\*\*(.+?)\*\*', lambda m: keep(r'\textbf{') + m.group(1) + keep('}'), s)
    # TeX の特別な文字
    s = (s.replace('\\', r'\textbackslash{}').replace('{', r'\{').replace('}', r'\}')
          .replace('%', r'\%').replace('&', r'\&').replace('#', r'\#').replace('_', r'\_')
          .replace('^', r'\^{}').replace('~', r'\~{}').replace('$', r'\$'))
    # 上つき・下つき・ギリシャ文字
    s = re.sub('[%s]+' % ''.join(SUP), lambda m: keep('$^{%s}$' % ''.join(SUP[c] for c in m.group(0))), s)
    s = re.sub('[%s]+' % ''.join(SUB), lambda m: keep('$_{%s}$' % ''.join(SUB[c] for c in m.group(0))), s)
    s = re.sub('[%s]' % ''.join(GREEK), lambda m: keep('$%s$' % GREEK[m.group(0)]), s)
    # 章番号は太いゴシックで（章を目で探しやすく）
    if chapids:
        s = re.sub(r'(?<![\d.\-/A-Za-z(])(\d-\d{1,2})(?![\d\-.])',
                   lambda m: keep(r'\kgcch{%s}' % m.group(1)) if m.group(1) in CHAPS else m.group(1), s)
    # 行末に「→」を残さない（矢印のあとでは改行しない：紙面の決まり）
    s = s.replace('→', keep(r'→\nobreak{}'))
    # ★の並び（★★〜★★★ など）は行末で切らない（rA #22）
    s = re.sub(r'[★☆]+(?:〜[★☆]+)?', lambda m: keep(r'\mbox{%s}' % m.group(0)), s)
    # 「もっと」＝もっと知りたい（発展の囲み）は札にする
    s = re.sub(r'もっと(?!知りたい)', lambda m: keep(r'\kgcmotto{}'), s)
    while '\x00' in s:
        s = re.sub('\x00(\\d+)\x00', lambda m: ph[int(m.group(1))], s)
    s = s.replace('$$', '')       # となり合った式を1つに
    return s

# ------------------------------------------------------------------
# 本に載せない書き方を取りのぞく（材料の中だけの約束・記録の参照・未確認）
# ------------------------------------------------------------------
INTERNAL = re.compile(r'〔未|議事録|第\d+回|構成案|原稿|guide-|\d章\s*\d-\d+|\d章を参照|（\d章）|RG-|K\d|L-[A-Z]')

# 本に載せるために言いかえる所（材料の意味は変えない）
REWRITE = [
    ('原稿の除法の例は', '除法の例は'),          # 「原稿」は本の読者には通じないので
    ('全巻で語が見つからない', 'どの巻にも語がない'),
    ('は全巻で見つからない', 'はどの巻にもない'),
    ('の語は現行の本文にない', 'の語は現行の指導要領の本文にない'),
]
# 原稿どうしの参照の誤り（委員会で直すこと）は、付録には載せない
ERRATA = re.compile(r'の本文は「.*」と書くが')

def clean(s):
    s = s.strip()
    for a, b in REWRITE:
        s = s.replace(a, b)
    # 中身が内部の記録の（ ）を消す
    prev = None
    while prev != s:
        prev = s
        s = re.sub(r'（[^（）]*）', lambda m: '' if INTERNAL.search(m.group(0)) else m.group(0).replace('（', '\x01').replace('）', '\x02'), s)
    s = s.replace('\x01', '（').replace('\x02', '）')
    # 文（。で区切る）ごとに、内部の記録を指す文を消す
    parts = [p for p in re.split(r'(?<=。)', s) if p.strip()]
    parts = [p for p in parts if not INTERNAL.search(p) and not ERRATA.search(p)]
    s = ''.join(parts).strip()
    s = re.sub(r'[。、]+$', '', s)
    s = s.replace('見つからない', 'ない')
    s = re.sub(r'範囲外-[^\s、）・。]+', '指導要領の範囲外', s)
    return s.strip()

# 大人用（『ガイドブック　保護者・先生のための本』）の表記：依頼者の指示（10/30 10:15）
# 「高校卒業程度の漢字を使って構わない」。常用漢字の範囲で、ひらいていた語を漢字にする。
# 章名・小見出し・用語の引用（「」の中）と、章の中身を本の言葉で並べた所は、本の表記のまま。
ADULT = [
    ('ふくむ', '含む'), ('ふくめ', '含め'), ('くわしく', '詳しく'), ('くらべ', '比べ'),
    ('ロボットのうでの', 'ロボットの腕の'), ('をころがす', 'を転がす'),
    ('たし算', '足し算'), ('ひき算', '引き算'), ('かけ算', '掛け算'), ('わり算', '割り算'),
    ('（あまり・', '（余り・'),
]
def adult(s):
    parts = re.split(r'(「[^「」]*」)', s)
    for i in range(0, len(parts), 2):
        for a, b in ADULT:
            parts[i] = parts[i].replace(a, b)
    return ''.join(parts)

def tex_toriatsukai(s):
    """扱いの欄：記号は四角の札、（ ）の中の説明はそのあとに小さく"""
    s = s.strip()
    if not s or INTERNAL.search(s):
        return ''
    m = re.match(r'([^（]*)(（.*）)?$', s)
    head, note = m.group(1), m.group(2) or ''
    syms = [x for x in re.split(r'[・／]', head) if x]
    seps = re.findall(r'[・／]', head)
    out = r'\kgcsym{%s}' % syms[0]
    for sep, x in zip(seps, syms[1:]):
        out += (r'\kgcsep{}' if sep == '・' else r'\kgcor{}') + r'\kgcsym{%s}' % x
    if note:
        out += r'\newline{}' + tex(note)
    return out

# ------------------------------------------------------------------
# 付録B：学年の欄と範囲外の印
# ------------------------------------------------------------------
def grade_cell(g):
    g = g.strip()
    return {'―': '―'}.get(g, g)

def outside_mark(items, grade, memo):
    """●（塗り）＝指導要領の範囲外の内容が中心、半分塗り＝一部に範囲外の内容をふくむ、空＝なし"""
    g = grade.strip()
    if g in ('大学', '範囲外'):
        return 'all'
    if '範囲外' in items or '範囲外' in memo or '大学' in g:
        return 'part'
    # 大人用の委員確認 rA #24：学年を「―」とした、シリーズ独自の内容の章（2-18 表計算・2-19 プログラム）は、
    # 指導要領の項目（コンピュータの活用）に「関連」するだけで中身は指導要領の外なので、一部の印をつける
    if g in ('―', '') and 'シリーズ独自' in memo:
        return 'part'
    return ''

def dash_list():
    """付録Bで学年を「―」とした章の一覧（凡例に書く。rA #25）"""
    out = []
    for cid in ORDER:
        rows = VOLTAB[CHAPS[cid]['vol']][1]
        for r in rows:
            if re.match(r'(\d-\d+)', r[0]).group(1) == cid and r[3].strip() in ('―', ''):
                out.append(cid)
    return '・'.join(out)

def stars_tex(st):
    a, b = st
    return r'\kgcstars{%d}{%d}' % (a, b)

def routes_tex(rs):
    if len(rs) == 7:
        return r'\kgcallroutes{}'
    return r'\par '.join(r'\kgcroute{%d}' % r for r in rs)

# ------------------------------------------------------------------
# 書き出し
# ------------------------------------------------------------------
PREAMBLE = r"""%% ===== 自動生成：tools/mkguidetables.py（手で直さない。材料を直したら動かし直す） =====
%% ガイドブック（保護者・先生のための本）の付録（組 G-C、頭文字 kgc）。材料：tools/guide-taiou.md・series.py
\makeatletter
%% G-B の見出し（guide-p2a.tex の写し。p2a が先に読まれていれば、そちらが使われる）
%% \kgbsec[柱・しおり用の題]{番号}{題}（改ページしない）、\kgbsub{番号}{題}
\providecommand\kgbsec[3][]{%
  \par\addvspace{18pt}\Needspace{8\baselineskip}\global\bk@decotrue
  \setcounter{bkfig}{0}\setcounter{bktab}{0}\gdef\kgbsecno{#2}%
  \if\relax\detokenize{#1}\relax\def\kgb@st{#3}\else\def\kgb@st{#1}\fi
  \bksetrunning{}{保護者・先生のための本}{\if\relax\detokenize{#2}\relax\else#2\hspace{0.6\zw}\fi\kgb@st}%
  \pdfbookmark[1]{#2　\kgb@st}{kgbsec-#2-\thepage}%
  \kgc@secband{#2}{#3}}
\newcommand\kgc@secband[2]{%
  \noindent\begin{tikzpicture}
    \if\relax\detokenize{#1}\relax
      \node[anchor=west, text=white, font=\sffamily\bfseries\LARGE, align=left, inner sep=0pt] (t) at (0.6,0) {#2};
    \else
      \node[anchor=west, circle, fill=white, text=bkVol0, minimum size=1.35cm, font=\sffamily\bfseries\Large, inner sep=0pt] (n) at (0.35,0) {#1};
      \node[anchor=west, text=white, font=\sffamily\bfseries\LARGE, text width=\linewidth-2.4cm, align=left, inner sep=0pt] (t) at ([xshift=0.4cm]n.east) {#2};
    \fi
    \begin{pgfonlayer}{background}
      \path let \p1=(t.north), \p2=(t.south) in coordinate (kgbT) at (0,{max(\y1+0.4cm,1cm)}) coordinate (kgbB) at (0,{min(\y2-0.4cm,-1cm)});
      \fill[bkVol0] (kgbB) rectangle (\linewidth,0 |- kgbT);
    \end{pgfonlayer}
  \end{tikzpicture}\par\vspace{10pt}}
\providecommand\kgbsub[2]{%
  \par\addvspace{12pt}\Needspace{8\baselineskip}\noindent
  \begin{tikzpicture}[baseline=(t.base)]
    \node[anchor=west, fill=bkVol0, text=white, rounded corners=1mm, font=\sffamily\bfseries\small, inner xsep=1.6mm, inner ysep=1mm] (i) at (0,0) {#1};
    \node[anchor=west, font=\sffamily\bfseries\large, text=bkVol0, inner sep=0pt] (t) at ([xshift=0.6\zw]i.east) {#2};
    \draw[bkVol0, line width=0.8pt] ([yshift=-4pt]i.south west) -- ++(\linewidth-1pt,0);
  \end{tikzpicture}\par\nobreak\vspace{6pt}}
\providecommand\kgbsecno{}
%% ---- G-C の部品（kgc） ----
% 表の中の章番号（太いゴシック）
\newcommand\kgcch[1]{\mbox{\sffamily\bfseries #1}}
% 「もっと知りたい」（発展の囲み）の札：白い地に枠と字（色だけにたよらない）
\newcommand\kgcmotto{\mbox{\tikz[baseline=(t.base)]\node[draw=bkVol0, line width=0.5pt, rounded corners=0.8mm, inner xsep=0.5mm, inner ysep=0.35mm, font=\sffamily\footnotesize, text=bkVol0](t){もっと};}}
% 扱い方の記号の札（枠つき・太字）
\newcommand\kgcsym[1]{\mbox{\tikz[baseline=(t.base)]\node[draw=bkInk, line width=0.5pt, inner xsep=0.6mm, inner ysep=0.4mm, font=\sffamily\bfseries\footnotesize](t){#1};}}
\newcommand\kgcsep{\hspace{0.2em}}
\newcommand\kgcor{\hspace{0.15em}{\footnotesize ／}\hspace{0.15em}}
% ★：塗りの★＝その章の★の下から、白抜きの☆＝上まで（★★☆＝★★〜★★★）
\newcommand\kgcstars[2]{\mbox{\footnotesize\@tempcnta=0\relax
  \loop\advance\@tempcnta\@ne
    \ifnum\@tempcnta>#1\relax\textcolor{bkStar!70!black}{☆}\else\textcolor{bkStar}{★}\fi
  \ifnum\@tempcnta<#2\repeat}}
% 路線：アイコン（形の記号）＋丸数字
\newcommand\kgcroute[1]{\mbox{\bkrouteicon[0.95em]{#1}\,{\footnotesize\ifcase#1\or①\or②\or③\or④\or⑤\or⑥\or⑦\fi}}}
\newcommand\kgcallroutes{{\footnotesize ①〜⑦\newline すべて}}
% 範囲外の印（塗りの丸＝中心、半分塗りの丸＝一部。形で区別する）
\newcommand\kgcout[1]{\tikz[baseline=-0.35em]{\ifx#1a\fill[bkInk] (0,0) circle (0.42em);\else
  \fill[bkInk] (0,-0.42em) arc[start angle=-90, end angle=90, radius=0.42em] -- cycle;\fi
  \draw[bkInk, line width=0.6pt] (0,0) circle (0.42em);}}

% 凡例の囲み
\newenvironment{kgclegend}[1]{\par\addvspace{6pt}\begin{tcolorbox}[enhanced, breakable, arc=2mm, boxrule=0.8pt,
  colframe=bkVol0, colback=white, left=3mm, right=3mm, top=2.5mm, bottom=2.5mm,
  title={#1}, fonttitle=\sffamily\bfseries\small, coltitle=white, colbacktitle=bkVol0]\small}{\end{tcolorbox}\par\addvspace{4pt}}
% 表の見出しの行の色（白い地に濃い字の行より、うすい紺灰色の地に濃い字）
\colorlet{kgcHead}{bkVol0!14}
\colorlet{kgcBand}{bkVol0!6}
% longtblr の「表 1」などの見出しと続きの注を出さない
\DefTblrTemplate{caption}{kgc}{}
\DefTblrTemplate{capcont}{kgc}{\noindent{\sffamily\bfseries\small\color{bkVol0}\InsertTblrText{caption}}\hspace{0.6\zw}{\sffamily\footnotesize（前のページからの続き）}\par\vspace{2pt}}
\DefTblrTemplate{contfoot}{kgc}{\raggedleft\footnotesize（次のページに続きます）\par}
\NewTblrTheme{kgc}{\SetTblrTemplate{caption}{kgc}\SetTblrTemplate{capcont}{kgc}\SetTblrTemplate{contfoot}{kgc}}
\makeatother
"""

def first_row_need(rows):
    """付録Aの表の最初の行（載せる行）の高さをおおまかに見つもる（pt）。1行は約15pt、字数は列のはばから"""
    import math
    hs = []
    for num, item, ch, tr, memo in rows:
        chc, mc = clean(ch), clean(memo)
        if not chc or not tex_toriatsukai(tr):
            continue
        lines = max(math.ceil(len(item) / 9), math.ceil(len(chc) / 12.5), math.ceil(len(mc) / 8.5), 2)
        hs.append(lines * 15 + 10)
        if len(hs) == 2:
            break
    # 見出し・表の見出しの行・最初の行と、2行めの頭（3行ぶんまで）：ページの下に1行だけ残らないように（rA #17）
    need = 48 + 26 + (hs[0] if hs else 60) + (min(hs[1], 3 * 15 + 10) if len(hs) > 1 else 0)
    return need

def table_A(rows, title=''):
    out = [r"\begin{longtblr}[theme=kgc, caption={%s}, entry=none, label=none]{colspec={Q[l,wd=19mm] Q[l,wd=31mm] X[2.4,l] Q[l,wd=15mm] X[1.6,l]}, width=\linewidth," % title,
           r"  rowhead=1, row{1}={bg=kgcHead, font=\sffamily\bfseries\footnotesize}, row{even[2]}={bg=kgcBand},",
           r"  hlines={0.4pt,bkLine}, vline{2-5}={0.4pt,bkLine}, rowsep=2pt, colsep=3pt, cells={font=\footnotesize}}",
           r"番号 & 項目（要点） & 扱っている章 & 扱い & 補足 \\"]
    dropped = []
    for num, item, ch, tr, memo in rows:
        chc = clean(ch)
        trc = tex_toriatsukai(tr)
        if not chc or not trc:
            dropped.append((num, item, ch, tr))
            continue
        num_t = tex(num, chapids=False).replace('-', '-\\allowbreak{}')
        out.append(r"{\sffamily %s} & %s & %s & %s & %s \\" % (num_t, tex(adult(item), chapids=False), tex(adult(chc)), trc, tex(adult(clean(memo)))))
    out.append(r"\end{longtblr}")
    return out, dropped

def table_B(vol):
    head, rows = VOLTAB[vol]
    byid = {}
    for r in rows:
        cid = re.match(r'(\d-\d+)', r[0]).group(1)
        byid[cid] = r
    v = S.VOLS[vol - 1]
    out = [r"\begin{longtblr}[theme=kgc, caption={第%d巻　%s}, entry=none, label=none]{colspec={Q[l,wd=14mm] X[l] Q[l,wd=17mm] Q[l,wd=12.5mm] Q[l,wd=25mm] Q[c,wd=10mm]}, width=\linewidth," % (vol, strip_ruby(v['title'])),
           r"  rowhead=1, row{1}={bg=kgcHead, font=\sffamily\bfseries\footnotesize}, row{even[2]}={bg=kgcBand},",
           r"  hlines={0.4pt,bkLine}, vline{2-6}={0.4pt,bkLine}, rowsep=1.5pt, colsep=3pt, cells={font=\footnotesize, valign=m}, row{1}={valign=m}}",
           r"章 & 章名 & ★ & 路線 & 指導要領の学年・科目 & 範囲外 \\"]
    for cid in [c for c in ORDER if CHAPS[c]['vol'] == vol]:
        c = CHAPS[cid]
        r = byid.get(cid, ['', '', '', '―', ''])
        mark = outside_mark(r[2], r[3], r[4])
        kind = KIND_TEX[c['kind']]
        idcell = r"{\sffamily\bfseries %s}%s" % (cid, (r"\newline{\footnotesize\sffamily %s}" % kind) if kind else '')
        out.append(r"%s & %s & %s & %s & %s & %s \\" % (
            idcell, c['title'], stars_tex(c['stars']), routes_tex(c['routes']), tex(grade_cell(r[3]), chapids=False),
            r'\kgcout{a}' if mark == 'all' else (r'\kgcout{p}' if mark == 'part' else '')))
    out.append(r"\end{longtblr}")
    return out

def legend_A():
    lines = [r"\begin{kgclegend}{「扱い」の記号}",
             r"\begin{tblr}{colspec={Q[c,wd=10mm] X[l] Q[c,wd=10mm] X[l]}, rowsep=1.5pt, colsep=3pt, cells={font=\small}}"]
    half = (len(LEGEND) + 1) // 2
    for i in range(half):
        cells = []
        for sym, mean in [LEGEND[i]] + ([LEGEND[i + half]] if i + half < len(LEGEND) else []):
            cells += [r"\kgcsym{%s}" % sym, tex(adult(clean(mean)), chapids=False)]
        cells += [''] * (4 - len(cells))
        lines.append(' & '.join(cells) + r' \\')
    lines.append(r"\end{tblr}\par\smallskip")
    lines.append(r"「先」「後」は、その巻の学年の目安と指導要領の学年を比べたもので、内容の深さ（同・詳・一部）とは別に書いています（例：\kgcsym{同}\kgcsep\kgcsym{後}）。"
                 r"「\kgcsym{一部}\kgcor\kgcsym{なし}」は、項目の中の事項によって扱いが分かれることを表します。"
                 r"\kgcsym{範囲外}は、指導要領の本文にない内容（数学Ⅲの注の微分方程式）を、このシリーズで扱っていることを表します。")
    lines.append(r"\end{kgclegend}")
    return lines

def build():
    L = [PREAMBLE]
    # ---------------- 付録A ----------------
    L.append(r"\bkevenpage\kgbsec[付録A　学習指導要領の項目からシリーズの章へ]{A}{付録A　学習指導要領の項目から\\シリーズの章へ}\label{kgc-a}\label{kgc-sec10}")
    L.append(r"""この付録は、現行の学習指導要領（小学校・中学校は平成29年告示、高等学校は平成30年告示）の算数・数学の項目ごとに、このシリーズのどの章で扱っているか、どのくらい扱っているかを示した一覧です。小学校第1学年から順に、中学校、高等学校の数学Ⅰ・数学A・数学Ⅱ・数学B・数学Ⅲ・数学Cの順に並べています。

\begin{itemize}[leftmargin=1.2\zw, itemsep=1pt, topsep=3pt]
\item 「番号」は、学年（科目）・領域・項目の番号です。例えば「小3-A(4)ア(ｴ)」は、小学校第3学年のA（数と計算）の(4)のアの(ｴ)を表します。「語」は〔用語・記号〕、「扱」は「内容の取扱い」の番号です。小学校のCは、第1〜3学年が「測定」、第4〜6学年が「変化と関係」です。
\item 「項目（要点）」は、指導要領の言葉を短くしたものです。正確な文は、指導要領の本文をご覧ください。
\item 「扱っている章」の \kgcch{1-4} などは章の番号（巻-章）です。「」の中は、その章の小見出しなどの題です。\kgcmotto{} は、章の中の発展の囲み「もっと知りたい」を表します。
\item 高等学校の科目を履修する学年は学校によって異なります。一般的な例は、数学Ⅰ・数学Aが1年、数学Ⅱ・数学Bが2年、数学Ⅲ・数学Cが3年です（指導要領で決められているものではありません）。
\item 「なし」「一部」の項目を補う方法は、「含めていない・軽く扱う内容と、補い方」の章をご覧ください。
\end{itemize}
""")
    L += legend_A()
    dropped_all = []
    school = {'小学校': '小学校', '中学校': '中学校'}
    for i, (g, rows) in enumerate(GRADES, 1):
        title = g
        m = re.match(r'高校\s*(数学.)', g)
        if m:
            title = '高等学校　' + m.group(1)
        else:
            title = re.sub(r'\s+', '　', g)
        # 見出しだけがページの下に残らないように、見出し＋表の見出しの行＋最初の行の高さを見つもって場所を確かめる
        L.append(r"\Needspace{%dpt}\kgbsub{A.%d}{%s}" % (first_row_need(rows), i, title))
        t, dropped = table_A(rows, title)
        L += t
        dropped_all += [(g,) + d for d in dropped]
    # ---------------- 付録B ----------------
    L.append(r"\bkevenpage\kgbsec{B}{付録B　全152章の一覧}\label{kgc-b}\label{kgc-sec11}")
    L.append(r"""この付録は、全9巻・152章（序章9・章139・読みもの3・終章1）を、巻と章の順に並べた一覧です。章名・★・路線は各巻のもくじと同じです。「指導要領の学年・科目」は、その章の内容が当たる学習指導要領の学年や科目で、1つの章が複数の学年にまたがるときは「入口〜出口」（最も低い学年〜最も高い学年・科目）で示しています。
""")
    rl = r"\hspace{1.2em plus 1fill}".join(r"\mbox{\kgcroute{%d}\,%s（%s）}" % (k, S.ROUTES[k]['name'], S.ROUTES[k]['sub']) for k in sorted(S.ROUTES))
    L.append(r"""\begin{kgclegend}{表の読み方}
\begin{tblr}{colspec={Q[l,wd=24mm] X[l]}, rowsep=2pt, colsep=3pt, cells={font=\small, valign=m}}
★ & 章の内容の高さの目安です。塗りの★はその章の下の高さ、白抜きの☆は上の高さまでを表します（例：\kgcstars{2}{3}＝★★〜★★★）。★は指導要領の学年と一対一ではありません。 \\
路線 & 7本の路線のどの駅に当たるかを、形の記号と番号で示しています。\par\smallskip{\raggedright %s\par} \\
指導要領の学年・科目 & 小＝小学校、中＝中学校、数Ⅰ〜数C＝高等学校の科目（数学Ⅰ〜数学C）、大学＝指導要領の範囲外で、大学の工学部で一般に学ぶ内容です。「範囲外」は、指導要領にも大学の科目の一覧にも項目がない内容です。「―」は、特定の学年に当てはめていない章です（DASHLIST）。 \\
範囲外 & \kgcout{a}＝指導要領の範囲外の内容が中心の章、\kgcout{p}＝一部に指導要領の範囲外の内容を含む章、印なし＝指導要領の範囲の中の章です。 \\
\end{tblr}
\end{kgclegend}
""".replace('DASHLIST', dash_list()) % rl)
    for vol in range(1, 10):
        v = S.VOLS[vol - 1]
        t = strip_ruby(v['title']) + ('　' + strip_ruby(v['sub']) if v['sub'] else '')
        nch = sum(1 for c in ORDER if CHAPS[c]['vol'] == vol)
        L.append(r"\Needspace{8\baselineskip}\kgbsub{第%d巻}{%s}\par\nobreak{\small\noindent 学年の目安：%s　章数：%d}\par\nobreak\vspace{3pt}" % (vol, t, v['grade'], nch))
        L += table_B(vol)
    return '\n'.join(L) + '\n', dropped_all

def main():
    nseen, nnames = check()
    print('series.py の章：%d　guide-taiou 2節の章：%d　guide-series の章名：%d' % (len(ORDER), nseen, nnames))
    print('付録Aの表：%d（%s）' % (len(GRADES), '・'.join(g for g, _ in GRADES)))
    if PROBLEMS:
        print('照らし合わせで見つかったこと（%d）：' % len(PROBLEMS))
        for p in PROBLEMS:
            print('  - ' + p)
    else:
        print('照らし合わせ：ちがいなし（152章、★・種類・書名・章名・章番号）')
    if '--check' in sys.argv:
        return
    body, dropped = build()
    open(OUT, 'w', encoding='utf-8').write(body)
    print('書いた：%s' % OUT)
    if dropped:
        print('付録Aに載せなかった行（扱いや章が未確認だけのもの）：')
        for d in dropped:
            print('  - %s %s %s：章「%s」扱い「%s」' % d)

if __name__ == '__main__':
    main()
