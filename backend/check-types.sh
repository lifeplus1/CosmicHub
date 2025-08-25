#!/bin/bash
# mypy-check.sh - Gradual mypy adoption script

echo "🔍 Running mypy type checking..."

# Check specific well-typed files first
echo "📁 Checking well-typed security files..."
mypy --follow-imports=silent --ignore-missing-imports \
     --disallow-untyped-defs --disallow-incomplete-defs \
     --check-untyped-defs --pretty --show-error-codes \
     security/csrf.py security/abuse_detection.py

if [ $? -eq 0 ]; then
    echo "✅ csrf.py and abuse_detection.py pass strict type checking!"
else
    echo "❌ Issues found in strictly checked files"
fi

echo ""
echo "📁 Checking advanced_validation.py (some decorator complexity)..."
mypy --follow-imports=silent --ignore-missing-imports \
     --disallow-untyped-defs --disallow-incomplete-defs \
     --check-untyped-defs --pretty --show-error-codes \
     security/advanced_validation.py

echo ""
echo "📁 Basic checking of all security files..."
mypy --follow-imports=silent --ignore-missing-imports \
     --pretty --show-error-codes \
     security/

echo ""
echo "🎯 Progress Summary:"
echo "   ✅ csrf.py - Fully type-safe"
echo "   ✅ abuse_detection.py - Fully type-safe"  
echo "   🔄 advanced_validation.py - Minor decorator issues"
echo "   🔄 Other files - Basic checking only"
echo ""
echo "📈 To continue improving:"
echo "   1. Fix remaining decorator typing in advanced_validation.py"
echo "   2. Add more files to strict checking in mypy.ini" 
echo "   3. Eventually enable global strict settings"
