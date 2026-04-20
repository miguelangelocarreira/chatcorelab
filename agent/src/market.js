/**
 * Conector de dados de mercado — Passo 3
 * Usa Alpaca Data API para snapshots e portfolio history.
 * Research fundamentalista via Perplexity (scripts/perplexity_research.js).
 */
import { getSnapshot, getNews, getAccount, getPositions } from "../../scripts/alpaca_api.js";

export async function getPortfolioSnapshot() {
  const [account, positions] = await Promise.all([getAccount(), getPositions()]);
  return {
    equity: parseFloat(account.equity),
    cash: parseFloat(account.cash),
    buying_power: parseFloat(account.buying_power),
    pnl_today: parseFloat(account.equity) - parseFloat(account.last_equity),
    positions: positions.map(p => ({
      ticker: p.symbol,
      qty: parseInt(p.qty),
      market_value: parseFloat(p.market_value),
      unrealized_pnl: parseFloat(p.unrealized_pl),
      unrealized_pnl_pct: parseFloat(p.unrealized_plpc) * 100,
    })),
  };
}

export async function getTickerSnapshot(ticker) {
  const snap = await getSnapshot(ticker);
  return {
    ticker,
    price: snap.latestTrade?.p,
    bid: snap.latestQuote?.bp,
    ask: snap.latestQuote?.ap,
    daily_change_pct: snap.dailyBar
      ? ((snap.dailyBar.c - snap.dailyBar.o) / snap.dailyBar.o) * 100
      : null,
    volume: snap.dailyBar?.v,
  };
}

export async function getRecentNews(ticker, limit = 5) {
  const data = await getNews(ticker, limit);
  return (data.news || []).map(n => ({
    headline: n.headline,
    summary: n.summary,
    date: n.created_at,
    url: n.url,
  }));
}
