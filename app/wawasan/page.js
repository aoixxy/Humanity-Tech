import Link from "next/link";
import TopikWawasan from "@/components/TopikWawasan";
import { topikWawasan } from "@/data/wawasan";
import "@/styles/wawasan.css";

export const metadata = {
  title: "Wawasan Globalisasi | HumanityTech",
  description: "Materi tentang konsep, proses, bentuk, dan dampak globalisasi dalam kehidupan masyarakat.",
};

export default function Wawasan() {
  return (
    <>
      <section className="wawasan-kepala">
        <div className="kontainer">
          <p className="hero-kicker">MATERI SOSIOLOGI</p>
          <h1>Wawasan Globalisasi</h1>
          <p className="wawasan-pengantar">
            Pelajari arus globalisasi dan dampaknya terhadap kehidupan sosial,
            budaya, ekonomi, serta identitas masyarakat. Materi ini menjadi
            dasar untuk merancang riset sosial yang berangkat dari fenomena nyata.
          </p>
        </div>
      </section>
      <section className="bagian">
        <div className="kontainer wawasan-tata">
          <nav className="wawasan-indeks" aria-label="Daftar materi">
            <p className="wawasan-indeks-judul">Daftar materi</p>
            <ul>{topikWawasan.map((t) => <li key={t.id}><a href={`#${t.id}`}>{t.judul}</a></li>)}</ul>
          </nav>
          <div>{topikWawasan.map((t) => <TopikWawasan key={t.id} topik={t} />)}</div>
        </div>
      </section>
      <section className="bagian bagian-permukaan">
        <div className="kontainer">
          <h2>Dari materi menuju penelitian</h2>
          <p className="wawasan-lanjut">
            Pilih fenomena yang dekat dengan kehidupanmu, lalu susun pertanyaan
            yang dapat dijawab melalui observasi, wawancara, atau data yang relevan.
          </p>
          <div className="wawasan-aksi">
            <Link href="/riset-sosial" className="tombol">Panduan Riset Sosial</Link>
            <Link href="/diskusi-ai" className="tombol tombol-garis">Diskusi dengan AI</Link>
          </div>
        </div>
      </section>
    </>
  );
}
