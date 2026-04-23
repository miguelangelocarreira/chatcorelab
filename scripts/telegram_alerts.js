const TELEGRAM_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

async function send(text) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return;
  const res = await fetch(TELEGRAM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text,
    }),
  }).catch(e => { console.error("[telegram] falhou:", e.message); return null; });
  if (res && !res.ok) {
    const err = await res.text().catch(() => "");
    console.error("[telegram] API erro:", res.status, err);
  }
}

export function sendDailySummary(date, pnlDay, pnlDayPct, spyPct, capital, positions = [], closedToday = 0, totalPnl = null) {
  const vs = pnlDayPct >= spyPct ? "✅ Outperform" : "❌ Underperform";
  const pnlSign = pnlDay >= 0 ? "+" : "";
  const spySign = spyPct >= 0 ? "+" : "";

  let portfolioLines = "";
  if (positions.length > 0) {
    const lines = positions.map((p, i) => {
      const pct = (parseFloat(p.unrealized_plpc) * 100).toFixed(2);
      const pl = parseFloat(p.unrealized_pl);
      const sign = pl >= 0 ? "+" : "";
      const prefix = i === positions.length - 1 ? "└" : "├";
      return `${prefix} ${p.symbol} (${p.qty}): ${sign}${pct}% | ${sign}$${pl.toFixed(2)}`;
    });
    portfolioLines = `\n\n💼 Portfolio: $${capital.toLocaleString("en-US", { minimumFractionDigits: 2 })}\n${lines.join("\n")}`;
  } else {
    portfolioLines = `\n\n💼 Portfolio: $${capital.toLocaleString("en-US", { minimumFractionDigits: 2 })}\n└ Sem posições abertas`;
  }

  const accumSign = totalPnl !== null && totalPnl >= 0 ? "+" : "";
  const accumLine = totalPnl !== null
    ? `\n🏁 Acumulado: ${accumSign}$${totalPnl.toFixed(2)} (${accumSign}${((totalPnl / (capital - totalPnl)) * 100).toFixed(2)}%)`
    : "";

  return send(
`📊 Resumo — ${date}

💹 Hoje: ${pnlSign}$${pnlDay.toFixed(2)} (${pnlSign}${pnlDayPct.toFixed(2)}%) vs SPY ${spySign}${spyPct.toFixed(2)}% ${vs}${portfolioLines}

📌 ${positions.length} posições abertas | ${closedToday} fechadas hoje${accumLine}`
  );
}

export function sendWeeklySummary(date, grade, totalReturnPct, winRate, trades, capital) {
  const gradeEmoji = { A: "🏆", B: "✅", C: "🟡", D: "🔴", F: "💀" }[grade] || "📈";
  return send(
`${gradeEmoji} Weekly Review — ${date}
Nota: ${grade}

Retorno total: ${totalReturnPct >= 0 ? "+" : ""}${totalReturnPct.toFixed(2)}%
Win rate: ${winRate}% (${trades} trades)
💰 Capital: $${capital.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
  );
}

export function sendAlert(emoji, title, body) {
  return send(`${emoji} ${title}\n\n${body}`);
}
