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

export function sendDailySummary(date, pnlDay, pnlDayPct, spyPct, capital) {
  const vs = pnlDayPct >= spyPct ? "✅ Outperform" : "❌ Underperform";
  const pnlSign = pnlDay >= 0 ? "+" : "";
  return send(
`📊 Resumo ${date}

Lucro/Perda: ${pnlSign}$${pnlDay.toFixed(2)} (${pnlSign}${pnlDayPct.toFixed(2)}%)
SPY: ${spyPct.toFixed(2)}%
Benchmark: ${(pnlDayPct - spyPct).toFixed(2)}% ${vs}

💰 Capital: $${capital.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
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
