#!/bin/bash

# Test script for Directus data sync workflow
# This simulates what the GitHub Action does locally

set -e

echo "🧪 Testing Directus Data Sync Workflow Locally"
echo "=============================================="

# Store original branch
ORIGINAL_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $ORIGINAL_BRANCH"

# Configuration
BRANCH_NAME="cms/data-updates"
COMMIT_TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "🔧 Installing dependencies..."
cd packages/frontendmu-data
pnpm install --frozen-lockfile
cd ../..

echo "🏗️  Building data..."
pnpm run data build

echo "🔍 Checking for changes..."
if [ -n "$(git status --porcelain packages/frontendmu-data/data/)" ]; then
    echo "✅ Changes detected in data files"
    
    # Configure git (use your actual git config)
    git config --local user.email "$(git config user.email)"
    git config --local user.name "$(git config user.name)"
    
    # Check if branch already exists
    if git show-ref --verify --quiet refs/heads/"${BRANCH_NAME}"; then
        echo "📝 Branch ${BRANCH_NAME} exists locally, updating..."
        # Copy the new data files to a temp location
        cp -r packages/frontendmu-data/data /tmp/new-data
        # Reset any local changes to allow clean checkout
        git reset --hard HEAD
        # Switch to existing branch
        git checkout "${BRANCH_NAME}"
        # Replace data files with the new ones
        cp -r /tmp/new-data/* packages/frontendmu-data/data/
        # Clean up temp files
        rm -rf /tmp/new-data
    else
        echo "🆕 Creating new branch ${BRANCH_NAME}"
        # Create new branch from current branch
        git checkout -b "${BRANCH_NAME}"
    fi
    
    # Add all changes in the data directory
    git add packages/frontendmu-data/data/
    
    # Create commit with timestamp
    git commit -m "(cms): data updated ${COMMIT_TIMESTAMP}"
    
    echo "✅ Local test completed successfully!"
    echo "📋 Summary:"
    echo "   - Branch: ${BRANCH_NAME}"
    echo "   - Commit: $(git rev-parse --short HEAD)"
    echo "   - Message: (cms): data updated ${COMMIT_TIMESTAMP}"
    echo ""
    echo "🚀 To push to remote:"
    echo "   git push origin ${BRANCH_NAME}"
    echo ""
    echo "🔄 To return to original branch:"
    echo "   git checkout ${ORIGINAL_BRANCH}"
    
else
    echo "ℹ️  No changes detected in data files"
    echo "📋 Repository is up to date"
fi

echo ""
echo "✨ Test completed!"
