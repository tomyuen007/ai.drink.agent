#!/usr/bin/env bash
# Usage: ./download_sample.sh [dataset_id] [output_file] [limit] [base_url]
#   dataset_id   Socrata dataset ID  (default: m3tr-qhgy — Iowa Liquor Sales)
#   output_file  Destination path    (default: data/sample.csv)
#   limit        Row count           (default: 1000)
#   base_url     Socrata base URL    (default: https://data.iowa.gov/resource)
#
# ── Iowa Liquor Sales (data.iowa.gov) ────────────────────────────────────────
#   ~27M rows of real state liquor transactions; naturally messy vendor/store names
#
#   ./download_sample.sh m3tr-qhgy data/iowa_liquor_sample.csv 5000
#
# ── LCBO Product Catalogue (data.ontario.ca) ─────────────────────────────────
#   Ontario liquor board product list; messy sizing (750ML vs 750 mL vs .75L),
#   mixed alcohol % formats, discontinued SKUs
#
#   ./download_sample.sh w6m7-iahg data/lcbo_sample.csv 1000 https://data.ontario.ca/api/3/action
#
# ── Optional: set SOCRATA_APP_TOKEN to remove anonymous rate limit (1000 req/day)
#   Register free at https://dev.socrata.com/register
#   SOCRATA_APP_TOKEN=your_token ./download_sample.sh

set -euo pipefail

DATASET_ID="${1:-m3tr-qhgy}"
OUTPUT_FILE="${2:-samples/sample.csv}"
LIMIT="${3:-1000}"
BASE_URL="${4:-https://data.iowa.gov/resource}"

mkdir -p "$(dirname "$OUTPUT_FILE")"

URL="${BASE_URL}/${DATASET_ID}.csv?\$limit=${LIMIT}&\$order=:id"

echo "Dataset : $DATASET_ID"
echo "Rows    : $LIMIT"
echo "Output  : $OUTPUT_FILE"
echo "URL     : $URL"
echo ""

curl -fSL \
  ${SOCRATA_APP_TOKEN:+-H "X-App-Token: $SOCRATA_APP_TOKEN"} \
  "$URL" \
  -o "$OUTPUT_FILE"

echo ""
echo "Saved to $OUTPUT_FILE"
