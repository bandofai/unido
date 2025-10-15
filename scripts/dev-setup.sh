#!/usr/bin/env bash
set -e

# Development setup script
# Prepares the repo for local development and testing

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}🔧 Unido Development Setup${NC}\n"

cd "$REPO_ROOT"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}\n"

# Build all packages
echo -e "${YELLOW}🏗️  Building all packages...${NC}"
pnpm run build
echo -e "${GREEN}✓ All packages built${NC}\n"

# Link CLI globally (optional)
echo -e "${YELLOW}🔗 Linking create-unido globally...${NC}"
cd packages/cli
if pnpm link --global 2>/dev/null; then
  echo -e "${GREEN}✓ create-unido linked globally${NC}\n"
else
  echo -e "${YELLOW}⚠️  Could not link globally (run 'pnpm setup' first)${NC}"
  echo -e "${YELLOW}   You can still use: pnpm run cli:test${NC}\n"
fi

cd "$REPO_ROOT"

# Display instructions
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Development setup complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${CYAN}Available commands:${NC}\n"

echo -e "${YELLOW}Development:${NC}"
echo -e "  ${GREEN}pnpm run dev${NC}              # Watch all packages for changes"
echo -e "  ${GREEN}pnpm run build${NC}            # Build all packages"
echo -e "  ${GREEN}pnpm run type-check${NC}       # Type check all packages"
echo -e "  ${GREEN}pnpm run lint${NC}             # Lint all packages"
echo -e ""

echo -e "${YELLOW}CLI Testing:${NC}"
echo -e "  ${GREEN}create-unido my-app${NC}       # Use globally linked CLI"
echo -e "  ${GREEN}pnpm run cli:test${NC}         # Test CLI directly"
echo -e "  ${GREEN}./scripts/local-test.sh${NC}   # Quick test with helper script"
echo -e ""

echo -e "${YELLOW}Test Apps:${NC}"
echo -e "  ${GREEN}pnpm run test:basic${NC}       # Create test-basic-app"
echo -e "  ${GREEN}pnpm run test:weather${NC}     # Create test-weather-app"
echo -e "  ${GREEN}./scripts/local-test.sh basic my-test${NC}"
echo -e ""

echo -e "${YELLOW}Quality Checks:${NC}"
echo -e "  ${GREEN}./scripts/smoke-test.sh${NC}   # Run smoke tests"
echo -e "  ${GREEN}pnpm run test${NC}             # Run unit tests"
echo -e ""

echo -e "${YELLOW}Recommended 3-terminal setup:${NC}"
echo -e "  Terminal 1: ${GREEN}pnpm run dev${NC}                    # Watch builds"
echo -e "  Terminal 2: ${GREEN}cd test-basic-app && pnpm run dev${NC} # Test server"
echo -e "  Terminal 3: ${GREEN}# Commands/testing${NC}              # Free terminal"
echo -e ""

echo -e "${CYAN}📚 See DEVELOPMENT.md for detailed guide${NC}\n"
