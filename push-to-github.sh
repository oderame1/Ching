#!/bin/bash

# Script to push Escrow Payment Platform to GitHub

set -e

echo "🚀 Preparing to push to GitHub..."
echo ""

# Check if remote already exists
if git remote get-url origin &>/dev/null; then
    echo "✅ Remote 'origin' already configured:"
    git remote get-url origin
    echo ""
    read -p "Do you want to use this remote? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing existing remote..."
        git remote remove origin
    fi
fi

# Get repository details
if ! git remote get-url origin &>/dev/null; then
    echo "📝 Enter your GitHub repository details:"
    read -p "GitHub username: " GITHUB_USER
    read -p "Repository name (default: escrow-payment-platform): " REPO_NAME
    REPO_NAME=${REPO_NAME:-escrow-payment-platform}
    
    echo ""
    echo "Choose connection method:"
    echo "1) HTTPS (recommended for beginners)"
    echo "2) SSH (requires SSH key setup)"
    read -p "Enter choice (1 or 2): " CONNECTION_TYPE
    
    if [ "$CONNECTION_TYPE" = "2" ]; then
        REMOTE_URL="git@github.com:${GITHUB_USER}/${REPO_NAME}.git"
    else
        REMOTE_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
    fi
    
    echo ""
    echo "Adding remote: $REMOTE_URL"
    git remote add origin "$REMOTE_URL"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Renaming branch to 'main'..."
    git branch -M main
fi

# Show what will be pushed
echo ""
echo "📦 Files to be pushed:"
git ls-files | wc -l | xargs echo "  Total files:"
echo ""

# Confirm
read -p "Ready to push to GitHub? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Push
echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo ""
echo "🌐 Your repository:"
git remote get-url origin | sed 's/\.git$//' | sed 's/git@github.com:/https:\/\/github.com\//'
echo ""
echo "Next steps:"
echo "1. Visit your repository on GitHub"
echo "2. Add repository description and topics"
echo "3. Enable GitHub Actions (if using CI/CD)"
echo "4. Add collaborators (Settings > Collaborators)"
echo ""

