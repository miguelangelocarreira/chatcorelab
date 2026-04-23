import Anthropic from "@anthropic-ai/sdk";

export async function analyzeAndDecide({
  date, equity, capitalInitial, positions, scores, tradeLog, strategy, instructions, briefing, stats, recentTrades, tradeStats,
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

  // ── Terminal-format context (compact, ~300 tokens) ──────────────────────────
  const eq = parseFloat(equity);
  const init = parseFloat(capitalInitial || equity);
  const totalPnl = eq - init;
  const totalPnlPct = init ? (totalPnl / init * 100) : 0;
  const pnlStr = `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(0)}(${totalPnl >= 0 ? "+" : ""}${totalPnlPct.toFixed(2)}%)`;
  const dd = eq < init ? ((init - eq) / init * 100).toFixed(1) : "0.0";

  const posLine = positions.length > 0
    ? positions.map(p => {
        const pct = parseFloat(p.unrealized_plpc) * 100;
        const pnl = parseFloat(p.unrealized_pl);
        return `${p.symbol}×${p.qty}@$${parseFloat(p.avg_entry_price).toFixed(0)} ${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%(${pnl >= 0 ? "+" : ""}$${Math.abs(pnl).toFixed(0)})`;
      }).join("  ")
    : "none";

  const perfBase = stats?.total > 0
    ? `wr:${stats.win_rate_pct}%(${stats.wins}W/${stats.losses}L) | pnl:${parseFloat(stats.total_pnl) >= 0 ? "+" : ""}$${parseFloat(stats.total_pnl).toFixed(0)}`
    : "wr:—(0W/0L) | pnl:$0";

  const SECTOR_ABBR = { Technology: "TECH", Healthcare: "HLTH", Defense: "DEF", Industrials: "IND", Energy: "ENRG", Financials: "FIN" };
  const sectorStr = tradeStats?.by_sector
    ? Object.entries(tradeStats.by_sector)
        .filter(([, v]) => v.trades > 0)
        .map(([k, v]) => {
          const abbr = SECTOR_ABBR[k] || k.slice(0, 4).toUpperCase();
          const p = `${v.total_pnl >= 0 ? "+" : ""}$${Math.abs(v.total_pnl).toFixed(0)}`;
          return `${abbr}:${v.wins}W/${v.losses}L(${p})`;
        }).join(" ")
    : "";

  const tradesLine = (recentTrades || []).length > 0
    ? (recentTrades || []).slice(-4).map(t => {
        const p = `${t.pnl >= 0 ? "+" : ""}$${Math.abs(parseFloat(t.pnl)).toFixed(0)}`;
        const r = { stop_loss: "sl", take_profit_partial: "tp", trailing_stop: "ts" }[t.reason] || (t.reason || "?").slice(0, 4);
        return `${t.ticker}:SELL${p}(${r})`;
      }).join("  ")
    : "none";

  const topScores = scores.slice(0, 6).map(s =>
    `${s.ticker}:${s.score}${s.earningsBlackout ? `(BKOUT${s.earningsDaysAway != null ? `-${s.earningsDaysAway}d` : ""})` : ""}`
  ).join(" ");
  const blackoutList = scores
    .filter(s => s.earningsBlackout)
    .map(s => `${s.ticker}(${s.earningsDaysAway === 0 ? "today" : `${s.earningsDaysAway}d`})`)
    .join(" ");

  const macroSnippet = (briefing || "n/a").replace(/\n+/g, " ").trim().slice(0, 180);

  // User message (dinâmico) — terminal notation, estado atual
  const userText = `DATE ${date}

PORTFOLIO  eq:$${eq.toFixed(0)} | init:$${init.toFixed(0)} | pnl:${pnlStr} | dd:-${dd}% | slots:${6 - positions.length}/6
POSITIONS  ${posLine}
PERF       ${perfBase}${sectorStr ? ` | ${sectorStr}` : ""}
TRADES     ${tradesLine}
SCORES     ${topScores}${blackoutList ? ` | BKOUT:${blackoutList}` : ""}
MACRO      ${macroSnippet}

---

Decide: (1) melhor tese fundamentalista; (2) score suportado por catalisadores concretos; (3) risco de perda permanente; (4) convicção ≥ 70%? Se não → NO_ACTION.
1 compra por ciclo. Em dúvida → NO_ACTION. Capital real — cada erro é permanente.

Responde EXCLUSIVAMENTE neste JSON (sem markdown, sem texto antes ou depois):
{
  "action": "BUY" ou "NO_ACTION",
  "ticker": "TICKER" ou null,
  "reasoning": "Raciocínio em português europeu (máx 150 palavras)",
  "confidence": 0.0,
  "risks": ["risco 1", "risco 2"]
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

// ─── Reflexão de Fim de Dia ──────────────────────────────────────────────────

export async function reflectOnDay({ date, pnlDay, pnlDayPct, spyPct, positions, closedTrades, todayDecision, strategy, instructions }) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const pnlSign = pnlDay >= 0 ? "+" : "";
  const vsSign = (pnlDayPct - spyPct) >= 0 ? "+" : "";
  const closedLines = closedTrades.length > 0
    ? closedTrades.map(t => `  ${t.ticker}: ${t.pnl >= 0 ? "GANHO" : "PERDA"} ${t.pnl >= 0 ? "+" : ""}$${parseFloat(t.pnl).toFixed(2)} (${t.reason || "—"})`).join("\n")
    : "  Nenhum";
  const openLines = positions.length > 0
    ? positions.map(p => `  ${p.symbol}: ${(parseFloat(p.unrealized_plpc) * 100).toFixed(2)}%`).join("\n")
    : "  Nenhuma";

  const stream = client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 600,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: `${instructions}\n\n---\n\n${strategy}`, cache_control: { type: "ephemeral" } }],
    messages: [{
      role: "user",
      content: `Data: ${date}
P&L do dia: ${pnlSign}$${pnlDay.toFixed(2)} (${pnlSign}${pnlDayPct.toFixed(2)}%) vs SPY ${spyPct >= 0 ? "+" : ""}${spyPct.toFixed(2)}% → ${vsSign}${(pnlDayPct - spyPct).toFixed(2)}% vs benchmark

Decisão da manhã:
${todayDecision || "Não disponível"}

Trades fechados hoje:
${closedLines}

Posições em aberto no fecho:
${openLines}

---

Escreve uma lição estruturada e honesta sobre hoje. Sê específico — evita generalismos.
Formato OBRIGATÓRIO (markdown puro, sem JSON):

### Lição — ${date}
**Decisão de manhã**: [o que foi decidido e porquê]
**Resultado**: [P&L, outperform/underperform SPY]
**O que funcionou**: [o que foi correto]
**O que falhou**: [o que correu mal ou podia ter sido melhor]
**Aprendizagem**: [lição específica aplicável a dias futuros]
**Amanhã**: [o que observar / o que mudar]`,
    }],
  });

  const message = await stream.finalMessage();
  const textBlock = message.content.find(b => b.type === "text");
  return textBlock?.text.trim() || null;
}

// ─── Revisão Semanal da Estratégia ──────────────────────────────────────────

export async function reviewWeekAndUpdateStrategy({ date, grade, stats, totalReturnPct, lessons, strategy, instructions }) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const pnlSign = parseFloat(stats.total_pnl) >= 0 ? "+" : "";

  const stream = client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: `${instructions}\n\n---\n\n${strategy}`, cache_control: { type: "ephemeral" } }],
    messages: [{
      role: "user",
      content: `Weekly Review — ${date}
Nota da semana: ${grade}
P&L total: ${pnlSign}$${parseFloat(stats.total_pnl).toFixed(2)} (${totalReturnPct >= 0 ? "+" : ""}${totalReturnPct.toFixed(2)}%)
Win rate: ${stats.win_rate_pct}% (${stats.wins} wins, ${stats.losses} losses, ${stats.total} total)

Lições acumuladas (memória de longo prazo):
${lessons || "Nenhuma lição registada ainda."}

---

Analisa as lições e o desempenho. Decide se a estratégia de trading precisa de ser atualizada.
Considera: padrões de erro repetidos, setores a evitar, threshold de convicção, regras a adicionar/remover.
Se a estratégia não precisa de mudar, diz porquê.

Responde em JSON (sem markdown):
{
  "updateNeeded": true | false,
  "reasoning": "Justificação (máx 100 palavras)",
  "changes": ["mudança 1"] | [],
  "updatedStrategy": "Texto COMPLETO atualizado de trading_strategy.md" | null
}`,
    }],
  });

  const message = await stream.finalMessage();
  const textBlock = message.content.find(b => b.type === "text");
  if (!textBlock) return null;

  const raw = textBlock.text.trim().replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
  return JSON.parse(raw);
}
