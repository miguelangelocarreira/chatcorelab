# Lições Aprendidas — Memória de Longo Prazo

> Gerado automaticamente pelo agente no fecho de cada dia de mercado.
> Lido no início de CADA sessão de Market Open para informar decisões futuras.
> NÃO editar manualmente — é a memória viva do agente.

---


### Lição — 2026-04-23

**Decisão de manhã**: NO_ACTION com confiança 55%. Justificação: já tinha 4 posições abertas (AMZN, LMT, MSFT, NVDA) com concentração tech/AI elevada; candidatos adicionais (GOOGL, JPM) não atingiram o threshold de 70% de convicção — GOOGL sem score suficiente, JPM sem catalisador específico verificável.

**Resultado**: P&L -$134.16 (-0.13%), SPY -0.14%. Outperform marginal de +0.01pp — estatisticamente nulo mas tecnicamente não-perdedor face ao benchmark. Posições: AMZN +0.98% (única verde), LMT -0.09% (flat), NVDA -0.63%, MSFT -1.35% (pior do dia).

**O que funcionou**: A disciplina de NO_ACTION foi tecnicamente correta — nenhum candidato atingiu convicção ≥70% e a regra de ouro foi respeitada. Evitar GOOGL e JPM sem catalisador verificável preveniu diluição adicional da tese. Nota positiva: LMT reporta earnings hoje (23 abr) e está flat — o mercado ainda não precificou o beat esperado (4x consecutivos). AMZN a segurar a carteira valida a tese AWS pré-earnings (29 abr).

**O que falhou**: Concentração setorial excessiva continua a ser o calcanhar de Aquiles — 3 de 4 posições em tech/AI (AMZN, MSFT, NVDA) movimentaram-se correlacionadas no downside. MSFT -1.35% arrastou o dia inteiro sem hedge defensivo. A r
### Lição — 2026-04-24
**Decisão de manhã**: NO_ACTION com confiança 40%. Justificação: portfólio já concentrado em tech/AI + defesa (4 posições), contexto macro adverso (IBM -6%, ServiceNow -13% pós-earnings indicando derating em tech), AMZN em blackout pré-earnings (29 abr), e GOOGL — apesar de ter score 4 — agravaria concentração setorial.

**Resultado**: P&L +$296.57 (+0.30%), underperform SPY em -0.13pp. Dia ligeiramente positivo em termos absolutos mas perdeu ao benchmark. AMZN (+4.59%) e NVDA (+3.36%) sustentaram o portfólio; LMT (-3.50%) e MSFT (+0.63%) foram o arrasto.

**O que funcionou**: 
- Disciplina de não adicionar GOOGL num dia de sell-off tech foi correta — evitar FOMO num derating setorial é exatamente o que o guardrail de 70% convicção exige.
- Respeito pelo blackout de 5 dias antes de earnings AMZN (protocolo de trading_strategy.md).
- Reconhecimento honesto da concentração setorial antes de amplificá-la.

**O que falhou**: 
- Underperformance de -0.13pp num dia em que o mercado subiu mostra que o portfólio atual tem beta insuficiente vs SPY quando o sell-off tech não se materializa amplamente. LMT -3.50% é o maior detractor — preciso avaliar se a tese de defesa NATO está a quebrar ou se é ruído pré-earnings (23 abr já passou — rever o resultado).
- Não documentei
### Lição — 2026-04-27
**Decisão de manhã**: NO_ACTION com confiança 40%. Recusei adicionar posições por já ter 4 abertas com enviesamento tech/AI (AMZN, MSFT, NVDA), pelo blackout de earnings em MSFT/META/AMZN/AAPL/LLY/UNH, e por VST não ter catalisador imediato concreto apesar de tese alinhada.

**Resultado**: +$136.04 (+0.14%) vs SPY +0.28% → underperformance de -0.14pp. NVDA destacou-se (+7.58%) e AMZN sólido (+3.36%), mas LMT continua a sangrar (-2.93%) e arrasta o portfólio. MSFT quase neutro (+0.54%).

**O que funcionou**: A disciplina de não adicionar tech foi correta — a concentração em AI já existente captou o upside do dia (NVDA +7.58% é o motor da carteira). O guardrail de earnings blackout protegeu de entrar em MSFT/AMZN/LLY antes de binary events esta semana. Não houve revenge trading apesar do drag de LMT.

**O que falhou**: Underperformance vs SPY num dia em que NVDA fez +7.58% é alarmante — significa que LMT (-2.93%) e cash parado estão a destruir alpha. A tese LMT (earnings 23 abr, bateu 4x consecutivo) materializou-se em perda — ou o earnings desiludiu, ou a reação de mercado foi negativa apesar do beat. Não revi a posição LMT após o earnings de 23 abr — isso é um erro de gestão ativa.

**Aprendizagem**: Pós-earnings, qualquer