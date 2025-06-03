#!/bin/bash

# This script starts the HTTPS proxy for the dev server

# Get the directory of this script
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
# The project root is the parent directory of the script's directory
PROJECT_ROOT=$( dirname -- "$SCRIPT_DIR" )

# ---

# 1. Define certificate paths in the project root
KEY_FILE="${PROJECT_ROOT}/localhost-key.pem"
CERT_FILE="${PROJECT_ROOT}/localhost.pem"

# 2. Check if certificate files exist
if [ ! -f "$KEY_FILE" ] || [ ! -f "$CERT_FILE" ]; then
    echo "Error: Certificate files not found in project root."
    echo "Please run 'scripts/setup-certs.sh' first to generate them."
    exit 1
fi

# 3. Start the proxy
echo "🔒 Starting HTTPS proxy..."
echo "   - Forwarding https://localhost:443 to http://localhost:3000"
local-ssl-proxy --key "$KEY_FILE" --cert "$CERT_FILE" --source 443 --target 3000