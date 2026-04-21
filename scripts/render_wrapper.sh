#!/usr/bin/env bash
# Wrapper executado pelo Render em cada cron job.
# Fluxo: pull estado mais recente → corre rotina → push memória atualizada.
set -e

ROUTINE=${1:?'ROUTINE não definida. Ex: bash scripts/render_wrapper.sh premarket'}
BRANCH="claude/autonomous-trading-agent-XbWUX"

echo "[render] rotina=$ROUTINE branch=$BRANCH"

# Configura git com o token de acesso injetado pelo Render
git config user.email "agent@chatcorelab.com"
git config user.name "Trading Agent"
git remote set-url origin "https://x-access-token:${GITHUB_TOKEN}@github.com/miguelangelocarreira/chatcorelab.git"

# Puxa o estado mais recente (memória do último ciclo)
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

# Instala dependências se necessário
npm install --silent

# Corre a rotina
ROUTINE="$ROUTINE" node agent/src/agent.js

# Persiste a memória de volta ao GitHub
git add memory/ AGENT_STATE.md agent/memory/
git commit -m "chore: persist [$ROUTINE] $(date -u +%Y-%m-%dT%H:%M:%SZ)" --allow-empty
git push origin "$BRANCH"

echo "[render] ciclo $ROUTINE concluído e persistido."
