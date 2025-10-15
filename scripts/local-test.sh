#!/usr/bin/env bash
set -e

# Local testing helper script for Unido development
# Usage: ./scripts/local-test.sh [basic|weather|custom] [app-name]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLI_PATH="$REPO_ROOT/packages/cli/dist/index.js"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Unido Local Testing Helper${NC}\n"

# Build CLI first
echo -e "${YELLOW}📦 Building CLI...${NC}"
cd "$REPO_ROOT/packages/cli"
pnpm run build
echo -e "${GREEN}✓ CLI built${NC}\n"

# Determine template and app name
TEMPLATE="${1:-basic}"
APP_NAME="${2:-test-$TEMPLATE-app}"

# Validate template
if [[ ! "$TEMPLATE" =~ ^(basic|weather|custom)$ ]]; then
  echo -e "${RED}❌ Invalid template: $TEMPLATE${NC}"
  echo "Valid templates: basic, weather, custom"
  exit 1
fi

# Create test directory in repo root
cd "$REPO_ROOT"
TEST_DIR="$REPO_ROOT/$APP_NAME"

# Clean up if exists
if [ -d "$TEST_DIR" ]; then
  echo -e "${YELLOW}🗑️  Removing existing $APP_NAME${NC}"
  rm -rf "$TEST_DIR"
fi

# Scaffold project
echo -e "${CYAN}📋 Scaffolding project: $APP_NAME (template: $TEMPLATE)${NC}"
if [ "$TEMPLATE" = "custom" ]; then
  node "$CLI_PATH" "$APP_NAME" --skip-git
else
  node "$CLI_PATH" "$APP_NAME" --template "$TEMPLATE" --skip-git
fi

# Install dependencies with workspace links
cd "$TEST_DIR"
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
pnpm install --ignore-workspace

echo -e "\n${GREEN}✅ Test app created successfully!${NC}\n"

# Display instructions
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📁 Project location:${NC} $TEST_DIR"
echo -e "${CYAN}📋 Template:${NC} $TEMPLATE"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "  ${GREEN}cd $APP_NAME${NC}"
echo -e "  ${GREEN}pnpm run dev${NC}"
echo -e ""
echo -e "${YELLOW}Test with MCP Inspector:${NC}"
echo -e "  ${GREEN}pnpm add -D @modelcontextprotocol/inspector${NC}"
echo -e "  ${GREEN}node node_modules/@modelcontextprotocol/inspector/bin/cli.js http://localhost:3000/sse --transport sse --method tools/list${NC}"
echo -e ""
echo -e "${YELLOW}Clean up when done:${NC}"
echo -e "  ${GREEN}cd $REPO_ROOT && rm -rf $APP_NAME${NC}"
echo -e ""
