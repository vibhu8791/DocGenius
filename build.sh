#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Starting Build Process..."

# Move to Backend directory
cd Backend

# Build the project
mvn clean install -DskipTests

echo "Build Finished Successfully!"
