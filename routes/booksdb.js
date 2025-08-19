const express = require('express');
const router = express.Router();
const db = require('../database/db'); // Import the database connection

// === Endpoint untuk mendapatkan semua buku ===
router.get('/', (req, res) => {
    db.query('SELECT * FROM books', (err, results) => {
        if (err) {
            console.error('Error fetching books:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.json(results);
    });
});

// === Endpoint untuk mendapatkan buku berdasarkan ID ===
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM books WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error fetching book by ID:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (results.length === 0) {
            return res.status(404).send('Buku tidak ditemukan');
        }
        res.json(results[0]);
    });
});

// === Endpoint untuk menambahkan buku baru ===
router.post('/', (req, res) => {
    const { title } = req.body;
    if (!title || title.trim() === '') {
        return res.status(400).send('Judul buku tidak boleh kosong');
    }

    db.query('INSERT INTO books (title) VALUES (?)', [title.trim()], (err, results) => {
        if (err) {
            console.error('Error adding new book:', err);
            return res.status(500).send('Internal Server Error');
        }
        const newBook = { id: results.insertId, title: title.trim() };
        res.status(201).json(newBook);
    });
});

// === Endpoint untuk memperbarui buku ===
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    if (!title || title.trim() === '') {
        return res.status(400).send('Judul buku tidak boleh kosong');
    }
    
    db.query('UPDATE books SET title = ? WHERE id = ?', [title.trim(), id], (err, results) => {
        if (err) {
            console.error('Error updating book:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Buku tidak ditemukan');
        }
        res.json({ id: id, title: title.trim() });
    });
});

// === Endpoint untuk menghapus buku ===
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM books WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error deleting book:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Buku tidak ditemukan');
        }
        res.status(204).send(); // No Content
    });
});

module.exports = router;
