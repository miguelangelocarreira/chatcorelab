/**
 * Alpaca Brokerage API Client — Passo 7 (stub completo)
 * Paper trading endpoint por omissão.
 * Credenciais injetadas via env vars, nunca em ficheiros.
 */

const BASE_URL = process.env.ALPACA_PAPER === "false"
  ? "https://api.alpaca.markets"
  : "https://paper-api.alpaca.markets";

const HEADERS = {
  "APCA-API-KEY-ID": process.env.ALPACA_API_KEY,
  "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY,
  "Content-Type": "application/json",
};

function assertCredentials() {
  if (!process.env.ALPACA_API_KEY || !process.env.ALPACA_SECRET_KEY) {
    throw new Error("ALPACA_API_KEY e ALPACA_SECRET_KEY não definidas nas variáveis de ambiente.");
  }
}

async function request(method, path, body) {
  assertCredentials();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Alpaca ${method} ${path} → ${res.status}: ${err}`);
  }
  return res.json();
}

// Conta e portfolio
export const getAccount = () => request("GET", "/v2/account");
export const getPortfolioHistory = (period = "1W") =>
  request("GET", `/v2/account/portfolio/history?period=${period}&timeframe=1D`);

// Posições
export const getPositions = () => request("GET", "/v2/positions");
export const getPosition = (symbol) => request("GET", `/v2/positions/${symbol}`);
export const closePosition = (symbol) => request("DELETE", `/v2/positions/${symbol}`);

// Ordens
export const getOrders = (status = "open") =>
  request("GET", `/v2/orders?status=${status}&limit=50`);
export const cancelAllOrders = () => request("DELETE", "/v2/orders");

export async function submitMarketOrder(symbol, qty, side) {
  return request("POST", "/v2/orders", {
    symbol,
    qty: qty.toString(),
    side,         // "buy" | "sell"
    type: "market",
    time_in_force: "day",
  });
}

export async function submitTrailingStop(symbol, qty, trailPercent = 12) {
  return request("POST", "/v2/orders", {
    symbol,
    qty: qty.toString(),
    side: "sell",
    type: "trailing_stop",
    trail_percent: trailPercent.toString(),
    time_in_force: "gtc",
  });
}

// Dados de mercado (via Alpaca Data API)
export const getSnapshot = (symbol) =>
  fetch(`https://data.alpaca.markets/v2/stocks/${symbol}/snapshot`, {
    headers: HEADERS,
  }).then(r => r.json());

// Notícias (para verificar catalisadores e earnings proximity)
export const getNews = (symbol, limit = 5) =>
  fetch(`https://data.alpaca.markets/v1beta1/news?symbols=${symbol}&limit=${limit}`, {
    headers: HEADERS,
  }).then(r => r.json());
