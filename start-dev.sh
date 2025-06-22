#!/bin/bash

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "Starting Disney Trip Planner development servers..."
echo "Environment variables loaded:"
echo "- BLOB_READ_WRITE_TOKEN: ${BLOB_READ_WRITE_TOKEN:0:20}..."
echo "- OPENAI_API_KEY: ${OPENAI_API_KEY:0:20}..."

# Start both servers using concurrently
npm run dev 