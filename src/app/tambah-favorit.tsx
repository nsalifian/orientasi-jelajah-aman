// src/app/tambah-favorit.tsx
import { View, Text, Button } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { tambahFavorit } from "../services/favoritStorage";
import { useTema } from "../context/ThemeContext";

export default function ModalTambahFavorit() {
  const { warna } = useTema();
  const { id, nama, lat, lon } = useLocalSearchParams<{
    id: string;
    nama: string;
    lat: string;
    lon: string;
  }>();

  async function simpan() {
    await tambahFavorit({
      id: Number(id),
      nama,
      latitude: Number(lat),
      longitude: Number(lon),
    });
    router.back();
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 16, backgroundColor: warna.latar }}>
      <Text style={{ color: warna.teks, fontSize: 16 }}>
        Tambahkan {nama} ke daftar favorit?
      </Text>
      <Button title="Simpan" onPress={simpan} />
      <Button title="Batal" color={warna.teksSekunder} onPress={() => router.back()} />
    </View>
  );
}