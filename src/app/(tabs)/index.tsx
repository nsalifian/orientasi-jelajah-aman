// src/app/(tabs)/index.tsx
import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Button,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import StatusData from "../../components/StatusData";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import { ambilCuacaOfflineFirst, BATAS_CACHE_MS } from "../../services/cuacaRepository";
import {
  bersihkanCacheLama,
  daftarKotaTersimpan,
  hapusCache,
} from "../../services/cacheRepository";
import { mintaIzinLokasi, ambilKoordinatSaatIni } from "../../services/locationService";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { tambahKeRiwayatPencarian } from "../../services/searchHistoryStorage";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useTema } from "../../context/ThemeContext";
import { HasilGeocoding } from "../../../types/geocoding";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../../types/cache";

function konfirmasiHapusCache(nama: string, onYa: () => void) {
  if (Platform.OS === "web") {
    if (window.confirm(`Hapus cache offline untuk "${nama}"?`)) onYa();
  } else {
    Alert.alert("Hapus Cache", `Hapus cache offline untuk "${nama}"?`, [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: onYa },
    ]);
  }
}

export default function HalamanUtama() {
  const { warna } = useTema();
  const params = useLocalSearchParams<{ id?: string; nama?: string; lat?: string; lon?: string }>();

  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const [isFavorit, setIsFavorit] = useState(false);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0);
  const paramIdDiprosesRef = useRef<string | null>(null);

  async function muatKotaTersimpan() {
    setKotaTersimpan(await daftarKotaTersimpan());
  }

  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => {});
  }, []);

  // Fitur 2: buka otomatis kota yang diklik dari tab Riwayat
  useEffect(() => {
    if (!params.id || !params.nama || !params.lat || !params.lon) return;
    if (paramIdDiprosesRef.current === params.id) return; // cegah loop
    paramIdDiprosesRef.current = params.id;

    pilihKota({
      id: Number(params.id),
      name: params.nama,
      latitude: Number(params.lat),
      longitude: Number(params.lon),
      country: "",
    });
  }, [params.id, params.nama, params.lat, params.lon]);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda).then(setHasilPencarian).catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  useEffect(() => {
    if (!kotaTerpilih) {
      setIsFavorit(false);
      return;
    }
    ambilSemuaFavorit().then((daftar) => {
      setIsFavorit(daftar.some((k) => k.id === kotaTerpilih.id));
    });
  }, [kotaTerpilih]);

  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    setKotaTerpilih(kota);
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);

    if (kota.id !== -1) {
      tambahKeRiwayatPencarian(kota).catch(() => {});
    }

    try {
      const data = await ambilCuacaOfflineFirst(
        { id: kota.id, nama: kota.name, latitude: kota.latitude, longitude: kota.longitude },
        { paksaPerbarui }
      );

      if (idSaatIni !== requestIdRef.current) return;

      setHasil(data);
      muatKotaTersimpan();
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi."
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();

    if (status === "denied") {
      setPesanLokasi("Izin lokasi ditolak. Silakan cari kota secara manual di atas.");
      return;
    }
    if (status === "unavailable") {
      setPesanLokasi("Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.");
      return;
    }

    setPesanLokasi(null);
    const koordinat = await ambilKoordinatSaatIni();
    pilihKota({
      id: -1,
      name: "Lokasi Saat Ini",
      latitude: koordinat.latitude,
      longitude: koordinat.longitude,
      country: "",
    });
  }

  async function hapusCacheKota(k: RingkasanKotaTersimpan) {
    await hapusCache(k.kunci);
    muatKotaTersimpan();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.latar }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBox onCari={setTeksCari} />

        <Button title="Gunakan Lokasi Saat Ini" onPress={gunakanLokasiSaatIni} />
        {pesanLokasi && (
          <Text accessibilityLabel={pesanLokasi} style={{ color: warna.teks }}>
            {pesanLokasi}
          </Text>
        )}

        {hasilPencarian.map((kota) => (
          <TouchableOpacity key={kota.id} onPress={() => pilihKota(kota)}>
            <Text style={{ color: warna.teks }}>{kota.name}</Text>
          </TouchableOpacity>
        ))}

        {/* Fitur 3: daftar cache offline dengan tombol hapus per item */}
        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "bold", color: warna.teks }}>
              Tersimpan di perangkat (bisa dibuka offline)
            </Text>
            {kotaTersimpan.map((k) => (
              <View
                key={k.kunci}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: warna.latarKartu,
                }}
              >
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() =>
                    pilihKota({
                      id: k.id,
                      name: k.nama,
                      latitude: k.latitude,
                      longitude: k.longitude,
                      country: "",
                    })
                  }
                >
                  <Text style={{ color: warna.teks }}>{k.nama}</Text>
                </TouchableOpacity>
                <Button
                  title="Hapus"
                  color={warna.bahaya}
                  onPress={() => konfirmasiHapusCache(k.nama, () => hapusCacheKota(k))}
                />
              </View>
            ))}
          </View>
        )}

        {sedangMemuat && <ActivityIndicator />}

        {pesanError && (
          <View>
            <Text accessibilityLabel={pesanError} style={{ color: warna.teks }}>
              {pesanError}
            </Text>
            <Button
              title="Coba Lagi"
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
            />
          </View>
        )}

        {hasil && kotaTerpilih && !sedangMemuat && (
          <>
            <StatusData sumber={hasil.sumber} disimpanPada={hasil.disimpanPada} />

            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
            />

            <Text style={{ fontSize: 13, color: warna.teksSekunder }}>
              Hari ini: {hasil.cuaca.harian.suhuMaksimal[0]}°C / {hasil.cuaca.harian.suhuMinimal[0]}°C
            </Text>

            <Text style={{ fontSize: 12, color: warna.teksSekunder }}>
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)} • Angin{" "}
              {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>

            <Text style={{ fontSize: 11, color: warna.teksSekunder }}>
              PM2.5: {hasil.kualitasUdara.pm25} µg/m³ • PM10: {hasil.kualitasUdara.pm10} µg/m³
            </Text>

            <Button title="Perbarui Sekarang" onPress={() => pilihKota(kotaTerpilih, true)} />

            {isFavorit ? (
              <Text style={{ color: warna.teksSekunder, fontStyle: "italic" }}>
                Kota ini sudah ada di favorit
              </Text>
            ) : (
              <Button
                title="Tambahkan ke Favorit"
                onPress={() =>
                  router.push({
                    pathname: "/tambah-favorit",
                    params: {
                      id: String(kotaTerpilih.id),
                      nama: kotaTerpilih.name,
                      lat: String(kotaTerpilih.latitude),
                      lon: String(kotaTerpilih.longitude),
                    },
                  })
                }
              />
            )}
          </>
        )}

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}