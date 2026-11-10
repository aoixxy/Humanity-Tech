import Link from "next/link";
import { halaman } from "@/data/navigasi";

export default function Footer() {
  const tahun = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="kontainer footer-isi">
        <div>
          <p className="footer-nama">HumanityTech</p>
          <p className="footer-judul">Riset Sosial Dampak Globalisasi</p>
        </div>
        <nav aria-label="Tautan halaman">
          <ul>{halaman.map((h) => <li key={h.alamat}><Link href={h.alamat}>{h.nama}</Link></li>)}</ul>
        </nav>
      </div>
      <div className="kontainer"><p className="footer-hak">© {tahun} HumanityTech.</p></div>
    </footer>
  );
}
