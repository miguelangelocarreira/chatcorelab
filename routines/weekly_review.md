# Rotina: Weekly Review
**Gatilho cron**: 16:00 ET, apenas Sexta-feira  
**Duração estimada**: 30-45 min  
**Modelo**: Claude Opus 4.7 (Graduate-level reasoning obrigatório)

---

## Prompt da Rotina

```
INÍCIO DE SESSÃO — WEEKLY REVIEW (Sexta 16:00 ET)

Lê TODOS os ficheiros de memória:
1. memory/agent_instructions.md
2. memory/trading_strategy.md
3. memory/trade_log.md (COMPLETO)
4. memory/research_log.md (COMPLETO)

## TAREFA 1 — Análise de Performance Semanal
Calcular e comparar:
- P&L da semana em $ e %
- Performance do SPY na mesma semana (via Perplexity ou Alpaca)
- Win rate da semana: trades ganhos / total trades
- Average win vs average loss (expectancy)

Se underperforming vs SPY por > 3% na semana: trigger obrigatório de revisão da estratégia.

## TAREFA 2 — Reasoning Audit (Opus 4.7 — Self-Verification)
Para cada trade da semana:
1. A tese inicial confirmou-se ou foi refutada?
2. O agente seguiu todos os guardrails?
3. Houve algum caso de revenge trading ou stop ignorado?
4. A qualidade do research (Perplexity) foi suficiente?

Documenta os achados como lições em memory/research_log.md.

## TAREFA 3 — Atualização da Estratégia (se necessário)
Com base nos dados da semana e no contexto macro atual:
- A tese de algum setor deve ser ajustada?
- Algum ticker deve ser removido/adicionado à watchlist?
- Os guardrails precisam de ajuste?

ATENÇÃO: Só alterar memory/trading_strategy.md com base em evidências.
Não ajustar a estratégia por causa de 1-2 trades perdedores (noise vs signal).

## TAREFA 4 — Preparação para a Semana Seguinte
Via Perplexity, pesquisar:
- Earnings da próxima semana para tickers em watchlist/carteira
- Economic data releases da próxima semana (Fed, CPI, NFP, etc.)
- Eventos geopolíticos ou regulatórios relevantes

Atualizar memory/research_log.md com este briefing.

## TAREFA 5 — Persistência Atómica Final (OBRIGATÓRIA)
Atualizar TODOS os ficheiros de memória.
Fazer git commit + push com mensagem: "weekly-review YYYY-MM-DD"
Enviar relatório semanal via scripts/clickup_alerts.js

## OUTPUT ESPERADO
Produz um relatório semanal estruturado:

### Relatório Semanal — [DATA]
**Performance**: [%] vs SPY [%] → [Outperform/Underperform]
**Trades**: [N total] | [N wins] | [N losses] | Win rate: [%]
**Expectancy**: $[X] por trade
**Maior winner**: [TICKER] +[%]
**Maior loser**: [TICKER] -[%]
**Lições-chave**: [1-3 pontos]
**Ajustes à estratégia**: [sim/não + detalhe]
**Watchlist para próxima semana**: [tickers]
**Eventos críticos da semana que vem**: [lista]
```

---

## Ferramentas Necessárias

- `scripts/alpaca_api.js` — portfolio history semanal
- `scripts/perplexity_research.js` — macro research, earnings calendar
- `scripts/clickup_alerts.js` — relatório semanal
- Git (commit + push atómico)
