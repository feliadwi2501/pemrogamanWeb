// ===== Hamburger Menu =====
function initNavToggle() {
    const toggleBtn = document.getElementById("nav-toggle-btn");
    const nav = document.querySelector("header nav");
    if (!toggleBtn || !nav) return;

    toggleBtn.addEventListener("click", function () {
        nav.classList.toggle("nav-open");
    });
}

// ===== Konfirmasi Hapus =====
function initHapusConfirm() {
    document.addEventListener("click", function (e) {
        const btn = e.target.closest(".btn-hapus");
        if (!btn) return;

        const row = btn.closest("tr");
        const nama = row ? row.querySelector("td")?.textContent : "data ini";
        const yakin = confirm("Yakin ingin menghapus \"" + nama + "\"?");
        if (yakin && row) {
            row.remove();
        }
    });
}

// ===== Filter/Pencarian Tabel =====
function initTableFilter() {
    const input = document.getElementById("search-input");
    const table = document.querySelector(".table-responsive table");
    if (!input || !table) return;

    input.addEventListener("keyup", function () {
        const keyword = input.value.toLowerCase();
        const rows = table.querySelectorAll("tbody tr");
        rows.forEach(function (row) {
            const teks = row.textContent.toLowerCase();
            row.style.display = teks.includes(keyword) ? "" : "none";
        });
    });
}

// ===== Validasi Form (Client-Side) =====
function tampilkanError(input, pesan) {
    hapusError(input);
    const span = document.createElement("span");
    span.className = "error";
    span.textContent = pesan;
    input.insertAdjacentElement("afterend", span);
}

function hapusError(input) {
    const next = input.nextElementSibling;
    if (next && next.classList.contains("error")) {
        next.remove();
    }
}

function initValidasiForm() {
    const form = document.getElementById("form-tambah");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        let valid = true;

        const judul = form.querySelector("[name='judul'], [name='nama']");
        if (judul && judul.value.trim() === "") {
            tampilkanError(judul, "Field ini wajib diisi.");
            valid = false;
        } else if (judul) {
            hapusError(judul);
        }

        const pengarang = form.querySelector("[name='pengarang']");
        if (pengarang && pengarang.value.trim() === "") {
            tampilkanError(pengarang, "Pengarang wajib diisi.");
            valid = false;
        } else if (pengarang) {
            hapusError(pengarang);
        }

        const tahun = form.querySelector("[name='tahun']");
        if (tahun) {
            const nilai = parseInt(tahun.value, 10);
            if (isNaN(nilai) || nilai < 1900 || nilai > 2026) {
                tampilkanError(tahun, "Tahun harus di antara 1900-2026.");
                valid = false;
            } else {
                hapusError(tahun);
            }
        }

        const stok = form.querySelector("[name='stok']");
        if (stok) {
            const nilai = parseInt(stok.value, 10);
            if (isNaN(nilai) || nilai < 0) {
                tampilkanError(stok, "Stok tidak boleh negatif.");
                valid = false;
            } else {
                hapusError(stok);
            }
        }

        const isbn = form.querySelector("[name='isbn']");
        if (isbn && isbn.value.trim() !== "") {
            const isbnPattern = /^[0-9-]+$/;
            if (!isbnPattern.test(isbn.value.trim())) {
                tampilkanError(isbn, "ISBN hanya boleh berisi angka dan tanda hubung (-).");
                valid = false;
            } else {
                hapusError(isbn);
            }
        } else if (isbn) {
            hapusError(isbn);
        }

        if (!valid) {
            e.preventDefault();
        }
    });
}

// ===== FUNGSI GENERIK (Pemuat Data JSON) =====
async function muatDataJSON(url, selectorTabel, keys, delay = 3000) {
    const tbody = document.querySelector(selectorTabel);
    const loading = document.getElementById("loading-indicator");
    if (!tbody) return;

    if (loading) loading.style.display = "block";
    tbody.innerHTML = "";

    try {
        // Simulasi delay jaringan 3 detik
        await new Promise((resolve) => setTimeout(resolve, delay));

        const res = await fetch(url);
        if (!res.ok) throw new Error("Gagal mengambil data (status " + res.status + ")");
        
        const dataList = await res.json();

        dataList.forEach(function (item) {
            const tr = document.createElement("tr");
            let htmlRow = keys.map(key => `<td>${item[key] ?? "-"}</td>`).join("");
            htmlRow += `<td><button type="button">Edit</button> <button type="button" class="btn-hapus">Hapus</button></td>`;
            
            tr.innerHTML = htmlRow;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="${keys.length + 1}">Gagal memuat data: ${err.message}</td></tr>`;
    } finally {
        if (loading) loading.style.display = "none";
    }
}

// ===== Initialization =====
document.addEventListener("DOMContentLoaded", function () {
    initNavToggle();
    initHapusConfirm();
    initTableFilter();
    initValidasiForm();

    // Deteksi halaman & panggil fungsi generik
    if (document.querySelector("title")?.textContent.includes("Daftar Buku")) {
        muatDataJSON("../data/buku.json", ".table-responsive table tbody", ["judul", "pengarang", "tahun", "stok", "kategori"]);
    } 
    else if (document.querySelector("title")?.textContent.includes("Daftar Anggota")) {
        muatDataJSON("../data/anggota.json", ".table-responsive table tbody", ["no_anggota", "nama", "alamat", "no_hp"]);
    }
});