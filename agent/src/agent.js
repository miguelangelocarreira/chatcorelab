/**
 * Loop principal do agente — Passo 8
 * Orchestration wrapper: lê memória, chama rotina certa, persiste estado.
 *
 * Em produção, este ficheiro é invocado pelas rotinas do Claude Desktop.
 * Cada rotina define o seu próprio prompt (ver /routines/).
 */
import { readState, writeState } from "./memory.js";
import settings from "../config/settings.json" assert { type: "json" };

const ROUTINE = process.env.ROUTINE; // premarket | market_open | midday | close | weekly

async function runCycle() {
  const state = readState();
  const cycle = state.cycle + 1;

  console.log(`[agent] ciclo #${cycle} | rotina: ${ROUTINE || "manual"} | modo: ${settings.agent.mode}`);

  if (state.phase === "SETUP") {
    console.log("[agent] Sistema em fase SETUP. Implementar Passos 5-10 antes de operar.");
    console.log("[agent] Ver CLAUDE.md e strategy.md para próximos passos.");
    return;
  }

  // TODO Passo 8: invocar rotina correta com base em ROUTINE env var
  // switch (ROUTINE) {
  //   case "premarket":   await runPremarket(); break;
  //   case "market_open": await runMarketOpen(); break;
  //   case "midday":      await runMidday(); break;
  //   case "close":       await runClose(); break;
  //   case "weekly":      await runWeekly(); break;
  // }

  writeState({ ...state, cycle });
}

runCycle().catch(err => {
  console.error("[agent] ERRO FATAL:", err.message);
  process.exit(1);
});
