#!/bin/bash

# This script sets up locally-trusted SSL certs for development

# Exit if any command fails
set -e

# Get the directory of this script
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
# The project root is the parent directory of the script's directory
PROJECT_ROOT=$( dirname -- "$SCRIPT_DIR" )

# ---

# 1. Check if mkcert is installed
if ! command -v mkcert &> /dev/null
then
    echo "Error: mkcert is not installed."
    echo "Please install it via Homebrew: brew install mkcert"
    exit 1
fi

# 2. Check if a local CA is installed, if not, install it
mkcert -install

# 3. Generate the certificate for localhost in the project root
echo "Generating certificate for localhost in '$PROJECT_ROOT'..."
mkcert -key-file "${PROJECT_ROOT}/localhost-key.pem" -cert-file "${PROJECT_ROOT}/localhost.pem" localhost

echo "✅ Certificates created successfully in project root."