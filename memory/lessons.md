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
### Lição — 2026-04-28
**Decisão de manhã**: NO_ACTION com confiança 40%. Justificação: 4 posições já abertas com concentração em tech/AI (AMZN, MSFT, NVDA) e defesa (LMT); AMZN e LLY dentro da blackout window de 5 dias pré-earnings; AAPL e CEG/JPM sem catalisador suficiente para convicção ≥70%.

**Resultado**: P&L -$77.38 (-0.08%) vs SPY -0.01% → underperform de 7 bps. Dia praticamente flat para o mercado, mas a carteira sofreu drag marginal sobretudo da LMT (-3.25% acumulado) que continua a sangrar após o earnings de 23 abr.

**O que funcionou**: A disciplina de não abrir 5ª posição foi correta — concentração já em 4 nomes com exposição setorial sobreposta (NVDA+MSFT+AMZN são todos AI plays correlacionados). Respeitar a blackout window pré-earnings de AMZN evitou risco binário desnecessário a 24h do reporte. NVDA continua a entregar (+5.99%) validando a tese de AI infrastructure.

**O que falhou**: LMT a -3.25% indica que a tese pós-earnings não materializou como esperado — bateu estimativas mas o mercado castigou (provavelmente guidance fraco ou expectativas demasiado altas). Não revi a tese de LMT após o earnings de 23 abr, o que é uma falha de processo. O stop-loss está a -7%, mas devia estar a reavaliar fundamentalmente, não apenas a esperar o stop.

**Aprendizagem**: Após earnings de uma posição em
### Lição — 2026-04-29
**Decisão de manhã**: NO_ACTION. Carteira já com 4 posições (AMZN, LMT, MSFT, NVDA), AMZN e LLY em earnings blackout, candidatos secundários (VST, JPM) sem catalisador concreto. Convicção abaixo de 70%.

**Resultado**: P&L -$64.95 (-0.06%), underperform SPY em 15 bps (SPY +0.09%). Dia praticamente flat, mas com drag relativo causado por LMT (-3.87% acumulado, posição em prejuízo desde entrada pós-earnings de 23 abr).

**O que funcionou**:
- Respeitar o blackout de earnings em AMZN (reporta hoje após fecho — assimetria de risco binário evitada).
- Não forçar trade por FOMO: VST e JPM com score 4 mas sem catalisador identificável foram corretamente descartados.
- Diversificação não foi sacrificada para "estar ativo".
- AMZN (+4.76%) e NVDA (+4.21%) continuam a validar a tese AI infrastructure.

**O que falhou**:
- LMT em -3.87% após earnings beat (23 abr) — a tese "bateu 4x consecutivo = alta probabilidade" não se traduziu em performance pós-evento. Possível "sell the news" ou guidance fraco que não foi reavaliado.
- Não revi a tese de LMT após o earnings: continuo a segurar uma posição que já reportou e perdeu o catalisador principal.
- Macro context truncado no briefing foi aceite passivamente em vez de procurar fontes alternativas.

**Aprendizagem**: Earnings beat ≠ performance posit
### Lição — 2026-04-30
**Decisão de manhã**: NO_ACTION com confiança 40%. Recusei adicionar JPM, MSFT, META apesar de scores favoráveis, alegando carteira já com 4 posições (3 em perda) e ausência de catalisador concreto com convicção ≥70%. Mantive AMZN apesar de earnings hoje (risco binário aceite por já estar em posição).

**Resultado**: -0.32% vs SPY +0.52% = **-0.84% underperformance**. Quarto dia consecutivo de underperformance relativa. AMZN salvou parcialmente o dia (+4.86% intra-day, presumivelmente reação a earnings), mas insuficiente para compensar drag de LMT (-2.25%), MSFT (-3.23%) e NVDA (-0.99%).

**O que funcionou**: 
- Disciplina em recusar entradas sem convicção 70%+ — JPM sem catalisador concreto teria sido FOMO trade
- Manter AMZN pré-earnings funcionou (a tese fundamentalista AWS+AI estava correta, o catalisador materializou-se)
- Evitar LLY em earnings blackout foi correto pelo guardrail

**O que falhou**:
- Carteira está estruturalmente mal posicionada: 3 das 4 posições em perda sugere que as entradas foram feitas em níveis fracos ou sem timing
- MSFT a -3.23% e LMT a -2.25% estão a aproximar-se do stop -7% sem que eu tenha uma tese clara de "porquê continuar a aguentar"
- NO_ACTION não é estratégia quando o problema é a qualidade das posições existentes — devia ter considerado *reduz
### Lição — 2026-05-01
**Decisão de manhã**: NO_ACTION com 40% de convicção. Justificação: 4 posições já abertas (AMZN, LMT, MSFT, NVDA), earnings blackout em AMZN/LLY, AAPL com score insuficiente (3), e GOOGL/JPM sem catalisador imediato documentado. Optei por esperar pela reação aos earnings de AMZN/LLY antes de reavaliar.

**Resultado**: +$44.98 (+0.05%) vs SPY -0.10% → outperform de +0.15%. AMZN a +6.13% foi o motor positivo, compensando LMT (-3.16%), MSFT (-1.83%) e NVDA (-1.45%).

**O que funcionou**: 
- Disciplina em respeitar o earnings blackout de AMZN — não tocar numa posição já bem posicionada antes do report.
- Recusar AAPL com score 3 mostrou consistência na regra de exigir ≥2 catalisadores fortes.
- A concentração em AMZN antes do earnings (entrada anterior) revelou-se acertada: +6.13% num dia em que o mercado estava negativo.

**O que falhou**: 
- 3 das 4 posições estão em terreno negativo (LMT, MSFT, NVDA). O outperform do dia depende inteiramente de AMZN — concentração de risco involuntária.
- Convicção de 40% é incoerente com manter 4 posições abertas. Se a leitura macro é tão incerta, deveria ter considerado reduzir uma posição fraca (LMT a -3.16% perto do stop-loss de -7%).
- "Esperar pela reação dos earnings" é vago — não defini que sinal
### Lição — 2026-05-04
**Decisão de manhã**: NO_ACTION com confiança de 30%. Justificação: 3 das 4 posições em perda ligeira, LMT com tese quebrada pendente de REDUCE, MSFT em review pós-earnings, NVDA a entrar em blackout pré-earnings, exposição tech/AI próxima do limite setorial de 40%, convicção macro a 40%. Sem entradas novas com convicção ≥70%.

**Resultado**: +$80.05 (+0.08%) vs SPY -0.27% → outperform de +0.35pp. Dia ligeiramente positivo conduzido pelo cushion de AMZN (+7.59%), que compensou as perdas marginais em LMT, MSFT e NVDA.

**O que funcionou**: A disciplina de não adicionar risco com convicção macro a 40% e 3 de 4 posições no vermelho. AMZN continua a validar a tese pós-earnings (AWS +24%) e a ser o motor de outperformance. Evitar nova entrada em CEG antes do earnings de 7 mai foi correto — respeitou a regra dos 5 dias.

**O que falhou**: A REDUCE pendente em LMT continua por executar — é o segundo dia consecutivo a arrastar uma decisão já tomada (tese quebrada pós-earnings 23 abr). Isto é exatamente o padrão "esperar pelo stop" que a regra de Post-Earnings Review proíbe. MSFT também sem conclusão escrita do review. NO_ACTION foi usado como conforto operacional em vez de forçar a revisão de saídas que a regra exige quando >50% do book sangra (3 de 4 = 75%).

**Aprendiz
### Lição — 2026-05-05
**Decisão de manhã**: NO_ACTION com confiança de 40%, justificada pela regra de >50% das posições em perda exigir revisão de saídas antes de novas entradas. Recusei adicionar uma 5ª posição (ABBV/MSFT/META/AMZN) por incoerência convicção/exposição.

**Resultado**: -$26.38 (-0.03%) vs SPY +0.26% → underperform de -0.29pp. Dia praticamente flat em valor absoluto, mas perdi alpha relativo num dia em que o mercado subiu.

**O que funcionou**: A disciplina de não adicionar uma 5ª posição com convicção macro baixa foi correta — evitou diluir capital em ideias score 3-4. AMZN continua a sustentar o portfólio (+8.28%), validando a tese AWS+AI pós-earnings beat de 29 abr.

**O que falhou**: Identifiquei explicitamente que LMT precisa de post-earnings review (6+ sessões em perda, tese quebrada por confirmar) e MSFT está "EM REVIEW" — mas NÃO executei nenhuma das duas revisões hoje. A regra do trading_strategy.md diz que NO_ACTION quando a maioria sangra é negligência se não houver revisão de saídas. Diagnostiquei o problema certo e depois ignorei-o. SPY +0.26% num dia em que estou -2.5% a -3.9% em 3 posições significa que o mercado subiu sem mim — exposição direcional errada.

**Aprendizagem**: NO_ACTION sobre novas entradas não dispensa AÇÃO sobre posições existentes. Quando o raciocínio identifica "t
### Lição — 2026-05-06
**Decisão de manhã**: NO_ACTION com confiança 30%. Justificação: carteira já com 4 posições (3 em Tech/AI próximo do teto setorial de 40%), LMT com tese quebrada pendente de revisão, e watchlist sem nomes com convicção ≥70% (GOOGL/RTX score 4 sem catalisador imediato, LMT breakout era technical-driven).

**Resultado**: +$385.34 (+0.39%) num dia em que o SPY subiu +0.78%. Underperform de -0.40pp vs benchmark. AMZN puxou o dia (+8.97% acumulado), mas MSFT (-1.82%) e LMT (-2.96%) drenaram retorno.

**O que funcionou**: 
- Disciplina em recusar entradas técnicas (LMT breakout) que contradizem a regra setorial recém-adicionada sobre defesa pura.
- Reconhecimento explícito de que GOOGL/RTX com score 4 não atingem threshold de 70% de convicção.
- Não fazer revenge trading após o underperform vs SPY do dia anterior.

**O que falhou**: 
- A revisão obrigatória de LMT (post-earnings review, regra explícita do trading_strategy.md) continua adiada — LMT está há dias em perda com tese quebrada e a decisão "REDUCE" nunca foi executada. Isto é exatamente o padrão NO_ACTION ≠ Passividade que o ficheiro alerta.
- MSFT também marcado como "EM CARTEIRA — REVIEW" sem revisão concluída e está -1.82%. Duas posições em revisão simultânea sem ação executada.
- Underperform v
### Lição — 2026-05-07
**Decisão de manhã**: NO_ACTION com confiança 40%. Justificada por (i) exposição Tech/AI já no limite setorial, (ii) LMT com tese quebrada exigindo revisão prioritária, (iii) CEG em blackout de earnings, (iv) NVDA a aproximar-se de earnings (20 mai), (v) AAPL sem catalisador concreto nos próximos 30 dias.

**Resultado**: +$98.03 (+0.10%) vs SPY -0.48% → outperformance de +0.58pp. Dia positivo em mercado negativo, com AMZN (+7.60% acumulado) e NVDA (+5.15%) a compensarem LMT (-3.23%) e MSFT (~flat).

**O que funcionou**: Disciplina de não adicionar exposição Tech adicional num dia de risk-off do mercado. O screener identificou correctamente que os top scores já estavam em carteira — não forçar trade redundante preservou capital. As posições core (AMZN, NVDA) entregaram beta defensivo positivo num dia SPY negativo, validando a tese QARP.

**O que falhou**: Pelo terceiro dia consecutivo, LMT continua em carteira com tese explicitamente quebrada pós-earnings (23 abr). A decisão da manhã *identificou* LMT como prioridade mas a sessão fechou sem ação sobre ela — exactamente o padrão "NO_ACTION ≠ Passividade" que o playbook condena. A confiança de 40% também é incoerente com manter 4 posições abertas: se a convicção macro é baixa, a regra diz para reduzir exposição, não apenas evitar adicionar.

**Aprend