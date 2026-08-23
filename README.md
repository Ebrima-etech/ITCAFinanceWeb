# ITCAFinanceWeb

The screens of [ITCA Account Management](https://github.com/Ebrima-etech/ITCAFinanceBack) — a Next.js + TypeScript + Tailwind frontend for tracking ITCA's dues, event revenue and costs, gifts, budget, and everything going out.

Companion backend: [ITCAFinanceBack](https://github.com/Ebrima-etech/ITCAFinanceBack).

## Setup

```bash
npm install
copy .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

Open `http://localhost:3000` and sign in with an account created via the backend's `seed_admin` command.

## Pages

- `/login` — the front door
- `/dashboard` — income vs expenses, profit/loss per event, budget vs actual, as charts and tables
- `/ledger` — the full list of money in and out, filterable, with the running total
- `/events` — events list and per-event detail (linked transactions, CSV ticketing import)
- `/dues` — record a membership payment (cash or online) and see who has paid
- `/budget` — enter next year's budget lines, with prior-year actuals for reference
- `/reports` — pick a period, preview, export CSV
- `/admin` — admin-only: manage officer accounts, browse the activity log
