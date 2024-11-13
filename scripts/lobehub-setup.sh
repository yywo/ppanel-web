#!/bin/bash

# Skip entire script in CI environment
if [ "$CI" = "true" ]; then
  echo "CI environment detected, skipping script execution."
  exit 0
fi

# Check and install @lobehub/i18n-cli if not installed
if ! npm list -g --depth=0 @lobehub/i18n-cli > /dev/null 2>&1; then
  echo "Installing @lobehub/i18n-cli globally..."
  npm install -g @lobehub/i18n-cli
else
  echo "@lobehub/i18n-cli is already installed."
fi

# Check and install @lobehub/commit-cli if not installed
if ! npm list -g --depth=0 @lobehub/commit-cli > /dev/null 2>&1; then
  echo "Installing @lobehub/commit-cli globally..."
  npm install -g @lobehub/commit-cli
else
  echo "@lobehub/commit-cli is already installed."
fi

# Run lobe-commit -i
echo "Running lobe-commit -i..."
lobe-commit -i
