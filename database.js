const sqlite3 = require('sqlite3').verbose();

function initializeDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./vendors.db', (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                reject(err);
            } else {
                console.log('Connected to SQLite database.');
            }
        });

        // Create vendors table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS vendors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                contact_email TEXT,
                phone_number TEXT,
                address TEXT,
                date_created DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
                reject(err);
            } else {
                console.log('Vendors table ready.');
                resolve(db);
            }
        });
    });
}

module.exports = { initializeDatabase };