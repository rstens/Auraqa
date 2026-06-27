# Contributing to AuraQA

## Getting Started

1. Fork the repository
2. Create a feature branch from `dev`
3. Set up the development environment (see [DEVELOPMENT.md](DEVELOPMENT.md))
4. Make your changes
5. Submit a pull request

## Pull Request Process

1. Ensure all checks pass: `npm run lint && npm run type-check && npm test`
2. Update documentation if you changed public APIs or added features
3. Add JSDoc comments to all new exported functions and types
4. Write tests for new functionality
5. Create a PR targeting the `dev` branch

## Code Style

- TypeScript strict mode — no `any` types
- Use `generateId()` from `src/lib/uuid.ts` for all new entity IDs
- Validate API inputs with Zod schemas in `src/lib/validators.ts`
- Default to React Server Components; use `"use client"` only when needed
- Keep components focused — one component per file

## Commit Messages

Use clear, descriptive commit messages:

- `feat: add article tag filtering`
- `fix: prevent duplicate votes on same target`
- `docs: update API reference with search endpoint`

## Reporting Issues

Open an issue on GitHub with:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node.js version, browser)
