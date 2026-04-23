import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import settings from "../config/settings.json" with { type: "json" };

function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

function checkEarningsBlackout(ticker) {
  const calPath = resolve(process.cwd(), "data/earnings_calendar.json");
  if (!existsSync(calPath)) return { blackout: false, daysAway: null };
  const { earnings } = JSON.parse(readFileSync(calPath, "utf-8"));
  const entry = earnings.find(e => e.ticker === ticker);
  if (!entry) return { blackout: false, daysAway: null };
  const days = daysUntil(entry.date);
  const blackout = days >= 0 && days <= settings.risk.earnings_blackout_days;
  return { blackout, daysAway: days };
}

const BULLISH = [
  "upgrade", "outperform", "buy rating", "beat", "exceeded", "raised guidance",
  "strong earnings", "record revenue", "margin expansion", "growth", "catalyst",
  "contract win", "approval", "partnership", "buyback", "positive", "top line",
  "ahead of estimates", "accelerating", "momentum", "new high",
  "market share", "raised price target", "strong demand", "backlog", "record orders"
];

const BEARISH = [
  "downgrade", "underperform", "sell", "missed", "below expectations",
  "cut guidance", "declining", "investigation", "lawsuit", "regulatory risk",
  "concern", "warning", "net loss", "layoffs", "debt concern", "bankruptcy",
  "overvalued", "stretched valuation", "priced to perfection", "expensive",
  "overbought", "crowded trade", "rich valuation", "lofty", "frothy",
  "margin compression", "slowdown", "disappointing", "headwinds"
];

function scoreText(text) {
  const lower = text.toLowerCase();
  const bull = BULLISH.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);
  const bear = BEARISH.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);
  return bull - bear;
}

export async function screenWatchlist(researchFn) {
  const { stocks } = JSON.parse(
    readFileSync(resolve(process.cwd(), "data/watchlist.json"), "utf-8")
  );

  const results = [];
  // Max 15 stocks — cobre toda a watchlist (~330 calls/mês, dentro do limite free tier)
  for (const stock of stocks.slice(0, 15)) {
    try {
      const research = await researchFn(stock.ticker);
      const score = scoreText(research);
      const { blackout, daysAway } = checkEarningsBlackout(stock.ticker);
      results.push({
        ticker:  stock.ticker,
        sector:  stock.sector,
        thesis:  stock.thesis,
        score,
        summary: research.slice(0, 400),
        earningsBlackout: blackout,
        earningsDaysAway: daysAway,
      });
    } catch (e) {
      results.push({ ticker: stock.ticker, sector: stock.sector, thesis: stock.thesis, score: 0, summary: `Erro: ${e.message}` });
    }
  }

  results.sort((a, b) => b.score - a.score);

  writeFileSync(
    resolve(process.cwd(), "memory/premarket_scores.json"),
    JSON.stringify({ date: new Date().toISOString().slice(0, 10), scores: results }, null, 2)
  );

  return results;
}

export function loadPremarketScores() {
  const path = resolve(process.cwd(), "memory/premarket_scores.json");
  if (!existsSync(path)) return null;
  const data = JSON.parse(readFileSync(path, "utf-8"));
  // Scores só são válidos se forem de hoje
  if (data.date !== new Date().toISOString().slice(0, 10)) return null;
  return data.scores;
}
