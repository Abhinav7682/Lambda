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

// Seed dummy data
const products = [
    { name: 'Wireless Headphones', description: 'High-quality noise-canceling wireless headphones.', price: 99.99, stock_quantity: 50 },
    { name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard with cherry MX switches.', price: 129.99, stock_quantity: 30 },
    { name: 'Gaming Mouse', description: 'Ergonomic gaming mouse with adjustable DPI.', price: 49.99, stock_quantity: 100 },
    { name: '27-inch Monitor', description: '4K IPS monitor with a 144Hz refresh rate.', price: 349.99, stock_quantity: 20 },
    { name: 'USB-C Docking Station', description: 'Multi-port USB-C dock for laptops.', price: 79.99, stock_quantity: 45 },
    { name: 'Webcam 1080p', description: 'HD webcam with built-in microphone.', price: 59.99, stock_quantity: 60 }
];

const insert = db.prepare('INSERT INTO products (name, description, price, stock_quantity) VALUES (@name, @description, @price, @stock_quantity)');

const count = db.prepare('SELECT COUNT(*) AS count FROM products').get();

if (count.count === 0) {
    console.log('Seeding dummy data...');
    const insertMany = db.transaction((prods) => {
        for (const prod of prods) insert.run(prod);
    });
    insertMany(products);
    console.log('Dummy data seeded successfully.');
} else {
    console.log('Database already seeded.');
}

db.close();
