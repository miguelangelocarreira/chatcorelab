/**
 * Health check de credenciais e conectividade.
 * Corre antes de qualquer rotina ou em CI.
 * node scripts/validate_env.js
 */

const MOCK_MODE = process.env.ALPACA_PAPER_MOCK === "true";

const REQUIRED = [
  { key: "ALPACA_API_KEY",      desc: "Alpaca API key",     mock_ok: true },
  { key: "ALPACA_SECRET_KEY",   desc: "Alpaca secret key",  mock_ok: true },
  { key: "TAVILY_API_KEY",      desc: "Tavily API key",     mock_ok: false },
  { key: "CLICKUP_API_TOKEN",   desc: "ClickUp token",      mock_ok: false },
  { key: "CLICKUP_LIST_ID",     desc: "ClickUp list ID",    mock_ok: false },
];

function checkEnvVars() {
  let ok = true;
  console.log("\n── Variáveis de Ambiente ──────────────────────────");
  for (const { key, desc, mock_ok } of REQUIRED) {
    const val = process.env[key];
    if (val) {
      const masked = val.slice(0, 6) + "***" + val.slice(-3);
      console.log(`  ✓  ${key.padEnd(25)} ${masked}`);
    } else if (MOCK_MODE && mock_ok) {
      console.log(`  ~  ${key.padEnd(25)} (mock mode — não necessário)`);
    } else {
      console.log(`  ✗  ${key.padEnd(25)} NÃO DEFINIDA`);
      ok = false;
    }
  }
  return ok;
}

async function pingAlpaca() {
  if (MOCK_MODE) {
    console.log("  ~  Alpaca                   mock mode ativo");
    return true;
  }
  try {
    const base = process.env.ALPACA_PAPER === "false"
      ? "https://api.alpaca.markets"
      : "https://paper-api.alpaca.markets";
    const res = await fetch(`${base}/v2/account`, {
      headers: {
        "APCA-API-KEY-ID": process.env.ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY,
      },
    });
    if (res.ok) {
      const acc = await res.json();
      console.log(`  ✓  Alpaca                   equity=$${parseFloat(acc.equity).toFixed(2)} status=${acc.status}`);
      return true;
    }
    console.log(`  ✗  Alpaca                   HTTP ${res.status}`);
    return false;
  } catch (e) {
    console.log(`  ✗  Alpaca                   ${e.message}`);
    return false;
  }
}

async function pingTavily() {
  if (!process.env.TAVILY_API_KEY) return false;
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: "ping",
        max_results: 1,
      }),
    });
    if (res.ok) {
      console.log("  ✓  Tavily                   OK");
      return true;
    }
    console.log(`  ✗  Tavily                   HTTP ${res.status}`);
    return false;
  } catch (e) {
    console.log(`  ✗  Tavily                   ${e.message}`);
    return false;
  }
}

async function pingClickUp() {
  if (!process.env.CLICKUP_API_TOKEN) return false;
  try {
    const res = await fetch("https://api.clickup.com/api/v2/user", {
      headers: { Authorization: process.env.CLICKUP_API_TOKEN },
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`  ✓  ClickUp                  user=${data.user?.username}`);
      return true;
    }
    console.log(`  ✗  ClickUp                  HTTP ${res.status}`);
    return false;
  } catch (e) {
    console.log(`  ✗  ClickUp                  ${e.message}`);
    return false;
  }
}

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  ChatCoreLab Trading Agent — Validation Check    ║");
  console.log(`║  Modo: ${MOCK_MODE ? "MOCK (sem chaves reais)" : "LIVE/PAPER"  }${" ".repeat(MOCK_MODE ? 22 : 28)}║`);
  console.log("╚══════════════════════════════════════════════════╝");

  const envOk = checkEnvVars();

  console.log("\n── Conectividade ──────────────────────────────────");
  const [alpacaOk, tavilyOk, clickupOk] = await Promise.all([
    pingAlpaca(),
    pingTavily(),
    pingClickUp(),
  ]);

  const allOk = MOCK_MODE
    ? alpacaOk
    : envOk && alpacaOk && tavilyOk && clickupOk;

  console.log("\n── Resultado ──────────────────────────────────────");
  if (allOk) {
    console.log("  ✓  Sistema pronto para operar.\n");
    process.exit(0);
  } else {
    console.log("  ✗  Configuração incompleta. Ver detalhes acima.\n");
    process.exit(1);
  }
}

main();
