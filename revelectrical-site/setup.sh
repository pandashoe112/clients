#!/usr/bin/env bash
# One-shot setup. Run from the repo root:  bash setup.sh YOUR_PROJECT_ID
set -e

PROJECT_ID="$1"
DATASET="${2:-production}"

if [ -z "$PROJECT_ID" ]; then
  echo "Usage: bash setup.sh YOUR_PROJECT_ID [dataset]"
  echo "Find the ID with: npx sanity projects list"
  exit 1
fi

echo "==> Writing project ID into the studio config and .env"
sed -i.bak "s/YOUR_PROJECT_ID/$PROJECT_ID/" sanity/sanity.config.ts && rm -f sanity/sanity.config.ts.bak
printf "PUBLIC_SANITY_PROJECT_ID=%s\nPUBLIC_SANITY_DATASET=%s\n" "$PROJECT_ID" "$DATASET" > .env

echo "==> Installing the studio"
(cd sanity && npm install)

echo "==> Importing content and images"
(cd sanity && npx sanity dataset import ./import/content.ndjson "$DATASET" --replace --project "$PROJECT_ID")

echo "==> Installing the front end"
npm install

cat <<'DONE'

Done. Two things left, both in sanity.io/manage:

  1. API > CORS origins: add http://localhost:4321 and your Netlify URL
  2. API > Webhooks: add your Netlify build hook so publishing rebuilds the site

Then:
  npm run dev              # site on http://localhost:4321
  cd sanity && npm run dev # studio on http://localhost:3333
DONE
