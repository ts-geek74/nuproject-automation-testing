#!/bin/bash
# Use Playwright Codegen to generate locators for your CRM app
# Replace YOUR_CRM_URL with your actual application URL

echo "Starting Playwright Codegen..."
echo "This will open your CRM app and record your interactions"
echo "Click on elements to generate locators automatically"
echo ""

npx playwright codegen YOUR_CRM_URL

# Example usage:
# npx playwright codegen https://app.omnigrowthos.io/login
