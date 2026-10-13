#!/bin/sh
# Container entrypoint: bring the database schema up to date, add any new catalog rows
# (the seed never overwrites admin settings), then start the web server.
set -e
pnpm db:migrate
pnpm db:seed
exec pnpm --filter @cp/web exec next start -H 0.0.0.0 -p "${PORT:-3000}"
