/**
 * ClickUp Monitoring & Alerts Client
 * Envia notificações de eventos críticos do agente.
 */

const CLICKUP_BASE = "https://api.clickup.com/api/v2";

function assertCredentials() {
  if (!process.env.CLICKUP_API_TOKEN) {
    throw new Error("CLICKUP_API_TOKEN não definido nas variáveis de ambiente.");
  }
  if (!process.env.CLICKUP_LIST_ID) {
    throw new Error("CLICKUP_LIST_ID não definido. Configura o ID da lista de alertas.");
  }
}

async function createTask(name, description, priority = 3) {
  assertCredentials();
  const res = await fetch(`${CLICKUP_BASE}/list/${process.env.CLICKUP_LIST_ID}/task`, {
    method: "POST",
    headers: {
      Authorization: process.env.CLICKUP_API_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
      priority, // 1=urgent, 2=high, 3=normal, 4=low
      status: "to do",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ClickUp createTask → ${res.status}: ${err}`);
  }
  return res.json();
}

// Alertas de trading
export function alertTradeExecuted(ticker, side, shares, price, pnl) {
  const emoji = side === "buy" ? "🟢" : "🔴";
  return createTask(
    `${emoji} Trade: ${side.toUpperCase()} ${shares}x ${ticker} @ $${price}`,
    `P&L: $${pnl > 0 ? "+" : ""}${pnl.toFixed(2)}\nData: ${new Date().toISOString()}`,
    4
  );
}

export function alertMandatoryCut(ticker, pnlPct) {
  return createTask(
    `⚠️ Corte obrigatório: ${ticker} (${pnlPct.toFixed(1)}%)`,
    `Guardrail -7% ativado em ${ticker}.\nP&L: ${pnlPct.toFixed(2)}%\nData: ${new Date().toISOString()}`,
    2
  );
}

export function alertDailyLossCap(portfolioPnlPct) {
  return createTask(
    `🚨 DAILY LOSS CAP ATINGIDO: ${portfolioPnlPct.toFixed(2)}%`,
    `O limite diário de -2% foi atingido. Novas ordens suspensas até amanhã.\nData: ${new Date().toISOString()}`,
    1
  );
}

export function alertDrawdownCircuitBreaker(drawdownPct) {
  return createTask(
    `🚨 CIRCUIT BREAKER: Drawdown ${drawdownPct.toFixed(2)}%`,
    `O drawdown máximo de 10% foi atingido. Agente SUSPENSO.\nIntervenção humana necessária.\nData: ${new Date().toISOString()}`,
    1
  );
}

export function sendDailySummary(date, pnlDay, pnlDayPct, spyPct, totalCapital) {
  const vs = pnlDayPct > spyPct ? "✅ Outperform" : "❌ Underperform";
  return createTask(
    `📊 Resumo ${date}: ${pnlDayPct > 0 ? "+" : ""}${pnlDayPct.toFixed(2)}% vs SPY ${spyPct > 0 ? "+" : ""}${spyPct.toFixed(2)}% ${vs}`,
    `P&L dia: $${pnlDay.toFixed(2)} (${pnlDayPct.toFixed(2)}%)\nSPY: ${spyPct.toFixed(2)}%\nCapital total: $${totalCapital.toFixed(2)}`,
    4
  );
}

export function sendWeeklySummary(report) {
  return createTask(
    `📈 Relatório Semanal — ${report.week}`,
    report.content,
    3
  );
}
