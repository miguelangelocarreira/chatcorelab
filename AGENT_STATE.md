# AGENT STATE — Ficheiro de Memória Viva

> O agente lê este ficheiro no INÍCIO de cada ciclo e atualiza-o no FIM.
> É aqui que se evita a "podridão do contexto" (context rot).
> Humanos podem ler mas não devem editar manualmente.

---

## Estado Atual

- **Fase**: `SETUP`
- **Última atualização**: 2026-04-28
- **Ciclo #**: 37
- **Status**: MIDDAY_DONE
- **Próxima rotina**: Market Close (15:00 ET)

## Capital & Risco (PAPER)

```json
{
  "capital_atual": 100258.12,
  "capital_inicial": 100000,
  "moeda": "USD",
  "drawdown_pct": 0,
  "posicoes_abertas": 4,
  "max_posicoes": 6,
  "status": "MIDDAY_DONE",
  "modo": "paper"
}
```

## Nota do Último Ciclo

Midday: 0 corte(s), 0 take-profit(s) parcial(is). 4 posições mantidas.

---

_Próximo passo: Market Close (15:00 ET)_
