import http from 'k6/http';
import { check, sleep } from 'k6';

// Konfigurasi Fase Pengujian (Load & Stress Testing)
export const options = {
  stages: [
    { duration: '10s', target: 100 }, // Ramp-up dari 1 ke 100 Virtual Users (VUs) dalam 10 detik
    { duration: '30s', target: 100 }, // Tahan beban puncak di 100 VUs selama 30 detik
    { duration: '10s', target: 0 },   // Ramp-down bertahap dari 100 ke 0 VUs dalam 10 detik
  ],
  thresholds: {
    // Toleransi tingkat kegagalan respons (HTTP error rate) maksimal 1%
    http_req_failed: ['rate<0.01'],
    // 95% dari seluruh request harus diselesaikan di bawah 500ms
    http_req_duration: ['p(95)<500'],
  },
};

// Data uji statis (Target endpoint dan kredensial)
const BASE_URL = 'http://localhost:5000/api/v1/orders/checkout';
// TODO: Ganti dengan token JWT statis (dari user valid) untuk kebutuhan load test
const JWT_TOKEN = 'ISI_DENGAN_TOKEN_JWT_YANG_VALID'; 

export default function () {
  // Payload checkout sesuai dengan skenario race condition stok
  const payload = JSON.stringify({
    product_id: 12,
    quantity: 3,
    pickup_location: 'Gedung A MIPA',
    pickup_day: 'Rabu',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JWT_TOKEN}`,
    },
  };

  // Mengirim HTTP POST request ke endpoint checkout
  const res = http.post(BASE_URL, payload, params);

  // Verifikasi respons balasan dari server
  // Pada simulasi balapan (race condition) dengan sisa stok 5:
  // - VUs awal yang menembus sistem akan mendapatkan HTTP 201 (Transaksi Berhasil)
  // - VUs ke-6 dan seterusnya harus ditolak secara elegan dengan HTTP 400 (Stok habis)
  check(res, {
    'status is 201 or 400': (r) => r.status === 201 || r.status === 400,
    'transaction successful (201)': (r) => r.status === 201,
    'stock depleted correctly (400)': (r) => r.status === 400 && r.body.includes('Stok tidak mencukupi'),
  });

  // Jeda acak antar request (0 - 1 detik) untuk mensimulasikan jeda interaksi manusia yang organik
  sleep(Math.random() * 1);
}
