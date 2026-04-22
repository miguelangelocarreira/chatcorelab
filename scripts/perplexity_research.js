/**
 * Perplexity Deep Research Client — Passo 3 (stub completo)
 * Usa o modelo Sonar Reasoning para análise fundamentalista.
 */

const PERPLEXITY_URL = "https://api.perplexity.ai/chat/completions";
// sonar = modelo mais barato ($1/1000 pedidos). sonar-pro só se necessário.
const DEFAULT_MODEL = "sonar";

function assertCredentials() {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY não definida nas variáveis de ambiente.");
  }
}

async function query(systemPrompt, userPrompt) {
  assertCredentials();
  const res = await fetch(PERPLEXITY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      return_citations: false,
      search_recency_filter: "day",
      max_tokens: 512,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Perplexity API → ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

const SYSTEM = "Analista S&P 500. Respostas curtas e objetivas em português europeu.";

export function getMarketBriefing(date) {
  return query(
    SYSTEM,
    `Briefing de mercado ${date}: futuros S&P500, 1 dado macro relevante, 1 discurso Fed, 3 notícias de ações. Máx 200 palavras.`
  );
}

export function researchStock(ticker) {
  return query(
    SYSTEM,
    `${ticker}: revenue growth YoY, FCF yield, margem operacional, catalisador principal, risco principal, consenso analistas. Máx 150 palavras.`
  );
}

export function getEarningsCalendar(tickers) {
  return query(
    SYSTEM,
    `Earnings nas próximas 2 semanas: ${tickers.join(", ")}. Formato: TICKER — DATA — EPS est.`
  );
}
