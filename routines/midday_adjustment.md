# Rotina: Midday Adjustment
**Gatilho cron**: 12:00 ET, Segunda a Sexta  
**Duração estimada**: 10 min  
**Modelo**: Claude Opus 4.7

---

## Prompt da Rotina

```
INÍCIO DE SESSÃO — MIDDAY ADJUSTMENT (12:00 ET)

Lê obrigatoriamente:
1. memory/agent_instructions.md
2. memory/trade_log.md (posições abertas hoje)
3. memory/research_log.md (contexto do dia)

## TAREFA 1 — Revisão de Posições
Via scripts/alpaca_api.js GET /v2/positions:
Para cada posição aberta:
- Calcular P&L atual (%)
- Verificar se stop-loss ainda está configurado corretamente
- Verificar se trailing stop deve ser ajustado

## TAREFA 2 — Corte Mandatório de Perdedores
GUARDRAIL INVIOLÁVEL: Se qualquer posição está a -7% ou mais desde a entrada:
- Fechar IMEDIATAMENTE com market order
- Não aguardar recuperação
- Documentar em trade_log.md com motivo: "Mandatory cut -7%"
- Enviar alerta via scripts/clickup_alerts.js

## TAREFA 3 — Proteção de Vencedores
Para posições com lucro > 8%:
- Verificar se trailing stop de 12% está ativo
- Se não, configurar agora
- Para posições com > 15% de lucro: considerar venda parcial de 50%

## TAREFA 4 — Verificação de Notícias Intraday
Via Perplexity, pesquisar news de last 4h para cada ticker em carteira.
Se houver news negativo material: avaliar saída antecipada.

## TAREFA 5 — Atualização de Memória (OBRIGATÓRIA)
Atualizar AGENT_STATE.md com estado atual do portfolio.
Se houver ordens executadas, atualizar trade_log.md.

## OUTPUT ESPERADO
"Midday concluído. Cortes: [N]. Ajustes stop: [N]. Portfolio: $[X] ([%] hoje). Próximo gatilho: 15:00 Market Close."
```

---

## Ferramentas Necessárias

- `scripts/alpaca_api.js` — positions, orders
- `scripts/perplexity_research.js` — news intraday
- `scripts/clickup_alerts.js` — alertas de cortes mandatórios
