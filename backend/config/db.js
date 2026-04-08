const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.toqaalnbidqpuwpfuwzr:group666asdfghtrewq@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;