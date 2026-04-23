import Anthropic from "@anthropic-ai/sdk";

export async function analyzeAndDecide({
  date, equity, capitalInitial, positions, scores, tradeLog, strategy, instructions, briefing, stats, recentTrades,
}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY não definida");
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // System prompt (cached) — conteúdo estático: personalidade + estratégia + guardrails
  const systemText = `${instructions}

---

${strategy}

---

## Guardrails Invioláveis (de CLAUDE.md)

- Daily Loss Cap: -2% do portfolio — parar ordens novas
- Max Position Size: 5% do capital por ativo
- Trailing Stop: 12% em posições vencedoras
- Stop Loss obrigatório: -7% — fechar sem exceção
- Max Drawdown: -10% acumulado — suspender agente
- Asset Whitelist: S&P 500 components apenas
- Proibido: Opções, Leveraged ETFs
- Earnings Blackout: sem compras nos 5 dias antes de earnings`;

  const openLines = positions.length > 0
    ? positions.map(p =>
        `  ${p.symbol}: ${(parseFloat(p.unrealized_plpc) * 100).toFixed(2)}% | P&L $${parseFloat(p.unrealized_pl).toFixed(2)} | ${p.qty} shares`
      ).join("\n")
    : "  Nenhuma";

  const scoresLines = scores.slice(0, 10).map(s =>
    `  ${s.ticker} (score ${s.score}${s.earningsBlackout ? " — BLACKOUT EARNINGS" : ""}): ${s.summary.slice(0, 200)}`
  ).join("\n");

  const recentLog = (tradeLog || "Sem trades recentes").split("\n").slice(-25).join("\n");

  // Bloco de desempenho — feedback explícito sobre decisões passadas
  const totalPnl = parseFloat(equity) - parseFloat(capitalInitial || equity);
  const totalPnlPct = capitalInitial ? (totalPnl / capitalInitial * 100).toFixed(2) : "0.00";
  const pnlSign = totalPnl >= 0 ? "+" : "";

  let performanceBlock;
  if (stats && stats.total > 0) {
    const recentSummary = (recentTrades || []).slice(-5).map(t =>
      `  ${t.side === "buy" ? "COMPRA" : "VENDA"} ${t.ticker} — ${t.pnl >= 0 ? "GANHO" : "PERDA"} ${t.pnl >= 0 ? "+" : ""}$${parseFloat(t.pnl).toFixed(2)} (${t.reason || "—"})`
    ).join("\n") || "  Nenhum";

    performanceBlock = `📊 O TEU HISTORIAL DE DESEMPENHO (feedback das tuas decisões anteriores):
Capital inicial: $${parseFloat(capitalInitial).toFixed(2)} → Atual: $${parseFloat(equity).toFixed(2)} (${pnlSign}$${totalPnl.toFixed(2)}, ${pnlSign}${totalPnlPct}%)
Win rate: ${stats.win_rate_pct}% | Trades: ${stats.total} (${stats.wins} ganhos, ${stats.losses} perdas) | P&L total: ${pnlSign}$${parseFloat(stats.total_pnl).toFixed(2)}
Últimos trades:
${recentSummary}

${stats.win_rate_pct < 50 ? "⚠️ WIN RATE ABAIXO DE 50% — as tuas últimas seleções estão a destruir capital. Eleva o threshold de convicção." : ""}
${totalPnl < 0 ? "⚠️ P&L NEGATIVO — estás a perder dinheiro real. Só entras com convicção ≥ 80% hoje." : ""}`;
  } else {
    performanceBlock = `📊 Historial: sem trades concluídos ainda. Capital inicial: $${parseFloat(capitalInitial || equity).toFixed(2)}`;
  }

  // User message (dinâmico) — estado atual do mercado e portfolio
  const userText = `Data: ${date}
Capital atual: $${parseFloat(equity).toFixed(2)}
Posições abertas (${positions.length}):
${openLines}

Briefing macro hoje:
${briefing || "Não disponível"}

Scores premarket (por ordem decrescente de score):
${scoresLines}

${performanceBlock}

Atividade recente (últimas entradas do trade log):
${recentLog}

---

Analisa os dados acima e decide se devo executar uma compra hoje.
Este é dinheiro real. Cada erro fica no historial para sempre.
Raciocina sobre: (1) qual ativo tem a melhor tese fundamentalista; (2) o score é suportado por catalisadores concretos e verificáveis; (3) qual é o risco de perda permanente de capital; (4) a tua convicção é ≥ 70%? Se não, a resposta é NO_ACTION.
Considera apenas 1 compra por ciclo. Em caso de dúvida, NO_ACTION.

Responde EXCLUSIVAMENTE neste formato JSON (sem markdown, sem código, sem texto antes ou depois):
{
  "action": "BUY" ou "NO_ACTION",
  "ticker": "TICKER" ou null,
  "reasoning": "Raciocínio em português europeu (máx 200 palavras)",
  "confidence": 0.0,
  "risks": ["risco 1", "risco 2", "risco 3"]
}`;

  const stream = client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 2048,
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: systemText,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userText }],
  });

  const message = await stream.finalMessage();

  const textBlock = message.content.find(b => b.type === "text");
  if (!textBlock) throw new Error("Claude não retornou bloco de texto");

  // Strip markdown code fences se o modelo os incluir
  const raw = textBlock.text.trim();
  const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
  return JSON.parse(cleaned);
}
