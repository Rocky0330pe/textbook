# ページの下の空き（本文の版面 天20mm・高さ215mm に対する割合）を、文字のいちばん下の位置から測る
import re, subprocess, sys
pdf, first, last = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
mm = 72 / 25.4
html = subprocess.run(['pdftotext', '-f', str(first), '-l', str(last), '-bbox', pdf, '-'], capture_output=True, text=True).stdout
for i, pg in enumerate(html.split('<page ')[1:]):
    ys = [float(m.group(1)) for m in re.finditer(r'yMax="([\d.]+)"', pg)]
    body = [y for y in ys if y < (20 + 215 + 1) * mm]
    words = re.findall(r'>([^<]*)</word>', pg)
    low = max(body) / mm if body else 20
    blank = (235 - low) / 215
    print('pdf p.%d  下の空き %.0f%%  %s' % (first + i, blank * 100, '★3分の1超' if blank > 1/3 else ''), (words[:3]))
