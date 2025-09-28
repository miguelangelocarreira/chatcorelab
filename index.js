import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// 1) Healthcheck
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

// 2) API Key simples
const API_KEY = process.env.API_KEY || "dev-key";

function auth(req, res, next) {
  const key = req.header("x-api-key");
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
}

// 3) Webhook
app.post("/webhook", auth, async (req, res) => {
  const { client, message, lang } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: "message required" });
  }

  const knowledge = {
    culinaris: {
      pt: {
        horarios: "Seg–Sex 12:00–15:00 e 19:00–23:00. Sáb–Dom 12:00–23:00.",
        reservas: "Reservas pelo WhatsApp ou telefone. Confirmamos em minutos."
      },
      en: {
        horarios: "Mon–Fri 12:00–15:00 & 19:00–23:00. Sat–Sun 12:00–23:00.",
        reservas: "Book via WhatsApp or phone. Fast confirmation."
      }
    }
  };

  const locale = (lang || "pt").toLowerCase().startsWith("en") ? "en" : "pt";
  const kb = (knowledge[client] && knowledge[client][locale]) || {};

  const text = message.toLowerCase();
  let reply;

  if (text.includes("horário") || text.includes("horarios") || text.includes("horario") || text.includes("hours")) {
    reply = kb.horarios || "Horários não definidos para este cliente.";
  } else if (text.includes("reserva") || text.includes("booking")) {
    reply = kb.reservas || "Reservas não definidas para este cliente.";
  } else if (text.includes("menu") || text.includes("cardápio") || text.includes("ementa")) {
    reply = locale === "pt" ? "Menu disponível aqui: https://exemplo.com/menu" : "Menu available: https://exemplo.com/menu";
  } else {
    reply = locale === "pt"
      ? "Obrigado pela sua mensagem. Em que posso ajudar? (horários, reservas, menu)"
      : "Thanks for your message. How can I help? (hours, booking, menu)";
  }

  return res.status(200).json({
    reply,
    meta: { client: client || "default", lang: locale }
  });
});

// 4) Porta
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`API a correr na porta ${PORT}`);
});