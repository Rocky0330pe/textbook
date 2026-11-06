#!/usr/bin/env python3
"""部の表（mondai/vN/parts.js）を、組ごとのブランチから組み立てる（第30回：組は自分の部の項目だけを書く）。
使い方：python3 mondai/build/merge_parts.py 巻 部の番号=ブランチ …
  例：python3 mondai/build/merge_parts.py 2 1=worktree-agent-xxx 3=worktree-agent-yyy
  書いていない部は、いまの parts.js の項目のまま。"""
import re, subprocess, sys

vol = sys.argv[1]
path = f'mondai/v{vol}/parts.js'
owners = dict(a.split('=', 1) for a in sys.argv[2:])


def blocks(text):
    # 「    { no: k,」から、次の「{ no:」または「  ];」の前まで
    starts = [(int(m.group(1)), m.start()) for m in re.finditer(r'^[ \t]*\{\s*no: (\d+),', text, re.M)]
    end = re.search(r'^\s*\];', text, re.M).start()
    out = {}
    for i, (k, s) in enumerate(starts):
        e = starts[i + 1][1] if i + 1 < len(starts) else end
        out[k] = text[s:e]
    return out, (starts[0][1] if starts else end), end


cur = open(path, encoding='utf-8').read()
cb, head_end, tail_start = blocks(cur)
for k, br in owners.items():
    t = subprocess.run(['git', 'show', f'{br}:{path}'], capture_output=True, text=True, check=True).stdout
    b, _, _ = blocks(t)
    cb[int(k)] = b[int(k)]
new = cur[:head_end] + ''.join(cb[k] for k in sorted(cb)) + cur[tail_start:]
open(path, 'w', encoding='utf-8').write(new)
print(f'{path}：部 {", ".join(sorted(owners))} を取りこんだ')
