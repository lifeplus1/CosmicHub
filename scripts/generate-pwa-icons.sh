#!/bin/bash

# PWA Icon Generation Script for CosmicHub
# Creates placeholder SVG icons that can be replaced with actual designs

echo "🎨 Generating PWA icons for CosmicHub..."

# Function to create SVG icon
create_svg_icon() {
    local size=$1
    local app=$2
    local output_dir=$3
    local color1=$4
    local color2=$5
    local emoji=$6
    
    cat > "${output_dir}/icon-${size}x${size}.png.svg" << EOF
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="$(($size/8))" fill="url(#grad1)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="$(($size/3))" text-anchor="middle" dominant-baseline="central" fill="white">${emoji}</text>
</svg>
EOF
    
    echo "  ✅ Created ${size}x${size} icon for ${app}"
}

# CosmicHub Astro Icons
astro_dir="/Users/Chris/Projects/CosmicHub/apps/astro/public/icons"
echo "📍 Creating icons for CosmicHub Astro..."

create_svg_icon 16 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"
create_svg_icon 32 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"
create_svg_icon 72 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"
create_svg_icon 96 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"
create_svg_icon 128 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"
create_svg_icon 144 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"
create_svg_icon 152 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"
create_svg_icon 192 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"
create_svg_icon 384 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"
create_svg_icon 512 "astro" "$astro_dir" "#553c9a" "#f6ad55" "🌟"

# Special icons for Astro
cat > "${astro_dir}/apple-touch-icon.png.svg" << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#553c9a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f6ad55;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="180" height="180" rx="40" fill="url(#grad1)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="60" text-anchor="middle" dominant-baseline="central" fill="white">🌟</text>
</svg>
EOF

cat > "${astro_dir}/safari-pinned-tab.svg" << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <path fill="#553c9a" d="M8 1l2.5 5H16l-4 3.5 1.5 5L8 11.5 2.5 14.5 4 9l-4-3.5h5.5L8 1z"/>
</svg>
EOF

# HealWave Icons
healwave_dir="/Users/Chris/Projects/CosmicHub/apps/healwave/public/icons"
echo "🎧 Creating icons for HealWave..."

create_svg_icon 16 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"
create_svg_icon 32 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"
create_svg_icon 72 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"
create_svg_icon 96 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"
create_svg_icon 128 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"
create_svg_icon 144 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"
create_svg_icon 152 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"
create_svg_icon 192 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"
create_svg_icon 384 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"
create_svg_icon 512 "healwave" "$healwave_dir" "#7c3aed" "#06b6d4" "🎧"

# Special icons for HealWave
cat > "${healwave_dir}/apple-touch-icon.png.svg" << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="180" height="180" rx="40" fill="url(#grad1)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="60" text-anchor="middle" dominant-baseline="central" fill="white">🎧</text>
</svg>
EOF

cat > "${healwave_dir}/safari-pinned-tab.svg" << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <path fill="#7c3aed" d="M3 6c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6zm2 0v4h6V6H5z"/>
  <circle cx="4" cy="8" r="2" fill="#06b6d4"/>
  <circle cx="12" cy="8" r="2" fill="#06b6d4"/>
</svg>
EOF

echo ""
echo "🎉 PWA icons generated successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Replace .svg files with actual .png images using your preferred design tool"
echo "   2. Ensure all icons follow your brand guidelines"
echo "   3. Test PWA installation on mobile devices"
echo "   4. Run Lighthouse audit to verify PWA score improvements"
echo ""
echo "💡 Pro tip: Use tools like Figma, Sketch, or online PWA icon generators"
echo "   to create professional icons from these SVG templates."
