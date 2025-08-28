const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let db;

// Initialize database and start server
initializeDatabase()
    .then((database) => {
        db = database;
        console.log('Database initialized successfully');
        
        // API Routes
        
        // Create a new vendor
        app.post('/api/vendors', (req, res) => {
            const { name, contact_email, phone_number, address } = req.body;
            
            if (!name) {
                return res.status(400).json({ error: 'Vendor name is required' });
            }
            
            const sql = `INSERT INTO vendors (name, contact_email, phone_number, address) 
                         VALUES (?, ?, ?, ?)`;
            
            db.run(sql, [name, contact_email, phone_number, address], function(err) {
                if (err) {
                    console.error('Error creating vendor:', err);
                    return res.status(500).json({ error: 'Failed to create vendor' });
                }
                res.status(201).json({ 
                    id: this.lastID, 
                    name, 
                    contact_email, 
                    phone_number, 
                    address,
                    date_created: new Date().toISOString()
                });
            });
        });
        
        // Get all vendors
        app.get('/api/vendors', (req, res) => {
            const sql = 'SELECT * FROM vendors ORDER BY date_created DESC';
            
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error('Error fetching vendors:', err);
                    return res.status(500).json({ error: 'Failed to fetch vendors' });
                }
                res.json(rows);
            });
        });
        
        // Get a single vendor by ID
        app.get('/api/vendors/:id', (req, res) => {
            const { id } = req.params;
            const sql = 'SELECT * FROM vendors WHERE id = ?';
            
            db.get(sql, [id], (err, row) => {
                if (err) {
                    console.error('Error fetching vendor:', err);
                    return res.status(500).json({ error: 'Failed to fetch vendor' });
                }
                if (!row) {
                    return res.status(404).json({ error: 'Vendor not found' });
                }
                res.json(row);
            });
        });
        
        // Update a vendor
        app.put('/api/vendors/:id', (req, res) => {
            const { id } = req.params;
            const { name, contact_email, phone_number, address } = req.body;
            
            if (!name) {
                return res.status(400).json({ error: 'Vendor name is required' });
            }
            
            const sql = `UPDATE vendors 
                         SET name = ?, contact_email = ?, phone_number = ?, address = ? 
                         WHERE id = ?`;
            
            db.run(sql, [name, contact_email, phone_number, address, id], function(err) {
                if (err) {
                    console.error('Error updating vendor:', err);
                    return res.status(500).json({ error: 'Failed to update vendor' });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Vendor not found' });
                }
                res.json({ 
                    id: parseInt(id), 
                    name, 
                    contact_email, 
                    phone_number, 
                    address 
                });
            });
        });
        
        // Delete a vendor
        app.delete('/api/vendors/:id', (req, res) => {
            const { id } = req.params;
            const sql = 'DELETE FROM vendors WHERE id = ?';
            
            db.run(sql, [id], function(err) {
                if (err) {
                    console.error('Error deleting vendor:', err);
                    return res.status(500).json({ error: 'Failed to delete vendor' });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Vendor not found' });
                }
                res.json({ message: 'Vendor deleted successfully' });
            });
        });
        
        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGINT', () => {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Database connection closed.');
        });
    }
    process.exit(0);
});