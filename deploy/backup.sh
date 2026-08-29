#!/usr/bin/env bash
#
# Nightly backup of the Sparkquill database.
#
# Runs as the sparkquill user from a systemd timer. Three things matter here
# and each one is a way backups usually fail:
#
#   1. The dump is verified, not just written. A pg_dump that produced a
#      truncated file exits 0 and leaves something that looks like a backup
#      until the day you need it. `pg_restore --list` reads the archive's own
#      table of contents, which is the cheapest real proof the file is intact.
#   2. Failure is loud. A silent backup failure is worse than no backup,
#      because it buys false confidence. This exits non-zero, which makes
#      systemd mark the unit failed, which the watchdog reports.
#   3. Old dumps are pruned, but only after a new one has been verified —
#      never before. Deleting first and failing second is how a retention
#      policy destroys the last good copy.
set -euo pipefail

DIR=/var/backups/sparkquill
KEEP_DAYS=30
STAMP=$(date +%Y%m%d-%H%M)
OUT="$DIR/sparkquill-$STAMP.dump"

set -a
. /etc/sparkquill/db.env 2>/dev/null || . /etc/sparkquill/app.env
set +a

mkdir -p "$DIR"

# Custom format: compressed, and restorable table by table rather than as one
# all-or-nothing SQL script.
pg_dump --format=custom --no-owner --no-privileges --file="$OUT" "$DATABASE_URL"

if ! pg_restore --list "$OUT" > /dev/null 2>&1; then
  echo "backup verification FAILED: $OUT is not a readable archive" >&2
  rm -f "$OUT"
  exit 1
fi

# A dump of an empty database is also a readable archive, so check it actually
# contains the tables. Restoring a valid, empty backup over a live database is
# a way to lose everything twice.
TABLES=$(pg_restore --list "$OUT" | grep -c "TABLE DATA" || true)
if [ "$TABLES" -lt 10 ]; then
  echo "backup verification FAILED: only $TABLES tables in $OUT" >&2
  rm -f "$OUT"
  exit 1
fi

SIZE=$(du -h "$OUT" | cut -f1)
echo "backed up $TABLES tables to $OUT ($SIZE)"

# Prune only now that a good dump exists.
find "$DIR" -name 'sparkquill-*.dump' -mtime +$KEEP_DAYS -delete
echo "kept $(find "$DIR" -name 'sparkquill-*.dump' | wc -l) dumps"
