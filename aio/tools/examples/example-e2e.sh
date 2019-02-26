#!/usr/bin/env bash

set -eu -o pipefail

echo $(pwd)
(
  # yarn --cwd=aio/tools/examples/shared --frozen-lockfile
  cd aio/content/examples/toh-pt6
  # cp -R ../../../tools/examples/shared/node_modules .
  cp -L -R ../../../tools/examples/shared/boilerplate/cli/* .

  # Build and store the app
  yarn
  ng e2e --prod --no-webdriver-update
)