#!/usr/bin/env bash
# Runs node with the given arguments, finding node even when this app started with a short PATH.
set -euo pipefail
export PATH="$PATH:/opt/homebrew/bin:/usr/local/bin:$HOME/.local/bin:$HOME/.volta/bin:$HOME/.fnm/aliases/default/bin"
if ! command -v node >/dev/null 2>&1 && [ -d "$HOME/.nvm/versions/node" ]; then
  latest="$(ls -1 "$HOME/.nvm/versions/node" | sort -V | tail -n1)"
  export PATH="$HOME/.nvm/versions/node/$latest/bin:$PATH"
fi
# A hook must never break a session: with no node, let the session go on.
command -v node >/dev/null 2>&1 || exit 0
exec node "$@"
