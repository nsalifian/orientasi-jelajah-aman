// src/components/WeatherCard.tsx
import { View, Text } from "react-native";
import { WeatherCardProps, TingkatAQI } from "../../types/cuaca";
import { useTema } from "../context/ThemeContext";

const warnaAQI: Record<TingkatAQI, string> = {
  BAIK: "#2E7D32",
  SEDANG: "#F9A825",
  TIDAK_SEHAT: "#EF6C00",
  BERBAHAYA: "#C62828",
};

export default function WeatherCard({ kota, suhu, tingkatAQI, indeksAQI }: WeatherCardProps) {
  const { warna } = useTema();

  return (
    <View
      style={{
        padding: 16,
        borderRadius: 12,
        backgroundColor: warna.latarKartu,
        gap: 4,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "bold", color: warna.teks }}>{kota}</Text>
      <Text style={{ fontSize: 32, fontWeight: "bold", color: warna.teks }}>{suhu}°C</Text>
      <Text style={{ color: warnaAQI[tingkatAQI], fontWeight: "600" }}>
        AQI: {tingkatAQI}
        {indeksAQI !== undefined ? ` (${indeksAQI})` : ""}
      </Text>
    </View>
  );
}