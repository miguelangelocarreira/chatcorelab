# Trading Agent — Strategy Document

> Fonte de verdade da estratégia. Só humanos o editam.
> O agente lê este ficheiro mas usa `memory/trading_strategy.md` como guia operacional detalhado.
> Para estado operacional, usa `AGENT_STATE.md`.

## 1. Identidade do Agente

- **Nome**: ChatCoreLab Autonomous Trading Agent v0.1
- **Motor de raciocínio**: Claude Opus 4.7 (Graduate-level reasoning)
- **Abordagem**: Análise Fundamentalista (NÃO técnica — sem MACD, candlesticks, RSI)
- **Benchmark**: S&P 500 (SPY)
- **Mercado**: Ações do S&P 500 via Alpaca
- **Modo atual**: Paper Trading (mínimo 30 dias obrigatório)

## 2. Por que Análise Fundamentalista?

O Opus 4.7 tem vantagem competitiva em:
- Digestão de relatórios financeiros (10-K, 10-Q, earnings calls)
- Julgamento sob ambiguidade (sinais macro contraditórios)
- Self-verifying outputs (loop interno de verificação)
- Teses de investimento coerentes baseadas em fundamentos

Não foi desenhado para day-trading técnico. A vantagem é na análise profunda, não na velocidade.

## 3. Filosofia de Risco

- Nunca arriscar mais de **5% do capital** por posição
- Stop-loss obrigatório a **-7%** em todas as posições
- Trailing stop de **12%** em posições vencedoras
- Daily loss cap: **-2%** — para tudo no dia
- Drawdown máximo: **-10%** — suspende agente, alerta humano
- Apenas ativos da **whitelist S&P 500** — sem opções, sem alavancagem

## 4. Os 10 Passos de Construção

- [x] Passo 1 — Estrutura base de pastas e ficheiros-âncora
- [x] Passo 2 — Arquitetura de memória (CLAUDE.md + /memory/)
- [x] Passo 3 — Tech stack: Alpaca + Perplexity + ClickUp (/scripts/)
- [x] Passo 4 — Scaffolding de ficheiros e schema (/memory/ + /routines/)
- [ ] Passo 5 — Migração de estratégia em Plan Mode (refinamento de prompts)
- [x] Passo 6 — Guardrails e limites de risco (CLAUDE.md)
- [x] Passo 7 — Rotinas e gatilhos cron (/routines/)
- [ ] Passo 8 — Persistência remota GitHub + push atómico
- [ ] Passo 9 — Variáveis de ambiente na cloud (Alpaca, Perplexity, ClickUp)
- [ ] Passo 10 — Validação, monitorização e iteração (paper trading 30 dias)

## 5. Ciclo de Operação (24/5)

```
06:00 ET  — Pre-Market Research (Perplexity: macro, watchlist)
08:30 ET  — Market Open Execution (Alpaca: ordens + trailing stops)
12:00 ET  — Midday Adjustment (cortes -7%, ajuste stops)
15:00 ET  — Market Close (fecho intraday + persistência atómica)
16:00 ET* — Weekly Review (*apenas sexta: performance vs SPY, ajuste estratégia)
```

## 6. Invariantes (nunca mudar sem revisão explícita)

- O agente lê SEMPRE `/memory/` antes de agir
- O agente persiste SEMPRE em `/memory/` antes de terminar
- Só humanos editam `strategy.md` e `CLAUDE.md`
- Credenciais apenas em variáveis de ambiente — nunca em código
- Paper trading 30 dias antes de qualquer capital real
