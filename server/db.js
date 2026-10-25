import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '2810',
  database: process.env.DB_NAME || 'formularacingdb',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
};

export const pool = mysql.createPool(dbConfig);

export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 as connected, NOW() as server_time, VERSION() as version');
    const [tables] = await connection.query(`
      SELECT TABLE_NAME, TABLE_ROWS 
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [dbConfig.database]);
    connection.release();
    return {
      success: true,
      data: rows[0],
      tables: tables.map(t => ({ name: t.TABLE_NAME, approxRows: t.TABLE_ROWS })),
      config: {
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user
      }
    };
  } catch (error) {
    console.error('MySQL Connection Error:', error.message);
    return {
      success: false,
      error: error.message,
      config: {
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user
      }
    };
  }
}
