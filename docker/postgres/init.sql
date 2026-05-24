-- PostgreSQL 18 initialization script for AuraQA
-- Executed on first database creation by the Docker entrypoint.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
