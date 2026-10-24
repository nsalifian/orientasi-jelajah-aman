// src/context/ThemeContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useColorScheme as useSkemaSistem } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ModeTema = "terang" | "gelap" | "sistem";
type SkemaEfektif = "terang" | "gelap";

interface WarnaTema {
  latar: string;
  latarKartu: string;
  teks: string;
  teksSekunder: string;
  border: string;
  aksen: string;
  bahaya: string;
}

const warnaTerang: WarnaTema = {
  latar: "#FFFFFF",
  latarKartu: "#F5F5F7",
  teks: "#111111",
  teksSekunder: "#666666",
  border: "#E0E0E0",
  aksen: "#208AEF",
  bahaya: "#D93025",
};

const warnaGelap: WarnaTema = {
  latar: "#121212",
  latarKartu: "#1E1E1E",
  teks: "#F2F2F2",
  teksSekunder: "#AAAAAA",
  border: "#333333",
  aksen: "#5FA8F5",
  bahaya: "#FF6B6B",
};

interface KonteksTema {
  mode: ModeTema;
  skemaEfektif: SkemaEfektif;
  warna: WarnaTema;
  aturMode: (mode: ModeTema) => void;
}

const KUNCI_TEMA = "@jelajah_aman:mode_tema";

const Konteks = createContext<KonteksTema>({
  mode: "sistem",
  skemaEfektif: "terang",
  warna: warnaTerang,
  aturMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const skemaSistem = useSkemaSistem();
  const [mode, setMode] = useState<ModeTema>("sistem");
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KUNCI_TEMA).then((tersimpan) => {
      if (tersimpan === "terang" || tersimpan === "gelap" || tersimpan === "sistem") {
        setMode(tersimpan);
      }
      setSiap(true);
    });
  }, []);

  async function aturMode(modeBaru: ModeTema) {
    setMode(modeBaru);
    await AsyncStorage.setItem(KUNCI_TEMA, modeBaru);
  }

  const skemaEfektif: SkemaEfektif =
    mode === "sistem" ? (skemaSistem === "dark" ? "gelap" : "terang") : mode;
  const warna = skemaEfektif === "gelap" ? warnaGelap : warnaTerang;

  if (!siap) return null;

  return (
    <Konteks.Provider value={{ mode, skemaEfektif, warna, aturMode }}>
      {children}
    </Konteks.Provider>
  );
}

export function useTema() {
  return useContext(Konteks);
}