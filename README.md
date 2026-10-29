# Digyaan Learn

Free coding and AI lessons for Project Digyaan students, in Telugu, Hindi, Urdu and English, with an AI doubt-helper ("Ask Digyaan").

This is the **pilot version**: the AI helper and the 8 lessons. Mentor requests, the opportunities board and teacher accounts come in later phases (see the website plan).

## What's inside

| File | What it does |
| --- | --- |
| `index.html` | The page, plus the title and description Google shows in search results |
| `css/style.css` | The look (exercise-book style, light and dark mode) |
| `js/i18n.js` | Every interface word in 4 languages — **edit here to fix translations** |
| `js/lessons.js` | The 8 lessons and quizzes — **edit here to change lesson content** |
| `js/app.js` | How the site works: pages, quiz, read-aloud, voice typing, chat |
| `api/ask.js` | The AI helper on the server. Holds the rules the AI follows. Uses your secret key |
| `sw.js` | Saves lessons on the lab PC so they open without internet |
| `robots.txt`, `sitemap.xml` | Help Google find the site |

## Put it online (free, about 20 minutes)

### 1. Get a free Cloudflare Workers AI key (an adult does this step)
The AI runs on Cloudflare's free plan: 10,000 "Neurons" a day, enough for hundreds of student questions, resetting every day at 5:30 am IST. No card needed.

1. An adult (teacher, parent or T-Works mentor) signs up at [dash.cloudflare.com](https://dash.cloudflare.com) on the **Free** plan.
2. Copy the **Account ID** (shown on the account's home page / Workers & Pages overview).
3. Go to **My Profile → API Tokens → Create Token**, use the **Workers AI** template, and create it. Copy the token. **Never paste it into any page file or share it.**
4. The adult should read Cloudflare's terms and the [Gemma terms of use](https://ai.google.dev/gemma/terms) for the model, since the site is for students under 18.

### 2. Put the code on GitHub
1. Make a free account at [github.com](https://github.com).
2. Create a new repository called `digyaan-learn`.
3. Click **uploading an existing file** and drag in everything from this folder (keep the `api`, `css` and `js` folders).

### 3. Host it on Vercel
1. Sign up at [vercel.com](https://vercel.com) with your GitHub account (free Hobby plan).
2. Click **Add New → Project**, pick `digyaan-learn`, and click **Deploy**. No build settings needed.
3. Go to **Settings → Environment Variables** and add:
   - `CF_ACCOUNT_ID` = the Account ID from step 1
   - `CF_API_TOKEN` = the token from step 1
   - (optional) `CF_MODEL` = a different model from the [Workers AI catalogue](https://developers.cloudflare.com/workers-ai/models/), if the default `@cf/google/gemma-4-26b-a4b-it` stops working or uses up the free allowance too fast (a smaller model = more questions per day)
   - (optional) `CF_GUARD_MODEL` = `off` to skip the safety check model (not recommended)
4. Go to **Deployments** and click **Redeploy** so the key takes effect.
5. Your site is live at something like `digyaan-learn.vercel.app`. Every time you change a file on GitHub, Vercel updates the site automatically.

### 4. Make it searchable on Google
1. Replace every `YOUR-SITE.vercel.app` in `index.html`, `robots.txt` and `sitemap.xml` with your real address.
2. Go to [Google Search Console](https://search.google.com/search-console), add your site, and verify it (Vercel lets you add the HTML tag or DNS record they give you).
3. Submit `https://your-address/sitemap.xml` under **Sitemaps**.
4. Google usually starts showing new sites within a few days to a few weeks. Links from T-Works, CHIREC or partner school websites make it show up faster.

## Before students use it

- [ ] A teacher or adult checks the AI's rules in `api/ask.js` and tries 20+ test questions in each language, including silly and unsafe ones.
- [ ] Native speakers check the Telugu, Hindi and Urdu words in `js/i18n.js`.
- [ ] Parental consent forms mention the website and that questions are processed by an AI service (Cloudflare). Students must never type personal details (the site warns them and blocks phone numbers and emails).
- [ ] Add a short public privacy and safety page saying what the AI helper is, what data is collected (none stored), and who to contact.
- [ ] Test in the partner school's lab: browser, internet speed, read-aloud and voice typing in Telugu (these depend on the voices installed on each PC — Chrome works best).

## Safety features already built in

- The AI key stays on the server, never in the page.
- The AI is told to stay on learning topics, give hints before answers, never ask for personal details, and point students to a trusted adult or Childline 1098 if they seem unsafe.
- Every question is checked by a separate safety model (Llama Guard) before the AI answers it.
- Phone numbers and emails are blocked before sending.
- Chats are not saved, so the next student on a shared PC can't see them.
- Each browser can ask 30 questions a day, and the server slows down anyone sending too many too fast. This also keeps the class inside Cloudflare's free daily allowance.

## Change things yourself

- **Fix a translation:** edit `js/i18n.js`.
- **Change a lesson or quiz:** edit `js/lessons.js`. The `answer` number is the position of the right option, starting from 0.
- **Change how the AI behaves:** edit the `systemPrompt` text in `api/ask.js`.
- **After any change:** bump `digyaan-v1` to `digyaan-v2` in `sw.js` so lab PCs fetch the new version.

## Try it on your own computer

You need [Node.js](https://nodejs.org) and the Vercel tool:

```
npm i -g vercel
vercel dev
```

Then open `http://localhost:3000`. For the AI to answer locally, run `vercel env pull` first (after adding the key on Vercel).
