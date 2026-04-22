# AGENT STATE — Ficheiro de Memória Viva

> O agente lê este ficheiro no INÍCIO de cada ciclo e atualiza-o no FIM.
> É aqui que se evita a "podridão do contexto" (context rot).
> Humanos podem ler mas não devem editar manualmente.

---

## Estado Atual

- **Fase**: `SETUP`
- **Última atualização**: 2026-04-22
- **Ciclo #**: 7
- **Status**: IDLE
- **Próxima rotina**: Pre-Market Research (amanhã 06:00 ET)

## Capital & Risco (PAPER)

```json
{
  "capital_atual": 100000,
  "capital_inicial": 10000,
  "moeda": "USD",
  "drawdown_pct": -900,
  "posicoes_abertas": 0,
  "max_posicoes": 6,
  "status": "IDLE",
  "modo": "paper"
}
```

## Nota do Último Ciclo

Fecho: P&L 0.00% | Capital $100000.00

---

_Próximo passo: Pre-Market Research (amanhã 06:00 ET)_
