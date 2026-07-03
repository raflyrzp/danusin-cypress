# Panduan Konfigurasi Apache JMeter untuk Uji Beban Checkout

Panduan ini mendeskripsikan langkah taktis untuk mensimulasikan ancaman _race condition_ (50 pengguna virtual melakukan checkout bersamaan dalam 1 detik) menggunakan GUI Apache JMeter. 

File JMX siap pakai telah disediakan di direktori `tests/performance/jmeter/checkout_plan.jmx`. Jika Anda ingin menyusun atau memodifikasinya dari awal secara manual, ikuti tahapan berikut:

## 1. Membuat Thread Group (Skenario Beban)
_Thread Group digunakan untuk mengatur jumlah pengguna virtual dan ritme serangan request._

1. Klik kanan pada **Test Plan** > **Add** > **Threads (Users)** > **Thread Group**.
2. Ubah nama menjadi: **"Checkout Virtual Users"**.
3. Atur parameter krusial berikut:
   - **Number of Threads (users)**: `50` (Mensimulasikan 50 pengguna bersamaan).
   - **Ramp-up period (seconds)**: `1` (Menjejalkan seluruh 50 pengguna tersebut dalam jendela waktu 1 detik).
   - **Loop Count**: `1` (Masing-masing pengguna menembak tepat satu kali).

## 2. Menyisipkan HTTP Header Manager
_Header Manager menyuntikkan kredensial autentikasi JWT dan tipe konten._

1. Klik kanan pada **Checkout Virtual Users** > **Add** > **Config Element** > **HTTP Header Manager**.
2. Klik **Add** di bagian bawah untuk menambahkan dua _header_ ini:
   - Name: `Content-Type`, Value: `application/json`
   - Name: `Authorization`, Value: `Bearer <MASUKKAN_TOKEN_JWT_VALID>` (Pastikan Anda menggunakan token dari akun yang sah).

## 3. Menyisipkan HTTP Request
_Komponen ini merupakan proyektil utama yang ditembakkan ke endpoint backend._

1. Klik kanan pada **Checkout Virtual Users** > **Add** > **Sampler** > **HTTP Request**.
2. Ubah nama menjadi: **"POST Checkout API"**.
3. Konfigurasi endpoint target:
   - **Protocol**: `http`
   - **Server Name or IP**: `localhost`
   - **Port Number**: `5000`
   - **HTTP Request Method**: `POST`
   - **Path**: `/api/v1/orders/checkout`
4. Pindah ke tab **Body Data** (di dalam HTTP Request) dan rekatkan JSON berikut:
   ```json
   {
     "product_id": 12,
     "quantity": 3,
     "pickup_location": "Gedung A MIPA",
     "pickup_day": "Rabu"
   }
   ```

## 4. Menyisipkan Response Assertion
_Karena ini adalah simulasi overselling/race condition, tidak semua request akan sukses 100%. Kita mengekspektasikan sistem akan menggugurkan sebagian transaksi dengan anggun._

1. Klik kanan pada **POST Checkout API** > **Add** > **Assertions** > **Response Assertion**.
2. Centang **"Ignore Status"** (Agar warna status merah tidak muncul pada balasan HTTP 400 stok habis).
3. Pada **Field to Test**, pilih **Response Code**.
4. Pada **Pattern Matching Rules**, pilih **Matches** atau **Contains** (centang "Or").
5. Klik **Add** pada _Patterns to Test_ lalu masukkan:
   - `201` (Sukses Checkout)
   - `400` (Gagal karena Validasi/Stok)

## 5. Menyisipkan Listener (Pembaca Hasil)
_Listener merekam statistik respons sistem dan memperlihatkan letak botol leher (bottleneck)._

1. Klik kanan pada **Checkout Virtual Users** > **Add** > **Listener** > **View Results Tree** (Untuk menginspeksi header dan JSON respons mentah satu per satu).
2. Klik kanan pada **Checkout Virtual Users** > **Add** > **Listener** > **Summary Report** (Untuk meninjau persentase error, latensi Min/Max, dan nilai Throughput/RPS secara agregat).

**Eksekusi:** Klik tombol hijau (Play) pada menu bar atas. Amati Summary Report. Sistem yang solid tidak akan mengizinkan transaksi melebihi jatah 5 stok dan sisanya akan dijegal dengan rapi.
