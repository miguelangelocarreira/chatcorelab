import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const CAL_PATH = resolve(process.cwd(), "data/earnings_calendar.json");

export async function updateEarningsCalendar(tickers) {
  const { getEarningsCalendar } = await import("./tavily_research.js");

  let raw;
  try {
    raw = await getEarningsCalendar(tickers);
  } catch (e) {
    console.warn("[earnings] Tavily falhou:", e.message);
    return null;
  }

  const today = new Date().toISOString().slice(0, 10);

  // Extrai pares "TICKER YYYY-MM-DD" do texto — formato pedido ao Tavily
  const fresh = new Map();
  for (const [, ticker, date] of raw.matchAll(/\b([A-Z]{2,5})\b\s+(\d{4}-\d{2}-\d{2})/g)) {
    if (tickers.includes(ticker) && date >= today) {
      fresh.set(ticker, date);
    }
  }

  // Merge com entradas existentes ainda no futuro
  const existing = JSON.parse(readFileSync(CAL_PATH, "utf-8"));
  const merged = new Map(
    existing.earnings
      .filter(e => e.date >= today)
      .map(e => [e.ticker, e.date])
  );

  for (const [ticker, date] of fresh) {
    merged.set(ticker, date);
  }

  const earnings = [...merged.entries()]
    .map(([ticker, date]) => ({ ticker, date }))
    .sort((a, b) => a.date.localeCompare(b.date));

  writeFileSync(CAL_PATH, JSON.stringify({
    updated: today,
    note: "Auto-atualizado no premarket via Tavily. Verificar se necessário.",
    earnings,
  }, null, 2));

  return { found: fresh.size, earnings };
}
