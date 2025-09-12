import { createPool } from "mysql2/promise";

export const pool = createPool({
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'coupon_system',
    ssl: {
      rejectUnauthorized: true
    }
})