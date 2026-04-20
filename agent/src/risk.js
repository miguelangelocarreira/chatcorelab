/**
 * Gestor de risco — Passo 6 (stub)
 * Calcula tamanho de posição, valida drawdown, aplica circuit-breakers.
 */

// TODO Passo 6: implementar positionSize(capital, riskPct, entry, stop)
export function positionSize(_capital, _riskPct, _entry, _stop) {
  throw new Error("risk.js não implementado — ver Passo 6 em strategy.md");
}

export function checkDrawdown(state) {
  return state.risk.drawdown_pct <= state.risk.max_drawdown_pct;
}
