# Trading Strategy — Tese de Investimento

> Lido no início de CADA sessão. Atualizado apenas em Weekly Review (sexta 16h).
> Define O QUE comprar, QUANDO e PORQUÊ.

---

## Tese Central

Superar o S&P 500 através de posições concentradas em empresas de alta qualidade (QARP: Quality At a Reasonable Price) com catalisadores de negócio identificáveis nos próximos 6-18 meses.

**Benchmark**: SPY (S&P 500 ETF)  
**Horizonte**: Swing trading (dias a semanas), não day trading  
**Modo atual**: Paper Trading (fase obrigatória de 30 dias)

---

## Critérios de Seleção (Screener Fundamentalista)

### Critérios de Inclusão (todos obrigatórios)
- Componente do S&P 500
- Market cap > $10B
- Free Cash Flow yield > 4%
- Revenue growth YoY > 8%
- Margem operacional > 15%
- Ratio Dívida/EBITDA < 3x
- Rating de analistas: ≥ 60% Buy/Strong Buy

### Critérios de Exclusão
- Upcoming earnings nos próximos 5 dias (evitar binary events não planeados)
- Investigação regulatória ou litígio material em curso
- Insider selling > 15% das ações nos últimos 90 dias
- Short interest > 20% do float

---

## Sinais de Entrada

Um ativo entra na watchlist quando apresenta **2 ou mais** destes catalisadores:

1. **Earnings Surprise**: Bateu estimativas de EPS em 2 trimestres consecutivos
2. **Analyst Upgrade**: Upgrade de rating nos últimos 30 dias com target revision +15%
3. **Product Catalyst**: Lançamento de produto, aprovação regulatória ou expansão geográfica iminente
4. **Macro Tailwind**: Setor beneficia de política monetária/fiscal atual
5. **Insider Buying**: C-suite ou diretores compraram ações no mercado aberto (últimos 60 dias)

---

## Gestão de Posição

```
Max por posição:    5% do capital total
Stop-loss:          -7% desde a entrada
Trailing stop:      12% em posições com lucro > 8%
Take-profit parcial: Vender 50% a +15%, deixar correr o restante
```

### Fórmula de Sizing
```
Shares = (Capital × 0.05) / Preço de entrada
```

---

## Watchlist Atual

| Ticker | Tese Resumida | Catalisadores | Status | Data |
|--------|---------------|---------------|--------|------|
| NVDA | AI infrastructure leader | Data center demand, +65% revenue YoY | EM CARTEIRA | 2026-04-22 |
| AMZN | AWS cloud + AI | AWS +24% Q1, earnings 29 abr | WATCH | 2026-04-22 |
| LMT | Defesa NATO | Earnings 23 abr, bateu 4x consecutivo | WATCH | 2026-04-22 |
| LLY | GLP-1 leader | Earnings 30 abr, guidance +25% YoY | WATCH | 2026-04-22 |
| CEG | Nuclear + AI power | Maior operador nuclear EUA, data centers | WATCH | 2026-04-22 |
| META | AI advertising | Advantage+ $60B run-rate, DAU +7% | WATCH | 2026-04-22 |

_Atualizar na rotina de Pre-Market (06:00) e Weekly Review (sexta 16:00)_

---

## Setores em Foco (contexto macro abril 2026)

- **Energia / Nuclear**: CEG, VST, NEE — proxy direto da procura AI data centers
- **Defesa / Industriais**: LMT, RTX — orçamentos NATO em expansão, conflito Irão
- **Healthcare / GLP-1**: LLY — guidance 2026 de $80-83B (+25% YoY)
- **AI Infrastructure**: NVDA, AMZN (AWS) — $650B+ capex big tech em 2026

## Setores a Evitar

- Retail discricionário (pressão no consumidor, inflação persistente)
- Real Estate (taxas em 3.5-3.75%, sem cortes esperados em 2026)
- Utilities puras sem exposição AI
- Tech sem catalisador claro (valuations elevadas, AI ROI questionado)

## Calendário de Earnings Próximos

| Ticker | Data | EPS Est | Notas |
|--------|------|---------|-------|
| LMT | 23 abr 2026 | $6.79 | Bateu 4x consecutivo — alta probabilidade |
| AMZN | 29 abr 2026 | — | AWS guidance é o número crítico |
| LLY | 30 abr 2026 | — | GLP-1 safety confirmada — momentum forte |
| CEG | 7 mai 2026 | $2.49 | Pós-aquisição Calpine — primeira vez |
| NVDA | 20 mai 2026 | ~$78B rev | Maior catalisador do mercado em maio |

**Regra**: Não abrir novas posições nos 5 dias antes do earnings de cada stock.
