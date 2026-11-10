import { Fraunces, Figtree } from "next/font/google";
import "@/styles/variables.css";
import "@/styles/globals.css";
import "@/styles/kerangka.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fontJudul = Fraunces({ subsets: ["latin"], variable: "--font-judul", display: "swap" });
const fontIsi = Figtree({ subsets: ["latin"], variable: "--font-isi", display: "swap" });

export const metadata = {
  title: "HumanityTech",
  description: "Riset Sosial Dampak Globalisasi: memahami arus globalisasi dan perubahan kehidupan masyarakat melalui perspektif Sosiologi.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${fontJudul.variable} ${fontIsi.variable}`}>
      <body><Header /><main id="isi">{children}</main><Footer /></body>
    </html>
  );
}
