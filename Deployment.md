# Deployment

## Environment

Copy `.env.example` to `.env` for local development. Production environments should define the same variables through platform-managed secrets.

Required groups:

- Web:
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- API:
  - `API_PORT`
  - `API_CORS_ORIGIN`
  - `SUPABASE_JWKS_URL`
  - `SUPABASE_JWT_ISSUER`
  - `SUPABASE_JWT_AUDIENCE`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_STORAGE_BUCKET_KB`
  - `GEMINI_API_KEY`
  - `GEMINI_MODEL`
  - `GEMINI_EMBEDDING_MODEL`
- Database:
  - `DATABASE_URL`

## Local Containers

The repository includes separate production-style containers for the web app and API.

Run:

```bash
docker compose up --build
```

Endpoints:

- Web: `http://localhost:3000`
- API: `http://localhost:4000/api/v1`
- Health: `http://localhost:4000/api/v1/health`

`docker-compose.yml` expects a local `.env` file and uses external Supabase and Gemini services.

## Vercel

Recommended project settings:

- Framework: Next.js
- Root directory: repository root
- Install command: `npm ci`
- Build command: `npm run build --workspace @gft-assist/web`

Required environment variables:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Point `NEXT_PUBLIC_API_URL` to the deployed Render API URL, for example `https://gft-assist-api.onrender.com/api/v1`.

## Render

Recommended web service settings:

- Root directory: repository root
- Runtime: Node 22
- Build command:

```bash
npm ci && npm run db:generate && npm run build --workspace @gft-assist/api
```

- Start command:

```bash
npm run start --workspace @gft-assist/api
```

- Health check path:

```text
/api/v1/health
```

Required environment variables:

- `NODE_ENV=production`
- `API_PORT=4000`
- `API_CORS_ORIGIN=<vercel-app-url>`
- `SUPABASE_JWKS_URL`
- `SUPABASE_JWT_ISSUER`
- `SUPABASE_JWT_AUDIENCE=authenticated`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET_KB`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GEMINI_EMBEDDING_MODEL`
- `DATABASE_URL`

## GitHub Actions

The CI workflow at `.github/workflows/ci.yml` runs:

1. `npm ci`
2. `npm run db:generate`
3. `npm test`
4. `npm run typecheck`
5. `npm run build`
