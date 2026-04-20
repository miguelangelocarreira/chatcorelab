/**
 * Gestor de risco — Passo 6
 * Aplica guardrails definidos no CLAUDE.md antes de qualquer ordem.
 */
import settings from "../config/settings.json" assert { type: "json" };

const R = settings.risk;

export function calcPositionSize(capitalTotal, pricePerShare) {
  const allocation = capitalTotal * (R.max_position_pct / 100);
  return Math.floor(allocation / pricePerShare);
}

export function checkDailyLossCap(portfolioPnlPct) {
  return Math.abs(portfolioPnlPct) < R.daily_loss_cap_pct;
}

export function checkMaxDrawdown(drawdownPct) {
  return Math.abs(drawdownPct) < R.max_drawdown_pct;
}

export function checkPositionSize(positionValueUsd, totalCapital) {
  return (positionValueUsd / totalCapital) * 100 <= R.max_position_pct;
}

export function checkOpenPositions(currentCount) {
  return currentCount < R.max_open_positions;
}

export function stopLossPrice(entryPrice) {
  return entryPrice * (1 - R.stop_loss_pct / 100);
}

export function partialTpPrice(entryPrice) {
  return entryPrice * (1 + R.partial_tp_pct / 100);
}

export function validateOrder(order, state) {
  const errors = [];
  if (!checkDailyLossCap(state.risk.daily_pnl_pct ?? 0))
    errors.push(`Daily loss cap atingido (${R.daily_loss_cap_pct}%)`);
  if (!checkMaxDrawdown(state.risk.drawdown_pct))
    errors.push(`Drawdown máximo atingido (${R.max_drawdown_pct}%)`);
  if (!checkOpenPositions(state.risk.open_positions))
    errors.push(`Máximo de posições abertas atingido (${R.max_open_positions})`);
  return { valid: errors.length === 0, errors };
}
