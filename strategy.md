# Trading Agent — Strategy Document

> Este ficheiro é a fonte de verdade da estratégia. Atualiza-o quando a estratégia mudar,
> não quando o mercado flutuar. Para estado operacional, usa `AGENT_STATE.md`.

## 1. Identidade do Agente

- **Nome**: ChatCoreLab Trading Agent v0.1
- **Estilo**: Trend-following + mean-reversion adaptativo
- **Mercados alvo**: Crypto (BTC/USDT, ETH/USDT) — expansível
- **Timeframe primário**: 1h | Timeframe de confirmação: 4h
- **Exchange**: Paper trading (simulado) → Binance spot

## 2. Filosofia de Risco

- Nunca arriscar mais de **2% do capital** por trade
- Stop-loss obrigatório em todos os trades abertos
- Máximo de **3 posições** simultâneas
- Drawdown máximo tolerado: **10%** — agente suspende operação automaticamente
- Sem alavancagem na fase inicial (paper trading)

## 3. Sinais de Entrada

### Long (compra)
- EMA 20 cruza acima de EMA 50 no timeframe 1h
- RSI(14) entre 40–65 (não sobrecomprado)
- Volume da vela de breakout > média 20 períodos

### Short / Saída de Long
- EMA 20 cruza abaixo de EMA 50
- RSI(14) > 70 (sobrecomprado) + divergência bearish
- Stop-loss atingido

## 4. Gestão de Posição

```
Tamanho = (Capital × RiskPct) / (EntryPrice - StopPrice)
```

- **Risk/Reward mínimo**: 1:2
- Take-profit parcial a 50% do target (fecha metade, move stop para break-even)

## 5. Ciclo de Operação do Agente

```
[Inicio do ciclo]
  1. Ler AGENT_STATE.md  ← anti-context-rot
  2. Buscar dados de mercado (API)
  3. Calcular indicadores
  4. Avaliar sinais
  5. Verificar risco/drawdown
  6. Executar ordens (paper ou live)
  7. Atualizar memory/state.json
  8. Escrever sumário em AGENT_STATE.md
[Fim do ciclo — aguarda próximo tick]
```

## 6. Os 10 Passos de Construção

- [x] Passo 1 — Estrutura de pastas e ficheiros-âncora (este ficheiro)
- [ ] Passo 2 — Módulo de memória (`agent/src/memory.js`)
- [ ] Passo 3 — Conector de dados de mercado (`agent/src/market.js`)
- [ ] Passo 4 — Motor de indicadores (`agent/src/indicators.js`)
- [ ] Passo 5 — Gerador de sinais (`agent/src/signals.js`)
- [ ] Passo 6 — Gestor de risco (`agent/src/risk.js`)
- [ ] Passo 7 — Motor de execução paper-trade (`agent/src/executor.js`)
- [ ] Passo 8 — Loop principal do agente (`agent/src/agent.js`)
- [ ] Passo 9 — Dashboard / logs legíveis por humanos
- [ ] Passo 10 — Migração para live trading com circuit-breakers

## 7. Invariantes (nunca mudar sem revisão explícita)

- O agente **nunca executa** sem ler `AGENT_STATE.md` primeiro
- O agente **nunca escreve** em `strategy.md` — só humanos o fazem
- Todos os trades ficam registados em `agent/memory/trades.json`
- Em caso de erro, o agente regista em `agent/logs/agent.log` e para
