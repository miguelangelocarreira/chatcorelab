# Rotina: Market Open Execution
**Gatilho cron**: 08:30 ET, Segunda a Sexta  
**Duração estimada**: 10-15 min  
**Modelo**: Claude Opus 4.7

---

## Prompt da Rotina

```
INÍCIO DE SESSÃO — MARKET OPEN EXECUTION (08:30 ET)

Lê obrigatoriamente, nesta ordem:
1. memory/agent_instructions.md
2. memory/trading_strategy.md
3. memory/trade_log.md
4. memory/research_log.md (contexto macro do dia, produzido às 06:00)

## TAREFA 1 — Estado do Portfolio
Via scripts/alpaca_api.js:
- GET /v2/account — capital disponível, equity, buying power
- GET /v2/positions — posições abertas, P&L atual
- Verificar se alguma posição ativou stop-loss overnight

## TAREFA 2 — Execução de Ordens Pendentes
Para cada ticker com status "Entrar" na watchlist:
1. Verificar que não há earnings nos próximos 5 dias (Alpaca news API)
2. Calcular position size: (Capital × 0.05) / Preço atual
3. Verificar guardrail: posição nova não excede 5% do portfolio
4. Verificar guardrail: total de posições abertas < 6
5. Submeter market order ou limit order (preço ask atual)
6. Configurar trailing stop de 12% imediatamente após confirmação

## TAREFA 3 — Self-Verification (OBRIGATÓRIA)
Antes de executar qualquer ordem, verificar:
- [ ] Daily loss cap não foi atingido hoje (-2%)?
- [ ] Posição respeita max size (5%)?
- [ ] Ativo está na whitelist S&P 500?
- [ ] Nenhum evento binário nos próximos 5 dias?
- [ ] A tese ainda é válida face ao contexto macro de hoje?

Se qualquer check falhar: NÃO executar e documentar em research_log.md.

## TAREFA 4 — Atualização de Memória (OBRIGATÓRIA)
Escreve em memory/trade_log.md cada ordem executada.
Escreve em AGENT_STATE.md o estado atual do portfolio.

## OUTPUT ESPERADO
"Market Open concluído. Ordens executadas: [N]. Portfolio: $[X] (+/-X% vs ontem). Posições abertas: [N]. Próximo gatilho: 12:00 Midday."
```

---

## Ferramentas Necessárias

- `scripts/alpaca_api.js` — account, positions, orders
- `scripts/clickup_alerts.js` — notificação de ordens executadas
