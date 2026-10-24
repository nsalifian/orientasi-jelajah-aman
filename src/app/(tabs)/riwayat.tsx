// src/app/(tabs)/riwayat.tsx
import { useState, useCallback } from "react";
import { View, Text, Button, Alert, Platform, ScrollView, TouchableOpacity } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { ambilRiwayatPencarian, hapusRiwayatPencarian } from "../../services/searchHistoryStorage";
import { useTema } from "../../context/ThemeContext";
import { KotaFavorit } from "../../../types/favorit";
import { HasilGeocoding } from "../../../types/geocoding";

function konfirmasi(judul: string, pesan: string, onYa: () => void) {
  if (Platform.OS === "web") {
    if (window.confirm(`${judul}\n\n${pesan}`)) onYa();
  } else {
    Alert.alert(judul, pesan, [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: onYa },
    ]);
  }
}

export default function TabRiwayat() {
  const { warna } = useTema();
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [daftarRiwayat, setDaftarRiwayat] = useState<HasilGeocoding[]>([]);

  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit().then(setDaftarFavorit);
      ambilRiwayatPencarian().then(setDaftarRiwayat);
    }, [])
  );

  async function hapusSatuFavorit(kota: KotaFavorit) {
    await hapusFavorit(kota.id);
    setDaftarFavorit((prev) => prev.filter((k) => k.id !== kota.id));
  }

  async function hapusSatuRiwayat(kota: HasilGeocoding) {
    await hapusRiwayatPencarian(kota.id);
    setDaftarRiwayat((prev) => prev.filter((k) => k.id !== kota.id));
  }

  function bukaKotaDariRiwayat(kota: HasilGeocoding) {
    router.push({
      pathname: "/",
      params: {
        id: String(kota.id),
        nama: kota.name,
        lat: String(kota.latitude),
        lon: String(kota.longitude),
      },
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.latar }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: warna.teks }}>
            Riwayat Pencarian Terakhir
          </Text>
          <Text style={{ color: warna.teksSekunder, fontSize: 12 }}>
            {daftarRiwayat.length} dari maksimal 10 tersimpan
          </Text>

          {daftarRiwayat.length === 0 && (
            <Text style={{ color: warna.teksSekunder }}>Belum ada riwayat pencarian</Text>
          )}

          {daftarRiwayat.map((kota) => (
            <View
              key={kota.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 10,
                borderRadius: 8,
                backgroundColor: warna.latarKartu,
              }}
            >
              <TouchableOpacity style={{ flex: 1 }} onPress={() => bukaKotaDariRiwayat(kota)}>
                <Text style={{ color: warna.teks }}>{kota.name}</Text>
              </TouchableOpacity>
              <Button
                title="Hapus"
                color={warna.bahaya}
                onPress={() =>
                  konfirmasi(
                    "Hapus Riwayat",
                    `Hapus "${kota.name}" dari riwayat pencarian?`,
                    () => hapusSatuRiwayat(kota)
                  )
                }
              />
            </View>
          ))}
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: warna.teks }}>Kota Favorit</Text>
          <Text style={{ color: warna.teksSekunder, fontSize: 12 }}>
            Tersimpan {daftarFavorit.length} kota
          </Text>

          {daftarFavorit.length === 0 && (
            <Text style={{ color: warna.teksSekunder }}>Belum ada kota favorit</Text>
          )}

          {daftarFavorit.map((kota) => (
            <View
              key={kota.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 10,
                borderRadius: 8,
                backgroundColor: warna.latarKartu,
              }}
            >
              <Text style={{ color: warna.teks }}>{kota.nama}</Text>
              <Button
                title="Hapus"
                color={warna.bahaya}
                onPress={() =>
                  konfirmasi("Hapus Favorit", `Yakin hapus ${kota.nama}?`, () =>
                    hapusSatuFavorit(kota)
                  )
                }
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}