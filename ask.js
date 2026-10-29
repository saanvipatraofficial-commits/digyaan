// Vercel serverless function: the only place the AI key is used.
// It calls Cloudflare Workers AI (free plan: 10,000 Neurons a day) running an open model.
// Secrets live in Vercel environment variables CF_ACCOUNT_ID and CF_API_TOKEN — never in the page code.

const MODEL = process.env.CF_MODEL || "@cf/google/gemma-4-26b-a4b-it";
// A second, small model that checks each question for unsafe content first. Set CF_GUARD_MODEL=off to skip.
const GUARD = process.env.CF_GUARD_MODEL || "@cf/meta/llama-guard-3-8b";
const LANGS = { en: "English", te: "Telugu", hi: "Hindi", ur: "Urdu" };

// Best-effort limit per visitor (resets when the function restarts).
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 6;
const hits = new Map();

function systemPrompt(lang) {
  const name = LANGS[lang] || "English";
  return `You are "Ask Digyaan", a friendly tutor for Grade 8 students in Hyderabad, India, who are part of Project Digyaan, a free digital literacy programme.

What students learn: digital ethics and online safety, what AI is, how machine learning works, Scratch (games and stories), PictoBlox (block coding, ML models, AI mini apps) and Quarky robotics.

How to answer:
- Reply in the language the student writes in. If they mix languages (Tenglish, Hinglish), reply in the same mix. If unsure, use ${name}. Telugu, Hindi and Urdu answers use their own script unless the student writes in English letters.
- Use short, simple sentences a 13-year-old learning English as a second language can follow. Max about 120 words.
- Teach, don't just tell: for coding or homework problems, first give a hint or ask a guiding question. Give the full answer only if they ask again or are clearly stuck.
- Use everyday Indian examples (cricket, auto-rickshaws, school, festivals, food).
- For Scratch or PictoBlox, name the exact block and its colour/category.
- Stay on learning topics: technology, coding, AI, school subjects, careers. Politely steer other topics back.

Safety rules (always follow):
- Never ask for the student's name, phone number, address, school, photos or any personal details. If they share some, tell them kindly not to share personal details online.
- Never help with anything unsafe, hurtful or inappropriate for children.
- If a student says they are being hurt, bullied, or feel very sad or unsafe, respond with care, tell them to talk to a teacher or trusted adult today, and that they can call Childline 1098 (free, any time).
- If you are not sure about something, say so and suggest asking their teacher or a Digyaan mentor.`;
}

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  return (typeof fwd === "string" && fwd.split(",")[0].trim()) || "unknown";
}

function tooMany(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

function cleanMessages(raw) {
  if (!Array.isArray(raw)) return null;
  const msgs = raw
    .slice(-8)
    .filter((m) => m && (m.role === "user" || m.role === "model") && typeof m.text === "string")
    .map((m) => ({ role: m.role, text: m.text.trim().slice(0, 800) }))
    .filter((m) => m.text.length > 0);
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return null;
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  return msgs;
}

function runModel(model, body, signal) {
  const account = process.env.CF_ACCOUNT_ID;
  return fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.CF_API_TOKEN}` },
    signal,
    body: JSON.stringify(body),
  });
}

function replyText(data) {
  const r = data && data.result;
  if (!r) return "";
  if (typeof r.response === "string") return r.response;
  const c = r.choices && r.choices[0];
  return (c && c.message && typeof c.message.content === "string" && c.message.content) || "";
}

// Returns true when the guard model flags the question as unsafe.
async function flagged(text, signal) {
  if (GUARD === "off") return false;
  try {
    const r = await runModel(GUARD, { messages: [{ role: "user", content: text }] }, signal);
    if (!r.ok) { console.error("Guard error", r.status, await r.text()); return false; }
    const data = await r.json();
    const out = data && data.result && data.result.response;
    if (out && typeof out === "object" && "safe" in out) return out.safe === false;
    return typeof out === "string" && /^\s*unsafe/i.test(out);
  } catch (e) {
    console.error("Guard failed", e);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  if (!process.env.CF_ACCOUNT_ID || !process.env.CF_API_TOKEN) return res.status(500).json({ error: "not_configured" });

  if (tooMany(clientIp(req))) return res.status(429).json({ error: "busy" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  const messages = cleanMessages(body && body.messages);
  if (!messages) return res.status(400).json({ error: "bad_request" });
  const lang = LANGS[body.lang] ? body.lang : "en";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  try {
    if (await flagged(messages[messages.length - 1].text, controller.signal)) {
      return res.status(200).json({ reply: "", blocked: true });
    }

    const r = await runModel(MODEL, {
      messages: [
        { role: "system", content: systemPrompt(lang) },
        ...messages.map((m) => ({ role: m.role === "model" ? "assistant" : "user", content: m.text })),
      ],
      max_tokens: 600,
      temperature: 0.4,
    }, controller.signal);

    if (r.status === 429) return res.status(429).json({ error: "busy" });
    if (!r.ok) {
      console.error("Workers AI error", r.status, await r.text());
      return res.status(r.status === 403 || r.status === 400 ? 502 : 503).json({ error: "ai_error" });
    }

    const reply = replyText(await r.json()).trim();
    if (!reply) return res.status(200).json({ reply: "", blocked: true });
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Ask failed", err);
    return res.status(502).json({ error: "ai_error" });
  } finally {
    clearTimeout(timer);
  }
}
