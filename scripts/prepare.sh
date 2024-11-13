#!/bin/bash

# Skip entire script in CI environment
if [ "$CI" = "true" ]; then
  echo "CI environment detected, skipping script execution."
  exit 0
fi

# Run Husky installation if not already installed
echo "Setting up Husky..."
if [ ! -d ".husky" ]; then
  husky
else
  echo "Husky is already set up."
fi

# Set up pre-commit hook if it doesn't exist
if [ ! -f ".husky/pre-commit" ]; then
  echo "Setting up pre-commit hook..."
  cat > .husky/pre-commit << EOL
#!/bin/sh
. "\$(dirname "\$0")/_/husky.sh"

npx --no-install lint-staged
EOL
  chmod +x .husky/pre-commit
else
  echo "pre-commit hook is already set up."
fi

# Set up commit-msg hook if it doesn't exist
if [ ! -f ".husky/commit-msg" ]; then
  echo "Setting up commit-msg hook..."
  cat > .husky/commit-msg << EOL
#!/bin/sh
. "\$(dirname "\$0")/_/husky.sh"

npx --no -- commitlint --edit "\$1"
EOL
  chmod +x .husky/commit-msg
else
  echo "commit-msg hook is already set up."
fi
