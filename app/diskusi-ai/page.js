import RuangObrolan from "@/components/RuangObrolan";
import "@/styles/diskusi-ai.css";

export const metadata = {
  title: "Ruang Diskusi AI | HumanityTech",
  description: "Asisten umum HumanityTech untuk berdiskusi dan bertanya tentang berbagai topik.",
};

export default function RuangDiskusiAI() {
  return <div className="kontainer obrolan-halaman"><RuangObrolan /></div>;
}
