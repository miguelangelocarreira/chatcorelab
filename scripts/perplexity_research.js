/**
 * Perplexity Deep Research Client — Passo 3 (stub completo)
 * Usa o modelo Sonar Reasoning para análise fundamentalista.
 */

const PERPLEXITY_URL = "https://api.perplexity.ai/chat/completions";

function assertCredentials() {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY não definida nas variáveis de ambiente.");
  }
}

async function query(systemPrompt, userPrompt, model = "sonar-reasoning") {
  assertCredentials();
  const res = await fetch(PERPLEXITY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      return_citations: true,
      search_recency_filter: "day",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Perplexity API → ${res.status}: ${err}`);
  }
  const data = await res.json();
  return {
    content: data.choices[0].message.content,
    citations: data.citations || [],
  };
}

const ANALYST_SYSTEM = `És um analista financeiro sénior especializado em ações do S&P 500.
Respondes sempre em português europeu com análise objetiva e estruturada.
Citas sempre as fontes e indicas a data das informações.`;

export function getMarketBriefing(date) {
  return query(
    ANALYST_SYSTEM,
    `Faz um briefing de mercado para ${date}. Inclui:
    1. Futuros S&P 500 e principais movimentos premarket
    2. Dados económicos publicados ou esperados hoje
    3. Discursos de membros da Fed agendados
    4. 3-5 notícias mais relevantes para o mercado de ações hoje`
  );
}

export function researchStock(ticker) {
  return query(
    ANALYST_SYSTEM,
    `Faz uma análise fundamentalista completa de ${ticker}. Inclui:
    1. Resumo do negócio e vantagem competitiva
    2. Métricas financeiras: Revenue growth YoY, FCF yield, margem operacional, Dívida/EBITDA
    3. Catalisadores identificados para os próximos 6-18 meses
    4. Principais riscos (bull/bear case)
    5. Consenso de analistas e target price médio
    6. Recomendação: Comprar / Watchlist / Evitar`
  );
}

export function getEarningsCalendar(tickers, weeksAhead = 2) {
  return query(
    ANALYST_SYSTEM,
    `Quais são as datas de resultados (earnings) das seguintes empresas nas próximas ${weeksAhead} semanas: ${tickers.join(", ")}?
    Formato: TICKER — DATA — Estimativa EPS — Estimativa Revenue`
  );
}

export function getSectorOutlook(sector) {
  return query(
    ANALYST_SYSTEM,
    `Analisa o outlook fundamentalista atual para o setor ${sector} no S&P 500.
    Inclui: tailwinds macro, riscos regulatórios, valuations relativas ao histórico, e 2-3 empresas de destaque.`
  );
}
