#!/bin/bash

# Skip script in CI environment
if [ "$CI" = "true" ]; then
  echo "CI environment detected, skipping script execution."
  exit 0
fi

# Exit if not a Git repository
if [ ! -d ".git" ]; then
  echo "Not a Git repository. Exiting."
  exit 1
fi

# Check if .husky folder exists and skip `npx husky install` if it does
if [ -d ".husky" ]; then
  echo ".husky folder already exists. Skipping npx husky install."
else
  echo "Setting up Husky..."
  if npx husky; then
    echo "Husky has been successfully set up."
  else
    echo "Failed to set up Husky. Skipping."
    exit 1
  fi
fi

# Function to set up a Husky hook
setup_husky_hook() {
  local hook_name=$1
  local hook_content=$2
  local hook_file=".husky/$hook_name"

  if [ -f "$hook_file" ]; then
    echo "$hook_name hook is already set up. Skipping."
    return
  fi

  echo "Setting up $hook_name hook..."
  echo "$hook_content" > "$hook_file" && chmod +x "$hook_file"
  if [ $? -eq 0 ]; then
    echo "$hook_name hook has been successfully set up."
  else
    echo "Failed to set up $hook_name hook. Skipping."
  fi
}

# Set up pre-commit hook
setup_husky_hook "pre-commit" "#!/bin/sh
. \"\$(dirname \"\$0\")/_/husky.sh\"

npx --no-install lint-staged"

# Set up commit-msg hook
setup_husky_hook "commit-msg" "#!/bin/sh
. \"\$(dirname \"\$0\")/_/husky.sh\"

npx --no-install commitlint --edit \"\$1\""

# Function to globally install an npm package if not installed
install_global_package() {
  local package_name=$1

  if npm list -g --depth=0 "$package_name" > /dev/null 2>&1; then
    echo "$package_name is already installed. Skipping installation."
    return
  fi

  echo "Installing $package_name globally..."
  if npm install -g "$package_name"; then
    echo "$package_name has been successfully installed."
  else
    echo "Failed to install $package_name globally. Skipping."
  fi
}

# Check and install required global npm packages
install_global_package "@lobehub/i18n-cli"
install_global_package "@lobehub/commit-cli"

# Check if .husky/_/prepare-commit-msg contains lobe-commit --hook
if grep -q "lobe-commit --hook" ".husky/_/prepare-commit-msg"; then
  echo "prepare-commit-msg hook already contains lobe-commit --hook. Skipping lobe-commit -i."
else
  # If the hook does not contain lobe-commit --hook, set it up and run lobe-commit -i
  echo "Setting up prepare-commit-msg hook..."
  if npx husky add .husky/prepare-commit-msg "exec < /dev/tty && npx lobe-commit -i"; then
    echo "prepare-commit-msg hook has been successfully set up."

    # Run lobe-commit interactively
    echo "Running lobe-commit -i..."
    if lobe-commit -i; then
      echo "lobe-commit executed successfully."
    else
      echo "lobe-commit failed. Skipping."
    fi
  else
    echo "Failed to set up prepare-commit-msg hook. Skipping lobe-commit."
    exit 1
  fi
fi
