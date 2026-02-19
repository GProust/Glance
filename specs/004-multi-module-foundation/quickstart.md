# Quickstart: Glance Developer Setup

## Prerequisites
- Node.js 20+
- PNPM (recommended)
- Supabase CLI
- Clerk Account

## Environment Variables
Create a `.env` file in the `backend/` directory:
```bash
DATABASE_URL=postgres://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
CLERK_SECRET_KEY=...
OPENAI_API_KEY=... # For AI Summarization
```

## Database Setup
1. Initialize Supabase: `supabase init`
2. Apply migrations: `supabase db push` (Schema defined in data-model.md)

## Development Workflow
1. **Backend**: `cd backend && pnpm install && pnpm dev`
2. **Web**: `cd web && pnpm install && pnpm dev`
3. **Mobile**: `cd mobile && pnpm install && pnpm start`

## AI Pipeline
The AI summarization logic is located in `backend/src/core/summarizer.service.ts`. It listens for new entries in `content_items` (via Supabase Webhooks or poll) and updates the `summary`, `trust_level`, and `is_ai_generated` fields.
