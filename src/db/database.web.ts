// src/db/database.web.ts
// Versi khusus web: SQLite tidak didukung penuh di browser,
// jadi database ini sengaja dibuat selalu gagal agar fitur cache
// otomatis dilewati dan aplikasi tetap berjalan normal (mode online-saja).
export function ambilDatabase(): Promise<never> {
  return Promise.reject(new Error("SQLite tidak didukung di web"));
}