# AI Sentinel

> **"Don't monitor everything. Let AI watch what matters."**

AI Sentinel is an autonomous background monitoring and intelligence platform designed for software engineers, AI research teams, and startup founders. It continuously watches GitHub repositories, websites, RSS feeds, and tech topics, filtering out non-essential noise and using Claude AI to surface meaningful, actionable intelligence.

---

## 🌟 Core Differentiators

1. **Not a Generic Chatbot or Simple Diff Tracker**: Executes a full 7-stage monitoring pipeline:
   `MONITOR → DETECT → FILTER → INVESTIGATE → UNDERSTAND → PRIORITIZE → ALERT`
2. **Noise Reduction Engine**: Filters out 97% of trivial noise (timestamps, ads, whitespace, bot commits) before invoking Claude.
3. **Structured Intelligence**: Every alert answers 4 essential questions:
   - **WHAT CHANGED?** (Factual summary)
   - **WHY DOES IT MATTER?** (Impact analysis & risk assessment)
   - **WHAT SHOULD I DO?** (Actionable next steps)
   - **SEVERITY SCORE** (CRITICAL, HIGH, MEDIUM, LOW)
4. **Custom AI Instructions**: Users define custom watch rules (e.g. *"Only alert me about breaking API changes"*).

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Next.js 14 Frontend                           │
│ (Command Center, Intelligence Feed, Watch System, Event Detail UI)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API
┌───────────────────────────────────▼────────────────────────────────────┐
│                        Next.js Server & API                            │
│  (Auth & Sessions, Watch CRUD, SSRF Security Shield, Event API)        │
└──────────────────┬────────────────────────────────┬────────────────────┘
                   │                                │
                   ▼                                ▼
        ┌─────────────────────┐          ┌──────────────────────┐
        │  PostgreSQL / Prisma│          │ Background Worker    │
        └─────────────────────┘          │ (Scheduled Scans)    │
                                         └──────────┬───────────┘
                                                    │
                               ┌────────────────────┴───────────────────┐
                               │       Modular Watch Engine             │
                               │ ┌───────────┬───────────┬────────────┐ │
                               │ │  GitHub   │  Website  │  RSS Feed  │ │
                               │ └───────────┴───────────┴────────────┘ │
                               └────────────────────┬───────────────────┘
                                                    │ Snapshots & Diffs
                               ┌────────────────────▼───────────────────┐
                               │      AI Intelligence Engine            │
                               │  (Claude Haiku Triage → Claude Sonnet  │
                               │   Deep Analysis → Zod Validation)      │
                               └────────────────────────────────────────┘
```

---

## 🔒 Security Model & SSRF Shield

- **URL Validation**: Parses host, verifies protocol (`http:` / `https:` only).
- **DNS Resolution Check**: Resolves hostname to IP addresses before fetch. Blocks all private/internal ranges (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, AWS IMDS `169.254.169.254`).
- **Fetch Size & Timeout Limits**: Maximum response size 5 MB, strict 10-second timeout.
- **Zero API Key Exposure**: All Anthropic API keys remain securely on the server side.

---

## ⚙️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Glassmorphism 2030 design
- **Backend & Database**: Next.js Server Architecture, Prisma ORM, PostgreSQL (SQLite for local dev)
- **AI Integration**: Anthropic Claude API (`@anthropic-ai/sdk`), Zod validation schemas
- **Auth**: Password hashing with `bcryptjs`, HttpOnly JWT session cookies
- **Testing**: Jest unit testing suite

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- Node.js v18+ & npm

### 2. Clone & Install
```bash
git clone https://github.com/Tazeenchandio/ai-sentinel.git
cd ai-sentinel
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```env
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY="your-anthropic-api-key"
AI_TRIAGE_MODEL="claude-3-5-haiku-20241022"
AI_ANALYSIS_MODEL="claude-3-5-sonnet-20241022"
JWT_SECRET="super-secret-jwt-key"
```

### 4. Database Setup & Seed
```bash
npx prisma db push
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the Intelligence Command Center.

### 6. Run Background Worker & Tests
```bash
# In a separate terminal
npm run worker

# Run unit tests
npm test
```

---

## 📄 License
Licensed under the [MIT License](LICENSE).
