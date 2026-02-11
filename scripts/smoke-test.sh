#!/bin/bash
# Carmen Smoke Test Script
# Usage: bash scripts/smoke-test.sh [base_url]
# Default: http://localhost:5000 (backend) and http://localhost:3000 (frontend)

BACKEND_URL="${1:-http://localhost:5000}"
FRONTEND_URL="${2:-http://localhost:3000}"
FAILED=0

check() {
  local name="$1"
  local url="$2"
  local expected="${3:-200}"

  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
  if [ "$status" = "$expected" ]; then
    echo "[PASS] $name ($url) -> $status"
  else
    echo "[FAIL] $name ($url) -> $status (expected $expected)"
    FAILED=1
  fi
}

echo "=== Carmen Smoke Tests ==="
echo "Backend:  $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo ""

# Backend checks
echo "--- Backend ---"
check "Health"          "$BACKEND_URL/health"
check "Health Ready"    "$BACKEND_URL/health/ready"
check "Health Live"     "$BACKEND_URL/health/live"
check "API Root"        "$BACKEND_URL/"

# Frontend checks
echo ""
echo "--- Frontend ---"
check "Frontend Home"   "$FRONTEND_URL/"

echo ""
if [ "$FAILED" = "0" ]; then
  echo "All smoke tests passed."
  exit 0
else
  echo "Some smoke tests FAILED."
  exit 1
fi
