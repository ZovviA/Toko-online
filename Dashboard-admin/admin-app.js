const API_URL = "http://localhost:3000/api";

const tabelBody = document.getElementById("tabel-produk-body");
const inputCari = document.getElementById("input-cari");
const filterKategori = document.getElementById("filter-kategori");

let dataProdukGlobal = [];
let dataKategoriGlobal = [];

async function initApp() {
  inputCari.addEventListener("input", filterData);
  filterKategori.addEventListener("change", filterData);

  await loadKategoriOptions();
  await loadProduk();
}

async function loadKategoriOptions() {
  try {
    const response = await fetch(`${API_URL}/kategori`);
    if (!response.ok) throw new Error("Gagal memuat kategori.");

    dataKategoriGlobal = await response.json();
    filterKategori.innerHTML = '<option value="">Semua Kategori</option>';

    dataKategoriGlobal.forEach((kategori) => {
      const option = document.createElement("option");
      option.value = kategori.nama_kategori;
      option.textContent = kategori.nama_kategori;
      filterKategori.appendChild(option);
    });
  } catch (error) {
    console.error("Gagal memuat kategori:", error);
  }
}

async function loadProduk() {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error("Gagal mengambil data produk.");

    dataProdukGlobal = await response.json();
    renderTabelAdmin(dataProdukGlobal);
  } catch (error) {
    console.error("Gagal mengambil data produk:", error);
    tabelBody.innerHTML = `
      <tr><td colspan="7" class="px-5 py-8 text-center text-red-600">
        Gagal memuat produk. Pastikan backend berjalan di http://localhost:3000.
      </td></tr>`;
  }
}

function renderTabelAdmin(listProduk) {
  if (!listProduk || listProduk.length === 0) {
    tabelBody.innerHTML = `
      <tr><td colspan="7" class="px-5 py-8 text-center text-gray-500">
        Data produk tidak ditemukan.
      </td></tr>`;
    return;
  }

  tabelBody.innerHTML = "";

  listProduk.forEach((item, index) => {
    const row = document.createElement("tr");
    row.className = "border-b hover:bg-gray-50";

    const gambar = document.createElement("img");
    gambar.src = item.gambar || "https://via.placeholder.com/48";
    gambar.alt = item.nama || "Gambar produk";
    gambar.className = "w-12 h-12 object-cover rounded";
    gambar.onerror = () => {
      gambar.onerror = null;
      gambar.src = "https://via.placeholder.com/48";
    };

    const kolomNo = document.createElement("td");
    kolomNo.className = "p-3 text-center align-middle";
    kolomNo.textContent = String(index + 1);

    const kolomProduk = document.createElement("td");
    kolomProduk.className = "p-3 text-center align-middle";
    const wadahProduk = document.createElement("div");
    wadahProduk.className = "flex gap-3 items-center";
    const nama = document.createElement("span");
    nama.className = "font-semibold text-gray-800";
    nama.textContent = item.nama || "(Tanpa nama)";
    wadahProduk.append(gambar, nama);
    kolomProduk.appendChild(wadahProduk);

    const kolomKategori = document.createElement("td");
    kolomKategori.className = "p-3 text-center align-middle";
    kolomKategori.textContent = item.kategori || "-";

    const kolomHarga = document.createElement("td");
    kolomHarga.className = "p-3 text-center align-middle font-medium";
    kolomHarga.textContent = `Rp ${Number(item.harga || 0).toLocaleString("id-ID")}`;

    const kolomStok = document.createElement("td");
    kolomStok.className = "p-3 text-center align-middle";
    kolomStok.textContent = String(item.stok ?? 0);

    const kolomStatus = document.createElement("td");
    kolomStatus.className = "p-3 text-center align-middle";
    const status = document.createElement("span");
    const stokAda = Number(item.stok) > 0;
    status.className = `px-2 py-1 text-xs rounded-full font-medium ${
      stokAda ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`;
    status.textContent = stokAda ? "Aktif" : "Habis";
    kolomStatus.appendChild(status);

    const kolomAksi = document.createElement("td");
    kolomAksi.className = "p-3 text-center align-middle whitespace-nowrap";

    const tombolEdit = document.createElement("button");
    tombolEdit.type = "button";
    tombolEdit.className =
      "bg-yellow-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-yellow-600 transition";
    tombolEdit.textContent = "Edit";
    tombolEdit.addEventListener("click", () => editProduk(item.id));

    const tombolHapus = document.createElement("button");
    tombolHapus.type = "button";
    tombolHapus.className =
      "bg-red-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-600 transition ml-1";
    tombolHapus.textContent = "Hapus";
    tombolHapus.addEventListener("click", () => hapusProduk(item.id));

    kolomAksi.append(tombolEdit, tombolHapus);
    row.append(
      kolomNo,
      kolomProduk,
      kolomKategori,
      kolomHarga,
      kolomStok,
      kolomStatus,
      kolomAksi,
    );
    tabelBody.appendChild(row);
  });
}

function filterData() {
  const keyword = inputCari.value.trim().toLowerCase();
  const kategoriDipilih = filterKategori.value;

  const hasilFilter = dataProdukGlobal.filter((item) => {
    const nama = String(item.nama || "").toLowerCase();
    const cocokNama = nama.includes(keyword);
    const cocokKategori = !kategoriDipilih || item.kategori === kategoriDipilih;
    return cocokNama && cocokKategori;
  });

  renderTabelAdmin(hasilFilter);
}

function editProduk(id) {
  if (!id) {
    alert("ID produk tidak valid.");
    return;
  }

  // Kirim ID produk ke halaman edit melalui query string.
  window.location.href = `produk-edit.html?id=${encodeURIComponent(id)}`;
}

async function hapusProduk(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

  try {
    const response = await fetch(
      `${API_URL}/products/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );

    const hasil = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(hasil.error || "Gagal menghapus produk.");
    }

    alert("Produk berhasil dihapus!");
    await loadProduk();
  } catch (error) {
    console.error(error);
    alert(error.message || "Terjadi kesalahan saat menghapus produk.");
  }
}

document.addEventListener("DOMContentLoaded", initApp);
