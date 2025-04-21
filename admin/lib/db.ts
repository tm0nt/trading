import { Pool } from "pg";

const pool = new Pool({
  user: "brx",
  host: "localhost",
  database: "trading",
  password: "brx",
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
