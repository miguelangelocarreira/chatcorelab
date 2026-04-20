/**
 * Loop principal do agente — Passo 8 (stub)
 *
 * Ciclo:
 *   1. Ler AGENT_STATE.md + state.json
 *   2. Buscar dados de mercado
 *   3. Calcular indicadores
 *   4. Avaliar sinais
 *   5. Verificar risco
 *   6. Executar ordens
 *   7. Persistir estado
 *   8. Atualizar AGENT_STATE.md
 */
import { readState } from "./memory.js";

async function runCycle() {
  const state = readState();
  console.log(`[agent] ciclo #${state.cycle} | fase: ${state.phase} | status: ${state.status}`);

  if (state.phase === "SETUP") {
    console.log("[agent] Módulos ainda não implementados. Ver strategy.md Passos 2-8.");
    return;
  }

  // TODO Passo 8: implementar ciclo completo
}

runCycle().catch(err => {
  console.error("[agent] ERRO FATAL:", err.message);
  process.exit(1);
});
