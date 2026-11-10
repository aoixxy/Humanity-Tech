// Setiap topik menampilkan satu rujukan utama yang menjadi dasar pembahasan.
export default function TopikWawasan({ topik }) {
  const idJudul = `judul-${topik.id}`;
  const sumber = topik.sumber;

  return (
    <section id={topik.id} className="topik" aria-labelledby={idJudul}>
      <h2 id={idJudul} className="topik-judul">{topik.judul}</h2>
      <p className="topik-ringkas">{topik.ringkas}</p>
      <div className="sudut">
        <div className="sudut-sosiologi">
          <h3>Perspektif Sosiologi</h3>
          {topik.sosiologi.map((paragraf, i) => <p key={i}>{paragraf}</p>)}
        </div>
      </div>
      <div className="topik-bagian">
        <h3>Contoh dalam kehidupan sehari-hari</h3>
        <p>{topik.sehariHari}</p>
      </div>
      <div className="topik-bagian topik-langkah">
        <h3>Poin untuk dipelajari</h3>
        <ul>{topik.langkah.map((langkah, i) => <li key={i}>{langkah}</li>)}</ul>
      </div>
      {sumber ? (
        <div className="topik-bagian topik-sumber">
          <h3>Sumber materi</h3>
          <p>Pembahasan topik ini merujuk pada sumber berikut. Buka sumber aslinya untuk membaca konteks lengkap dan memeriksa informasi.</p>
          <p><a href={sumber.url} target="_blank" rel="noopener noreferrer">{sumber.nama} ↗</a></p>
        </div>
      ) : null}
    </section>
  );
}
