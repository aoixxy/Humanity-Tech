import TeamCards from "@/components/TeamCards";
import "@/styles/tentang-kami.css";

export const metadata = {
  title: "Tentang Kami | HumanityTech",
  description:
    "Kenali enam orang di balik HumanityTech dan cerita kecil dalam perjalanan proyek ini.",
};

export default function TentangKami() {
  return (
    <main className="tentang-kami">
      <section className="cerita-section" aria-labelledby="cerita-title">
        <div className="cerita-copy">
          <p className="tim-eyebrow">A LITTLE NOTE FROM US</p>
          <h1 id="cerita-title">Sebuah proyek, banyak cerita.</h1>
          <p>
            HumanityTech dikembangkan dari rasa ingin tahu tentang hubungan
            antara teknologi, manusia, dan kehidupan sosial. Kami belajar,
            berdiskusi, dan mencoba menyatukan ide untuk membuat sesuatu yang
            bermanfaat.
          </p>
        </div>
      </section>

      <section className="tim-section" aria-labelledby="tim-title">
        <TeamCards />
        <div className="tim-heading tim-heading--bottom">
          <p className="tim-eyebrow">THE PEOPLE BEHIND THE PROJECT</p>
          <h2 id="tim-title" className="tim-title">
            Enam orang, satu cerita.
          </h2>
          <p className="tim-intro">
            Kenali orang-orang di balik HumanityTech. Pilih satu kartu untuk
            membukanya dan melihat cerita dari setiap anggota tim.
          </p>
          <p className="tim-hint">Team</p>
        </div>
      </section>

      <section className="panasea-audio-section" aria-label="Lagu Panasea">
        <div className="panasea-audio">
          <p className="panasea-audio__title">Sedikit teman saat menjelajah</p>
          <audio controls preload="metadata" aria-label="Pemutar audio Panasea">
            <source src="/audio/panasea.mp3" type="audio/mpeg" />
            Browser kamu tidak mendukung pemutar audio.
          </audio>
        </div>
      </section>
    </main>
  );
}
