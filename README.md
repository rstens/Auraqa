# Auraqa

Minimal web app using:

- **htmx** for browser interactions
- **Node.js** API server
- **PostgreSQL** persistence (or in-memory fallback when `DATABASE_URL` is not set)

## Run

```bash
npm install
npm start
```

The app starts on `http://localhost:3000`.

Set `DATABASE_URL` to enable PostgreSQL storage:

```bash
DATABASE_URL=postgres://user:password@localhost:5432/auraqa npm start
```

## Test

```bash
npm test
```