# AGENT STATE — Ficheiro de Memória Viva

> O agente lê este ficheiro no INÍCIO de cada ciclo e atualiza-o no FIM.
> É aqui que se evita a "podridão do contexto" (context rot).
> Humanos podem ler mas não devem editar manualmente.

---

## Estado Atual

- **Fase**: `SETUP`
- **Última atualização**: 2026-04-22
- **Ciclo #**: 9
- **Status**: MARKET_OPEN_DONE
- **Próxima rotina**: Midday Adjustment (12:00 ET)

## Capital & Risco (PAPER)

```json
{
  "capital_atual": 99999.75,
  "capital_inicial": 10000,
  "moeda": "USD",
  "drawdown_pct": 0,
  "posicoes_abertas": 2,
  "max_posicoes": 6,
  "status": "MARKET_OPEN_DONE",
  "modo": "paper"
}
```

## Nota do Último Ciclo

Market open: 2 posições abertas.

---

_Próximo passo: Midday Adjustment (12:00 ET)_
