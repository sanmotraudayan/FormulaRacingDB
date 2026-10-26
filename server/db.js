import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'node:fs';

dotenv.config();



const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'FormulaRacingDB',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  ssl: process.env.DB_SSL === 'true'
    ? {
      ca: fs.readFileSync('/etc/secrets/ca.pem', 'utf8'),
      rejectUnauthorized: true,
    }
    : undefined,
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
