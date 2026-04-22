import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const BULLISH = [
  "upgrade", "outperform", "buy rating", "beat", "exceeded", "raised guidance",
  "strong earnings", "record revenue", "margin expansion", "growth", "catalyst",
  "contract win", "approval", "partnership", "buyback", "positive", "top line",
  "ahead of estimates", "accelerating", "momentum", "new high"
];

const BEARISH = [
  "downgrade", "underperform", "sell", "missed", "below expectations",
  "cut guidance", "declining", "investigation", "lawsuit", "regulatory risk",
  "concern", "warning", "net loss", "layoffs", "debt concern", "bankruptcy"
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
  // Max 12 stocks para não consumir demasiados créditos Tavily
  for (const stock of stocks.slice(0, 12)) {
    try {
      const research = await researchFn(stock.ticker);
      const score = scoreText(research);
      results.push({
        ticker:  stock.ticker,
        sector:  stock.sector,
        thesis:  stock.thesis,
        score,
        summary: research.slice(0, 400),
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
