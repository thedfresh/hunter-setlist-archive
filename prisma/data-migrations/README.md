# Data Migrations

This folder contains SQL scripts for data transformations that run AFTER schema migrations.

## Pattern
- Numbered files: 001-description.sql, 002-description.sql
- Run in order, tracked in data_migrations table
- Idempotent - won't re-run if already applied

## Adding New Migrations
1. Create new file with next number
2. Write SQL (test locally first)
3. Commit to repo
4. Deployment runs automatically via run-data-migrations script

## Manual Execution
Run specific migration:
  psql -U hunter_admin -h localhost -d hunter_archive < prisma/data-migrations/001-name.sql

Run all pending:
  npx tsx scripts/run-data-migrations.ts
