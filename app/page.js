import Link from "next/link";
import { halaman } from "@/data/navigasi";
import "@/styles/beranda.css";

const tujuan = halaman.filter((h) => h.alamat !== "/");

export const metadata = {
  title: "HumanityTech | Belajar Globalisasi",
  description: "Jelajahi konsep, sejarah, bentuk, dan dampak globalisasi terhadap kehidupan masyarakat.",
};

export default function Beranda() {
  return (
    <>
      <section className="bagian hero">
        <div className="kontainer hero-isi">
          <div>
            <p className="hero-kicker">GLOBALISASI • SOSIOLOGI</p>
            <h1>Memahami dunia yang semakin terhubung.</h1>
            <p className="hero-pengantar">
              HumanityTech mengajak kita meneliti bagaimana arus globalisasi
              memengaruhi kebiasaan, hubungan sosial, ekonomi, budaya, dan
              kehidupan masyarakat sehari-hari.
            </p>
            <div className="hero-aksi">
              <Link href="/wawasan" className="tombol">Jelajahi Wawasan</Link>
              <Link href="/riset-sosial" className="tombol tombol-garis">Mulai Riset Sosial</Link>
            </div>
          </div>

          <aside className="pembacaan" aria-labelledby="judul-pembacaan">
            <h2 id="judul-pembacaan" className="pembacaan-judul">Mulai dari pertanyaan sosial</h2>
            <p className="pembacaan-pertanyaan">
              Apakah tren global membuat budaya lokal semakin dikenal atau justru mulai ditinggalkan?
            </p>
            <div className="pembacaan-sudut">
              <div>
                <h3>Fenomena</h3>
                <p>Musik, makanan, pakaian, dan gaya hidup dari berbagai negara cepat dikenal masyarakat.</p>
              </div>
              <div>
                <h3>Pertanyaan riset</h3>
                <p>Bagaimana masyarakat memilih, menerima, atau menyesuaikan pengaruh budaya tersebut?</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="bagian dua-disiplin">
        <div className="kontainer">
          <h2 className="dua-judul">Globalisasi bukan sekadar sesuatu yang terjadi jauh di luar sana</h2>
          <div className="dua-kolom">
            <div>
              <h3>Amati kehidupan sehari-hari</h3>
              <p>
                Arus barang, informasi, manusia, dan budaya lintas negara hadir
                dalam pilihan makanan, pekerjaan, hiburan, pendidikan, serta
                cara kita berinteraksi.
              </p>
            </div>
            <div>
              <h3>Teliti dampaknya secara sosial</h3>
              <p>
                Sosiologi membantu kita melihat perubahan nilai, identitas,
                pola konsumsi, kesempatan, dan ketimpangan. Riset sosial
                membantu menguji dugaan melalui data, bukan hanya pendapat.
              </p>
            </div>
          </div>
          <p className="dua-penutup">
            Tujuan kita bukan langsung menilai globalisasi baik atau buruk,
            melainkan memahami siapa yang terdampak, bagaimana dampaknya terjadi,
            dan mengapa pengalaman setiap kelompok bisa berbeda.
          </p>
        </div>
      </section>

      <section className="bagian bagian-permukaan">
        <div className="kontainer">
          <h2>Jelajahi HumanityTech</h2>
          <ul className="daftar-halaman">
            {tujuan.map((h) => (
              <li key={h.alamat}>
                <Link href={h.alamat} className="baris">
                  <span className="baris-nama">{h.nama}</span>
                  <span className="baris-deskripsi">{h.deskripsi}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bagian bagian-navy">
        <div className="kontainer penutup">
          <h2>Mulai dari hal yang dekat, lalu temukan cerita sosial di baliknya.</h2>
          <Link href="/riset-sosial" className="tombol tombol-sage">Susun Riset Sosial</Link>
        </div>
      </section>
    </>
  );
}
