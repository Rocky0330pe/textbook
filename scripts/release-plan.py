#!/usr/bin/env python3
"""リリース（版を渡す）を決める。GitHub Actions の plan ジョブが使う（第18回編集委員会）。

各巻のいまの版は versions.json に書く（例 {"6": 2, "guide": 1}）。Ver3 などを作るときは、
プルリクエストの中でその巻の番号を上げる。main に取りこまれると、番号が上がった巻を組んで、
タグ（vol6-ver3 など）とリリースを Actions が作る。

使い方:
  python3 scripts/release-plan.py push 比較元 比較先        main への push：versions.json で番号が上がった巻
  python3 scripts/release-plan.py tags "vol7-ver2 guide-ver2" [--no-check]
                                                            タグの名前から（手動の実行・タグの push）
  python3 scripts/release-plan.py targets リリースのJSON      リリースから組む巻（matrix 用）
  python3 scripts/release-plan.py union 組む巻のJSON リリースのJSON
                                                            2つの組む巻の一覧を合わせる
出力: リリースは [{"target": "7", "tag": "vol7-ver2", "ver": "Ver2"}] の形の JSON。組む巻は ["6","7"] の形。
タグの形は volN-verM・guide-verM・pN-verM・all-YYYY-MM-DD（全巻、版の欄は日付）。
"""
import json
import re
import subprocess
import sys

MATH = [str(i) for i in range(1, 10)] + ['guide']
ORDER = MATH + ['p1', 'p2', 'p3', 'p4', 'p5']
VERSIONS = 'versions.json'


def git(*args):
    return subprocess.run(['git', *args], capture_output=True, text=True, check=True).stdout


def versions_at(rev):
    try:
        return json.loads(git('show', f'{rev}:{VERSIONS}'))
    except Exception:
        return None


def tag_exists(tag):
    return subprocess.run(['git', 'rev-parse', '-q', '--verify', f'refs/tags/{tag}'],
                          capture_output=True).returncode == 0


def tag_name(target, ver):
    if re.fullmatch(r'[1-9]', target):
        return f'vol{target}-ver{ver}'
    return f'{target}-ver{ver}'


def parse_tag(tag):
    """タグの名前から (組む巻, 版の欄)。決まりにない形なら None。"""
    if m := re.fullmatch(r'vol([1-9])-ver([0-9]+)', tag):
        return m.group(1), f'Ver{m.group(2)}'
    if m := re.fullmatch(r'(guide|p[1-5])-ver([0-9]+)', tag):
        return m.group(1), f'Ver{m.group(2)}'
    if m := re.fullmatch(r'all-([0-9]{4}-[0-9]{2}-[0-9]{2})', tag):
        return 'all', m.group(1)
    return None


def order(targets):
    s = set(targets)
    return [x for x in ORDER if x in s]


def cmd_push(base, head):
    if not base or set(base) == {'0'}:
        return []
    old, new = versions_at(base), versions_at(head)
    if old is None or new is None:
        # versions.json を初めて入れた push などでは、リリースを作らない
        return []
    out = []
    for k in order(new):
        if k in old and isinstance(new[k], int) and new[k] > old[k]:
            tag = tag_name(k, new[k])
            if tag_exists(tag):
                print(f'::notice::タグ {tag} はもうあるので、リリースを作らない', file=sys.stderr)
                continue
            out.append({'target': k, 'tag': tag, 'ver': f'Ver{new[k]}'})
    return out


def cmd_tags(text, check):
    now = versions_at('HEAD') or {}
    out, bad = [], False
    for tag in text.split():
        p = parse_tag(tag)
        if p is None:
            print(f'::error::このタグの形は決まりにない: {tag}（volN-verM・guide-verM・pN-verM・all-YYYY-MM-DD）', file=sys.stderr)
            bad = True
            continue
        target, ver = p
        if check and target != 'all':
            want = now.get(target)
            if want is None or f'Ver{want}' != ver:
                print(f'::error::{tag} の版が versions.json（{target}: {want}）と合わない。先に versions.json を直す', file=sys.stderr)
                bad = True
                continue
        out.append({'target': target, 'tag': tag, 'ver': ver})
    if bad:
        sys.exit(1)
    return out


def cmd_targets(releases):
    t = []
    for r in releases:
        t += MATH if r['target'] == 'all' else [r['target']]
    return order(t)


def main():
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    if a[0] == 'push':
        print(json.dumps(cmd_push(a[1], a[2]), ensure_ascii=False))
    elif a[0] == 'tags':
        print(json.dumps(cmd_tags(a[1], '--no-check' not in a), ensure_ascii=False))
    elif a[0] == 'targets':
        print(json.dumps(cmd_targets(json.loads(a[1]))))
    elif a[0] == 'union':
        print(json.dumps(order(json.loads(a[1]) + cmd_targets(json.loads(a[2])))))
    else:
        sys.exit(__doc__)


if __name__ == '__main__':
    main()
