// src/app/(tabs)/pengaturan.tsx
import { useState } from "react";
import { Text, Button, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { hapusSemuaCache } from "../../services/cacheRepository";
import { hapusSemuaRiwayatPencarian } from "../../services/searchHistoryStorage";
import { useTema, ModeTema } from "../../context/ThemeContext";

const PILIHAN_TEMA: { nilai: ModeTema; label: string }[] = [
  { nilai: "terang", label: "Terang" },
  { nilai: "gelap", label: "Gelap" },
  { nilai: "sistem", label: "Ikuti Sistem" },
];

export default function TabPengaturan() {
  const { mode, aturMode, warna } = useTema();
  const [pesan, setPesan] = useState<string | null>(null);

  async function hapusDataTersimpan() {
    await hapusSemuaCache();
    setPesan("Data cuaca tersimpan sudah dihapus.");
  }

  async function hapusRiwayat() {
    await hapusSemuaRiwayatPencarian();
    setPesan("Riwayat pencarian sudah dihapus.");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.latar, padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", color: warna.teks }}>Jelajah Aman</Text>
      <Text style={{ color: warna.teksSekunder }}>Versi 1.0.0</Text>

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: "bold", color: warna.teks }}>Tampilan</Text>
        {PILIHAN_TEMA.map((pilihan) => (
          <TouchableOpacity
            key={pilihan.nilai}
            onPress={() => aturMode(pilihan.nilai)}
            style={{
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: mode === pilihan.nilai ? warna.aksen : warna.border,
              backgroundColor: mode === pilihan.nilai ? warna.latarKartu : "transparent",
            }}
          >
            <Text style={{ color: warna.teks }}>
              {mode === pilihan.nilai ? "● " : "○ "}
              {pilihan.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="Hapus Data Cuaca Tersimpan" onPress={hapusDataTersimpan} />
      <Button title="Hapus Riwayat Pencarian" onPress={hapusRiwayat} color={warna.bahaya} />

      {pesan && (
        <Text accessibilityLabel={pesan} style={{ color: warna.teksSekunder }}>{pesan}</Text>
      )}
    </SafeAreaView>
  );
}