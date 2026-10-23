// Mengimpor dependensi
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server API Tokoku berhasil berjalan!");
});

// GET semua produk. Alias id dan nama dipertahankan agar kompatibel dengan admin-app.js.
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id_produk AS id,
        p.id_kategori,
        p.nama_produk AS nama,
        k.nama_kategori AS kategori,
        p.harga,
        p.stok,
        p.status,
        p.badge,
        p.rating,
        p.gambar,
        p.deskripsi
      FROM produk AS p
      LEFT JOIN kategori AS k ON p.id_kategori = k.id_kategori
      ORDER BY p.id_produk ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Gagal mengambil data produk:", error);
    res.status(500).json({ error: "Gagal mengambil data produk" });
  }
});

// GET semua kategori
app.get("/api/kategori", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_kategori, nama_kategori
      FROM kategori
      ORDER BY id_kategori ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error mengambil kategori:", error);
    res.status(500).json({ error: "Gagal mengambil data kategori" });
  }
});

// POST tambah produk
app.post("/api/products", async (req, res) => {
  try {
    const { nama_produk, id_kategori, harga, stok, gambar, rating, deskripsi } =
      req.body;

    if (!nama_produk || id_kategori == null || harga == null || stok == null) {
      return res
        .status(400)
        .json({ error: "Nama, kategori, harga, dan stok wajib diisi." });
    }

    const result = await pool.query(
      `INSERT INTO produk
        (nama_produk, id_kategori, harga, stok, gambar, rating, deskripsi, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        nama_produk.trim(),
        Number(id_kategori),
        Number(harga),
        Number(stok),
        gambar || null,
        rating == null ? 0 : Number(rating),
        deskripsi || null,
        Number(stok) > 0 ? "Aktif" : "Habis",
      ],
    );

    res.status(201).json({
      message: "Produk berhasil ditambahkan!",
      produk: result.rows[0],
    });
  } catch (error) {
    console.error("Gagal menambah produk:", error);
    res.status(500).json({ error: "Gagal menyimpan produk ke database" });
  }
});

// PUT memperbarui produk. Termasuk rating agar form edit dapat menyimpan semua field.
app.put("/api/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nama_produk, id_kategori, harga, stok, gambar, deskripsi, rating } =
      req.body;

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "ID produk tidak valid." });
    }
    if (
      !nama_produk ||
      id_kategori == null ||
      harga == null ||
      stok == null ||
      rating == null
    ) {
      return res
        .status(400)
        .json({
          error: "Nama, kategori, harga, stok, dan rating wajib diisi.",
        });
    }

    const stokAngka = Number(stok);
    const hargaAngka = Number(harga);
    const ratingAngka = Number(rating);

    if (
      !Number.isFinite(hargaAngka) ||
      hargaAngka < 0 ||
      !Number.isInteger(stokAngka) ||
      stokAngka < 0 ||
      !Number.isFinite(ratingAngka) ||
      ratingAngka < 0 ||
      ratingAngka > 5
    ) {
      return res
        .status(400)
        .json({ error: "Harga, stok, atau rating tidak valid." });
    }

    const result = await pool.query(
      `UPDATE produk
       SET nama_produk = $1,
           id_kategori = $2,
           harga = $3,
           stok = $4,
           gambar = $5,
           deskripsi = $6,
           rating = $7,
           status = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id_produk = $9
       RETURNING *`,
      [
        nama_produk.trim(),
        Number(id_kategori),
        hargaAngka,
        stokAngka,
        gambar || null,
        deskripsi || null,
        ratingAngka,
        stokAngka > 0 ? "Aktif" : "Habis",
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Produk tidak ditemukan." });
    }

    res.json({
      message: "Produk berhasil diperbarui!",
      produk: result.rows[0],
    });
  } catch (error) {
    console.error("Gagal memperbarui produk:", error);
    res.status(500).json({ error: "Gagal memperbarui data produk" });
  }
});

// DELETE produk
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM produk WHERE id_produk = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    res.json({ message: "Produk berhasil dihapus!" });
  } catch (error) {
    console.error("Gagal menghapus produk:", error);
    res.status(500).json({ error: "Gagal menghapus data produk" });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
