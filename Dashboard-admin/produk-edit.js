const API_URL = "http://localhost:3000/api";

const parameterURL = new URLSearchParams(window.location.search);
const idProduk = parameterURL.get("id");

const form = document.getElementById("form-edit-produk");
const selectKategori = document.getElementById("kategori-produk");
const tombolSimpan = document.getElementById("tombol-simpan");
const kotakPesan = document.getElementById("pesan");

function tampilkanPesan(teks, berhasil = false) {
  kotakPesan.textContent = teks;
  kotakPesan.className = berhasil
    ? "mb-4 rounded-lg p-3 bg-green-100 text-green-700"
    : "mb-4 rounded-lg p-3 bg-red-100 text-red-700";
}

async function ambilJSON(response, pesanGagal) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || pesanGagal);
  }
  return data;
}

async function loadKategori() {
  const response = await fetch(`${API_URL}/kategori`);
  const kategori = await ambilJSON(response, "Gagal mengambil kategori.");

  selectKategori.innerHTML = '<option value="">-- Pilih Kategori --</option>';

  kategori.forEach((item) => {
    const option = document.createElement("option");
    option.value = String(item.id_kategori);
    option.textContent = item.nama_kategori;
    selectKategori.appendChild(option);
  });
}

async function loadProduk() {
  if (!idProduk || !/^\d+$/.test(idProduk) || Number(idProduk) < 1) {
    tampilkanPesan(
      "ID produk tidak valid. Buka halaman edit melalui tombol Edit pada daftar produk.",
    );
    tombolSimpan.disabled = true;
    return;
  }

  tombolSimpan.disabled = true;

  try {
    // Muat kategori dan produk dari API.
    const [, daftarProduk] = await Promise.all([
      loadKategori(),
      fetch(`${API_URL}/products`).then((response) =>
        ambilJSON(response, "Gagal mengambil data produk."),
      ),
    ]);

    const produk = daftarProduk.find(
      (item) => String(item.id) === String(idProduk),
    );

    if (!produk) {
      throw new Error("Produk tidak ditemukan.");
    }

    document.getElementById("nama-produk").value = produk.nama ?? "";
    document.getElementById("harga-produk").value = produk.harga ?? "";
    document.getElementById("stok-produk").value = produk.stok ?? "";
    document.getElementById("gambar-produk").value = produk.gambar ?? "";
    document.getElementById("rating-produk").value = produk.rating ?? 0;
    document.getElementById("deskripsi-produk").value = produk.deskripsi ?? "";

    // API mengirim id_kategori. Jika tidak ada (data API lama), cocokkan dari nama kategori.
    let idKategori = produk.id_kategori;
    if (idKategori == null) {
      const kategoriCocok = [...selectKategori.options].find(
        (option) => option.textContent === produk.kategori,
      );
      idKategori = kategoriCocok?.value ?? "";
    }
    selectKategori.value = idKategori == null ? "" : String(idKategori);

    tombolSimpan.disabled = false;
  } catch (error) {
    console.error(error);
    tampilkanPesan(error.message || "Gagal memuat data produk.");
    tombolSimpan.disabled = true;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!idProduk || !/^\d+$/.test(idProduk)) {
    tampilkanPesan("ID produk tidak valid.");
    return;
  }

  const dataProduk = {
    nama_produk: document.getElementById("nama-produk").value.trim(),
    id_kategori: Number(selectKategori.value),
    harga: Number(document.getElementById("harga-produk").value),
    stok: Number(document.getElementById("stok-produk").value),
    gambar: document.getElementById("gambar-produk").value.trim(),
    rating: Number(document.getElementById("rating-produk").value),
    deskripsi: document.getElementById("deskripsi-produk").value.trim(),
  };

  if (!dataProduk.nama_produk || !selectKategori.value) {
    tampilkanPesan("Nama produk dan kategori wajib diisi.");
    return;
  }
  if (!Number.isFinite(dataProduk.harga) || dataProduk.harga < 0) {
    tampilkanPesan("Harga harus berupa angka nol atau lebih.");
    return;
  }
  if (!Number.isInteger(dataProduk.stok) || dataProduk.stok < 0) {
    tampilkanPesan("Stok harus berupa bilangan bulat nol atau lebih.");
    return;
  }
  if (
    !Number.isFinite(dataProduk.rating) ||
    dataProduk.rating < 0 ||
    dataProduk.rating > 5
  ) {
    tampilkanPesan("Rating harus berada di antara 0 sampai 5.");
    return;
  }

  tombolSimpan.disabled = true;
  tombolSimpan.textContent = "Menyimpan...";

  try {
    const response = await fetch(
      `${API_URL}/products/${encodeURIComponent(idProduk)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataProduk),
      },
    );

    await ambilJSON(response, "Gagal memperbarui produk.");
    tampilkanPesan("Produk berhasil diperbarui!", true);

    window.setTimeout(() => {
      window.location.href = "produk-admin.html";
    }, 1000);
  } catch (error) {
    console.error(error);
    tampilkanPesan(
      error.message || "Terjadi kesalahan saat menyimpan perubahan.",
    );
    tombolSimpan.disabled = false;
    tombolSimpan.textContent = "Simpan Perubahan";
  }
});

loadProduk();
