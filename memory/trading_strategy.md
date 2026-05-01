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
Max por posição:        5% do capital total
Max por setor:          40% do capital exposto (NOVO)
Stop-loss:              -7% desde a entrada
Trailing stop:          12% em posições com lucro > 8%
Take-profit parcial:    Vender 50% a +15%, deixar correr o restante
Reduce-on-weakness:     Posições com perda >3% sem catalisador futuro identificável → reduzir 50% (NOVO)
```

### Fórmula de Sizing
```
Shares = (Capital × 0.05) / Preço de entrada
```

### Limite de Concentração Setorial (NOVO)
Nenhum setor pode ultrapassar 40% do capital total exposto. Setores definidos: Tech/AI, Defesa, Healthcare/Pharma, Energia/Nuclear, Financeiras, Consumer. Se uma nova entrada empurrar um setor acima de 40%, a entrada é recusada ou compensada com redução de outra posição no mesmo setor.

---

## Regras de Gestão Ativa (NOVO — derivadas de erros repetidos)

### Post-Earnings Review (OBRIGATÓRIO)
Dentro de 48h após o earnings de qualquer posição em carteira, executar revisão de tese:
1. O catalisador esperado materializou-se? (beat/miss, guidance, narrativa)
2. A reação do mercado validou ou invalidou a tese?
3. Se a posição está em perda >2% pós-earnings → decidir entre HOLD com nova tese explícita, REDUCE 50%, ou EXIT total
4. Documentar conclusão em research_log.md — não basta "esperar pelo stop"

### NO_ACTION ≠ Passividade
Se >50% das posições em carteira estão em perda, a sessão DEVE começar pela revisão de saídas antes de avaliar entradas novas. NO_ACTION sobre o portfólio existente quando a maioria sangra é negligência, não disciplina.

### Coerência Convicção/Exposição
Se a convicção macro do dia é <50%, considerar reduzir exposição (não apenas evitar adicionar). Manter 4 posições abertas com convicção de 40% é incoerente.

---

## Watchlist Atual

| Ticker | Tese Resumida | Catalisadores | Status | Data |
|--------|---------------|---------------|--------|------|
| NVDA | AI infrastructure leader | Data center demand, +65% revenue YoY, earnings 20 mai | EM CARTEIRA | 2026-05-01 |
| AMZN | AWS cloud + AI | AWS +24%, earnings beat 29 abr (+6% reaction) | EM CARTEIRA | 2026-05-01 |
| MSFT | Azure + Copilot | Em revisão pós-earnings | EM CARTEIRA — REVIEW | 2026-05-01 |
| LMT | Defesa NATO | Earnings 23 abr — TESE QUEBRADA pós-evento | EM CARTEIRA — REDUCE | 2026-05-01 |
| LLY | GLP-1 leader | Earnings 30 abr — avaliar reação | WATCH | 2026-05-01 |
| CEG | Nuclear + AI power | Earnings 7 mai | WATCH | 2026-05-01 |
| META | AI advertising | Advantage+ momentum | WATCH | 2026-05-01 |

_Atualizar na rotina de Pre-Market (06:00) e Weekly Review (sexta 16:00)_

---

## Setores em Foco (contexto macro maio 2026)

- **Energia / Nuclear**: CEG, VST, NEE — proxy direto da procura AI data centers
- **Healthcare / GLP-1**: LLY — guidance 2026 de $80-83B (+25% YoY)
- **AI Infrastructure**: NVDA, AMZN (AWS), MSFT (Azure) — $650B+ capex big tech em 2026 (LIMITADO A 40% DO CAPITAL)

## Setores a Evitar

- Retail discricionário (pressão no consumidor, inflação persistente)
- Real Estate (taxas em 3.5-3.75%, sem cortes esperados em 2026)
- Utilities puras sem exposição AI
- Tech sem catalisador claro (valuations elevadas, AI ROI questionado)
- **Defesa pura sem exposição AI** (NOVO — lição LMT: earnings beat não traduziu em performance, sell-the-news pattern)

## Calendário de Earnings Próximos

| Ticker | Data | EPS Est | Notas |
|--------|------|---------|-------|
| CEG | 7 mai 2026 | $2.49 | Pós-aquisição Calpine — primeira vez |
| NVDA | 20 mai 2026 | ~$78B rev | Maior catalisador do mercado em maio — JÁ EM CARTEIRA, blackout entry |

**Regra**: Não abrir novas posições nos 5 dias antes do earnings de cada stock. Posições existentes entram em **post-earnings review obrigatório dentro de 48h** após o report.
