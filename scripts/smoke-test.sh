#!/usr/bin/env bash
set -e

# Smoke test script for Unido
# Tests the CLI and generated apps work correctly

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}🧪 Unido Smoke Test${NC}\n"

# Build everything
echo -e "${YELLOW}📦 Building all packages...${NC}"
cd "$REPO_ROOT"
pnpm run build
echo -e "${GREEN}✓ Build complete${NC}\n"

# Test basic template
echo -e "${YELLOW}📋 Testing basic template...${NC}"
TEST_BASIC="$REPO_ROOT/.test-smoke-basic"
rm -rf "$TEST_BASIC"
node "$REPO_ROOT/packages/cli/dist/index.js" .test-smoke-basic --template basic --skip-git --skip-install

cd "$TEST_BASIC"
pnpm install --ignore-workspace >/dev/null 2>&1
pnpm run type-check
echo -e "${GREEN}✓ Basic template OK${NC}\n"

# Test weather template
echo -e "${YELLOW}📋 Testing weather template...${NC}"
TEST_WEATHER="$REPO_ROOT/.test-smoke-weather"
rm -rf "$TEST_WEATHER"
cd "$REPO_ROOT"
node "$REPO_ROOT/packages/cli/dist/index.js" .test-smoke-weather --template weather --skip-git --skip-install

cd "$TEST_WEATHER"
pnpm install --ignore-workspace >/dev/null 2>&1
pnpm run type-check
echo -e "${GREEN}✓ Weather template OK${NC}\n"

# Test server starts
echo -e "${YELLOW}🚀 Testing server startup...${NC}"
cd "$TEST_BASIC"
timeout 10 pnpm run dev >/dev/null 2>&1 &
SERVER_PID=$!
sleep 3

# Check if server is responding
if curl -s http://localhost:3000/sse >/dev/null 2>&1; then
  echo -e "${GREEN}✓ Server started successfully${NC}\n"
else
  echo -e "${RED}✗ Server failed to start${NC}\n"
  kill $SERVER_PID 2>/dev/null || true
  exit 1
fi

kill $SERVER_PID 2>/dev/null || true

# Clean up
cd "$REPO_ROOT"
rm -rf "$TEST_BASIC" "$TEST_WEATHER"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All smoke tests passed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
