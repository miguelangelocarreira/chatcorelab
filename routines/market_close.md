# Rotina: Market Close
**Gatilho cron**: 15:00 ET, Segunda a Sexta  
**Duração estimada**: 10-15 min  
**Modelo**: Claude Opus 4.7

---

## Prompt da Rotina

```
INÍCIO DE SESSÃO — MARKET CLOSE (15:00 ET)

Lê obrigatoriamente:
1. memory/agent_instructions.md
2. memory/trade_log.md
3. memory/trading_strategy.md

## TAREFA 1 — Fecho de Operações Intraday
Verificar se há posições que devem ser fechadas antes do close:
- Posições abertas hoje com thesis já invalidada
- Posições com earnings amanhã (evitar binary event overnight)
- Cancelar ordens limit pendentes não executadas

## TAREFA 2 — Snapshot do Portfolio
Via scripts/alpaca_api.js:
- GET /v2/account: equity final do dia
- GET /v2/portfolio/history?period=1D: gráfico de performance do dia
- Calcular P&L do dia vs SPY performance (benchmark)

## TAREFA 3 — Verificação do Daily Loss Cap
Calcular P&L do dia total:
- Se P&L < -2%: registar que o daily cap foi atingido
- Garantir que não há mais ordens abertas para amanhã (cancelar tudo)
- Enviar alerta urgente via ClickUp se cap foi atingido

## TAREFA 4 — Atualização de Memória (OBRIGATÓRIA — GOLDEN RULE)
Escrever em memory/trade_log.md:
- Todas as operações do dia com P&L final
- Performance do dia vs SPY

Escrever em AGENT_STATE.md:
- Capital atual, drawdown acumulado, próxima sessão amanhã 06:00

Fazer git commit + push automático de todos os ficheiros de memória.
Esta é a persistência atómica. SEM ISTO, o estado é perdido.

## OUTPUT ESPERADO
"Market Close concluído. P&L hoje: $[X] ([%]). SPY hoje: [%]. Portfolio total: $[X]. Memória persistida: ✓. Próximo ciclo: amanhã 06:00."
```

---

## Ferramentas Necessárias

- `scripts/alpaca_api.js` — account, positions, portfolio history
- `scripts/clickup_alerts.js` — daily summary notification
- Git (commit + push atómico dos ficheiros de memória)
