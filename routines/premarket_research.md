# Rotina: Pre-Market Research
**Gatilho cron**: 06:00 ET, Segunda a Sexta  
**Duração estimada**: 15-20 min de processamento  
**Modelo**: Claude Opus 4.7

---

## Prompt da Rotina

```
INÍCIO DE SESSÃO — PRE-MARKET RESEARCH (06:00 ET)

Lê obrigatoriamente, nesta ordem:
1. memory/agent_instructions.md
2. memory/trading_strategy.md
3. memory/trade_log.md (últimas 5 entradas)
4. memory/research_log.md (últimas 10 entradas)

Após a leitura, executa as seguintes tarefas:

## TAREFA 1 — Briefing Macro (via Perplexity)
Usa a ferramenta de web search para pesquisar:
- "S&P 500 premarket [data de hoje] catalyst"
- "Fed speakers today economic data [data de hoje]"
- "Market moving news [data de hoje] earnings"

Sintetiza em 3-5 pontos de contexto macro para o dia.

## TAREFA 2 — Verificação da Watchlist
Para cada ticker em memory/trading_strategy.md#watchlist-atual:
- Verificar se há news ou catalisadores novos
- Verificar se os critérios de entrada ainda se mantêm
- Atualizar status (Manter / Entrar / Remover)

## TAREFA 3 — Novo Research (máx 2 tickers)
Com base no briefing macro, identifica 1-2 empresas do S&P 500 que:
- Têm catalisadores relevantes para hoje/semana
- Passam no screener de memory/trading_strategy.md
Documenta o research no formato de memory/research_log.md

## TAREFA 4 — Atualização de Memória (OBRIGATÓRIA)
Escreve em memory/research_log.md:
- Contexto macro do dia
- Atualizações da watchlist
- Novo research produzido

Escreve em AGENT_STATE.md:
- Ciclo +1, status do dia, próxima rotina às 08:30

## OUTPUT ESPERADO
Responde com: "Pre-Market concluído. Watchlist: [N tickers]. Research novo: [tickers]. Próximo gatilho: 08:30 Market Open."
```

---

## Ferramentas Necessárias

- `scripts/perplexity_research.js` — web search profundo
- `scripts/alpaca_api.js` — verificar posições abertas existentes
