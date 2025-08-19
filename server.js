// server.js
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const db = require("./database/db");
const port = process.env.PORT || 3001;
const expressLayouts = require("express-ejs-layouts");

// Middleware
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Konfigurasi EJS sebagai view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/main-layouts");

// === Rute Utama ===
app.get("/", (req, res) => {
  res.render("index", {
    layout: "layouts/main-layouts",
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    layout: "layouts/main-layouts",
  });
});

// === Rute untuk menampilkan data dari database ===
app.get("/books", (req, res) => {
  db.query("SELECT * FROM books", (err, books) => {
    if (err) {
      console.error("Error fetching books:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.render("books-page", { books: books, layout: "layouts/main-layouts" });
  });
});

// === Rute CRUD untuk Database ===

// CREATE: Menambahkan buku baru ke database
app.post("/add-book", (req, res) => {
  const newBookTitle = req.body.title;
  if (!newBookTitle || newBookTitle.trim() === '') {
    return res.status(400).send("Judul buku tidak boleh kosong.");
  }

  db.query("INSERT INTO books (title) VALUES (?)", [newBookTitle.trim()], (err, results) => {
    if (err) {
      console.error("Error adding book to database:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.redirect("/books"); // Arahkan kembali ke daftar buku
  });
});

// UPDATE: Memperbarui judul buku di database
app.post("/update-book/:id", (req, res) => {
  const bookId = req.params.id;
  const updatedTitle = req.body.title;
  
  if (!updatedTitle || updatedTitle.trim() === '') {
    return res.status(400).send("Judul buku tidak boleh kosong.");
  }

  db.query("UPDATE books SET title = ? WHERE id = ?", [updatedTitle.trim(), bookId], (err, results) => {
    if (err) {
      console.error("Error updating book:", err);
      return res.status(500).send("Internal Server Error");
    }
    if (results.affectedRows === 0) {
      return res.status(404).send("Buku tidak ditemukan.");
    }
    res.redirect("/books");
  });
});

// DELETE: Menghapus buku dari database
app.post("/delete-book/:id", (req, res) => {
  const bookId = req.params.id;

  db.query("DELETE FROM books WHERE id = ?", [bookId], (err, results) => {
    if (err) {
      console.error("Error deleting book:", err);
      return res.status(500).send("Internal Server Error");
    }
    if (results.affectedRows === 0) {
      return res.status(404).send("Buku tidak ditemukan.");
    }
    res.redirect("/books");
  });
});


// Middleware 404 (harus di akhir)
app.use((req, res, next) => {
  res.status(404).send("404 - page not found");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
