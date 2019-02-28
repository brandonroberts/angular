#!/usr/bin/env bash

set -eu -o pipefail

echo $(pwd)
(
  cd aio
  yarn example-setup
  yarn example-e2e --filter router
)