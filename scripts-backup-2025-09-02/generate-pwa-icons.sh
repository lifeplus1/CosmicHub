#!/bin/bash

# PWA Icon Generation Script for CosmicHub
# Creates optimized SVG icons with optional PNG fallbacks and WebP support
# Enhanced with minification and performance optimizations

echo "🎨 Generating optimized PWA icons for CosmicHub..."

# Check for ImageMagick and svgo for optimization (optional)
HAVE_CONVERT=$(command -v convert >/dev/null 2>&1 && echo "true" || echo "false")
HAVE_SVGO=$(command -v svgo >/dev/null 2>&1 && echo "true" || echo "false")

if [[ "$HAVE_CONVERT" == "true" ]]; then
    echo "✅ ImageMagick detected - will generate PNG and WebP formats"
else
    echo "⚠️  ImageMagick not found - SVG only mode (install with: brew install imagemagick)"
fi

if [[ "$HAVE_SVGO" == "true" ]]; then
    echo "✅ SVGO detected - will minify SVG files"
else
    echo "⚠️  SVGO not found - no SVG minification (install with: npm install -g svgo)"
fi

# Function to cleanup existing redundant icons
cleanup_redundant_icons() {
    local icon_dir="$1"
    echo "🧹 Cleaning up redundant icons in $icon_dir"
    
    # Remove old .png.svg files (keeping only .svg)
    find "$icon_dir" -name "*.png.svg" -type f -delete 2>/dev/null
    
    # Remove any temporary icon files
    find "$icon_dir" -name "icon-*.tmp" -type f -delete 2>/dev/null
    
    echo "  ✅ Cleanup complete"
}

# Function to create optimized SVG icon with optional formats
create_optimized_icon() {
    local size=$1
    local app=$2
    local output_dir=$3
    local color1=$4
    local color2=$5
    local emoji=$6
    
    local svg_file="${output_dir}/icon-${size}x${size}.svg"
    
    # Create optimized SVG
    cat > "$svg_file" << EOF
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${color2}" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="$(($size/8))" fill="url(#g${size})"/>
  <text x="50%" y="50%" font-family="system-ui,sans-serif" font-size="$(($size/3))" text-anchor="middle" dominant-baseline="central" fill="white">${emoji}</text>
</svg>
EOF

    # Minify SVG if svgo is available
    if [[ "$HAVE_SVGO" == "true" ]]; then
        svgo --multipass --quiet "$svg_file" -o "$svg_file" 2>/dev/null
    fi
    
    # Generate PNG and WebP if ImageMagick is available
    if [[ "$HAVE_CONVERT" == "true" ]]; then
        local png_file="${output_dir}/icon-${size}x${size}.png"
        local webp_file="${output_dir}/icon-${size}x${size}.webp"
        
        # Convert SVG to PNG with high quality
        convert "$svg_file" -background none -density 300 -quality 95 "$png_file" 2>/dev/null
        
        # Convert PNG to WebP for better compression
        convert "$png_file" -quality 85 "$webp_file" 2>/dev/null
        
        echo "  ✅ Created ${size}x${size} icon for ${app} (SVG, PNG, WebP)"
    else
        echo "  ✅ Created ${size}x${size} SVG icon for ${app}"
    fi
}

# CosmicHub Astro Icons
astro_dir="/Users/Chris/Projects/CosmicHub/apps/astro/public/icons"
echo "📍 Creating icons for CosmicHub Astro..."

# Clean up any redundant files first
cleanup_redundant_icons "$astro_dir"

create_optimized_icon 16 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"
create_optimized_icon 32 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"
create_optimized_icon 72 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"
create_optimized_icon 96 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"
create_optimized_icon 128 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"
create_optimized_icon 144 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"
create_optimized_icon 152 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"
create_optimized_icon 192 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"
create_optimized_icon 384 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"
create_optimized_icon 512 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"

# Special icons for Astro
apple_icon="${astro_dir}/apple-touch-icon.svg"
cat > "$apple_icon" << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <defs>
    <linearGradient id="gradApple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#553c9a" stop-opacity="1"/>
      <stop offset="100%" stop-color="#f6ad55" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <rect width="180" height="180" rx="40" fill="url(#gradApple)"/>
  <text x="50%" y="50%" font-family="system-ui,sans-serif" font-size="60" text-anchor="middle" dominant-baseline="central" fill="white">🌟</text>
</svg>
EOF

safari_icon="${astro_dir}/safari-pinned-tab.svg"
cat > "$safari_icon" << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <path fill="#553c9a" d="M8 1l2.5 5H16l-4 3.5 1.5 5L8 11.5 2.5 14.5 4 9l-4-3.5h5.5L8 1z"/>
</svg>
EOF

# Optimize special icons
if [[ "$HAVE_SVGO" == "true" ]]; then
    svgo --multipass --quiet "$apple_icon" -o "$apple_icon" 2>/dev/null
    svgo --multipass --quiet "$safari_icon" -o "$safari_icon" 2>/dev/null
fi

# Generate PNG versions if ImageMagick available
if [[ "$HAVE_CONVERT" == "true" ]]; then
    convert "$apple_icon" -background none -density 300 -quality 95 "${astro_dir}/apple-touch-icon.png" 2>/dev/null
    echo "  ✅ Created Apple touch icon (SVG, PNG)"
else
    echo "  ✅ Created Apple touch icon (SVG)"
fi

# HealWave Icons
healwave_dir="/Users/Chris/Projects/CosmicHub/apps/healwave/public/icons"
echo "🎧 Creating icons for HealWave..."

# Clean up any redundant files first
cleanup_redundant_icons "$healwave_dir"

create_optimized_icon 16 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"
create_optimized_icon 32 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"
create_optimized_icon 72 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"
create_optimized_icon 96 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"
create_optimized_icon 128 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"
create_optimized_icon 144 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"
create_optimized_icon 152 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"
create_optimized_icon 192 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"
create_optimized_icon 384 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"
create_optimized_icon 512 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"

# Special icons for HealWave
healwave_apple="${healwave_dir}/apple-touch-icon.svg"
cat > "$healwave_apple" << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <defs>
    <linearGradient id="gradHealWave" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed" stop-opacity="1"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <rect width="180" height="180" rx="40" fill="url(#gradHealWave)"/>
  <text x="50%" y="50%" font-family="system-ui,sans-serif" font-size="60" text-anchor="middle" dominant-baseline="central" fill="white">🎧</text>
</svg>
EOF

healwave_safari="${healwave_dir}/safari-pinned-tab.svg"
cat > "$healwave_safari" << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <path fill="#7c3aed" d="M3 6c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6zm2 0v4h6V6H5z"/>
  <circle cx="4" cy="8" r="2" fill="#06b6d4"/>
  <circle cx="12" cy="8" r="2" fill="#06b6d4"/>
</svg>
EOF

# Optimize HealWave special icons
if [[ "$HAVE_SVGO" == "true" ]]; then
    svgo --multipass --quiet "$healwave_apple" -o "$healwave_apple" 2>/dev/null
    svgo --multipass --quiet "$healwave_safari" -o "$healwave_safari" 2>/dev/null
fi

# Generate PNG versions if ImageMagick available
if [[ "$HAVE_CONVERT" == "true" ]]; then
    convert "$healwave_apple" -background none -density 300 -quality 95 "${healwave_dir}/apple-touch-icon.png" 2>/dev/null
    echo "  ✅ Created HealWave Apple touch icon (SVG, PNG)"
else
    echo "  ✅ Created HealWave Apple touch icon (SVG)"
fi

echo ""
echo "🎉 Optimized PWA icons generated successfully!"
echo ""

# Calculate savings if we have both formats
if [[ "$HAVE_CONVERT" == "true" ]]; then
    echo "� Bundle size optimization:"
    echo "   ✅ SVG: Vector graphics, smallest file sizes"
    echo "   ✅ WebP: 25-35% smaller than PNG for photos"
    echo "   ✅ PNG: Universal compatibility fallback"
fi

echo "📋 Next steps:"
echo "   1. Update manifest.json to reference the new icons"
echo "   2. Consider using WebP icons in modern browsers (check browser support)"
echo "   3. Test PWA installation on mobile devices"
echo "   4. Run Lighthouse audit to verify PWA score improvements"
echo "   5. Monitor bundle size impact with new icon formats"
echo ""

if [[ "$HAVE_CONVERT" == "false" || "$HAVE_SVGO" == "false" ]]; then
    echo "🔧 Optional optimizations:"
    if [[ "$HAVE_CONVERT" == "false" ]]; then
        echo "   📦 Install ImageMagick: brew install imagemagick"
    fi
    if [[ "$HAVE_SVGO" == "false" ]]; then
        echo "   🗜️  Install SVGO: npm install -g svgo"
    fi
    echo ""
fi

echo "💡 Performance tips:"
echo "   • Use SVG icons in modern browsers for best quality/size ratio"
echo "   • Implement lazy loading for large icon sets"
echo "   • Consider using icon sprites for frequently used icons"
echo "   • Monitor Core Web Vitals impact after icon updates"
