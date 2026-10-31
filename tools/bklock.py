# 第13回編集委員会（物理第1巻）：lualatex の席（/tmp/bk-lualatex-slot0.lock・slot1.lock）を、並んだ順にとる（チケット式）
# 使い方:  import bklock; fh = bklock.take('ジョブの名前') … 組む … fh.close()
# ・並ぶと /tmp/bk-lualatex-queue/ に「時刻-プロセス番号」の札を置く。札の古い順に、前から2人までが席をとりに行ける。
# ・終わった（または止まった）プロセスの札は、ほかの人が見つけしだい片づける。
# ・巻全体を組むとき（flock で2つの席を両方とる）は、この列に並ばずに席が空くのを待つ（今までと同じ）。
# ・ロックファイルは消さない。
import os, time, fcntl

QDIR = '/tmp/bk-lualatex-queue'
NSLOT = 2


def _alive(pid):
    try:
        os.kill(pid, 0)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
        return True


def _queue():
    out = []
    for name in os.listdir(QDIR):
        try:
            pid = int(name.split('-')[1])
        except (IndexError, ValueError):
            continue
        if _alive(pid):
            out.append(name)
        else:
            try:
                os.remove(os.path.join(QDIR, name))
            except OSError:
                pass
    return sorted(out)


def take(job='', verbose=True):
    os.makedirs(QDIR, exist_ok=True)
    try:
        os.chmod(QDIR, 0o777)
    except OSError:
        pass
    me = '%020d-%d' % (time.time_ns(), os.getpid())
    path = os.path.join(QDIR, me)
    with open(path, 'w') as f:
        f.write(job)
    told = False
    try:
        while True:
            q = _queue()
            pos = q.index(me) if me in q else 0
            if pos < NSLOT:
                for k in range(NSLOT):
                    fh = open('/tmp/bk-lualatex-slot%d.lock' % k, 'w')
                    try:
                        fcntl.flock(fh, fcntl.LOCK_EX | fcntl.LOCK_NB)
                        return fh
                    except OSError:
                        fh.close()
            elif verbose and not told:
                print('席を待っています（前に %d 人）' % pos, flush=True)
                told = True
            time.sleep(1)
    finally:
        try:
            os.remove(path)
        except OSError:
            pass
