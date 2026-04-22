const TAVILY_URL = "https://api.tavily.com/search";

function assertCredentials() {
  if (!process.env.TAVILY_API_KEY) {
    throw new Error("TAVILY_API_KEY não definida nas variáveis de ambiente.");
  }
}

async function search(query, topic = "news") {
  assertCredentials();
  const res = await fetch(TAVILY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      topic,
      search_depth: "basic",
      days: 1,
      max_results: 5,
      include_answer: true,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tavily API → ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.answer || data.results.map(r => r.content).join("\n\n");
}

export function getMarketBriefing(date) {
  return search(
    `Market briefing ${date}: S&P500 futures, macro data today, Fed speakers, top 3 stock news. Answer in European Portuguese, max 200 words.`,
    "news"
  );
}

export function researchStock(ticker) {
  return search(
    `${ticker} fundamental analysis: revenue growth YoY, FCF yield, operating margin, main catalyst, main risk, analyst consensus. Max 150 words.`,
    "finance"
  );
}

export function getEarningsCalendar(tickers) {
  return search(
    `Earnings next 2 weeks for: ${tickers.join(", ")}. Format: TICKER — DATE — EPS est.`,
    "finance"
  );
}
