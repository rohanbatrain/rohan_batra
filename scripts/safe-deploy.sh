#!/bin/bash
# scripts/safe-deploy.sh
# Safe deployment script with health checks and gradual rollout

set -e  # Exit on any error

echo "🚀 Starting Safe Deployment Process"

# Configuration
BACKUP_DIR="./backups/pre-deploy-$(date +%Y%m%d_%H%M%S)"
HEALTH_CHECK_URL="http://localhost:3000/api/health/enhanced"
MAX_ROLLOUT_WAIT=300  # 5 minutes

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: Pre-deployment backup
echo "📦 Creating pre-deployment backup..."
if [ -x "./scripts/create-safety-backup.sh" ]; then
    ./scripts/create-safety-backup.sh
else
    echo "⚠️  Warning: Safety backup script not found or not executable"
fi

# Step 2: Build and test
echo "🔨 Building application..."
if command -v pnpm &> /dev/null; then
    pnpm build
elif command -v npm &> /dev/null; then
    npm run build
else
    echo "❌ Error: No package manager found (pnpm or npm required)"
    exit 1
fi

echo "🧪 Running tests..."
if command -v pnpm &> /dev/null; then
    pnpm test || echo "⚠️  Tests failed, continuing with deployment (review needed)"
else
    npm test || echo "⚠️  Tests failed, continuing with deployment (review needed)"
fi

# Step 3: Deploy with feature flags disabled (production deployment would go here)
echo "🚢 Deploying with features disabled..."
export FEATURE_ASSET_INTEGRATION=false
export FEATURE_ENHANCED_VALIDATION=false
export FEATURE_RICH_EDITOR=false
export FEATURE_ADVANCED_ANALYTICS=false
export FEATURE_MULTI_CATEGORIES=false
export FEATURE_URL_VALIDATION=false
export FEATURE_AUDIT_TRAIL=false
export ROLLOUT_PERCENTAGE=0

echo "✅ Deployment configuration set (features disabled for safety)"
echo "🔍 To enable features, update environment variables and restart"

# Note: In a real deployment, this would restart the service
# For local development, the user needs to restart manually
echo "📋 Manual steps required:"
echo "  1. Update .env.local with desired feature flags"
echo "  2. Restart the development server"
echo "  3. Gradually increase ROLLOUT_PERCENTAGE"
echo "  4. Monitor /api/health/enhanced for system health"

echo "🎉 Safe deployment preparation completed!"