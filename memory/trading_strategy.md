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
| —      | —             | —             | —      | —    |

_Atualizar na rotina de Pre-Market (06:00) e Weekly Review (sexta 16:00)_

---

## Setores em Foco (contexto macro 2026)

- **Tecnologia / AI Infrastructure**: Ciclo de capex em IA ainda em expansão
- **Healthcare / Biopharma**: Pipeline de GLP-1 e oncologia
- **Industriais / Defense**: Orçamentos de defesa em expansão na NATO
- **Energia / Transition**: Infraestrutura de rede elétrica e nuclear small-scale

## Setores a Evitar

- Retail discricionário (pressão do consumidor)
- Real Estate (sensível a taxas ainda elevadas)
- Utilities puras (crescimento limitado para o benchmark)
