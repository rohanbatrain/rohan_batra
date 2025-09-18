#!/bin/bash
# scripts/create-safety-backup.sh
# Creates comprehensive safety backup before deploying advanced features

set -e  # Exit on any error

echo "🛡️ Creating comprehensive safety backup..."

# Create timestamped backup directory
BACKUP_DIR="./backups/safety-$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

echo "📦 Creating backup directory: $BACKUP_DIR"

# Code state backup
echo "💾 Backing up current code state..."
git archive --format=tar.gz --output="$BACKUP_DIR/code-state.tar.gz" HEAD

# Environment backup (exclude secrets)
echo "⚙️ Backing up environment template..."
if [ -f ".env.local" ]; then
    # Create sanitized version without secrets
    grep -E '^(FEATURE_|ROLLOUT_|ENABLE_|NODE_ENV)' .env.local > "$BACKUP_DIR/env.template" || echo "# No feature flags found" > "$BACKUP_DIR/env.template"
fi

# Package state backup
echo "📋 Backing up package state..."
cp package.json "$BACKUP_DIR/package.json"
cp pnpm-lock.yaml "$BACKUP_DIR/pnpm-lock.yaml" 2>/dev/null || echo "No pnpm lockfile found"

# Create restore script
cat > "$BACKUP_DIR/restore.sh" << 'EOF'
#!/bin/bash
echo "🚨 RESTORING FROM SAFETY BACKUP"
echo "⚠️  This will restore code to backup state!"
read -p "Are you sure? (type 'YES' to confirm): " confirm

if [ "$confirm" = "YES" ]; then
    echo "📂 Extracting code backup..."
    tar -xzf code-state.tar.gz
    
    echo "📋 To restore environment:"
    echo "  cp env.template .env.local"
    echo "  # Then add your secrets back"
    
    echo "✅ Code backup restored. Please restore environment manually."
else
    echo "❌ Restore cancelled"
fi
EOF

chmod +x "$BACKUP_DIR/restore.sh"

echo "✅ Safety backup created: $BACKUP_DIR"
echo "📋 To restore: cd $BACKUP_DIR && ./restore.sh"
echo "⚠️  Note: Database backup requires manual mongodump with your MongoDB URI"