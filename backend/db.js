import dns from "dns";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required.");
}

const useIPv4 = process.env.PG_FORCE_IPV4 === "true";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  ...(useIPv4 && {
    lookup(hostname, options, callback) {
      return dns.lookup(hostname, { family: 4, hints: dns.ADDRCONFIG }, callback);
    }
  })
});

export async function query(text, params = []) {
  return pool.query(text, params);
}
