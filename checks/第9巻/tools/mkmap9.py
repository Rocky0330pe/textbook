#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""第9巻 巻末「変換の地図」を、本文の場合分けの表と例題の1行めから写す（第15回編集委員会、組 B9）。

  python3 tools/mkmap9.py            … tex/ch9-back.tex の地図を書きかえる（「こんなとき」・「例題」の列、変換表の再掲）
  python3 tools/mkmap9.py --check    … 書きかえずに、ちがう所だけ表示する（ちがいがあれば終了コード1）
  python3 tools/mkmap9.py --flow     … 流れ図「どの表を見る？」を、この巻のすべての例題でたどって確かめる

写すもの（第8巻 r3 の T3-8・T3-11 の決定：手で写さない）
  ・「こんなとき」：本文の表（\\kix?casetitle のすぐ後の bktable）の2列めを、そのまま写す（小さな分数だけ斜線の形 a/b に）。
  ・「例題」：本文の表の「例題」の列 ∪ 例題の1行め \\kix?baai{…}{表}{記号,記号} に出てくる例題（2つの場合を通る例題もふくむ）。
     その表の章の例題は番号だけ、ほかの章の例題は「\\kixzo{9-1}{2・4}」（9-1 の例題2・4）として2行めに書く。
     表9-2 は 9-2 の行（A〜I）と 9-3 の行（J′・A・G・F・J）があるので、9-3 の例題は 9-3 の行へ、9-1 の例題は 9-2 の行へ。
  ・変換表の再掲：9-6 の「変換表（見開き）」の2つの表（関数・性質）を、そのまま写す。
地図の中の目印（ch9-back.tex）： 「%% map:表:章のファイル:頭文字」から「%% /map」まで、「%% saikei:kansu」「%% saikei:seishitsu」から「%% /saikei」まで。
"""
import re, sys, os

BUILD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEX = os.path.join(BUILD, 'tex')

def grp(s, i):
    """s[i]=='{' の中身と、閉じかっこの次の位置"""
    assert s[i] == '{', s[i:i+30]
    d = 0; j = i
    while True:
        c = s[j]
        if c == '\\': j += 2; continue
        if c == '{': d += 1
        elif c == '}':
            d -= 1
            if d == 0: return s[i+1:j], j+1
        j += 1

def simple(x):
    x = x.strip()
    return re.fullmatch(r'-?(\d+(\.\d+)?|[A-Za-z]|\\[A-Za-z]+|[A-Za-z](_\{?[\w\\]+\}?)?|\\dd\s*[A-Za-z]|\\[A-Za-z]+\s*[A-Za-z]|\d*[A-Za-z]|\([^()]*\)(\^\{?\w+\}?)?)', x) is not None

def slash(s):
    """小さな分数 \\frac{a}{b}・\\dfrac・\\tfrac を、斜線の形 a/b に（地図の表は 9.5pt なので：第8巻 r3 T3-12）"""
    out = ''; i = 0
    rx = re.compile(r'\\[dt]?frac\s*')
    while True:
        m = rx.search(s, i)
        if not m: out += s[i:]; break
        out += s[i:m.start()]
        j = m.end()
        def arg(j):
            if s[j] == '{': return grp(s, j)
            if s[j] == '\\':
                mm = re.match(r'\\[A-Za-z]+', s[j:]); return mm.group(0), j+mm.end()
            return s[j], j+1
        a, j = arg(j); b, k = arg(j)
        a = slash(a); b = slash(b)
        A = a if simple(a) else '(' + a + ')'
        B = b if simple(b) else '(' + b + ')'
        out += A + '/' + B
        if k < len(s) and re.match(r'[A-Za-z\\]', s[k]): out += ' '
        i = k
    return out

def strip_comments(c):
    return re.sub(r'(?<!\\)%.*', '', c)

def chapter_table(fname, pre):
    """本文の場合分けの表：記号 → (こんなとき, 例題の列の番号の集合)。行の順も返す"""
    c = strip_comments(open(os.path.join(TEX, fname), encoding='utf-8').read())
    m = re.search(r'\\' + pre + r'casetitle\{[^}]*\}', c)
    if not m: raise SystemExit(f'{fname}: \\{pre}casetitle が見つからない')
    i = c.find(r'\begin{bktable}', m.end()); j = c.find(r'\end{bktable}', i)
    rows = {}; order = []
    body = c[i:j]
    # 行は「\\」で区切る（1行が複数行にわたってもよい）
    for line in re.split(r'\\\\\s*\n', body):
        line = line.strip()
        mm = re.match(r'\\' + pre + r'case\{', line)
        if not mm: continue
        key, k = grp(line, mm.end()-1)
        cells = split_cells(line[k:])
        konna = cells[1].strip(); nums = cells[-1].strip()
        key = norm_key(key)
        rows[key] = (konna, set(parse_nums(nums)), cells[2] if len(cells) > 3 else ''); order.append(key)
    return rows, order

def split_cells(s):
    """& で分ける（{ } と $ $ の中の & は分けない）"""
    out = []; d = 0; cur = ''; i = 0
    while i < len(s):
        c = s[i]
        if c == '\\': cur += s[i:i+2]; i += 2; continue
        if c == '{': d += 1
        elif c == '}': d -= 1
        if c == '&' and d == 0: out.append(cur); cur = ''
        else: cur += c
        i += 1
    out.append(cur)
    return out

def norm_key(k):
    return k.replace("$'$", "'").replace('′', "'").strip()

def parse_nums(t):
    t = t.replace('〜', '-').replace('～', '-')
    out = []
    for a, b in re.findall(r'(\d+)\s*(?:-\s*(\d+))?', t):
        if b: out += list(range(int(a), int(b)+1))
        else: out.append(int(a))
    return out

def all_baai():
    """すべての章の例題の1行め：(章の番号, 例題の番号, 表, [記号…], 題)"""
    res = []
    for n in range(0, 14):
        f = os.path.join(TEX, f'ch9-{n:02d}.tex')
        if not os.path.exists(f): continue
        c = strip_comments(open(f, encoding='utf-8').read())
        pre = 'kix' + chr(ord('a') + n)
        for k, m in enumerate(re.finditer(r'\\begin\{reidai\}(\[(?:[^\[\]]|\[[^\]]*\])*\])?(.*?)\\end\{reidai\}', c, re.S), 1):
            title = (m.group(1) or '')[1:-1]
            b = re.search(r'\\' + pre + r'baai\{', m.group(2))
            if not b:
                res.append((f'9-{n}', k, None, [], title)); continue
            i = b.end() - 1
            _, i = grp(m.group(2), i); tab, i = grp(m.group(2), i); keys, i = grp(m.group(2), i)
            res.append((f'9-{n}', k, tab.strip(), [norm_key(x) for x in keys.split(',')], title))
    return res

BLOCK_RX = re.compile(r'%% map:([\d-]+):(ch9-\d\d)(?:\.tex)?:(kix[a-z])[^\n]*\n(.*?)%% /map', re.S)

def fmt_nums(own, other):
    s = '・'.join(map(str, sorted(own)))
    o = ''.join(r'\\\kixzo{%s}{%s}' % (ch, '・'.join(map(str, sorted(v)))) for ch, v in sorted(other.items(), key=lambda x: int(x[0].split('-')[1])))
    if o: return '{' + (s if s else '―') + o + '}'
    return s if s else '―'

def run(path, check):
    src = open(path, encoding='utf-8').read()
    baai = all_baai()
    blocks = [(m.group(1), m.group(2) + '.tex', m.group(3)) for m in BLOCK_RX.finditer(src)]
    msgs = []
    new = src
    for m in list(BLOCK_RX.finditer(src)):
        tab, fname, pre = m.group(1), m.group(2) + '.tex', m.group(3)
        chap = '9-%d' % int(fname[4:6])
        rows, order = chapter_table(fname, pre)
        # この表・この章の行へ写す例題
        own = {k: set(v[1]) for k, v in rows.items()}; other = {k: {} for k in rows}
        same_tab_blocks = [f for t, f, _ in blocks if t == tab]
        main_file = 'ch9-%02d.tex' % int(tab.split('-')[1])
        for ch, num, t, keys, title in baai:
            if t != tab: continue
            chfile = 'ch9-%02d.tex' % int(ch.split('-')[1])
            target = chfile if chfile in same_tab_blocks else main_file
            if target != fname: continue
            for k in keys:
                if k not in rows:
                    msgs.append(f'  ！ {ch} 例題{num}「{title}」の場合 {k} が {fname} の表{tab}にない'); continue
                if ch == chap: own[k].add(num)
                else: other[k].setdefault(ch, set()).add(num)
        # 表の列と例題の1行めのちがいを知らせる（本文の組へ）
        for k in rows:
            b = {num for ch, num, t, keys, _ in baai if t == tab and ch == chap and k in keys}
            if b != rows[k][1] and fname == ('ch9-%02d.tex' % int(chap.split('-')[1])):
                msgs.append(f'  {fname} 表{tab} {k}：本文の表の例題 {sorted(rows[k][1])}、例題の1行め {sorted(b)} → 地図は両方 {sorted(own[k])}')
        seg = m.group(4)
        seen = []
        def rep(mm):
            k = norm_key(mm.group(1)); seen.append(k)
            if k not in rows:
                msgs.append(f'  ！ 地図の 表{tab}（{fname}）の {k} が本文の表にない'); return mm.group(0)
            line = mm.group(0)
            # こんなとき
            p = line.find(r'\kixzif{')
            _, e = grp(line, p + len(r'\kixzif'))
            konna = slash(rows[k][0])
            line = line[:p] + r'\kixzif{' + konna + '}' + line[e:]
            # 手順の札（\kix?op{n}・\kix?dan{n}）：本文の表の札を、出てくる順に写す（手順のことばは地図用に短くしたもの）
            tags = re.findall(r'\\kix[a-z](op|dan)\{(\d)\}', rows[k][2])
            p2 = line.find(r'\kixzif{'); _, e2 = grp(line, p2 + len(r'\kixzif'))
            cells0 = split_cells(line[e2:])
            mtags = list(re.finditer(r'\\kixz(op|dan)\{(\d)\}', cells0[0]))
            if len(mtags) != len(tags):
                msgs.append(f'  ！ 表{tab}（{fname}）{k}：手順の札の数が本文 {len(tags)}・地図 {len(mtags)}。地図の手順を手で直す')
            else:
                c0 = cells0[0]
                for mt, (kind, num) in reversed(list(zip(mtags, tags))):
                    if (mt.group(1), mt.group(2)) != (kind, num):
                        msgs.append(f'  表{tab}（{fname}）{k}：札を {mt.group(1)}{mt.group(2)} → {kind}{num} に写した（手順のことばも確かめる）')
                    c0 = c0[:mt.start()] + r'\kixz' + kind + '{' + num + '}' + c0[mt.end():]
                line = line[:e2] + c0 + line[e2 + len(cells0[0]):]
            # 例題（最後のセル）
            cells = split_cells(line[:-2] if line.endswith('\\\\') else line)
            last = cells[-1]
            nums = fmt_nums(own[k], other[k])
            body = '&'.join(cells[:-1]) + '& ' + nums + ' \\\\'
            return body
        seg2 = re.sub(r'\\kixzcase\{((?:[^{}]|\{[^{}]*\})*)\}[^\n]*\\\\', rep, seg)
        missing = [k for k in order if k not in seen]
        if missing: msgs.append(f'  ！ 地図の 表{tab}（{fname}）にない場合：{missing}')
        if [k for k in seen] != [k for k in order if k in seen]:
            msgs.append(f'  地図の 表{tab}（{fname}）の行の順が本文とちがう：地図 {seen}、本文 {order}')
        new = new.replace(m.group(0), m.group(0)[:m.start(4)-m.start(0)] + seg2 + '%% /map', 1)
        print(f'表{tab}（{fname}）：場合 {len(order)}、地図の行 {len(seen)}')
    # 変換表の再掲
    c6 = strip_comments(open(os.path.join(TEX, 'ch9-06.tex'), encoding='utf-8').read())
    for key, lab in (('kansu', 'bk:9-6:tab-kansu'), ('seishitsu', 'bk:9-6:tab-seishitsu')):
        j = c6.find(r'\label{' + lab + '}')
        i = c6.rfind(r'\begin{bktable}', 0, j); e = c6.find(r'\end{bktable}', i) + len(r'\end{bktable}')
        cap = re.search(r'\\bktabcaption\{', c6[e:j])
        tbl = c6[i:e]
        capt, _ = grp(c6, e + cap.end() - 1)
        mm = re.search(r'(%% saikei:' + key + r'[^\n]*\n)(.*?)(%% /saikei)', new, re.S)
        if not mm: msgs.append(f'  ！ 再掲の目印 saikei:{key} がない'); continue
        body = tbl + '\n\\bktabcaption{' + capt + '}\n'
        new = new[:mm.start(2)] + body + new[mm.end(2):]
    for x in msgs: print(x)
    if new != src:
        if check:
            print('地図・再掲が本文とちがう（python3 tools/mkmap9.py で写し直す）'); return 1
        open(path, 'w', encoding='utf-8').write(new); print('書きかえた：', path)
    else:
        print('地図・再掲は本文と同じ')
    return 0

# ---------------- 流れ図「どの表を見る？」の確かめ ----------------
# 問い（ch9-back.tex の図と同じ順）。(問い, 「はい」で着く表, 着いたあと「下の問いへ」もどる先の問い or None)
FLOW = [('q1', '9-4', None),   # 名前は F(ω) か DFT？
        ('q2', '9-2', None),   # 波を sin・cos の和で書く？
        ('q3', '9-11', None),  # 名前は e^{At}？
        ('q4', '9-10', None),  # 状態方程式を立てる・使う？
        ('q5', '9-8', 'q6'),   # G(s) を作る・使う？（作ったら下の問いへ）
        ('q6', '9-9', None),   # 極・安定かを知りたい？
        ('q7', '9-6', 'q8'),   # t の式を s の式に変える？（変えたら下の問いへ）
        ('q8', '9-7', None)]   # s の式を t の式にもどす？
# 四角に書いた「同じ場合」（表9-10 の四角：E＝表9-9のG・表9-11のI、H＝表9-8のE）
ALSO = {'9-10': {('9-9', 'G'), ('9-11', 'I'), ('9-8', 'E')}}
# 例題ごとの「はい」と答える問い。問題の文（何があたえられて、何を求めるか）から決めた。
# キーは (章, 例題の番号)。題も書いておき、題が変わったら知らせる。
ANS = {
 ('9-1', 2): ('0と1をくり返す信号', 'q2'), ('9-1', 3): ('のこぎり波', 'q2'), ('9-1', 4): ('1\\,kHz の信号の成分', 'q2'),
 ('9-1', 5): ('12個のデータから係数を求める', 'q2'), ('9-1', 6): ('棒のまん中の温度', 'q2'), ('9-1', 7): ('まん中が50', 'q2'),
 ('9-2', 1): ('公式で書き直す', 'q2'), ('9-2', 2): ('偶関数の方形波', 'q2'), ('9-2', 3): ('山の形の三角波', 'q2'),
 ('9-2', 4): ('直線の形の初めの温度', 'q2'), ('9-2', 5): ('まん中ではじいた弦', 'q2'), ('9-2', 6): ('50\\,Hz の方形波', 'q2'),
 ('9-2', 7): ('整流した波の平均', 'q2'), ('9-2', 8): ('半波整流', 'q2'), ('9-2', 9): ('12個のデータから係数を求める', 'q2'),
 ('9-3', 1): ('回る矢印の和', 'q2'), ('9-3', 2): ('から $c_n$ を求める', 'q2'), ('9-3', 3): ('オイラーの公式で分ける', 'q2'),
 ('9-3', 4): ('整流した電圧の平均', 'q2'), ('9-3', 5): ('0と2の方形波', 'q2'), ('9-3', 6): ('のこぎり波', 'q2'),
 ('9-3', 7): ('ローパスフィルター', 'q2'), ('9-3', 8): ('輪の熱', 'q2'), ('9-3', 9): ('基本波にある電力の割合', 'q2'),
 ('9-4', 1): ('方形パルスの変換', 'q1'), ('9-4', 2): ('だんだん消える波の変換', 'q1'), ('9-4', 3): ('両側の指数の変換', 'q1'),
 ('9-4', 4): ('ガウスの形の変換', 'q1'), ('9-4', 5): ('ずらしたパルスの変換', 'q1'), ('9-4', 6): ('ガウスの形', 'q1'),
 ('9-4', 7): ('くり返す波のスペクトル', 'q1'), ('9-4', 8): ('8点の DFT', 'q1'), ('9-4', 9): ('FFT の結果を読む', 'q1'),
 ('9-4', 10): ('エイリアシング', 'q1'),
 # 9-5：変換する（例題2〜5は、変換したあと x・T などにもどす）
 ('9-5', 1): ('定義の積分で作る', 'q7'), ('9-5', 2): ('冷めるコーヒー', 'q7 q8'), ('9-5', 3): ('RC 回路の充電', 'q7 q8'),
 ('9-5', 4): ('RL 回路', 'q7 q8'), ('9-5', 5): ('車A を翻訳する', 'q7 q8'), ('9-5', 6): ('微分の行を、数で確かめる', 'q7'),
 ('9-5', 7): ('たし算の形を変換する', 'q7'),
 ('9-6', 1): ('表を引く', 'q7'), ('9-6', 2): ('項の和', 'q7'), ('9-6', 3): ('ゆれながら止まる形', 'q7'), ('9-6', 4): ('おくれて入れる', 'q7'),
 ('9-6', 5): ('車B の式を変換する', 'q7'), ('9-6', 6): ('インパルス応答', 'q7 q8'), ('9-6', 7): ('パルスを変換する', 'q7'),
 ('9-6', 8): ('がかかった形', 'q7'), ('9-6', 9): ('表にない形を、数値で', 'q7'), ('9-6', 10): ('たたみこみを2通りで', 'q7'),
 ('9-6', 11): ('はじめと最後の値で確かめる', 'q7 q8'),
 # 9-7：あたえられた F(s) をもどす（1・10〜13）、微分方程式を変換してからもどす（2〜9）
 ('9-7', 1): ('表の形にそろえて引く', 'q8'), ('9-7', 2): ('ゆれずにもどる動き', 'q7 q8'), ('9-7', 3): ('RC 回路の充電', 'q7 q8'),
 ('9-7', 4): ('臨界減衰', 'q7 q8'), ('9-7', 5): ('熱電対のおくれ', 'q7 q8'), ('9-7', 6): ('車B', 'q7 q8'),
 ('9-7', 7): ('一定の力をかけ続ける', 'q7 q8'), ('9-7', 8): ('強制振動', 'q7 q8'), ('9-7', 9): ('共振', 'q7 q8'),
 ('9-7', 10): ('おくれて入れたスイッチ', 'q8'), ('9-7', 11): ('分子の次数が大きい', 'q8'), ('9-7', 12): ('最後の値だけ求める', 'q8'),
 ('9-7', 13): ('手で分けきれない分母', 'q8'),
 # 9-8：伝達関数を作る・使う。例題4は全体の分母が0になる s も求める。例題1は微分方程式を変換する。例題7は時間の動きにもどす
 ('9-8', 1): ('微分方程式から伝達関数を作る', 'q5 q7'), ('9-8', 2): ('エンジンと車をつなぐ', 'q5'), ('9-8', 3): ('2つのスピーカー', 'q5'),
 ('9-8', 4): ('モーターの比例制御', 'q5 q6'), ('9-8', 5): ('エアコン', 'q5'), ('9-8', 6): ('状態方程式から作る', 'q4 q5'),
 ('9-8', 7): ('ステップ応答とインパルス応答', 'q5 q8'), ('9-8', 8): ('ばねの周波数応答', 'q5'), ('9-8', 9): ('2段のフィルター', 'q5'),
 ('9-8', 10): ('データから伝達関数を作る', 'q5'),
 # 9-9：極・安定を調べる。伝達関数があたえられている（1〜4・10）、フィードバックで全体を作る（6・8・9）、
 #      微分方程式があたえられている（7）、状態方程式があたえられている（5）
 ('9-9', 1): ('極の場所から動きを当てる', 'q5 q6'), ('9-9', 2): ('1次おくれの温度センサー', 'q5 q6'), ('9-9', 3): ('2次おくれの極と行きすぎ', 'q5 q6'),
 ('9-9', 4): ('零点と極', 'q5 q6'), ('9-9', 5): ('状態方程式から極を求める', 'q4 q6'), ('9-9', 6): ('モーターの比例制御', 'q5 q6'),
 ('9-9', 7): ('エアコンの比例制御', 'q6'), ('9-9', 8): ('ロボットの腕', 'q5 q6'), ('9-9', 9): ('3次の電気炉の安定', 'q5 q6'),
 ('9-9', 10): ('4次の式を Python で', 'q5 q6'),
 ('9-10', 1): ('ばねを状態方程式に', 'q4'), ('9-10', 2): ('水そうに水を入れる', 'q4'), ('9-10', 3): ('RLC の回路', 'q4'),
 ('9-10', 4): ('短い棒の線形化', 'q4'), ('9-10', 5): ('落ち着くかの判定', 'q4 q6'), ('9-10', 6): ('棒を立たせる', 'q4'),
 ('9-10', 7): ('コンピュータのくり返し', 'q4'), ('9-10', 8): ('から $G(s)$', 'q4 q5'),
 ('9-11', 1): ('対角の行列', 'q3 q4'), ('9-11', 2): ('水そうを対角化で', 'q3 q4'), ('9-11', 3): ('車B', 'q3 q4'),
 ('9-11', 4): ('押したあとの台車', 'q3 q4'), ('9-11', 5): ('送電線', 'q3'), ('9-11', 6): ('ちょうどゆれない動き', 'q3 q4 q8'),
 ('9-11', 7): ('で', 'q3 q4 q8'), ('9-11', 8): ('一定の力を入れる', 'q3 q4 q8'), ('9-11', 9): ('3つの点の熱', 'q3 q4'),
 ('9-11', 10): ('落ち着くかの判定', 'q4 q6'),
}

def walk(yes):
    """流れ図を上からたどり、着いた表を順に返す"""
    ids = [q for q, _, _ in FLOW]; i = 0; got = []
    while i < len(FLOW):
        q, tab, nxt = FLOW[i]
        if q in yes:
            got.append(tab)
            if nxt is None: return got
            i = ids.index(nxt); continue
        i += 1
    got.append('（答え：もどさない）'); return got

def flow():
    bad = 0; n = 0; skip = []
    for ch, num, tab, keys, title in all_baai():
        if tab is None: skip.append(f'{ch} 例題{num}「{title}」'); continue
        a = ANS.get((ch, num))
        if a is None: print(f'  ！ {ch} 例題{num}「{title}」の答え方が ANS にない（足す）'); bad += 1; continue
        if a[0] not in title: print(f'  ！ {ch} 例題{num} の題が変わった：「{title}」（ANS は「{a[0]}」）')
        got = walk(set(a[1].split()))
        ok = tab in got or any((tab, k) in ALSO.get(g, set()) for g in got for k in keys)
        n += 1
        mark = 'OK' if ok else 'ちがう'
        if not ok: bad += 1
        print(f'{mark:3s} {ch} 例題{num:2d}「{title}」 はい：{a[1]:10s} → 表{"→表".join(got)}（場合：表{tab}の{"・".join(keys)}）')
    print(f'例題 {n} 題をたどった。ちがう所 {bad}。場合の行のない例題（表を使わない例題）：{len(skip)} 題')
    for x in skip: print('   ', x)
    return 1 if bad else 0

if __name__ == '__main__':
    args = sys.argv[1:]
    if '--flow' in args: sys.exit(flow())
    path = next((a for a in args if not a.startswith('--')), os.path.join(TEX, 'ch9-back.tex'))
    sys.exit(run(path, '--check' in args))
