#!/bin/bash
# Forwarding bridge for seedContent.sh
exec bash "$(dirname "$0")/../../scripts/seed/seedContent.sh" "$@"
