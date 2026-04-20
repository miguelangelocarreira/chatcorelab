# AGENT STATE — Ficheiro de Memória Viva

> O agente lê este ficheiro no INÍCIO de cada ciclo e atualiza-o no FIM.
> É aqui que se evita a "podridão do contexto" (context rot).
> Humanos podem ler mas não devem editar manualmente.

---

## Estado Atual

- **Fase**: `SETUP` (Passos 1-4 concluídos / Passos 5-10 pendentes)
- **Última atualização**: 2026-04-20
- **Ciclo #**: 0
- **Próxima rotina**: Pre-Market Research (06:00 ET) — após configurar Cloud Environment

## Capital & Risco (Paper)

```json
{
  "capital_inicial": 10000,
  "capital_atual": 10000,
  "moeda": "USD",
  "drawdown_pct": 0,
  "posicoes_abertas": 0,
  "max_posicoes": 6,
  "status": "IDLE",
  "modo": "paper"
}
```

## Checklist de Ativação

- [x] Passo 1 — Estrutura base criada
- [x] Passo 2 — Arquitetura de memória (CLAUDE.md + /memory/)
- [x] Passo 3 — Scripts Alpaca, Perplexity, ClickUp
- [x] Passo 4 — Scaffolding completo (/routines/, /memory/, CLAUDE.md)
- [ ] Passo 5 — Refinamento de prompts em Plan Mode
- [x] Passo 6 — Guardrails em CLAUDE.md e risk.js
- [x] Passo 7 — Rotinas cron definidas em /routines/
- [ ] Passo 8 — Push atómico GitHub configurado nas rotinas
- [ ] Passo 9 — Variáveis de ambiente na cloud (Alpaca, Perplexity, ClickUp)
- [ ] Passo 10 — Primeira execução paper trading + 30 dias de validação

## Posições Abertas

_Nenhuma._

## Último Sinal Avaliado

_Nenhum — agente ainda não operacional._

## Log de Contexto (sessões recentes)

| Data       | Passo | Ação                                              | Resultado |
|------------|-------|---------------------------------------------------|-----------|
| 2026-04-20 | 1     | Estrutura base criada (Binance + indicadores técnicos) | OK    |
| 2026-04-20 | 2-7   | Migração para Alpaca + análise fundamental + rotinas | OK      |

---

_Próximos passos: Passo 9 (configurar env vars na cloud) → Passo 10 (primeira execução)_
