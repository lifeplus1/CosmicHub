#!/bin/bash

# HealWave Enhanced Test Script
# This script runs HealWave tests with enhanced debugging and coverage

set -e

echo "🏥 HealWave Enhanced Test Suite"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Change to HealWave directory
cd "$(dirname "$0")/../apps/healwave"

echo -e "${BLUE}📍 Running tests in: $(pwd)${NC}"

# Ensure clean state
echo -e "${YELLOW}🧹 Cleaning up any hanging processes...${NC}"
pkill -f "vitest" 2>/dev/null || true
sleep 1

# Run tests with specific configuration
echo -e "${BLUE}🧪 Running HealWave tests...${NC}"

# Test with coverage and verbose output
npx vitest run \
  --reporter=verbose \
  --coverage \
  --coverage.reporter=text \
  --coverage.reporter=html \
  --coverage.reportsDirectory=coverage \
  --run \
  --no-watch \
  --passWithNoTests

TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ All HealWave tests passed!${NC}"
  
  # Show coverage summary
  if [ -f "coverage/index.html" ]; then
    echo -e "${BLUE}📊 Coverage report generated at: apps/healwave/coverage/index.html${NC}"
  fi
  
  # Show test file count
  TEST_COUNT=$(find src/__tests__ -name "*.test.*" | wc -l | tr -d ' ')
  echo -e "${BLUE}📈 Total test files: ${TEST_COUNT}${NC}"
  
else
  echo -e "${RED}❌ HealWave tests failed with exit code: $TEST_EXIT_CODE${NC}"
  exit $TEST_EXIT_CODE
fi

echo -e "${GREEN}🎉 HealWave test suite completed successfully!${NC}"
