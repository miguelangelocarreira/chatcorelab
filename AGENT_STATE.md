# AGENT STATE — Ficheiro de Memória Viva

> O agente lê este ficheiro no INÍCIO de cada ciclo e atualiza-o no FIM.
> É aqui que se evita a "podridão do contexto" (context rot).
> Humanos podem ler mas não devem editar manualmente.

---

## Estado Atual

- **Fase**: `SETUP` (passo 1/10 — estrutura criada, módulos ainda não implementados)
- **Última atualização**: 2026-04-20
- **Ciclo #**: 0

## Capital & Risco

```json
{
  "capital_inicial": 10000,
  "capital_atual": 10000,
  "drawdown_pct": 0,
  "posicoes_abertas": 0,
  "max_posicoes": 3,
  "status": "IDLE"
}
```

## Posições Abertas

_Nenhuma._

## Último Sinal Avaliado

_Nenhum — agente ainda não operacional._

## Decisões Pendentes

- Instalar dependências de mercado (ccxt, ta-lib ou alternativa)
- Implementar Passo 2: módulo de memória

## Log de Contexto (últimas 5 sessões)

| Data       | Passo | Ação                              | Resultado |
|------------|-------|-----------------------------------|-----------|
| 2026-04-20 | 1     | Estrutura de pastas e ficheiros criada | OK     |

---

_Próximo passo: Passo 2 — `agent/src/memory.js`_
