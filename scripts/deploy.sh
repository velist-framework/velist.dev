#!/bin/bash
# Deploy script untuk velist documentation
# Usage: ./scripts/deploy.sh

set -e

echo "🚀 Deploying Velist Documentation..."
echo "Project: velist"
echo ""

# Build
echo "📦 Building..."
bun run build

# Deploy dengan project name hardcoded
echo "☁️  Deploying to Cloudflare Pages..."
bunx wrangler pages deploy docs/.vitepress/dist \
  --project-name velist \
  --branch main \
  --commit-dirty=true

echo ""
echo "✅ Deploy complete!"
echo "🌐 URL: https://velist.pages.dev"
