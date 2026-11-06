import dotenv from 'dotenv'; dotenv.config(); import bcrypt from 'bcryptjs'; import db from './db.js';
const email=process.argv[2]||'admin@creditlens.local', password=process.argv[3]||'ChangeMe123!';
const hash=await bcrypt.hash(password,12); await db.query("INSERT INTO users(full_name,email,password_hash,role) VALUES('CREDITLENS Admin',?,?,'Admin') ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)",[email,hash]); console.log(`Admin ready: ${email}`); await db.end();
