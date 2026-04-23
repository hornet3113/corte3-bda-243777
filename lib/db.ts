import { Pool } from 'pg';

const pool = new Pool({
  host:     process.env.DB_HOST     ?? 'localhost',
  port:     Number(process.env.DB_PORT ?? 5441),
  database: process.env.DB_NAME     ?? 'clinica_vet',
  user:     process.env.DB_USER     ?? 'app_user',
  password: process.env.DB_PASSWORD ?? 'app123',
});

export default pool;