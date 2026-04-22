/**
 * Loop principal do agente — Passo 8
 *
 * Uso:
 *   ROUTINE=premarket    node agent/src/agent.js
 *   ROUTINE=market_open  node agent/src/agent.js
 *   ROUTINE=midday       node agent/src/agent.js
 *   ROUTINE=close        node agent/src/agent.js
 *   ROUTINE=weekly       node agent/src/agent.js
 *
 * Em modo mock: ALPACA_PAPER_MOCK=true ROUTINE=market_open node agent/src/agent.js
 */

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  readState, writeState, readPositions, writePositions,
  appendTrade, appendToTradeLog, appendToResearchLog,
  updateAgentStateMd, readMemoryFiles,
} from "./memory.js";
import { validateOrder, calcPositionSize, stopLossPrice } from "./risk.js";
import settings from "../config/settings.json" with { type: "json" };

function loadJson(relPath) {
  return JSON.parse(readFileSync(resolve(process.cwd(), relPath), "utf-8"));
}

// Seleciona o cliente Alpaca: mock ou real
const USE_MOCK = process.env.ALPACA_PAPER_MOCK === "true"
  || !process.env.ALPACA_API_KEY;

const alpaca = USE_MOCK
  ? await import("../../scripts/mock_alpaca.js")
  : await import("../../scripts/alpaca_api.js");

const ROUTINE = process.env.ROUTINE;
const VALID_ROUTINES = ["premarket", "market_open", "midday", "close", "weekly"];

// ─── Guardrails ─────────────────────────────────────────────────────────────

function isInWhitelist(ticker) {
  const { tickers } = loadJson("data/sp500_whitelist.json");
  return tickers.includes(ticker.toUpperCase());
}

// ─── Rotinas ────────────────────────────────────────────────────────────────

async function runPremarket() {
  log("PRE-MARKET RESEARCH (06:00 ET)");
  const state = readState();
  const mem = readMemoryFiles();

  let briefing;
  if (USE_MOCK || !process.env.TAVILY_API_KEY) {
    briefing = "[MOCK] Futuros S&P 500: +0.3%. Sem dados macro hoje. Fed sem discursos agendados.";
  } else {
    const { getMarketBriefing } = await import("../../scripts/tavily_research.js");
    briefing = await getMarketBriefing(today());
  }

  log("Briefing macro:", briefing);

  // Scoring fundamentalista da watchlist
  let topPicks = [];
  if (!USE_MOCK && process.env.TAVILY_API_KEY) {
    const { screenWatchlist } = await import("./screener.js");
    const { researchStock } = await import("../../scripts/tavily_research.js");
    log("A fazer screening da watchlist...");
    const scores = await screenWatchlist(researchStock);
    topPicks = scores.filter(s => s.score > 0).slice(0, 5);
    log(`Screening completo. Top picks: ${topPicks.map(s => `${s.ticker}(${s.score})`).join(", ") || "nenhum"}`);
  }

  appendToResearchLog(`
### Research ${today()} — Pre-Market Briefing
**Fonte**: ${USE_MOCK || !process.env.TAVILY_API_KEY ? "MOCK" : "Tavily"}
**Contexto macro**: ${briefing}
**Top picks hoje**: ${topPicks.length ? topPicks.map(s => `${s.ticker} (score ${s.score})`).join(", ") : "screening não disponível"}
`);

  const cycle = state.cycle + 1;
  writeState({ ...state, cycle, status: "PREMARKET_DONE" });
  updateAgentStateMd({
    cycle, phase: state.phase, status: "PREMARKET_DONE",
    capital: { current: state.capital.current, initial: state.capital.initial, drawdown_pct: state.risk.drawdown_pct },
    openPositions: state.risk.open_positions,
    note: `Pre-market concluído. Top picks: ${topPicks.map(s => s.ticker).join(", ") || "nenhum"}`,
    nextRoutine: "Market Open (08:30 ET)",
  });

  log("Concluído. Próxima rotina: 08:30 Market Open.");
}

async function runMarketOpen() {
  log("MARKET OPEN EXECUTION (08:30 ET)");

  if (!await validateContext()) return;

  const state = readState();

  // Verificação de guardrails globais
  const { valid, errors } = validateOrder({}, state);
  if (!valid) {
    log("ORDENS BLOQUEADAS pelos guardrails:", errors.join("; "));
    return;
  }

  const account = await alpaca.getAccount();
  const equity = parseFloat(account.equity);
  log(`Portfolio: $${equity.toFixed(2)}`);

  const positions = await alpaca.getPositions();
  const openTickers = new Set(positions.map(p => p.symbol));
  const slotsAvailable = settings.risk.max_open_positions - positions.length;

  if (slotsAvailable <= 0) {
    log(`Sem slots disponíveis (${positions.length}/${settings.risk.max_open_positions} posições).`);
  } else if (USE_MOCK) {
    // Mock: usa AAPL e MSFT como demonstração
    for (const ticker of ["AAPL", "MSFT"].filter(t => !openTickers.has(t)).slice(0, slotsAvailable)) {
      await executeBuy(ticker, equity, "MOCK — demonstração do sistema");
    }
  } else {
    // Real: usa scores do premarket
    const { loadPremarketScores } = await import("./screener.js");
    const scores = loadPremarketScores();

    if (!scores) {
      log("AVISO: scores de premarket não disponíveis para hoje. Sem novas compras.");
    } else {
      const candidates = scores
        .filter(s => s.score > 0 && !openTickers.has(s.ticker) && isInWhitelist(s.ticker))
        .slice(0, Math.min(slotsAvailable, 2)); // máx 2 compras por dia

      if (candidates.length === 0) {
        log("Nenhum candidato com score positivo hoje. Sem compras.");
      }

      for (const candidate of candidates) {
        await executeBuy(candidate.ticker, equity, `Score ${candidate.score} — ${candidate.summary.slice(0, 120)}`);
      }
    }
  }

  async function executeBuy(ticker, portfolioEquity, rationale) {
    try {
      const snap = await alpaca.getSnapshot(ticker);
      const price = snap.latestTrade.p;
      const qty = calcPositionSize(portfolioEquity, price);
      if (qty < 1) { log(`Sem capital para ${ticker}`); return; }

      const order = await alpaca.submitMarketOrder(ticker, qty, "buy");
      await alpaca.submitTrailingStop(ticker, qty, settings.risk.trailing_stop_pct);

      appendToTradeLog(`
### Trade — ${ticker} LONG
- **Data entrada**: ${now()}
- **Preço entrada**: $${price}
- **Quantidade**: ${qty} shares
- **Capital alocado**: $${(price * qty).toFixed(2)} (${((price * qty / portfolioEquity) * 100).toFixed(1)}%)
- **Stop-loss**: $${stopLossPrice(price).toFixed(2)} (-${settings.risk.stop_loss_pct}%)
- **Trailing stop**: ${settings.risk.trailing_stop_pct}%
- **Racional**: ${rationale}
- **Order ID**: ${order.id}
`);
      log(`BUY ${qty}x ${ticker} @ $${price} | ${rationale.slice(0, 60)}`);
    } catch (e) {
      log(`ERRO ao comprar ${ticker}:`, e.message);
    }
  }

  const updatedState = readState();
  const updatedPositions = await alpaca.getPositions();
  updatedState.risk.open_positions = updatedPositions.length;
  updatedState.capital.current = parseFloat((await alpaca.getAccount()).equity);
  writeState({ ...updatedState, cycle: updatedState.cycle + 1 });

  updateAgentStateMd({
    cycle: updatedState.cycle,
    phase: updatedState.phase,
    status: "MARKET_OPEN_DONE",
    capital: { current: updatedState.capital.current, initial: updatedState.capital.initial, drawdown_pct: 0 },
    openPositions: updatedPositions.length,
    note: `Market open: ${updatedPositions.length} posições abertas.`,
    nextRoutine: "Midday Adjustment (12:00 ET)",
  });

  log(`Concluído. Posições abertas: ${updatedPositions.length}.`);
}

async function runMidday() {
  log("MIDDAY ADJUSTMENT (12:00 ET)");

  if (!await validateContext()) return;

  const state = readState();
  const positions = await alpaca.getPositions();
  let cuts = 0;

  for (const pos of positions) {
    const pnlPct = parseFloat(pos.unrealized_plpc) * 100;
    log(`${pos.symbol}: ${pnlPct.toFixed(2)}%`);

    // Guardrail: corte mandatório a -7%
    if (pnlPct <= -settings.risk.stop_loss_pct) {
      log(`CORTE OBRIGATÓRIO: ${pos.symbol} ${pnlPct.toFixed(2)}%`);
      await alpaca.closePosition(pos.symbol);
      appendToTradeLog(`
### Corte Mandatório — ${pos.symbol} (${pnlPct.toFixed(2)}%)
- **Data**: ${now()}
- **Motivo**: Guardrail -${settings.risk.stop_loss_pct}% atingido
- **Preço saída**: $${pos.current_price}
`);
      cuts++;
    }
  }

  updateAgentStateMd({
    cycle: state.cycle + 1,
    phase: state.phase,
    status: "MIDDAY_DONE",
    capital: { current: state.capital.current, initial: state.capital.initial, drawdown_pct: state.risk.drawdown_pct },
    openPositions: positions.length - cuts,
    note: `Midday: ${cuts} corte(s) mandatório(s). ${positions.length - cuts} posições mantidas.`,
    nextRoutine: "Market Close (15:00 ET)",
  });

  writeState({ ...state, cycle: state.cycle + 1, risk: { ...state.risk, open_positions: positions.length - cuts } });
  log(`Concluído. Cortes: ${cuts}.`);
}

async function runMarketClose() {
  log("MARKET CLOSE (15:00 ET)");
  const state = readState();
  const account = await alpaca.getAccount();
  const equity = parseFloat(account.equity);
  const lastEquity = parseFloat(account.last_equity);
  const pnlDay = equity - lastEquity;
  const pnlDayPct = (pnlDay / lastEquity) * 100;

  log(`P&L do dia: $${pnlDay.toFixed(2)} (${pnlDayPct.toFixed(2)}%)`);

  // Daily loss cap
  if (pnlDayPct < -settings.risk.daily_loss_cap_pct) {
    log(`DAILY LOSS CAP ATINGIDO: ${pnlDayPct.toFixed(2)}%. Cancelando ordens.`);
    await alpaca.cancelAllOrders();
    if (process.env.CLICKUP_API_TOKEN) {
      const { alertDailyLossCap } = await import("../../scripts/clickup_alerts.js");
      await alertDailyLossCap(pnlDayPct).catch(e => log("ClickUp alert falhou:", e.message));
    }
  }

  // Resumo diário no ClickUp
  if (process.env.CLICKUP_API_TOKEN) {
    const { sendDailySummary } = await import("../../scripts/clickup_alerts.js");
    await sendDailySummary(today(), pnlDay, pnlDayPct, 0, equity)
      .catch(e => log("ClickUp summary falhou:", e.message));
  }

  appendToResearchLog(`
### Fecho de Mercado — ${today()}
**P&L dia**: $${pnlDay.toFixed(2)} (${pnlDayPct.toFixed(2)}%)
**Capital final**: $${equity.toFixed(2)}
**Daily cap atingido**: ${pnlDayPct < -settings.risk.daily_loss_cap_pct ? "Sim" : "Não"}
`);

  const updatedState = { ...state, capital: { ...state.capital, current: equity }, cycle: state.cycle + 1 };
  writeState(updatedState);

  updateAgentStateMd({
    cycle: updatedState.cycle,
    phase: updatedState.phase,
    status: "IDLE",
    capital: { current: equity, initial: state.capital.initial, drawdown_pct: ((state.capital.initial - equity) / state.capital.initial) * 100 },
    openPositions: (await alpaca.getPositions()).length,
    note: `Fecho: P&L ${pnlDayPct.toFixed(2)}% | Capital $${equity.toFixed(2)}`,
    nextRoutine: "Pre-Market Research (amanhã 06:00 ET)",
  });

  // Persistência atómica — push para GitHub
  atomicPush();
  log(`Concluído. Capital: $${equity.toFixed(2)}. Memória persistida.`);
}

async function runWeeklyReview() {
  log("WEEKLY REVIEW (Sexta 16:00 ET)");
  const state = readState();
  const tradesDb = loadJson(settings.paths.trades_json);

  const stats = tradesDb.stats;
  log(`Trades semana: ${stats.total} | Win rate: ${stats.win_rate_pct}% | P&L: $${stats.total_pnl}`);

  appendToResearchLog(`
### Weekly Review — ${today()}
**Performance total**: $${stats.total_pnl} | Win rate: ${stats.win_rate_pct}%
**Trades**: ${stats.total} (${stats.wins} wins, ${stats.losses} losses)
`);

  if (process.env.CLICKUP_API_TOKEN) {
    const { sendWeeklySummary } = await import("../../scripts/clickup_alerts.js");
    await sendWeeklySummary({
      week: today(),
      content: `P&L total: $${stats.total_pnl}\nWin rate: ${stats.win_rate_pct}%\nTrades: ${stats.total} (${stats.wins} wins, ${stats.losses} losses)\nCapital: $${state.capital.current}`,
    }).catch(e => log("ClickUp weekly falhou:", e.message));
  }

  updateAgentStateMd({
    cycle: state.cycle + 1,
    phase: state.phase,
    status: "IDLE",
    capital: { current: state.capital.current, initial: state.capital.initial, drawdown_pct: state.risk.drawdown_pct },
    openPositions: state.risk.open_positions,
    note: `Weekly review: ${stats.total} trades | $${stats.total_pnl} P&L`,
    nextRoutine: "Pre-Market Research (segunda 06:00 ET)",
  });

  writeState({ ...state, cycle: state.cycle + 1 });
  atomicPush();
  log("Weekly review concluído. Memória persistida.");
}

// ─── Validação de Contexto ───────────────────────────────────────────────────

async function validateContext() {
  const state = readState();

  // Verifica se o push anterior falhou
  if (state.persist_ok === false) {
    const msg = `⚠️ CONTEXTO INVÁLIDO: o push anterior falhou (ciclo ${state.cycle}). Trades suspensos até confirmação manual.`;
    log(msg);
    if (process.env.CLICKUP_API_TOKEN) {
      const { alertDailyLossCap } = await import("../../scripts/clickup_alerts.js");
      // Reutiliza alerta de alta prioridade para notificar
      const { createTask } = await import("../../scripts/clickup_alerts.js").catch(() => null) || {};
      await fetch(`https://api.clickup.com/api/v2/list/${process.env.CLICKUP_LIST_ID}/task`, {
        method: "POST",
        headers: { Authorization: process.env.CLICKUP_API_TOKEN, "Content-Type": "application/json" },
        body: JSON.stringify({ name: msg, description: `Ciclo: ${state.cycle}\nData: ${now()}\nAção necessária: verificar o repositório GitHub e repor persist_ok: true em agent/memory/state.json`, priority: 1, status: "to do" }),
      }).catch(e => log("ClickUp alerta falhou:", e.message));
    }
    return false;
  }

  return true;
}

// ─── Persistência Atómica ────────────────────────────────────────────────────

async function atomicPush() {
  const state = readState();
  try {
    const msg = `chore: atomic persist — ciclo ${state.cycle} [${now()}]`;
    execSync(`git add memory/ AGENT_STATE.md agent/memory/ && git commit -m "${msg}" --allow-empty`, { stdio: "pipe" });
    execSync("git push origin HEAD", { stdio: "pipe" });
    // Marca persist como OK
    writeState({ ...readState(), persist_ok: true });
    log("Git push atómico: OK");
  } catch (e) {
    log("AVISO: git push falhou —", e.message.slice(0, 100));
    // Marca falha — o workflow Persist memory vai commitar este flag
    writeState({ ...readState(), persist_ok: false });
    if (process.env.CLICKUP_API_TOKEN) {
      await fetch(`https://api.clickup.com/api/v2/list/${process.env.CLICKUP_LIST_ID}/task`, {
        method: "POST",
        headers: { Authorization: process.env.CLICKUP_API_TOKEN, "Content-Type": "application/json" },
        body: JSON.stringify({ name: `🚨 PUSH FALHOU — memória pode estar desatualizada (ciclo ${state.cycle})`, description: `O agente não conseguiu persistir o estado no GitHub.\nTrades suspensos na próxima rotina até resolução manual.\nData: ${now()}`, priority: 1, status: "to do" }),
      }).catch(() => {});
    }
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(...args) {
  console.log(`[agent][${now()}]`, ...args);
}

function now() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Entry Point ─────────────────────────────────────────────────────────────

async function main() {
  log(`Iniciando rotina: ${ROUTINE ?? "(nenhuma)"} | mock: ${USE_MOCK}`);

  const state = readState();
  if (state.phase === "SETUP") {
    log("AVISO: fase SETUP — a correr em modo de demonstração.");
  }

  if (!ROUTINE || !VALID_ROUTINES.includes(ROUTINE)) {
    log(`ROUTINE inválida. Usar: ${VALID_ROUTINES.join(" | ")}`);
    process.exit(1);
  }

  const routines = {
    premarket:   runPremarket,
    market_open: runMarketOpen,
    midday:      runMidday,
    close:       runMarketClose,
    weekly:      runWeeklyReview,
  };

  await routines[ROUTINE]();
}

main().catch(err => {
  console.error("[agent] ERRO FATAL:", err.message);
  process.exit(1);
});
