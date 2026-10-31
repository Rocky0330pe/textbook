# 力-8〜11 の紙面の決まり（C の項目）の候補を数える。原稿は読むだけ。
import re, sys
files = {"力-8":"tex/p1-08.tex","力-9":"tex/p1-09.tex","力-10":"tex/p1-10.tex","力-11":"tex/p1-11.tex"}
root = "/home/user/textbook/"
def strip(line):
    # コメントを除く（\% は残す）
    return re.sub(r'(?<!\\)%.*', '', line)
pats = {
 "katakana(ーなし)": r'(エレベータ|モータ|コンピュータ|ボイラ|コンプレッサ|シリンダ|ローラ|センサ|ドライバ|メーカ|ブレーキ)(?!ー)',
 "場所で指す図表": r'[右左上下]の(図|表|グラフ)',
 "boldsymbol": r'\\boldsymbol',
 "scriptsize/tiny": r'\\scriptsize|\\tiny',
 "fill=white": r'fill=white',
 "で学ぶ": r'で学ぶ',
 "quad小問": r'\\quad\s*（[0-9２-９]）',
 "記号（単位）": r'\$[^$]{1,12}\$（(?:mm|cm|m|N|kN|MPa|Pa|GPa|kg|s|K|rad|°|N·m|mm\^?2?)[^）]{0,6}）',
}
def inline_math(line):
    # 日本語と同じ行の $...$
    return re.findall(r'(?<!\$)\$([^$]+)\$(?!\$)', line)
for ch, f in files.items():
    lines = open(root+f, encoding='utf-8').read().split('\n')
    res = {k:[] for k in pats}
    dfr=[]; mat=[]; five=[]
    in_display=False
    for i,l in enumerate(lines,1):
        s = strip(l)
        for k,p in pats.items():
            for m in re.finditer(p, s):
                res[k].append(i)
        if re.search(r'[ぁ-んァ-ヶ一-龠]', s):
            for m in inline_math(s):
                if '\\dfrac' in m or '\\displaystyle' in m: dfr.append(i)
                if 'pmatrix' in m: mat.append(i)
        # 区切っていない5けた以上の数（\num{} \qty{} の外、ファイル名・座標を除く）
        t = re.sub(r'\\(num|qty|pxkq|pxlq|SI)\{[^}]*\}(\{[^}]*\})?', '', s)
        t = re.sub(r'\\begin\{tikzpicture\}.*', '', t)
        if 'axis cs' in t or 'domain' in t or '\\draw' in t or '\\fill' in t or '\\node' in t or 'addplot' in t: continue
        for m in re.finditer(r'(?<![\d.\w])(\d{5,})(?![\d])', t):
            five.append((i,m.group(1)))
    print("==", ch, f)
    for k,v in res.items():
        print(f"  {k}: {len(v)}  lines {sorted(set(v))[:25]}")
    print(f"  文中の dfrac/displaystyle（行数）: {len(set(dfr))}  例 {sorted(set(dfr))[:15]}")
    print(f"  文中の行列: {len(set(mat))}  lines {sorted(set(mat))}")
    print(f"  区切っていない5けた以上: {len(five)}  例 {five[:30]}")
