#!/usr/bin/env python3
"""組む対象（巻）を決める。GitHub Actions の plan ジョブが使う。

使い方:
  python3 scripts/changed-targets.py 比較元 比較先        main への push（2点の差分）
  python3 scripts/changed-targets.py --pr 比較元 比較先   プルリクエスト（分かれた所からの差分）
  python3 scripts/changed-targets.py --input "6 7 guide"  手動の実行（入力を確かめて並べる）
出力: GitHub Actions の matrix 用の JSON（例: ["6","7","guide"]）。組むものがなければ []。

決まり（docs/GitHub/GitHub運用_仕様書 5.2 と同じ）:
  tex/chN-*・tex/volN*・tex/wrapN.tex             → 第N巻
  tex/guide-*・tools/mkguidetables.py             → guide
  tools/mkmap9.py・tools/mkseriesidx.py           → 9
  tex/p1-*・tex/phN*・tex/phwrapN.tex             → pN（物理シリーズ）
  phys/*・tex/bk-phys*                            → p1（物理は第1巻だけ本文がある）
  pages_actual.json                               → 値が変わった巻だけ
  組み上がりに効く共通の部品（tex/bk-*・tex/series-data.tex・tex/fonts/・tex/img/・texmf/・
    series.py・gen.py・tools/syncpages.py・tools/check_pages.py・scripts/ci-build.sh）
                                                  → 全巻（1〜9）と guide
  ワークフローと、組み上がりに効かないスクリプト（build.yml・changed-targets.py・name-pdfs.py）
                                                  → guide（いちばん短い試し）
  docs/・checks/・README などの文書               → 組まない
比較元がない（リポジトリに初めて入れた push、000…）ときは組まない（初回は手動で組む）。
比較元が見つからない（force push など）ときは guide だけ組み、警告を出す。
"""
import json
import re
import subprocess
import sys

MATH = [str(i) for i in range(1, 10)] + ['guide']
ORDER = MATH + ['p1', 'p2', 'p3', 'p4', 'p5']
VALID = re.compile(r'^([1-9]|guide|p[1-5])$')


def git(*args):
    return subprocess.run(['git', *args], capture_output=True, text=True, check=True).stdout


def show_json(rev, path):
    try:
        return json.loads(git('show', f'{rev}:{path}'))
    except Exception:
        return {}


def out(targets):
    print(json.dumps([x for x in ORDER if x in set(targets)]))


def from_input(text):
    t = []
    for w in text.split():
        if w == 'all':
            t += MATH
        elif VALID.match(w):
            t.append(w)
        else:
            print(f'::warning::知らない対象を飛ばした: {w}（1〜9・guide・p1〜p5・all）', file=sys.stderr)
    out(t)


def classify(files, base, head):
    t = set()
    for f in files:
        if m := re.match(r'tex/(?:ch|vol|wrap)([1-9])[-.]', f):
            t.add(m.group(1)); continue
        if f.startswith('tex/guide-') or f == 'tools/mkguidetables.py':
            t.add('guide'); continue
        if f in ('tools/mkmap9.py', 'tools/mkseriesidx.py'):
            t.add('9'); continue
        if f.startswith(('phys/', 'tex/bk-phys')):
            t.add('p1'); continue
        if m := re.match(r'tex/(?:p|ph|phwrap)([1-5])[-.a-z]', f):
            t.add('p' + m.group(1)); continue
        if f == 'pages_actual.json':
            a, b = show_json(base, f), show_json(head, f)
            for k in set(a) | set(b):
                if a.get(k) != b.get(k):
                    t.add(str(k))
            continue
        if (f.startswith(('tex/bk-', 'tex/fonts/', 'tex/img/', 'texmf/'))
                or f in ('tex/series-data.tex', 'series.py', 'gen.py', 'tools/syncpages.py',
                         'tools/check_pages.py', 'scripts/ci-build.sh')):
            t.update(MATH); continue
        if f.startswith(('.github/workflows/', 'scripts/')):
            t.add('guide'); continue
    return t


def main():
    a = sys.argv[1:]
    if a and a[0] == '--input':
        from_input(a[1] if len(a) > 1 else '')
        return
    pr = bool(a) and a[0] == '--pr'
    if pr:
        a = a[1:]
    base, head = a[0], a[1]
    if not base or set(base) == {'0'}:
        print('::notice::リポジトリに初めて入れた push なので組まない（Actions →「組版」→「Run workflow」で手動で組む）', file=sys.stderr)
        out([])
        return
    try:
        if pr:
            base = git('merge-base', base, head).strip()
        files = [f for f in git('diff', '--name-only', base, head).splitlines() if f]
    except subprocess.CalledProcessError:
        print(f'::warning::比較元 {base} が見つからないので、試しに guide だけ組む', file=sys.stderr)
        out(['guide'])
        return
    out(classify(files, base, head))


if __name__ == '__main__':
    main()
