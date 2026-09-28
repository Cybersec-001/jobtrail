import pg from 'pg';
export const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:5});
export async function migrate(){await pool.query(`CREATE TABLE IF NOT EXISTS jobtrail_owner (
 id smallint PRIMARY KEY CHECK(id=1), profile jsonb, profile_revision bigint NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);CREATE TABLE IF NOT EXISTS jobtrail_sessions (
 token_hash text PRIMARY KEY, expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);CREATE TABLE IF NOT EXISTS jobtrail_applications (
 id text PRIMARY KEY, title text NOT NULL, company text NOT NULL DEFAULT '', application_url text NOT NULL,
 source text NOT NULL, status text NOT NULL CHECK(status IN ('saved','applied','interview','offer','rejected','withdrawn')),
 job_description text NOT NULL, profile_revision bigint NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);CREATE TABLE IF NOT EXISTS jobtrail_feed_cache (
 query_key text PRIMARY KEY, fetched_at timestamptz NOT NULL, payload jsonb NOT NULL
);`)}
