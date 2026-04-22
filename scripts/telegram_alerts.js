const TELEGRAM_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

async function send(text) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return;
  await fetch(TELEGRAM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text,
      parse_mode: "HTML",
    }),
  }).catch(e => console.error("[telegram] falhou:", e.message));
}

export function sendDailySummary(date, pnlDay, pnlDayPct, spyPct, capital) {
  const vs = pnlDayPct >= spyPct ? "✅ Outperform" : "❌ Underperform";
  const pnlSign = pnlDay >= 0 ? "+" : "";
  return send(
`📊 <b>Resumo ${date}</b>

P&L: <b>${pnlSign}$${pnlDay.toFixed(2)} (${pnlSign}${pnlDayPct.toFixed(2)}%)</b>
SPY: ${spyPct.toFixed(2)}%
Benchmark: ${(pnlDayPct - spyPct).toFixed(2)}% ${vs}

💰 Capital: $${capital.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
  );
}

export function sendWeeklySummary(date, grade, totalReturnPct, winRate, trades, capital) {
  const gradeEmoji = { A: "🏆", B: "✅", C: "🟡", D: "🔴", F: "💀" }[grade] || "📈";
  return send(
`${gradeEmoji} <b>Weekly Review — ${date}</b>
Nota: <b>${grade}</b>

Retorno total: <b>${totalReturnPct >= 0 ? "+" : ""}${totalReturnPct.toFixed(2)}%</b>
Win rate: ${winRate}% (${trades} trades)
💰 Capital: $${capital.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
  );
}

export function sendAlert(emoji, title, body) {
  return send(`${emoji} <b>${title}</b>\n\n${body}`);
}
