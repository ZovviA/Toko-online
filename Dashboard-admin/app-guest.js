async function tampilkanProduk() {
  try {
    const response = await fetch("http://localhost:3000/api/products");
    const dataProduk = await response.json();

    const daftarProduk = document.getElementById("daftar-produk");
    daftarProduk.innerHTML = "";

    // Objek pemetaan warna berdasarkan teks badge
    const warnaBadgeMap = {
      "Best Seller": "bg-red-500 text-white",
      "Produk Baru": "bg-blue-500 text-white",
      "Hot Seller": "bg-orange-500 text-white",
      Promo: "bg-purple-500 text-white",
    };

    dataProduk.forEach((item) => {
      // 1. Tentukan warna stok
      const warnaStok = item.stok < 5 ? "text-red-500" : "text-green-600";

      // 2. Tentukan warna badge (gunakan warna default jika badge tidak terdaftar)
      const teksBadge = item.badge || "Produk";
      const warnaBadge = warnaBadgeMap[teksBadge] || "bg-gray-400 text-white";

      daftarProduk.innerHTML += `
        <div class="bg-white rounded-xl shadow p-5">
            <!-- GAMBAR -->
            <img src="${item.gambar}" alt="${item.nama}" class="w-full h-48 object-cover rounded-lg" />
            
            <div class="p-5">
                <!-- BADGE BERVARIASI -->
                <span class="inline-block ${warnaBadge} px-3 py-1 rounded-full text-sm font-semibold">
                    ${teksBadge}
                </span>
                
                <h3 class="text-xl font-bold mt-2">
                    ${item.nama}
                </h3>
                
                <p class="text-gray-600 mt-2">
                    ${item.deskripsi}
                </p>
                
                <p class="text-blue-600 font-bold text-lg mt-2">
                    Rp ${Number(item.harga).toLocaleString("id-ID")}
                </p>
                
                <p class="${warnaStok} font-semibold mt-2">
                    Stok: ${item.stok}
                </p>
                
                <p class="mt-2">
                    ⭐ ${item.rating}
                </p>
                
                <p class="text-sm text-gray-500">
                    Kategori: ${item.kategori}
                </p>

                <div class="mt-4">
                    <button class="w-full bg-blue-800 text-white py-2 rounded-full hover:bg-blue-700">
                        Detail Produk
                    </button>
                    <button class="w-full mt-2 bg-orange-800 text-white py-2 rounded-full hover:bg-orange-700">
                        Tambah ke Keranjang
                    </button>
                </div>
            </div>
        </div>
      `;
    });
  } catch (error) {
    console.error("Gagal mengambil data produk:", error);
  }
}

tampilkanProduk();
