// //DATA BASE TO STORE DATA FOR USER IMPORTS

// // backend/config/database.js
// const { Pool } = require('pg');
// require('dotenv').config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

// // Test database connection
// const testConnection = async () => {
//   try {
//     const client = await pool.connect();
//     console.log('✅ Connected to Neon database');
//     client.release();
//     return true;
//   } catch (err) {
//     console.error('❌ Database connection error:', err);
//     return false;
//   }
// };

// // Initialize database tables
// const initDatabase = async () => {
//   try {
//     // Create pantry_items table
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS pantry_items (
//         id SERIAL PRIMARY KEY,
//         user_id VARCHAR(255) DEFAULT 'default_user',
//         item_name VARCHAR(255) NOT NULL,
//         category VARCHAR(50) NOT NULL,
//         location VARCHAR(50) NOT NULL CHECK (location IN ('freezer', 'fridge', 'pantry')),
//         quantity INTEGER DEFAULT 1,
//         unit VARCHAR(50),
//         added_date TIMESTAMP DEFAULT NOW(),
//         expiry_date TIMESTAMP,
//         storage_time VARCHAR(100),
//         storage_tips TEXT[],
//         from_receipt BOOLEAN DEFAULT true,
//         created_at TIMESTAMP DEFAULT NOW(),
//         updated_at TIMESTAMP DEFAULT NOW()
//       )
//     `);

//     // Create scanned_receipts table
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS scanned_receipts (
//         id SERIAL PRIMARY KEY,
//         user_id VARCHAR(255) DEFAULT 'default_user',
//         receipt_text TEXT,
//         items_found TEXT[],
//         scan_date TIMESTAMP DEFAULT NOW(),
//         total_items INTEGER,
//         created_at TIMESTAMP DEFAULT NOW()
//       )
//     `);

//     // Create saved_recipes table
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS saved_recipes (
//         id SERIAL PRIMARY KEY,
//         user_id VARCHAR(255) DEFAULT 'default_user',
//         recipe_name VARCHAR(255) NOT NULL,
//         ingredients TEXT[],
//         instructions TEXT[],
//         prep_time INTEGER,
//         cook_time INTEGER,
//         servings INTEGER,
//         source VARCHAR(50),
//         created_at TIMESTAMP DEFAULT NOW()
//       )
//     `);

//     console.log('✅ Database tables initialized');
//     return true;
//   } catch (err) {
//     console.error('❌ Error initializing database:', err);
//     return false;
//   }
// };

// module.exports = {
//   pool,
//   testConnection,
//   initDatabase
// };


// backend/config/database.js
import mongoose from 'mongoose';
import pkg from 'pg';
const { Pool } = pkg;

class DatabaseManager {
  constructor() {
    this.mongoConnected = false;
    this.postgresConnected = false;
    this.postgresPool = null;
  }

  async connectMongoDB(uri) {
    try {
      await mongoose.connect(uri);
      this.mongoConnected = true;
      return true;
    } catch (error) {
      console.error("MongoDB connection error:", error);
      return false;
    }
  }

  async connectPostgres(connectionString) {
    try {
      this.postgresPool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
      });
      
      const client = await this.postgresPool.connect();
      client.release();
      this.postgresConnected = true;
      return true;
    } catch (error) {
      console.error("PostgreSQL connection error:", error);
      return false;
    }
  }

  getPostgresPool() {
    return this.postgresPool;
  }

  isMongoConnected() {
    return this.mongoConnected;
  }

  isPostgresConnected() {
    return this.postgresConnected;
  }
}

export default new DatabaseManager();