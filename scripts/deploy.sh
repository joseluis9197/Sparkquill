#!/usr/bin/env bash
#
# Deploys the current main branch to the Oracle server.
#
# Run from a workstation:  ./scripts/deploy.sh
#
# The server hosts other production projects (ProsperTruck, TraderPro, a Nivora
# node), so every step here is scoped to Sparkquill's own user, port, database
# and nginx vhost. Nothing in this script touches shared configuration.
set -euo pipefail

HOST="${SPARKQUILL_HOST:-ubuntu@138.2.217.209}"
APP_DIR="/var/www/sparkquill/current"
SERVICE="sparkquill.service"
PORT=3100

echo "==> Deploying to ${HOST}"

ssh -o BatchMode=yes "$HOST" 'bash -euo pipefail -s' <<REMOTE
APP_DIR="${APP_DIR}"
SERVICE="${SERVICE}"
PORT="${PORT}"

run_as_app() { sudo -n -u sparkquill "\$@"; }
app_env() { sudo -n cat /etc/sparkquill/app.env | xargs; }

cd "\$APP_DIR"

echo "--> Fetching main"
BEFORE=\$(run_as_app git rev-parse --short HEAD)
run_as_app git fetch --quiet origin main
run_as_app git reset --quiet --hard origin/main
AFTER=\$(run_as_app git rev-parse --short HEAD)
echo "    \$BEFORE -> \$AFTER"

if [ "\$BEFORE" = "\$AFTER" ]; then
  echo "    already up to date; continuing anyway to pick up any config change"
fi

echo "--> Installing dependencies"
run_as_app npm ci --no-audit --no-fund --silent

echo "--> Applying migrations"
run_as_app env \$(app_env) npx drizzle-kit migrate 2>&1 | tail -3

# Skills are derived from the generator registry, so a deploy that adds a
# generator has to refresh them or the new questions have nowhere to record
# attempts against.
echo "--> Seeding curriculum and skills"
run_as_app env \$(app_env) npx tsx scripts/seed-curriculum.ts 2>&1 | tail -2
run_as_app env \$(app_env) npx tsx scripts/seed-skills.ts 2>&1 | tail -2

echo "--> Building"
run_as_app env \$(app_env) npm run build 2>&1 | tail -3

echo "--> Restarting \$SERVICE"
sudo -n systemctl restart "\$SERVICE"

# Wait for the app to answer rather than assuming a fixed sleep is enough.
echo -n "--> Waiting for health"
for i in \$(seq 1 30); do
  CODE=\$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:\${PORT}/" || true)
  if [ "\$CODE" = "200" ]; then echo " ok (\${i}s)"; break; fi
  if [ "\$i" = "30" ]; then
    echo " FAILED (last status \$CODE)"
    sudo -n journalctl -u "\$SERVICE" -n 30 --no-pager
    exit 1
  fi
  echo -n "."
  sleep 1
done

echo "--> Confirming the other projects are untouched"
for svc in prospertruck.service traderpro.service nivora.service nginx.service postgresql@16-main.service; do
  printf '    %-32s %s\n' "\$svc" "\$(systemctl is-active \$svc)"
done
REMOTE

echo "==> Done"
