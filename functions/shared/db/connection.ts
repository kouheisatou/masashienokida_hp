/**
 * Oracle Database Connection Module with Connection Pooling
 * Optimized for OCI Functions (serverless)
 */

import oracledb from 'oracledb';

// Connection pool instance
let pool: oracledb.Pool | null = null;

// Pool configuration for serverless environment
interface PoolConfig {
  user: string;
  password: string;
  connectString: string;
  poolMin: number;
  poolMax: number;
  poolIncrement: number;
  poolTimeout: number;
  poolPingInterval: number;
  stmtCacheSize: number;
}

/**
 * Initialize the connection pool
 * Uses DRCP (Database Resident Connection Pooling) for optimal serverless performance
 */
async function initializePool(): Promise<oracledb.Pool> {
  if (pool) {
    return pool;
  }

  // Initialize Oracle Instant Client if TNS_ADMIN is set
  if (process.env.TNS_ADMIN) {
    try {
      oracledb.initOracleClient({ configDir: process.env.TNS_ADMIN });
    } catch (err) {
      // Already initialized, ignore
    }
  }

  const config: PoolConfig = {
    user: process.env.DB_USER || 'ADMIN',
    password: process.env.DB_PASSWORD || '',
    connectString: process.env.DB_CONNECTION_STRING || '',
    poolMin: 1,           // Keep minimum connections low for serverless
    poolMax: 5,           // Limit maximum connections
    poolIncrement: 1,     // Add one connection at a time
    poolTimeout: 60,      // Close idle connections after 60 seconds
    poolPingInterval: 60, // Check connection health every 60 seconds
    stmtCacheSize: 30,    // Cache SQL statements for reuse
  };

  pool = await oracledb.createPool(config);

  console.log('Database connection pool initialized');
  return pool;
}

/**
 * Get a connection from the pool
 */
export async function getConnection(): Promise<oracledb.Connection> {
  const p = await initializePool();
  return p.getConnection();
}

/**
 * Execute a query and return results
 */
export async function executeQuery<T = Record<string, unknown>>(
  sql: string,
  binds: oracledb.BindParameters = {},
  options: oracledb.ExecuteOptions = {}
): Promise<T[]> {
  const connection = await getConnection();

  try {
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...options,
    });

    return (result.rows || []) as T[];
  } finally {
    await connection.close();
  }
}

/**
 * Execute an insert and return the generated ID
 */
export async function executeInsert(
  sql: string,
  binds: oracledb.BindParameters = {}
): Promise<{ id: string }> {
  const connection = await getConnection();

  try {
    // Append RETURNING clause if not present
    const hasReturning = sql.toLowerCase().includes('returning');
    const finalSql = hasReturning ? sql : `${sql} RETURNING id INTO :out_id`;
    const finalBinds = hasReturning
      ? binds
      : { ...binds, out_id: { dir: oracledb.BIND_OUT, type: oracledb.STRING } };

    const result = await connection.execute(finalSql, finalBinds, {
      autoCommit: true,
    });

    const outBinds = result.outBinds as Record<string, unknown>;
    const id = Array.isArray(outBinds?.out_id)
      ? outBinds.out_id[0]
      : outBinds?.out_id;

    return { id: String(id) };
  } finally {
    await connection.close();
  }
}

/**
 * Execute an update/delete and return affected row count
 */
export async function executeUpdate(
  sql: string,
  binds: oracledb.BindParameters = {}
): Promise<{ rowsAffected: number }> {
  const connection = await getConnection();

  try {
    const result = await connection.execute(sql, binds, {
      autoCommit: true,
    });

    return { rowsAffected: result.rowsAffected || 0 };
  } finally {
    await connection.close();
  }
}

/**
 * Execute multiple statements in a transaction
 */
export async function executeTransaction<T>(
  callback: (connection: oracledb.Connection) => Promise<T>
): Promise<T> {
  const connection = await getConnection();

  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.close();
  }
}

/**
 * Close the connection pool (for graceful shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close(0);
    pool = null;
    console.log('Database connection pool closed');
  }
}

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  await closePool();
});

process.on('SIGINT', async () => {
  await closePool();
});

// Export types for external use
export type { oracledb as OracleDB };
