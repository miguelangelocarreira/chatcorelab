/**
 * Módulo de memória persistente — Passo 2 (stub)
 * Responsável por ler/escrever state.json, positions.json, trades.json e AGENT_STATE.md
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import settings from "../config/settings.json" assert { type: "json" };

const root = resolve(process.cwd());

function load(relPath) {
  return JSON.parse(readFileSync(resolve(root, relPath), "utf-8"));
}

function save(relPath, data) {
  writeFileSync(resolve(root, relPath), JSON.stringify(data, null, 2), "utf-8");
}

export function readState() {
  return load(settings.paths.state);
}

export function writeState(state) {
  state.updated_at = new Date().toISOString();
  save(settings.paths.state, state);
}

export function readPositions() {
  return load(settings.paths.positions);
}

export function writePositions(positions) {
  save(settings.paths.positions, positions);
}

export function appendTrade(trade) {
  const db = load(settings.paths.trades);
  db.trades.push({ ...trade, timestamp: new Date().toISOString() });
  const wins = db.trades.filter(t => t.pnl > 0).length;
  db.stats = {
    total: db.trades.length,
    wins,
    losses: db.trades.length - wins,
    win_rate_pct: db.trades.length ? Math.round((wins / db.trades.length) * 100) : 0,
    total_pnl: db.trades.reduce((sum, t) => sum + (t.pnl || 0), 0),
  };
  save(settings.paths.trades, db);
}

// TODO Passo 2: implementar updateAgentStateMd()
