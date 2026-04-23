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

  // Atualizar calendário de earnings via Tavily (1 call, antes do screener)
  if (!USE_MOCK && process.env.TAVILY_API_KEY) {
    try {
      const { updateEarningsCalendar } = await import("../../scripts/earnings_updater.js");
      const { stocks } = loadJson("data/watchlist.json");
      const tickers = stocks.map(s => s.ticker);
      const result = await updateEarningsCalendar(tickers);
      if (result) log(`Earnings calendar atualizado: ${result.found} datas encontradas (${result.earnings.map(e => `${e.ticker} ${e.date}`).join(", ") || "nenhuma"})`);
    } catch (e) {
      log("AVISO: atualização do earnings calendar falhou:", e.message, "— a usar dados existentes");
    }
  }

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
    // Real: usa scores do premarket + Claude Opus 4.7 reasoning
    const { loadPremarketScores } = await import("./screener.js");
    const scores = loadPremarketScores();

    if (!scores) {
      log("AVISO: scores de premarket não disponíveis para hoje. Sem novas compras.");
    } else {
      // Log stocks em earnings blackout
      scores
        .filter(s => s.earningsBlackout)
        .forEach(s => log(`BLACKOUT: ${s.ticker} tem earnings em ${s.earningsDaysAway} dia(s) — excluído`));

      if (process.env.ANTHROPIC_API_KEY) {
        // Claude Opus 4.7: raciocínio fundamentalista completo com adaptive thinking
        const { analyzeAndDecide } = await import("../../scripts/claude_reasoning.js");
        const mem = readMemoryFiles();
        let decision = null;
        try {
          log("Claude: a analisar mercado com Opus 4.7...");
          decision = await analyzeAndDecide({
            date: today(),
            equity,
            positions,
            scores: scores.filter(s => isInWhitelist(s.ticker)),
            tradeLog: mem.tradeLog,
            strategy: mem.strategy,
            instructions: mem.instructions,
            briefing: mem.researchLog.split("\n").slice(-30).join("\n"),
          });
          log(`Claude: ${decision.action}${decision.ticker ? ` → ${decision.ticker}` : ""} | confiança ${(decision.confidence * 100).toFixed(0)}%`);
          log(`Claude: ${decision.reasoning}`);
          appendToResearchLog(`\n### Claude Decision — ${today()}\n**Ação**: ${decision.action}${decision.ticker ? ` → ${decision.ticker}` : ""}\n**Confiança**: ${(decision.confidence * 100).toFixed(0)}%\n**Raciocínio**: ${decision.reasoning}\n**Riscos**: ${(decision.risks || []).join("; ")}\n`);
        } catch (e) {
          log("Claude reasoning falhou:", e.message, "— fallback para keyword scoring");
        }

        if (decision?.action === "BUY" && decision.ticker) {
          const ticker = decision.ticker.toUpperCase();
          // Guardrails forçados em código — Claude não pode contorná-los
          if (!isInWhitelist(ticker)) {
            log(`GUARDRAIL: ${ticker} fora da whitelist S&P 500 — bloqueado`);
          } else if (scores.find(s => s.ticker === ticker)?.earningsBlackout) {
            log(`GUARDRAIL: ${ticker} em blackout de earnings — bloqueado`);
          } else if (openTickers.has(ticker)) {
            log(`${ticker} já em carteira — sem compra`);
          } else {
            await executeBuy(ticker, equity, `Claude Opus 4.7 — ${decision.reasoning.slice(0, 120)}`);
          }
        } else if (decision?.action === "NO_ACTION") {
          log(`Claude: sem oportunidade hoje. Riscos: ${(decision.risks || []).join(", ")}`);
        } else if (!decision) {
          // Fallback: keyword scoring (quando Claude falha)
          const candidates = scores
            .filter(s => s.score > 0 && !openTickers.has(s.ticker) && isInWhitelist(s.ticker) && !s.earningsBlackout)
            .slice(0, 1);
          if (candidates.length === 0) {
            log("Nenhum candidato com score positivo hoje. Sem compras.");
          }
          for (const c of candidates) {
            await executeBuy(c.ticker, equity, `Score ${c.score} — ${c.summary.slice(0, 120)}`);
          }
        }
      } else {
        // Sem ANTHROPIC_API_KEY: fallback para keyword scoring
        log("AVISO: ANTHROPIC_API_KEY não definida — usando keyword scoring");
        const candidates = scores
          .filter(s => s.score > 0 && !openTickers.has(s.ticker) && isInWhitelist(s.ticker) && !s.earningsBlackout)
          .slice(0, 1);
        if (candidates.length === 0) {
          log("Nenhum candidato com score positivo hoje (ou todos em blackout). Sem compras.");
        }
        for (const c of candidates) {
          await executeBuy(c.ticker, equity, `Score ${c.score} — ${c.summary.slice(0, 120)}`);
        }
      }
    }
  }

  async function executeBuy(ticker, portfolioEquity, rationale) {
    try {
      // Cancelar ordens abertas para este ticker antes de comprar (evita conflitos)
      const cancelled = await alpaca.cancelOrdersForTicker(ticker);
      if (cancelled > 0) log(`${ticker}: ${cancelled} ordem(ns) abertas canceladas`);

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
  let partials = 0;

  for (const pos of positions) {
    const pnlPct = parseFloat(pos.unrealized_plpc) * 100;
    const qty = parseInt(pos.qty);
    log(`${pos.symbol}: ${pnlPct.toFixed(2)}% (${qty} shares)`);

    // Guardrail: corte mandatório a -7%
    if (pnlPct <= -settings.risk.stop_loss_pct) {
      log(`CORTE OBRIGATÓRIO: ${pos.symbol} ${pnlPct.toFixed(2)}%`);
      await alpaca.closePosition(pos.symbol);
      const realizedPnl = parseFloat(pos.unrealized_pl);
      appendTrade({
        ticker: pos.symbol,
        side: "sell",
        reason: "stop_loss",
        qty,
        entry_price: parseFloat(pos.avg_entry_price),
        exit_price: parseFloat(pos.current_price),
        pnl: realizedPnl,
        pnl_pct: pnlPct,
      });
      appendToTradeLog(`
### Corte Mandatório — ${pos.symbol} (${pnlPct.toFixed(2)}%)
- **Data**: ${now()}
- **Motivo**: Guardrail -${settings.risk.stop_loss_pct}% atingido
- **Preço saída**: $${pos.current_price}
- **P&L realizado**: $${realizedPnl.toFixed(2)}
`);
      cuts++;

    // Take-profit parcial: vender 50% quando lucro > 15%
    } else if (pnlPct >= settings.risk.partial_tp_pct && qty >= 2) {
      const sellQty = Math.floor(qty / 2);
      log(`TAKE-PROFIT PARCIAL: ${pos.symbol} +${pnlPct.toFixed(2)}% — vendendo ${sellQty} de ${qty} shares`);
      await alpaca.submitMarketOrder(pos.symbol, sellQty, "sell");
      const entryPrice = parseFloat(pos.avg_entry_price);
      const exitPrice = parseFloat(pos.current_price);
      const partialPnl = (exitPrice - entryPrice) * sellQty;
      appendTrade({
        ticker: pos.symbol,
        side: "sell",
        reason: "take_profit_partial",
        qty: sellQty,
        entry_price: entryPrice,
        exit_price: exitPrice,
        pnl: partialPnl,
        pnl_pct: pnlPct,
      });
      appendToTradeLog(`
### Take-Profit Parcial — ${pos.symbol} (+${pnlPct.toFixed(2)}%)
- **Data**: ${now()}
- **Motivo**: Target +${settings.risk.partial_tp_pct}% atingido
- **Vendido**: ${sellQty} shares (50%) @ $${pos.current_price}
- **P&L realizado**: $${partialPnl.toFixed(2)}
- **Mantido**: ${qty - sellQty} shares (deixar correr com trailing stop ${settings.risk.trailing_stop_pct}%)
`);
      partials++;
    }
  }

  updateAgentStateMd({
    cycle: state.cycle + 1,
    phase: state.phase,
    status: "MIDDAY_DONE",
    capital: { current: state.capital.current, initial: state.capital.initial, drawdown_pct: state.risk.drawdown_pct },
    openPositions: positions.length - cuts,
    note: `Midday: ${cuts} corte(s), ${partials} take-profit(s) parcial(is). ${positions.length - cuts} posições mantidas.`,
    nextRoutine: "Market Close (15:00 ET)",
  });

  writeState({ ...state, cycle: state.cycle + 1, risk: { ...state.risk, open_positions: positions.length - cuts } });
  log(`Concluído. Cortes: ${cuts} | Take-profits parciais: ${partials}.`);
}

async function getSPYDailyChangePct() {
  try {
    const snap = await alpaca.getSnapshot("SPY");
    const bar = snap.dailyBar;
    if (bar && bar.o && bar.c) return ((bar.c - bar.o) / bar.o) * 100;
    return 0;
  } catch (e) {
    log("SPY snapshot falhou:", e.message);
    return 0;
  }
}

async function runMarketClose() {
  log("MARKET CLOSE (15:00 ET)");
  const state = readState();
  const account = await alpaca.getAccount();
  const equity = parseFloat(account.equity);
  const lastEquity = parseFloat(account.last_equity);
  const pnlDay = equity - lastEquity;
  const pnlDayPct = (pnlDay / lastEquity) * 100;
  const spyPct = await getSPYDailyChangePct();
  const positions = await alpaca.getPositions();
  const tradesDb = loadJson(settings.paths.trades_json);
  const closedToday = tradesDb.trades.filter(t => t.timestamp?.slice(0, 10) === today()).length;
  const totalPnl = equity - state.capital.initial;

  log(`P&L do dia: $${pnlDay.toFixed(2)} (${pnlDayPct.toFixed(2)}%) | SPY: ${spyPct.toFixed(2)}%`);
  log(`vs Benchmark: ${(pnlDayPct - spyPct).toFixed(2)}% (${pnlDayPct >= spyPct ? "✓ outperform" : "✗ underperform"})`);

  // Max drawdown guardrail — verifica antes de tudo
  if (await checkMaxDrawdown(equity, state.capital.initial)) {
    atomicPush();
    return;
  }

  // Daily loss cap
  if (pnlDayPct < -settings.risk.daily_loss_cap_pct) {
    log(`DAILY LOSS CAP ATINGIDO: ${pnlDayPct.toFixed(2)}%. Cancelando ordens.`);
    await alpaca.cancelAllOrders();
    if (process.env.CLICKUP_API_TOKEN) {
      const { alertDailyLossCap } = await import("../../scripts/clickup_alerts.js");
      await alertDailyLossCap(pnlDayPct).catch(e => log("ClickUp alert falhou:", e.message));
    }
  }

  // Resumo diário no ClickUp com SPY real
  if (process.env.CLICKUP_API_TOKEN) {
    const { sendDailySummary: clickupSummary } = await import("../../scripts/clickup_alerts.js");
    await clickupSummary(today(), pnlDay, pnlDayPct, spyPct, equity)
      .catch(e => log("ClickUp summary falhou:", e.message));
  }

  // Resumo diário no Telegram
  if (process.env.TELEGRAM_BOT_TOKEN) {
    log("Telegram: a enviar resumo diário...");
    const { sendDailySummary: telegramSummary } = await import("../../scripts/telegram_alerts.js");
    await telegramSummary(today(), pnlDay, pnlDayPct, spyPct, equity, positions, closedToday, totalPnl)
      .catch(e => log("Telegram summary falhou:", e.message));
    log("Telegram: enviado.");
  } else {
    log("Telegram: TELEGRAM_BOT_TOKEN não definido — a saltar.");
  }

  appendToResearchLog(`
### Fecho de Mercado — ${today()}
**P&L dia**: $${pnlDay.toFixed(2)} (${pnlDayPct.toFixed(2)}%)
**SPY dia**: ${spyPct.toFixed(2)}%
**vs Benchmark**: ${(pnlDayPct - spyPct).toFixed(2)}% (${pnlDayPct >= spyPct ? "outperform" : "underperform"})
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

function selfGrade(winRatePct, capitalCurrent, capitalInitial) {
  const totalReturnPct = ((capitalCurrent - capitalInitial) / capitalInitial) * 100;
  if (winRatePct >= 60 && totalReturnPct > 2)  return "A";
  if (winRatePct >= 50 && totalReturnPct > 0)  return "B";
  if (winRatePct >= 40 || totalReturnPct >= 0) return "C";
  if (winRatePct >= 30 || totalReturnPct > -5) return "D";
  return "F";
}

async function runWeeklyReview() {
  log("WEEKLY REVIEW (Sexta 16:00 ET)");
  const state = readState();
  const tradesDb = loadJson(settings.paths.trades_json);
  const spyPct = await getSPYDailyChangePct();

  const stats = tradesDb.stats;
  const grade = selfGrade(stats.win_rate_pct, state.capital.current, state.capital.initial);
  const totalReturnPct = ((state.capital.current - state.capital.initial) / state.capital.initial) * 100;

  log(`Trades semana: ${stats.total} | Win rate: ${stats.win_rate_pct}% | P&L: $${stats.total_pnl} | Nota: ${grade}`);

  appendToResearchLog(`
### Weekly Review — ${today()}
**Performance total**: $${stats.total_pnl} (${totalReturnPct.toFixed(2)}% desde início)
**Win rate**: ${stats.win_rate_pct}% | **Trades**: ${stats.total} (${stats.wins} wins, ${stats.losses} losses)
**Auto-avaliação**: ${grade}
**SPY hoje**: ${spyPct.toFixed(2)}%
`);

  if (process.env.CLICKUP_API_TOKEN) {
    const { sendWeeklySummary: clickupWeekly } = await import("../../scripts/clickup_alerts.js");
    await clickupWeekly({
      week: today(),
      content: `Nota da semana: ${grade}\nP&L total: $${stats.total_pnl} (${totalReturnPct.toFixed(2)}%)\nWin rate: ${stats.win_rate_pct}%\nTrades: ${stats.total} (${stats.wins} wins, ${stats.losses} losses)\nCapital: $${state.capital.current}`,
    }).catch(e => log("ClickUp weekly falhou:", e.message));
  }

  if (process.env.TELEGRAM_BOT_TOKEN) {
    const { sendWeeklySummary: telegramWeekly } = await import("../../scripts/telegram_alerts.js");
    await telegramWeekly(today(), grade, totalReturnPct, stats.win_rate_pct, stats.total, state.capital.current)
      .catch(e => log("Telegram weekly falhou:", e.message));
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

  // Verifica suspensão por max drawdown
  if (state.suspended === true) {
    const msg = `🚨 AGENTE SUSPENSO: max drawdown atingido. Retomar manualmente em agent/memory/state.json (suspended: false).`;
    log(msg);
    return false;
  }

  // Verifica se o push anterior falhou
  if (state.persist_ok === false) {
    const msg = `⚠️ CONTEXTO INVÁLIDO: o push anterior falhou (ciclo ${state.cycle}). Trades suspensos até confirmação manual.`;
    log(msg);
    if (process.env.CLICKUP_API_TOKEN) {
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

// ─── Max Drawdown Guardrail ──────────────────────────────────────────────────

async function checkMaxDrawdown(equity, capitalInitial) {
  const drawdownPct = ((capitalInitial - equity) / capitalInitial) * 100;
  if (drawdownPct < settings.risk.max_drawdown_pct) return false;

  log(`🚨 MAX DRAWDOWN ATINGIDO: -${drawdownPct.toFixed(2)}% (limite: -${settings.risk.max_drawdown_pct}%)`);

  // Cancelar todas as ordens abertas e fechar posições
  try {
    await alpaca.cancelAllOrders();
    const openPositions = await alpaca.getPositions();
    for (const pos of openPositions) {
      await alpaca.closePosition(pos.symbol);
      log(`Posição fechada por max drawdown: ${pos.symbol}`);
    }
  } catch (e) {
    log("Erro ao fechar posições no max drawdown:", e.message);
  }

  // Suspender agente
  const state = readState();
  writeState({ ...state, suspended: true });

  const alertMsg = `Portfolio caiu -${drawdownPct.toFixed(2)}% desde início.\nCapital atual: $${equity.toFixed(2)} (inicial: $${capitalInitial.toFixed(2)})\nTodas as posições fechadas.\nReativar: editar suspended: false em agent/memory/state.json`;

  if (process.env.TELEGRAM_BOT_TOKEN) {
    const { sendAlert } = await import("../../scripts/telegram_alerts.js");
    await sendAlert("🚨", "MAX DRAWDOWN — Agente Suspenso", alertMsg)
      .catch(e => log("Telegram alert falhou:", e.message));
  }

  if (process.env.CLICKUP_API_TOKEN) {
    await fetch(`https://api.clickup.com/api/v2/list/${process.env.CLICKUP_LIST_ID}/task`, {
      method: "POST",
      headers: { Authorization: process.env.CLICKUP_API_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({ name: `🚨 MAX DRAWDOWN ATINGIDO — Agente Suspenso`, description: alertMsg, priority: 1, status: "to do" }),
    }).catch(e => log("ClickUp alert falhou:", e.message));
  }

  appendToResearchLog(`\n### 🚨 MAX DRAWDOWN — ${today()}\n${alertMsg}\n`);
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
