const API_URL = "http://localhost:3000/api";

// 1. Fungsi mengambil data kategori dari database untuk pilihan <select>
async function loadKategori() {
  const selectKategori = document.getElementById("kategori-produk");
  try {
    const response = await fetch(`${API_URL}/kategori`);
    if (!response.ok) throw new Error("Gagal mengambil data kategori");

    const dataKategori = await response.json();
    dataKategori.forEach((kategori) => {
      const option = document.createElement("option");
      option.value = kategori.id_kategori;
      option.textContent = kategori.nama_kategori;
      selectKategori.appendChild(option);
    });
  } catch (error) {
    console.error("Error mengambil kategori:", error);
  }
}

// 2. Fungsi mengirim data form ke backend (POST to PostgreSQL)
const formTambah = document.getElementById("form-tambah-produk");

if (formTambah) {
  formTambah.addEventListener("submit", async (e) => {
    e.preventDefault(); // Mencegah reload halaman otomatis

    // Mengambil nilai dari tiap input form
    const produkBaru = {
      nama_produk: document.getElementById("nama-produk").value,
      id_kategori: document.getElementById("kategori-produk").value,
      harga: document.getElementById("harga-produk").value,
      stok: document.getElementById("stok-produk").value,
      gambar: document.getElementById("gambar-produk").value,
      rating: document.getElementById("rating-produk").value,
      deskripsi: document.getElementById("deskripsi-produk").value,
    };

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(produkBaru),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan data produk");
      }

      alert("Produk berhasil ditambahkan!");
      // Otomatis berpindah kembali ke halaman tabel produk admin
      window.location.href = "produk-admin.html";
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat menyimpan produk.");
    }
  });
}

// Jalankan loadKategori saat dokumen siap
document.addEventListener("DOMContentLoaded", loadKategori);
