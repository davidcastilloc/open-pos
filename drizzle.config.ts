import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './app/database/schema/*',
  out: './database/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './database/pos.db'
  },
  verbose: true,
  strict: true
})
