name: bootstrap-database
description: Initializes the SQLite database for the e-commerce shopping website, creates the required product tables, and seeds it with initial inventory data. Use this whenever the database needs to be reset or initialized.
---
# Goal
Create a robust SQLite schema for storing product information and seed it with dummy data suitable for the AWS deployment demonstration.

# Instructions
1.  **Schema Definition:** Create a Node.js script named init_db.js that utilizes an SQLite module to create a database file named ecommerce.db.
2.  **Table Creation:** Define a table named products with the following columns: id (INTEGER PRIMARY KEY), name (TEXT NOT NULL), description (TEXT), price (REAL NOT NULL), and stock_quantity (INTEGER NOT NULL).
3.  **Data Seeding:** Insert at least five distinct product records into the products table (e.g., 'Cloud Computing Textbook', 'Wireless Mouse', 'Mechanical Keyboard').
4.  **Execution:** Execute the init_db.js script to generate the database file.
5.  **Verification:** Run a SELECT * FROM products query using the sqlite-query tool to verify the data was inserted successfully, and present the output to the user.
