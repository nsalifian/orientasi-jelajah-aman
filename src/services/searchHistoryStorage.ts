// src/services/searchHistoryStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HasilGeocoding } from "../../types/geocoding";

const KUNCI_RIWAYAT = "@jelajah_aman:riwayat_pencarian";
const BATAS_RIWAYAT = 10;

export async function ambilRiwayatPencarian(): Promise<HasilGeocoding[]> {
  const json = await AsyncStorage.getItem(KUNCI_RIWAYAT);
  return json ? JSON.parse(json) : [];
}

export async function tambahKeRiwayatPencarian(kota: HasilGeocoding): Promise<void> {
  const daftar = await ambilRiwayatPencarian();
  const tanpaDuplikat = daftar.filter((k) => k.id !== kota.id);
  const daftarBaru = [kota, ...tanpaDuplikat].slice(0, BATAS_RIWAYAT);
  await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(daftarBaru));
}

export async function hapusRiwayatPencarian(id: number): Promise<void> {
  const daftar = await ambilRiwayatPencarian();
  const daftarBaru = daftar.filter((k) => k.id !== id);
  await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(daftarBaru));
}

export async function hapusSemuaRiwayatPencarian(): Promise<void> {
  await AsyncStorage.removeItem(KUNCI_RIWAYAT);
}