# 精査の組E：力-12〜15 の紙面の決まりの候補を数える（python3 -I style_e.py <texdir>）
import re, sys
texdir = sys.argv[1]
chs = ['p1-12', 'p1-13', 'p1-14', 'p1-15']

def strip_comment(line):
    return re.sub(r'(?<!\\)%.*', '', line)

pats = {
  'で学ぶ':            r'で学ぶ',
  '∮(oint)':          r'\\oint',
  'boldsymbol':       r'\\boldsymbol',
  'scriptsize/tiny':  r'\\scriptsize|\\tiny',
  'エレベータ(ーなし)': r'エレベータ(?!ー)',
  'モータ(ーなし)':     r'モータ(?!ー)',
  'コンピューター':     r'コンピューター',
  'インバータ(ーなし)': r'インバータ(?!ー)',
  'センサー/センサ':    r'センサ',
  '場所で指す図表':     r'(右|左|上|下)の(図|グラフ|表)',
  '小問の\\quad並べ':   r'\\quad\s*[（(]\s*\d\s*[)）]|\\quad\s*\(\d\)',
  '\\ref で例題':        r'例題\\ref',
  'bkreidairef':      r'\\bkreidairef',
}
for ch in chs:
    lines = open(f'{texdir}/{ch}.tex', encoding='utf-8').read().splitlines()
    body = [strip_comment(l) for l in lines]
    print(f'==== {ch} ====')
    for name, p in pats.items():
        hits = [i+1 for i, l in enumerate(body) if re.search(p, l)]
        if hits:
            print(f'  {name}: {len(hits)}  行 {hits[:15]}')
    # 5けた以上で \num/\qty の外にある数（$…$ や地の文）
    five = []
    for i, l in enumerate(body):
        s = re.sub(r'\\(num|qty|qtyrange|SI)\{[^{}]*\}(\{[^{}]*\})?(\{[^{}]*\})?', '', l)
        s = re.sub(r'\\begin\{phcode\}.*', '', s)
        for m in re.finditer(r'(?<![\d.,e\-])(\d{5,})(?![\d.])', s):
            five.append((i+1, m.group(1)))
    # プログラムの中を除く
    inside = False; code_lines = set()
    for i, l in enumerate(lines):
        if re.search(r'\\begin\{(phcode|phcodeout)\}', l): inside = True
        if inside: code_lines.add(i+1)
        if re.search(r'\\end\{(phcode|phcodeout)\}', l): inside = False
    five = [f for f in five if f[0] not in code_lines and not re.search(r'coordinates|axis|domain|xtick|ytick', lines[f[0]-1])]
    print(f'  5けた以上で \\num の外: {len(five)}  {five[:20]}')
    # 文中（日本語と同じ行の $…$）の \dfrac・\displaystyle
    inl = 0; ex = []
    for i, l in enumerate(body):
        if re.search(r'[ぁ-んァ-ン一-龥]', l):
            for m in re.finditer(r'(?<!\\)\$(.+?)(?<!\\)\$', l):
                if re.search(r'\\dfrac|\\displaystyle', m.group(1)):
                    inl += 1; ex.append(i+1)
    print(f'  文中の \\dfrac・\\displaystyle（候補）: {inl}  例 {sorted(set(ex))[:12]}')
    # 記号と単位が（ ）で並ぶ候補：「$x$（m）」の形（表の見出し・軸の名前を除く）
    cand = []
    for i, l in enumerate(body):
        if re.search(r'xlabel|ylabel|&', l):
            continue
        for m in re.finditer(r'\$[^$]{1,25}\$（(m|s|kg|N|Pa|kPa|MPa|m/s|m\$\^?\{?[23]\}?\$|Hz|W|kW|L/s|J|rad/s|m\$\^3\$/s|kg/s|mm)）', l):
            cand.append(i+1)
    print(f'  記号（単位）の候補: {len(cand)}  行 {cand[:15]}')
    # 〔 の数
    print(f'  〔 の数: {sum(l.count("〔") for l in body)}')
    # 例題・入試の数
    print('  phreidai:', sum(1 for l in body if '\\begin{phreidai}' in l), ' reidai:', sum(1 for l in body if re.search(r'\\begin\{reidai\}', l)),
          ' jibun:', sum(1 for l in body if '\\begin{jibun}' in l), ' bkproblem:', sum(l.count('\\bkproblem ') for l in body),
          ' phnyushi 後の問題:', None)
    txt = '\n'.join(body)
    if '\\phnyushi' in txt:
        after = txt.split('\\phnyushi', 1)[1].split('\\begin{furikaeri}')[0]
        print('   入試にチャレンジの問題数:', after.count('\\bkproblem '))
    print('  図 bkfigure:', txt.count('\\begin{bkfigure}'), ' tikzpicture:', txt.count('\\begin{tikzpicture}'), ' axis:', txt.count('\\begin{axis}'),
          ' phflow:', txt.count('\\begin{phflow}'), ' phmada:', txt.count('\\begin{phmada}'), ' phsaki:', txt.count('\\begin{phsaki}'),
          ' phbaisuru:', txt.count('\\begin{phbaisuru}'), ' phyomi:', txt.count('\\begin{phyomi}'), ' phmijika:', txt.count('\\begin{phmijika}'))
