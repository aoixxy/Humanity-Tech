import Link from "next/link";
import "@/styles/wawasan.css";

export const metadata = {
  title: "Riset Sosial | HumanityTech",
  description: "Panduan menyusun riset sosial untuk memahami dampak arus globalisasi.",
};

const tahap = [
  ["1. Tentukan fenomena", "Pilih fenomena globalisasi yang dekat dengan kehidupan, misalnya tren budaya populer, produk impor, perubahan pilihan konsumsi, atau pengaruh tren global terhadap usaha lokal."],
  ["2. Susun rumusan masalah", "Buat pertanyaan yang spesifik, terbuka, dan bisa diteliti. Contoh: “Bagaimana tren makanan global memengaruhi pilihan makanan siswa di sekolah?”"],
  ["3. Tentukan sumber data", "Pilih orang atau situasi yang relevan. Kamu dapat menggunakan observasi, wawancara, kuesioner sederhana, dan sumber tertulis yang dapat dipercaya."],
  ["4. Kumpulkan data secara etis", "Jelaskan tujuan kegiatan, minta persetujuan narasumber, jangan memaksa orang menjawab, dan hindari mencantumkan nama atau informasi pribadi tanpa izin."],
  ["5. Analisis temuan", "Kelompokkan jawaban yang mirip, cari pola dan perbedaan, serta pertimbangkan faktor seperti usia, lingkungan, pekerjaan, dan akses ekonomi."],
  ["6. Tarik kesimpulan", "Jawab rumusan masalah berdasarkan data. Bedakan temuan, interpretasi, dan dugaan; sebutkan juga keterbatasan penelitian."]
];

export default function RisetSosial() {
  return (
    <>
      <section className="wawasan-kepala">
        <div className="kontainer">
          <p className="hero-kicker">PANDUAN PENELITIAN</p>
          <h1>Riset Sosial Dampak Globalisasi</h1>
          <p className="wawasan-pengantar">
            Riset sosial membantu kita memahami bagaimana arus globalisasi
            memengaruhi masyarakat berdasarkan data dan pengalaman nyata,
            bukan hanya asumsi atau pendapat pribadi.
          </p>
        </div>
      </section>
      <section className="bagian">
        <div className="kontainer">
          <h2>Langkah menyusun riset</h2>
          {tahap.map(([judul, isi]) => (
            <section className="topik" key={judul}>
              <h3>{judul}</h3><p>{isi}</p>
            </section>
          ))}
          <section className="topik">
            <h2>Contoh topik penelitian</h2>
            <ul>
              <li>Pengaruh tren budaya populer global terhadap pilihan hiburan remaja.</li>
              <li>Perubahan kebiasaan belanja akibat popularitas produk internasional.</li>
              <li>Pandangan generasi muda terhadap pelestarian budaya lokal di tengah globalisasi.</li>
              <li>Pengalaman pedagang lokal menghadapi perubahan pilihan konsumen.</li>
              <li>Pengaruh makanan global terhadap kebiasaan makan di lingkungan sekolah.</li>
            </ul>
          </section>
          <section className="topik">
            <h2>Ingat etika penelitian</h2>
            <p>Hormati narasumber, jaga kerahasiaan informasi pribadi, catat jawaban dengan jujur, dan jangan mengubah data demi mendukung kesimpulan yang sudah kamu inginkan.</p>
          </section>
          <div className="wawasan-aksi">
            <Link href="/wawasan" className="tombol tombol-garis">Kembali ke Wawasan</Link>
            <Link href="/diskusi-ai" className="tombol">Diskusikan ide penelitian</Link>
          </div>
        </div>
      </section>
    </>
  );
}
