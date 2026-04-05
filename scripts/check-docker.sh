#!/usr/bin/env bash
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker Desktop." >&2
  exit 1
fi
