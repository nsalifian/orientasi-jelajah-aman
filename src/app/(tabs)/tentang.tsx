// src/app/(tabs)/tentang.tsx
import { Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTema } from "../../context/ThemeContext";

export default function TabTentang() {
  const { warna } = useTema();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.latar }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: warna.teks }}>Jelajah Aman</Text>
        <Text style={{ color: warna.teksSekunder }}>Versi 1.0.0</Text>
        <Text style={{ color: warna.teks, lineHeight: 20 }}>
          Jelajah Aman membantu pengguna mengecek cuaca dan kualitas udara sebelum
          beraktivitas di luar ruangan, lengkap dengan dukungan mode offline.
          Dibangun dengan Expo, React Native, dan Expo Router sebagai tugas mata
          kuliah Pemrograman Berbasis Platform.
        </Text>
        <Text style={{ color: warna.teksSekunder, fontSize: 12, marginTop: 12 }}>
          Dibuat oleh Naufal — NIM 60324033
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}