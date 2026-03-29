#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  EcoTrade Rwanda — Full Test Suite Runner
#  Usage:  bash run_tests.sh [--backend-only | --frontend-only | --mobile-only | --help]
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# ── Colour helpers ────────────────────────────────────────────────────────────
BOLD='\033[1m'
RESET='\033[0m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
DIM='\033[2m'

hr()  { printf "${DIM}%s${RESET}\n" "$(printf '─%.0s' {1..72})"; }
hdr() { echo; hr; printf "${BOLD}${CYAN}  $1${RESET}\n"; hr; echo; }
ok()  { printf "  ${GREEN}✔${RESET}  $1\n"; }
fail(){ printf "  ${RED}✘${RESET}  $1\n"; }
info(){ printf "  ${YELLOW}▸${RESET}  $1\n"; }

# ── Argument parsing ──────────────────────────────────────────────────────────
RUN_BACKEND=true
RUN_FRONTEND=true

for arg in "$@"; do
  case $arg in
    --backend-only)  RUN_FRONTEND=false ;;
    --frontend-only) RUN_BACKEND=false  ;;
    --mobile-only)
      RUN_BACKEND=false
      RUN_FRONTEND=true
      ;;
    --help|-h)
      echo ""
      echo "  ${BOLD}EcoTrade Rwanda Test Runner${RESET}"
      echo ""
      echo "  Usage: bash run_tests.sh [options]"
      echo ""
      echo "  Options:"
      echo "    (none)           Run backend + frontend (includes mobile) tests"
      echo "    --backend-only   Run only backend (pytest) tests"
      echo "    --frontend-only  Run only frontend (vitest) tests"
      echo "    --mobile-only    Run only frontend/mobile utility tests (vitest)"
      echo "    --help           Show this help message"
      echo ""
      echo "  Backend test files  (pytest):"
      echo "    tests/test_auth.py          — Registration, login, JWT, password change"
      echo "    tests/test_users.py         — User profile, admin CRUD"
      echo "    tests/test_listings.py      — Waste listing lifecycle"
      echo "    tests/test_bids.py          — Bid placement, accept/reject/withdraw"
      echo "    tests/test_notifications.py — Notification delivery and read state"
      echo "    tests/test_blog.py          — Blog post CRUD, publish/unpublish"
      echo "    tests/test_stats.py         — Platform stats and admin audit logs"
      echo "    tests/test_support.py       — Support tickets and contact form"
      echo ""
      echo "  Frontend test files (vitest):"
      echo "    src/services/api.test.ts         — API client, URL building, auth headers"
      echo "    src/utils/imageUrl.test.ts        — Image URL resolution helpers"
      echo "    src/utils/userDisplayName.test.ts — Dashboard display name logic"
      echo ""
      echo "  Mobile / PWA test files (vitest):"
      echo "    src/utils/geo.test.ts            — Haversine distance, ETA, format helpers"
      echo "    src/utils/offlineQueue.test.ts   — Offline action queue, 24-hr TTL, replay"
      echo "    src/utils/markdown.test.ts       — Markdown-to-HTML renderer (blog)"
      echo "    src/utils/toast.test.ts          — Toast notification event dispatch"
      echo "    src/utils/dataStore.test.ts      — Local data store CRUD and CSV export"
      echo ""
      exit 0
      ;;
  esac
done

# ── Timing helper ─────────────────────────────────────────────────────────────
elapsed() { echo $(( $(date +%s) - $1 ))s; }

# ── Result accumulators ───────────────────────────────────────────────────────
BACKEND_STATUS="SKIPPED"
FRONTEND_STATUS="SKIPPED"
BACKEND_PASSED=0
BACKEND_FAILED=0
BACKEND_ERRORS=0
BACKEND_TIME=0
FRONTEND_PASSED=0
FRONTEND_FAILED=0
FRONTEND_TIME=0

# ─────────────────────────────────────────────────────────────────────────────
#  HEADER BANNER
# ─────────────────────────────────────────────────────────────────────────────
echo ""
printf "${BOLD}${WHITE}"
echo "  ╔══════════════════════════════════════════════════════════════════╗"
echo "  ║          EcoTrade Rwanda — Test Suite                           ║"
printf "  ║          %-55s║\n" "$(date '+%Y-%m-%d  %H:%M:%S')"
echo "  ╚══════════════════════════════════════════════════════════════════╝"
printf "${RESET}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
#  BACKEND TESTS  (pytest)
# ─────────────────────────────────────────────────────────────────────────────
if $RUN_BACKEND; then
  hdr "BACKEND TESTS  (pytest)"

  # Locate Python — prefer venv
  if [ -f "$BACKEND_DIR/venv/Scripts/python.exe" ]; then
    PYTHON="$BACKEND_DIR/venv/Scripts/python.exe"
    PYTEST="$BACKEND_DIR/venv/Scripts/pytest.exe"
    info "Using venv: $PYTHON"
  elif [ -f "$BACKEND_DIR/venv/bin/python" ]; then
    PYTHON="$BACKEND_DIR/venv/bin/python"
    PYTEST="$BACKEND_DIR/venv/bin/pytest"
    info "Using venv: $PYTHON"
  elif command -v python3 &>/dev/null; then
    PYTHON="python3"
    PYTEST="python3 -m pytest"
    info "Using system python3"
  elif command -v python &>/dev/null; then
    PYTHON="python"
    PYTEST="python -m pytest"
    info "Using system python"
  else
    fail "Python not found. Install Python 3.11+ or run: cd backend && python -m venv venv"
    BACKEND_STATUS="ERROR"
    BACKEND_ERRORS=1
  fi

  if [ "$BACKEND_STATUS" != "ERROR" ]; then
    # Check pytest is available
    if ! "$PYTHON" -c "import pytest" &>/dev/null; then
      info "pytest not found — installing dependencies..."
      "$PYTHON" -m pip install -q -r "$BACKEND_DIR/requirements.txt" pytest httpx
    fi

    echo ""
    info "Test files:"
    info "  tests/test_auth.py          — Registration, login, JWT, password change"
    info "  tests/test_users.py         — User profile, admin CRUD"
    info "  tests/test_listings.py      — Waste listing lifecycle"
    info "  tests/test_bids.py          — Bid placement, accept/reject/withdraw"
    info "  tests/test_notifications.py — Notification delivery and read state"
    info "  tests/test_blog.py          — Blog post CRUD, publish/unpublish"
    info "  tests/test_stats.py         — Platform stats and admin audit logs"
    info "  tests/test_support.py       — Support tickets and contact form"
    echo ""
    info "Running pytest from: $BACKEND_DIR"
    echo ""

    START=$(date +%s)
    set +e
    BACKEND_RAW=$(
      cd "$BACKEND_DIR"
      PYTHONPATH="$BACKEND_DIR" "$PYTHON" -m pytest tests/ \
        -v \
        --tb=short \
        --no-header \
        --color=yes \
        -p no:cacheprovider \
        2>&1
    )
    BACKEND_EXIT=$?
    set -e
    BACKEND_TIME=$(elapsed $START)

    echo "$BACKEND_RAW"

    # Parse summary line like "5 passed, 2 failed, 1 error in 3.14s"
    SUMMARY_LINE=$(echo "$BACKEND_RAW" | grep -E "^(FAILED|ERROR|[0-9]+ passed)" | tail -1 || true)
    if [ -z "$SUMMARY_LINE" ]; then
      SUMMARY_LINE=$(echo "$BACKEND_RAW" | grep -E "passed|failed|error" | tail -1 || true)
    fi

    BACKEND_PASSED=$(echo "$SUMMARY_LINE" | grep -oE '[0-9]+ passed'  | grep -oE '[0-9]+' || echo 0)
    BACKEND_FAILED=$(echo "$SUMMARY_LINE" | grep -oE '[0-9]+ failed'  | grep -oE '[0-9]+' || echo 0)
    BACKEND_ERRORS=$(echo "$SUMMARY_LINE" | grep -oE '[0-9]+ error'   | grep -oE '[0-9]+' || echo 0)

    if [ $BACKEND_EXIT -eq 0 ]; then
      BACKEND_STATUS="PASSED"
    else
      BACKEND_STATUS="FAILED"
    fi
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
#  FRONTEND + MOBILE TESTS  (vitest)
# ─────────────────────────────────────────────────────────────────────────────
if $RUN_FRONTEND; then
  hdr "FRONTEND + MOBILE TESTS  (vitest)"

  if ! command -v node &>/dev/null; then
    fail "Node.js not found. Install Node 18+."
    FRONTEND_STATUS="ERROR"
  else
    info "Node $(node --version)  |  npm $(npm --version)"

    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
      info "node_modules missing — running npm install..."
      cd "$FRONTEND_DIR" && npm install --silent
    fi

    echo ""
    info "Frontend test files:"
    info "  src/services/api.test.ts         — API client, URL building, auth headers"
    info "  src/utils/imageUrl.test.ts        — Image URL resolution helpers"
    info "  src/utils/userDisplayName.test.ts — Dashboard display name logic"
    echo ""
    info "Mobile / PWA test files:"
    info "  src/utils/geo.test.ts            — Haversine distance, ETA, format helpers"
    info "  src/utils/offlineQueue.test.ts   — Offline action queue, 24-hr TTL, replay"
    info "  src/utils/markdown.test.ts       — Markdown-to-HTML renderer (blog)"
    info "  src/utils/toast.test.ts          — Toast notification event dispatch"
    info "  src/utils/dataStore.test.ts      — Local data store CRUD and CSV export"
    echo ""
    info "Running vitest from: $FRONTEND_DIR"
    echo ""

    START=$(date +%s)
    set +e
    FRONTEND_RAW=$(
      cd "$FRONTEND_DIR"
      npx vitest run --reporter=verbose 2>&1
    )
    FRONTEND_EXIT=$?
    set -e
    FRONTEND_TIME=$(elapsed $START)

    echo "$FRONTEND_RAW"

    FRONTEND_PASSED=$(echo "$FRONTEND_RAW" | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' | tail -1 || echo 0)
    FRONTEND_FAILED=$(echo "$FRONTEND_RAW" | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+' | tail -1 || echo 0)

    if [ $FRONTEND_EXIT -eq 0 ]; then
      FRONTEND_STATUS="PASSED"
    else
      FRONTEND_STATUS="FAILED"
    fi
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
#  SUMMARY TABLE
# ─────────────────────────────────────────────────────────────────────────────
echo ""
hr
printf "${BOLD}${WHITE}  RESULTS SUMMARY${RESET}\n"
hr
echo ""

print_row() {
  local suite=$1 status=$2 passed=$3 failed=$4 time=$5
  local badge color
  case $status in
    PASSED)  color=$GREEN;  badge="✔ PASSED " ;;
    FAILED)  color=$RED;    badge="✘ FAILED " ;;
    ERROR)   color=$RED;    badge="✘ ERROR  " ;;
    SKIPPED) color=$YELLOW; badge="– SKIPPED" ;;
  esac

  printf "  %-24s ${color}${BOLD}%s${RESET}   passed: ${GREEN}%-4s${RESET}  failed: ${RED}%-4s${RESET}  time: %s\n" \
    "$suite" "$badge" "${passed:-0}" "${failed:-0}" "$time"
}

if $RUN_BACKEND;  then print_row "Backend (pytest)"           "$BACKEND_STATUS"  "$BACKEND_PASSED"  "$BACKEND_FAILED"  "$BACKEND_TIME";  fi
if $RUN_FRONTEND; then print_row "Frontend+Mobile (vitest)"  "$FRONTEND_STATUS" "$FRONTEND_PASSED" "$FRONTEND_FAILED" "$FRONTEND_TIME"; fi

echo ""
hr

# ── Breakdown by area ─────────────────────────────────────────────────────────
if $RUN_BACKEND && [ "$BACKEND_STATUS" = "PASSED" ]; then
  echo ""
  printf "${DIM}  Backend coverage:${RESET}\n"
  printf "${DIM}    Auth · Users · Listings · Bids · Notifications · Blog · Stats · Support${RESET}\n"
fi

if $RUN_FRONTEND && [ "$FRONTEND_STATUS" = "PASSED" ]; then
  echo ""
  printf "${DIM}  Frontend + Mobile coverage:${RESET}\n"
  printf "${DIM}    API client · Image URLs · Display names${RESET}\n"
  printf "${DIM}    Geo/navigation · Offline queue (PWA) · Markdown · Toast · Data store${RESET}\n"
fi

# ── Overall exit code ─────────────────────────────────────────────────────────
OVERALL=0
[[ "$BACKEND_STATUS"  == "FAILED" || "$BACKEND_STATUS"  == "ERROR" ]] && OVERALL=1
[[ "$FRONTEND_STATUS" == "FAILED" || "$FRONTEND_STATUS" == "ERROR" ]] && OVERALL=1

echo ""
if [ $OVERALL -eq 0 ]; then
  printf "  ${BOLD}${GREEN}All test suites passed.${RESET}\n\n"
else
  printf "  ${BOLD}${RED}One or more test suites failed — see output above.${RESET}\n\n"
fi

exit $OVERALL
