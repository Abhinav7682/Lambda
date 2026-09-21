const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'ecommerce.db');
const db = new Database(dbPath, { verbose: console.log });

console.log('Initializing database schema...');

// Create the products table
db.exec(`
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        stock_quantity INTEGER NOT NULL
    )
`);

console.log('Database schema created successfully.');
db.close();
