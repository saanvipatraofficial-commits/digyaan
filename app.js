(function () {
  "use strict";

  // ---------- Small helpers ----------
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked */ }
    },
  };

  // el("p", {class: "x"}, "text", childNode) — builds DOM safely (text is never treated as HTML).
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v === null || v === undefined) continue;
      if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else if (k === "class") node.className = v;
      else node.setAttribute(k, v === true ? "" : v);
    }
    for (const c of children.flat()) {
      if (c === null || c === undefined || c === false) continue;
      node.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return node;
  }

  const main = document.getElementById("main");
  const DAILY_LIMIT = 30;

  let lang = store.get("dg-lang", "te");
  if (!window.STRINGS[lang]) lang = "te";
  const done = new Set(store.get("dg-done", []));
  let chat = []; // kept only in memory, so the next student on a shared PC can't see it
  let pendingAsk = null;

  function t(key, vars) {
    let s = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
    for (const k in vars || {}) s = s.split("{" + k + "}").join(vars[k]);
    return s;
  }
  const langInfo = () => LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  // ---------- Read aloud (free, built into the browser) ----------
  let speakingBtn = null;
  function stopSpeaking() {
    if (window.speechSynthesis) speechSynthesis.cancel();
    if (speakingBtn) speakingBtn.textContent = "🔊 " + t("listen");
    speakingBtn = null;
  }
  function speak(text, btn) {
    if (!window.speechSynthesis) return;
    if (speakingBtn === btn) return stopSpeaking();
    stopSpeaking();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = langInfo().speech;
    const prefix = u.lang.slice(0, 2);
    const voice = speechSynthesis.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith(prefix));
    if (voice) u.voice = voice;
    u.rate = 0.9;
    u.onend = u.onerror = stopSpeaking;
    speakingBtn = btn;
    btn.textContent = "⏹ " + t("stopSpeak");
    speechSynthesis.speak(u);
  }
  function listenButton(getText) {
    if (!window.speechSynthesis) return null;
    const b = el("button", { class: "chip", type: "button" }, "🔊 " + t("listen"));
    b.addEventListener("click", () => speak(getText(), b));
    return b;
  }

  // ---------- Header, tabs, footer ----------
  function renderChrome() {
    document.documentElement.lang = lang;
    document.documentElement.dir = langInfo().dir;

    const langs = document.getElementById("langs");
    langs.replaceChildren(
      ...LANGUAGES.map((l) =>
        el(
          "button",
          {
            type: "button",
            class: "lang" + (l.code === lang ? " on" : ""),
            "aria-pressed": l.code === lang ? "true" : "false",
            lang: l.code,
            onclick: () => {
              lang = l.code;
              store.set("dg-lang", lang);
              stopSpeaking();
              render();
            },
          },
          l.label
        )
      )
    );

    const route = location.hash.replace(/^#\/?/, "").split("/")[0];
    const tab = (href, icon, label, key) =>
      el("a", { href, class: "tab", "aria-current": route === key ? "page" : false },
        el("span", { class: "tab-icon", "aria-hidden": "true" }, icon), el("span", {}, label));
    document.getElementById("tabbar").replaceChildren(
      tab("#", "🏠", t("home"), ""),
      tab("#ask", "💬", t("ask"), "ask"),
      tab("#learn", "📚", t("learn"), route === "lesson" ? "lesson" : "learn")
    );
    document.getElementById("foot").textContent = t("footer");
  }

  // ---------- Views ----------
  function homeView() {
    const n = done.size;
    return [
      el("section", { class: "hello" },
        el("h1", { tabindex: "-1" }, t("welcome")),
        el("p", { class: "lede" }, t("tagline"))),
      el("div", { class: "doors" },
        el("a", { class: "door door-ask", href: "#ask" },
          el("span", { class: "door-icon", "aria-hidden": "true" }, "💬"),
          el("span", { class: "door-name" }, t("ask")),
          el("span", { class: "door-desc" }, t("askDesc"))),
        el("a", { class: "door door-learn", href: "#learn" },
          el("span", { class: "door-icon", "aria-hidden": "true" }, "📚"),
          el("span", { class: "door-name" }, t("learn")),
          el("span", { class: "door-desc" }, t("learnDesc")),
          el("span", { class: "door-progress" }, el("mark", {}, t("progress", { n }))))),
    ];
  }

  function learnView() {
    const n = done.size;
    return [
      el("h1", { tabindex: "-1" }, t("lessonsTitle")),
      el("div", { class: "progress", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "8", "aria-valuenow": String(n) },
        el("span", { class: "progress-fill", style: `width:${(n / 8) * 100}%` })),
      el("p", { class: "progress-label" }, t("progress", { n })),
      el("ol", { class: "contents" },
        LESSONS.map((L) =>
          el("li", {},
            el("a", { href: "#lesson/" + L.id, class: "row" + (done.has(L.id) ? " is-done" : "") },
              el("span", { class: "row-num" }, String(L.id)),
              el("span", { class: "row-icon", "aria-hidden": "true" }, L.icon),
              el("span", { class: "row-title", lang: "en", dir: "ltr" }, L.title),
              done.has(L.id) ? el("span", { class: "row-done" }, "✓ " + t("done")) : null)))),
    ];
  }

  function lessonView(id) {
    const L = LESSONS.find((x) => x.id === id);
    if (!L) return learnView();
    const fullText = [L.title, L.summary, ...L.points, L.activity].join(". ");

    const result = el("p", { class: "quiz-result", "aria-live": "polite" });
    const quiz = el("form", { class: "quiz", onsubmit: (e) => {
      e.preventDefault();
      let right = 0;
      L.quiz.forEach((q, qi) => {
        const box = quiz.querySelector(`[data-q="${qi}"]`);
        const picked = quiz.querySelector(`input[name="q${qi}"]:checked`);
        const ok = picked && Number(picked.value) === q.answer;
        if (ok) right++;
        box.classList.toggle("ok", !!ok);
        box.classList.toggle("bad", !ok);
      });
      result.textContent = (right === L.quiz.length ? "🎉 " : "") + t("score", { n: right, t: L.quiz.length });
    } },
      L.quiz.map((q, qi) =>
        el("fieldset", { "data-q": String(qi) },
          el("legend", { lang: "en" }, q.q),
          q.options.map((o, oi) =>
            el("label", { class: "opt", lang: "en" },
              el("input", { type: "radio", name: "q" + qi, value: String(oi) }), " ", o)))),
      el("button", { type: "submit", class: "btn" }, t("check")),
      result);

    const doneBtn = el("button", { type: "button", class: "btn btn-mark" + (done.has(id) ? " is-done" : "") },
      done.has(id) ? "✓ " + t("done") : t("markDone"));
    doneBtn.addEventListener("click", () => {
      if (done.has(id)) done.delete(id); else done.add(id);
      store.set("dg-done", [...done]);
      render();
    });

    const explainBtn = el("button", { type: "button", class: "btn btn-quiet" }, "💬 " + t("explain"));
    explainBtn.addEventListener("click", () => {
      pendingAsk = t("explainPrompt", { lang: langInfo().label }) + L.title + ". " + L.summary + " " + L.points.join(" ");
      location.hash = "#ask";
    });

    return [
      el("a", { href: "#learn", class: "back" }, "← " + t("back")),
      el("article", { class: "page", lang: "en", dir: "ltr" },
        el("p", { class: "page-num", lang, dir: langInfo().dir }, t("session") + " " + L.id + " / 8"),
        el("h1", { tabindex: "-1" }, el("span", { "aria-hidden": "true" }, L.icon + " "), L.title),
        el("div", { class: "actions", lang, dir: langInfo().dir }, listenButton(() => fullText), explainBtn),
        el("p", { class: "summary" }, L.summary),
        el("h2", { lang, dir: langInfo().dir }, t("keyPoints")),
        el("ul", { class: "points" }, L.points.map((p) => el("li", {}, p))),
        el("aside", { class: "try" }, el("h2", { lang, dir: langInfo().dir }, "✏️ " + t("tryThis")), el("p", {}, L.activity)),
        el("h2", { lang, dir: langInfo().dir }, t("quiz")),
        quiz,
        el("div", { class: "actions end", lang, dir: langInfo().dir }, doneBtn)),
    ];
  }

  // ---------- Ask Digyaan ----------
  function formatReply(text) {
    // Turns simple markdown (paragraphs, - lists, **bold**) into safe DOM nodes.
    const frag = document.createDocumentFragment();
    const inline = (line) => {
      const span = document.createDocumentFragment();
      line.split(/(\*\*[^*]+\*\*)/g).forEach((part) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) span.append(el("strong", {}, part.slice(2, -2)));
        else if (part) span.append(part.replace(/\*/g, ""));
      });
      return span;
    };
    let list = null;
    for (const raw of text.split("\n")) {
      const line = raw.trim();
      const item = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
      if (item) {
        if (!list) { list = el("ul"); frag.append(list); }
        list.append(el("li", {}, inline(item[1])));
      } else {
        list = null;
        if (line) frag.append(el("p", {}, inline(line.replace(/^#+\s*/, ""))));
      }
    }
    return frag;
  }

  function bubble(msg) {
    const isBot = msg.role === "model";
    const b = el("div", { class: "msg " + (isBot ? "bot" : "me") + (msg.kind ? " " + msg.kind : "") });
    if (isBot && !msg.kind) {
      b.append(formatReply(msg.text));
      const lb = listenButton(() => msg.text);
      if (lb) b.append(el("div", { class: "msg-tools" }, lb));
    } else {
      b.append(el("p", {}, msg.text));
    }
    return b;
  }

  function todayKey() {
    const d = new Date();
    return `dg-asked-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  function askView() {
    const log = el("div", { class: "log", role: "log", "aria-live": "polite" });
    const note = el("p", { class: "note" }, "🔒 " + t("privacy"));
    const box = el("textarea", { id: "q", rows: "3", maxlength: "800", placeholder: t("placeholder"), "aria-label": t("placeholder") });
    const sendBtn = el("button", { type: "submit", class: "btn" }, t("send"));
    const tools = el("div", { class: "composer-tools" });

    const paint = () => {
      log.replaceChildren(bubble({ role: "model", text: t("greeting"), kind: "greet" }), ...chat.map(bubble));
      log.scrollTop = log.scrollHeight;
    };
    const say = (text) => { log.append(bubble({ role: "model", text, kind: "system" })); log.scrollTop = log.scrollHeight; };

    async function send(text) {
      text = text.trim();
      if (!text) return;
      if (/(\+?91[\s-]?)?[6-9]\d{9}\b/.test(text.replace(/[\s-]/g, "")) || /\S+@\S+\.\S+/.test(text)) {
        return say(t("privacyBlocked"));
      }
      const count = store.get(todayKey(), 0);
      if (count >= DAILY_LIMIT) return say(t("limit"));
      if (!navigator.onLine) return say(t("offline"));

      chat.push({ role: "user", text });
      paint();
      box.value = "";
      sendBtn.disabled = true;
      const wait = bubble({ role: "model", text: t("thinking"), kind: "thinking" });
      log.append(wait);
      log.scrollTop = log.scrollHeight;

      try {
        const r = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang, messages: chat.slice(-8).map((m) => ({ role: m.role, text: m.text })) }),
        });
        const data = await r.json().catch(() => ({}));
        wait.remove();
        if (r.status === 429) { chat.pop(); paint(); return say(t("busy")); }
        if (!r.ok) { chat.pop(); paint(); return say(t("error")); }
        store.set(todayKey(), count + 1);
        const reply = data.reply || t("blocked");
        chat.push({ role: "model", text: reply });
        paint();
      } catch (e) {
        wait.remove();
        chat.pop();
        paint();
        say(t("error"));
      } finally {
        sendBtn.disabled = false;
        box.focus();
      }
    }

    // Voice typing, where the browser supports it (Chrome does).
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (Rec) {
      const mic = el("button", { type: "button", class: "chip" }, "🎤 " + t("speak"));
      let rec = null;
      mic.addEventListener("click", () => {
        if (rec) { rec.stop(); return; }
        rec = new Rec();
        rec.lang = langInfo().speech;
        rec.interimResults = false;
        rec.onresult = (e) => { box.value = (box.value + " " + e.results[0][0].transcript).trim(); };
        rec.onend = () => { rec = null; mic.textContent = "🎤 " + t("speak"); mic.classList.remove("live"); };
        mic.textContent = "⏹ " + t("stopSpeak");
        mic.classList.add("live");
        rec.start();
      });
      tools.append(mic);
    }
    const fresh = el("button", { type: "button", class: "chip" }, "＋ " + t("newChat"));
    fresh.addEventListener("click", () => { chat = []; stopSpeaking(); paint(); box.focus(); });
    tools.append(fresh);

    box.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(box.value); }
    });
    const form = el("form", { class: "composer", onsubmit: (e) => { e.preventDefault(); send(box.value); } },
      box, el("div", { class: "composer-row" }, tools, sendBtn));

    paint();
    if (pendingAsk) {
      const p = pendingAsk;
      pendingAsk = null;
      setTimeout(() => send(p), 0);
    }
    return [el("h1", { tabindex: "-1" }, "💬 " + t("askTitle")), note, el("div", { class: "chat" }, log, form)];
  }

  // ---------- Router ----------
  function render() {
    renderChrome();
    const [route, arg] = location.hash.replace(/^#\/?/, "").split("/");
    let view;
    if (route === "ask") view = askView();
    else if (route === "learn") view = learnView();
    else if (route === "lesson") view = lessonView(Number(arg));
    else view = homeView();
    main.className = "view-" + (route || "home");
    main.replaceChildren(...view);
    const h1 = main.querySelector("h1");
    if (h1 && document.activeElement !== document.body) h1.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", () => { stopSpeaking(); render(); });

  // ---------- Offline notice and installable app ----------
  const offline = document.getElementById("offline");
  const netState = () => { offline.hidden = navigator.onLine; offline.textContent = t("offline"); };
  window.addEventListener("online", netState);
  window.addEventListener("offline", netState);
  if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => {};
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  render();
  netState();
})();
