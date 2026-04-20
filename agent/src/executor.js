/**
 * Motor de execução — Passo 7
 * Ponte entre decisão do agente e Alpaca API.
 * Aplica guardrails via risk.js antes de submeter ordens.
 */
import { submitMarketOrder, submitTrailingStop } from "../../scripts/alpaca_api.js";
import { validateOrder, calcPositionSize, stopLossPrice } from "./risk.js";
import { readState, writePositions, appendTrade } from "./memory.js";
import settings from "../config/settings.json" assert { type: "json" };

export async function openPosition(ticker, pricePerShare, thesis) {
  const state = readState();
  const { valid, errors } = validateOrder({}, state);

  if (!valid) {
    throw new Error(`Ordem recusada pelos guardrails: ${errors.join("; ")}`);
  }

  const qty = calcPositionSize(state.capital.current, pricePerShare);
  if (qty < 1) throw new Error(`Capital insuficiente para 1 share de ${ticker} @ $${pricePerShare}`);

  const order = await submitMarketOrder(ticker, qty, "buy");
  await submitTrailingStop(ticker, qty, settings.risk.trailing_stop_pct);

  const position = {
    id: order.id,
    ticker,
    qty,
    entry_price: pricePerShare,
    stop_loss: stopLossPrice(pricePerShare),
    thesis,
    opened_at: new Date().toISOString(),
  };

  const positions = (await import("../../agent/memory/positions.json", { assert: { type: "json" } })).default;
  positions.open.push(position);
  writePositions(positions);

  return position;
}

export async function closePosition(ticker, exitPrice, reason) {
  const positions = (await import("../../agent/memory/positions.json", { assert: { type: "json" } })).default;
  const pos = positions.open.find(p => p.ticker === ticker);
  if (!pos) throw new Error(`Posição ${ticker} não encontrada`);

  await submitMarketOrder(ticker, pos.qty, "sell");

  const pnl = (exitPrice - pos.entry_price) * pos.qty;
  const pnlPct = ((exitPrice - pos.entry_price) / pos.entry_price) * 100;

  appendTrade({
    ticker,
    qty: pos.qty,
    entry_price: pos.entry_price,
    exit_price: exitPrice,
    pnl,
    pnl_pct: pnlPct,
    reason,
    thesis: pos.thesis,
    opened_at: pos.opened_at,
    closed_at: new Date().toISOString(),
  });

  positions.open = positions.open.filter(p => p.ticker !== ticker);
  writePositions(positions);

  return { pnl, pnlPct };
}
