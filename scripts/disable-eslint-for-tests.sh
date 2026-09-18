#!/bin/bash
exec "$(dirname "$0")/release/disable-eslint-for-tests.sh" "$@"
