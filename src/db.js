import { createPool } from "mysql2/promise";

export const pool = createPool({
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME || 'coupon_system',
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined
})