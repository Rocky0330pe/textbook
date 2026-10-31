#!/usr/bin/env python3
# 全巻にかかる修正事項の機械チェック（読むだけ。原稿は書きかえない）
import re, os, sys, glob, json, collections
TEX = '/home/claude/work/build/tex'
sys.path.insert(0, '/home/claude/work/build')
import series as S

def strip_comments(s):
    out = []
    for line in s.split('\n'):
        # % で始まるコメントを外す（\% は残す）
        m = re.search(r'(?<!\\)%', line)
        out.append(line[:m.start()] if m else line)
    return '\n'.join(out)

def chapters(n):
    if n == 'p':
        fs = sorted(glob.glob(TEX + '/p1-[0-9][0-9].tex'))
    else:
        fs = sorted(glob.glob(TEX + '/ch%d-[0-9][0-9].tex' % n))
    return fs

def read(f):
    return strip_comments(open(f, encoding='utf-8').read())

STARS = {}
KIND = {}
for v in S.VOLS:
    for p in v['parts']:
        for c in p[2]:
            STARS[c[0]] = c[3]; KIND[c[0]] = c[5]

def cid(f):
    b = os.path.basename(f)[:-4]
    m = re.match(r'ch(\d)-(\d\d)', b)
    if m: return '%d-%d' % (int(m.group(1)), int(m.group(2)))
    m = re.match(r'p1-(\d\d)', b)
    return '力-%d' % int(m.group(1))

def remove_envs(s, names):
    for nm in names:
        s = re.sub(r'\\begin\{%s\}.*?\\end\{%s\}' % (nm, nm), ' ', s, flags=re.S)
    return s

def inline_math(s):
    # $...$ だけ（$$ と \[ \] は除く）
    s2 = re.sub(r'\\\[.*?\\\]', ' ', s, flags=re.S)
    s2 = s2.replace('\\$', '')
    return re.findall(r'(?<!\$)\$([^$]+?)\$(?!\$)', s2, flags=re.S)

res = collections.OrderedDict()
VOLS = [1,2,3,4,5,6,7,8,9,'p']
KATAKANA = {
 'コンデンサ(ーなし)': r'コンデンサ(?!ー)', 'エレベータ(ーなし)': r'エレベータ(?!ー)', 'モータ(ーなし)': r'モータ(?!ー)',
 'ダンパ(ーなし)': r'ダンパ(?!ー)', 'コンピューター': r'コンピューター'}
POLE_OK = ['N極','S極','北極','南極','電極','極限','極板','極座標','極値','極大','極小','積極','両極','磁極','極め','極端','極性','陽極','陰極','極細','至極','極力','極端','究極','極寒','極地','極み','極上','極秘','極光','極度','北極星','極めて','N 極','S 極','+極','－極','−極','＋極','-極','正極','負極','\\R{極']
detail = collections.defaultdict(list)
for n in VOLS:
    r = collections.OrderedDict()
    fs = chapters(n)
    star_bad = []; hat_missing = []; idx_bad = []; voice_missing = []; rei_tag_missing = []
    for f in fs:
        s = read(f); c = cid(f)
        body_nofig = remove_envs(s, ['tikzpicture', 'axis'])
        im = inline_math(body_nofig)
        def add(k, v=1):
            r[k] = r.get(k, 0) + v
        # 1 文中の \dfrac・\displaystyle
        k1 = [m for m in im if re.search(r'\\dfrac|\\displaystyle', m)]
        add('文中dfrac', len(k1))
        if k1: detail['文中dfrac'].append((c, len(k1)))
        # 文中の行列
        k2 = [m for m in im if re.search(r'\\begin\{[pbv]?matrix\}', m)]
        add('文中行列', len(k2))
        if k2: detail['文中行列'].append((c, len(k2)))
        add('smallmatrix', len(re.findall(r'smallmatrix', s)))
        # 2 字の大きさ
        sc = len(re.findall(r'\\scriptsize|\\tiny', s)); add('scriptsize/tiny', sc)
        if sc: detail['scriptsize'].append((c, sc))
        bs = len(re.findall(r'\\boldsymbol|\\bm\{', s)); add('boldsymbol', bs)
        if bs: detail['boldsymbol'].append((c, bs))
        # 3 ∮ と ∯
        oint_surf = len(re.findall(r'\\oint(?!\w)[^$]{0,60}?(dS|dA|d\\vec ?\{?[SA])', s)); add('∮で面', oint_surf)
        if oint_surf: detail['∮で面'].append((c, oint_surf))
        add('∯', len(re.findall(r'\\oiint', s)))
        dn = len(re.findall(r'電束', s)); add('電束', dn)
        if dn: detail['電束'].append((c, dn))
        mu = len(re.findall(r'\\mu_0|\\mu_\{0\}|μ_?0|\\mu_\{\\mathrm\{0\}\}', s))
        if mu:
            detail['μ0'].append((c, mu, '2019注あり' if '2019' in s else '2019注なし'))
        add('μ0', mu)
        # rot=0 の条件
        for m in re.finditer(r'[^。\n]*(rot|\\rot|回転)[^。\n]*(＝|=)\s*\\?\{?\\?vec\{?0\}?[^。\n]*(なら|ならば)[^。\n]*。', s):
            if 'すきま' not in m.group(0) and ('勾配' in m.group(0) or 'grad' in m.group(0) or 'ポテンシャル' in m.group(0)):
                detail['rot=0条件なし'].append((c, m.group(0)[:80]))
        # 極
        for m in re.finditer(r'極', s):
            ctx = s[max(0, m.start()-4):m.end()+3]
            if any(ok in ctx for ok in POLE_OK) or re.search(r'[NS]\s*(\\R\{)?極|極(座標|限|板|値|大|小|め|端|性)', ctx):
                continue
            detail['極'].append((c, ctx.replace('\n', ' ')))
        # ことば
        for k, pat in [('小学1・2年', r'小学\s*1\s*・\s*2\s*年|小学1年・2年|小学1・2年'), ('工学を理解するための物理', r'工学を理解するための物理'),
                       ('何百回', r'何百回'), ('倍音', r'倍音'), ('振動数', r'振動数'), ('周波数', r'周波数'),
                       ('単位行列', r'単位行列'), ('numpy版', r'numpy\s*[0-9]\.[0-9]'), ('奇関数', r'奇関数'),
                       ('わき出(N極近く)', r'N\s*極[^。]{0,20}わき出|わき出[^。]{0,20}N\s*極'),
                       ('ラジアン（章）', r'ラジアン[^（]{0,8}（[0-9]-[0-9]+）'),
                       ('場所で指す', r'(右|左|下|上|となり)の(図|ページ|表|グラフ)|(右|左)のよう(な|に)'),
                       ('文字で表N/図N', r'(?<![\\{])(図|表)\s?[0-9０-９]+'),
                       ('ラプラシアン/Δ', r'ラプラシアン|\\Delta\s*\\?[a-zA-Z]'),
                       ('変数分離', r'変数分離'),
                       ]:
            cnt = len(re.findall(pat, s))
            if cnt:
                add(k, cnt)
                if k not in ('周波数', '振動数', '文字で表N/図N', 'ラプラシアン/Δ', '変数分離'):
                    detail[k].append((c, cnt))
                elif k in ('振動数',):
                    detail[k].append((c, cnt))
        for k, pat in KATAKANA.items():
            cnt = len(re.findall(pat, s))
            if cnt: add(k, cnt); detail[k].append((c, cnt))
        # \clearpage と例題
        cp = 0
        for m in re.finditer(r'\\(clearpage|newpage)\b', s):
            after = s[m.end():m.end()+250]
            if re.search(r'\\begin\{reidai\}|\\bksection\{reidai\}', after.split('\n\n\n')[0][:250]):
                cp += 1
        add('例題前clearpage', cp)
        if cp: detail['例題前clearpage'].append((c, cp))
        add('clearpage/newpage(全部)', len(re.findall(r'\\(clearpage|newpage)\b', s)))
        # 小問の \quad 並べ
        q = len(re.findall(r'\\q?quad\s*(\\R\{)?（\s*[2-9]\s*）|\\q?quad\s*\(\s*[2-9]\s*\)', s)); add('小問quad並べ', q)
        if q: detail['小問quad並べ'].append((c, q))
        # bkcodeout
        bo = len(re.findall(r'\\begin\{bkcodeout\}(?!\[)', s)); add('bkcodeout[]なし', bo)
        if bo: detail['bkcodeout[]なし'].append((c, bo))
        add('bkcode', len(re.findall(r'\\begin\{bkcode\}', s)))
        add('verbatim/lstlisting', len(re.findall(r'\\begin\{(verbatim|lstlisting|Verbatim)\}', s)))
        # 〔 〕と （単位）
        add('〔〕', len(re.findall(r'〔', s)))
        ax = len(re.findall(r'(xlabel|ylabel|zlabel)\s*=\s*\{[^}]*〔', s)); add('軸に〔〕', ax)
        if ax: detail['軸に〔〕'].append((c, ax))
        # 記号のすぐ後の（単位）・［単位］（本文。図は除く）
        sym_unit = re.findall(r'\$[^$]{1,15}\$\s*[（(［\[]\s*(\\si\{|\\unit\{)?(?:[A-Za-zΩμ°℃%]|\\(ohm|degreeCelsius|micro|kilo|meter|second|volt|ampere))[A-Za-z0-9Ω°℃/·.^\-{}\\ ]{0,18}[）)］\]]', body_nofig)
        add('記号の後の（単位）', len(sym_unit))
        if sym_unit: detail['記号の後の（単位）'].append((c, len(sym_unit)))
        # 温度
        add('degreeCelsius', len(re.findall(r'\\degreeCelsius', s)))
        add('℃', len(re.findall(r'℃', s)))
        # 5けた以上の数（第4巻から）
        s5 = re.sub(r'\\(num|qty|SI|si|unit|label|ref|pageref|bkfurref|includegraphics|input|bkidx)\{[^}]*\}(\{[^}]*\})?', ' ', s)
        s5 = remove_envs(s5, ['tikzpicture', 'axis', 'bkcode', 'bkcodeout', 'bksheet'])
        s5 = re.sub(r'\\bksheet\{.*?\n\s*\}', ' ', s5, flags=re.S)
        n5 = len(re.findall(r'(?<![\d.,{}\w\\/:#=-])\d{5,}(?![\d\w])', s5))
        add('5けた生', n5)
        if n5 and n not in (1, 2, 3): detail['5けた生'].append((c, n5))
        # \color{bkTheme}・色の字
        th = len(re.findall(r'\\(text)?color\{bkTheme\}', s)); add('color{bkTheme}', th)
        if th: detail['color{bkTheme}'].append((c, th))
        ct = len(re.findall(r'\\textcolor\{bk(Blue|Purple|Orange|Red|Theme|Vol\d|Green)[^}]*\}', s)); add('textcolor明色', ct)
        # ∽
        add('∽/backsim(非sojisym)', len(re.findall(r'∽|\\backsim', s)))
        add('sojisym', len(re.findall(r'\\sojisym', s)))
        # 道しるべ
        mi = re.search(r'\\bkmichishirube\{([^}]*)\}\{([^}]*)\}', s)
        if mi: detail['道しるべ'].append((c, mi.group(1), mi.group(2)))
        # ふりかえりの参照
        add('bkfurref', len(re.findall(r'\\bkfurref', s)))
        fu = re.search(r'\\begin\{furikaeri\}(.*?)\\end\{furikaeri\}', s, flags=re.S)
        if fu:
            add('ふりかえり内pageref', len(re.findall(r'\\pageref', fu.group(1))))
        # 章ごとの決まり（序章・終章・読みものは別）
        kind = KIND.get(c, '?')
        if c in STARS and kind == 'C':
            lo, hi = STARS[c]
            exp_b = lo; exp_c = hi if hi > lo else min(5, hi + 1)
            gs = re.findall(r'\\bkproblemgroup\{([^}]*(?:\}[^}]*)?)\}\{(\d)\}', s)
            b = [int(x[1]) for x in gs if 'チャレンジ' not in x[0]]
            ch = [int(x[1]) for x in gs if 'チャレンジ' in x[0]]
            if gs and ((b and b[0] != exp_b) or (ch and ch[0] != exp_c)):
                star_bad.append('%s(%d,%d):基本%s/チャレンジ%s→%d/%d' % (c, lo, hi, b[0] if b else '-', ch[0] if ch else '-', exp_b, exp_c))
            if '\\begin{hatena}' in s and '\\bkhatenaref' not in s:
                hat_missing.append(c)
            ni = len(re.findall(r'\\bkidx\{', s))
            if ni < 3 or ni > 5: idx_bad.append('%s:%d' % (c, ni))
            if not re.search(r'わからなくても|大丈夫|だいじょうぶ|\\R\{大丈夫\}', s):
                voice_missing.append(c)
            # 章末問題の（例題N）札
            ep = s.split('\\bkendproblems', 1)
            if len(ep) == 2:
                nprob = len(re.findall(r'\\bkproblem(?![a-z])', ep[1]))
                ntag = len(re.findall(r'（(\\R\{)?例題|（れいだい|（\\R\{例題', ep[1]))
                if nprob and ntag == 0: rei_tag_missing.append(c)
                add('章末問題数', nprob); add('（例題N）札', ntag)
    r['章末★ずれ'] = star_bad; r['はてなの答えなし'] = hat_missing; r['bkidx3〜5外'] = idx_bad
    r['声かけなし'] = voice_missing; r['（例題）札なし章'] = rei_tag_missing
    r['章の数'] = len(fs)
    res[str(n)] = r

json.dump({'res': res, 'detail': detail}, open(os.path.join(os.path.dirname(__file__), 'chk_all.json'), 'w'), ensure_ascii=False, indent=1)
keys = []
for n in res:
    for k in res[n]:
        if k not in keys: keys.append(k)
for k in keys:
    row = []
    for n in res:
        v = res[n].get(k, 0)
        row.append(str(len(v)) if isinstance(v, list) else str(v))
    print('%-22s' % k, ' '.join('%6s' % x for x in row))
