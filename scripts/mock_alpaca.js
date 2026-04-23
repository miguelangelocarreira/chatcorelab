/**
 * Mock Alpaca API — substituto completo sem credenciais reais.
 * Ativo quando ALPACA_PAPER_MOCK=true ou quando as chaves não estão definidas.
 * Mantém estado em agent/memory/ tal como o cliente real faria.
 *
 * Uso: a camada de execução (executor.js, market.js) importa o cliente correto
 * via getAlpacaClient() em vez de importar alpaca_api.js diretamente.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const MOCK_STATE_PATH = resolve(process.cwd(), "agent/memory/mock_account.json");

function loadMockAccount() {
  if (!existsSync(MOCK_STATE_PATH)) {
    const initial = {
      equity: 10000,
      cash: 10000,
      last_equity: 10000,
      buying_power: 10000,
      positions: [],
      orders: [],
      order_seq: 1,
    };
    writeFileSync(MOCK_STATE_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(readFileSync(MOCK_STATE_PATH, "utf-8"));
}

function saveMockAccount(acc) {
  writeFileSync(MOCK_STATE_PATH, JSON.stringify(acc, null, 2));
}

// Preços simulados estáticos — suficientes para testar guardrails e sizing
const MOCK_PRICES = {
  AAPL: 210.50, MSFT: 415.20, NVDA: 875.00, AMZN: 185.30, META: 520.10,
  GOOGL: 175.80, JPM: 210.00, LLY: 780.00, V: 275.00, COST: 870.00,
  MA: 470.00, HD: 355.00, CRM: 290.00, NFLX: 625.00, ADBE: 430.00,
};

function mockPrice(symbol) {
  const base = MOCK_PRICES[symbol] ?? 100.00;
  // variação aleatória ±1.5% para simular movimento
  const jitter = 1 + (Math.random() - 0.5) * 0.03;
  return parseFloat((base * jitter).toFixed(2));
}

// --- Implementações mock ---

export function getAccount() {
  const acc = loadMockAccount();
  return Promise.resolve({
    equity: acc.equity.toString(),
    cash: acc.cash.toString(),
    last_equity: acc.last_equity.toString(),
    buying_power: acc.buying_power.toString(),
    status: "ACTIVE",
    pattern_day_trader: false,
    trading_blocked: false,
    account_blocked: false,
  });
}

export function getPositions() {
  const acc = loadMockAccount();
  return Promise.resolve(
    acc.positions.map(p => {
      const current = mockPrice(p.symbol);
      const unrealized_pl = (current - p.avg_entry_price) * p.qty;
      const unrealized_plpc = (current - p.avg_entry_price) / p.avg_entry_price;
      return {
        symbol: p.symbol,
        qty: p.qty.toString(),
        avg_entry_price: p.avg_entry_price.toString(),
        current_price: current.toString(),
        market_value: (current * p.qty).toFixed(2),
        unrealized_pl: unrealized_pl.toFixed(2),
        unrealized_plpc: unrealized_plpc.toFixed(4),
        side: "long",
      };
    })
  );
}

export function getPosition(symbol) {
  const acc = loadMockAccount();
  const pos = acc.positions.find(p => p.symbol === symbol);
  if (!pos) return Promise.reject(new Error(`[mock] Posição ${symbol} não encontrada`));
  const current = mockPrice(symbol);
  return Promise.resolve({
    symbol,
    qty: pos.qty.toString(),
    avg_entry_price: pos.avg_entry_price.toString(),
    current_price: current.toString(),
    market_value: (current * pos.qty).toFixed(2),
    unrealized_pl: ((current - pos.avg_entry_price) * pos.qty).toFixed(2),
    unrealized_plpc: (((current - pos.avg_entry_price) / pos.avg_entry_price)).toFixed(4),
  });
}

export function closePosition(symbol) {
  const acc = loadMockAccount();
  const idx = acc.positions.findIndex(p => p.symbol === symbol);
  if (idx === -1) return Promise.reject(new Error(`[mock] Posição ${symbol} não encontrada`));

  const pos = acc.positions[idx];
  const exitPrice = mockPrice(symbol);
  const proceeds = exitPrice * pos.qty;
  const pnl = (exitPrice - pos.avg_entry_price) * pos.qty;

  acc.positions.splice(idx, 1);
  acc.cash = parseFloat((acc.cash + proceeds).toFixed(2));
  acc.equity = parseFloat((acc.cash + acc.positions.reduce((s, p) => s + mockPrice(p.symbol) * p.qty, 0)).toFixed(2));
  saveMockAccount(acc);

  console.log(`[mock] SELL ${pos.qty}x ${symbol} @ $${exitPrice} | P&L: $${pnl.toFixed(2)}`);
  return Promise.resolve({ id: `mock-close-${symbol}`, status: "filled" });
}

export function getOrders() {
  const acc = loadMockAccount();
  return Promise.resolve(acc.orders.filter(o => o.status === "pending"));
}

export function cancelAllOrders() {
  const acc = loadMockAccount();
  acc.orders = acc.orders.map(o => ({ ...o, status: "cancelled" }));
  saveMockAccount(acc);
  return Promise.resolve({ cancelled_orders: acc.orders.length });
}

export function cancelOrdersForTicker(symbol) {
  const acc = loadMockAccount();
  let count = 0;
  acc.orders = acc.orders.map(o => {
    if (o.symbol === symbol && o.status === "pending") {
      count++;
      return { ...o, status: "cancelled" };
    }
    return o;
  });
  saveMockAccount(acc);
  return Promise.resolve(count);
}

export function submitMarketOrder(symbol, qty, side) {
  const acc = loadMockAccount();
  const price = mockPrice(symbol);
  const cost = price * qty;
  const orderId = `mock-${acc.order_seq++}-${symbol}`;

  if (side === "buy") {
    if (acc.cash < cost) {
      return Promise.reject(new Error(`[mock] Cash insuficiente: $${acc.cash.toFixed(2)} < $${cost.toFixed(2)}`));
    }
    acc.cash = parseFloat((acc.cash - cost).toFixed(2));
    const existing = acc.positions.find(p => p.symbol === symbol);
    if (existing) {
      const totalQty = existing.qty + qty;
      existing.avg_entry_price = parseFloat(
        ((existing.avg_entry_price * existing.qty + price * qty) / totalQty).toFixed(4)
      );
      existing.qty = totalQty;
    } else {
      acc.positions.push({ symbol, qty, avg_entry_price: price });
    }
    console.log(`[mock] BUY  ${qty}x ${symbol} @ $${price} | Total: $${cost.toFixed(2)}`);
  } else {
    closePosition(symbol);
    return Promise.resolve({ id: orderId, status: "filled", filled_avg_price: price.toString() });
  }

  acc.equity = parseFloat((acc.cash + acc.positions.reduce((s, p) => s + mockPrice(p.symbol) * p.qty, 0)).toFixed(2));
  saveMockAccount(acc);

  return Promise.resolve({
    id: orderId,
    symbol,
    qty: qty.toString(),
    side,
    type: "market",
    status: "filled",
    filled_avg_price: price.toString(),
    filled_at: new Date().toISOString(),
  });
}

export function submitTrailingStop(symbol, qty, trailPercent = 12) {
  console.log(`[mock] Trailing stop configurado: ${symbol} ${trailPercent}% (${qty} shares)`);
  return Promise.resolve({ id: `mock-trail-${symbol}`, status: "accepted" });
}

export function getSnapshot(symbol) {
  const price = mockPrice(symbol);
  return Promise.resolve({
    latestTrade: { p: price },
    latestQuote: { bp: price - 0.05, ap: price + 0.05 },
    dailyBar: { o: price * 0.99, h: price * 1.01, l: price * 0.98, c: price, v: 1_500_000 },
  });
}

export function getNews(symbol, limit = 5) {
  return Promise.resolve({
    news: [
      {
        headline: `[mock] ${symbol}: Analistas mantêm rating de compra`,
        summary: "Nota de research simulada para testes.",
        created_at: new Date().toISOString(),
        url: "https://example.com",
      },
    ].slice(0, limit),
  });
}

export function getPortfolioHistory(period = "1W") {
  const acc = loadMockAccount();
  return Promise.resolve({
    equity: [acc.last_equity, acc.equity],
    profit_loss: [0, acc.equity - acc.last_equity],
    profit_loss_pct: [0, ((acc.equity - acc.last_equity) / acc.last_equity)],
    timestamp: [Date.now() - 7 * 86400000, Date.now()],
    base_value: acc.last_equity,
  });
}
