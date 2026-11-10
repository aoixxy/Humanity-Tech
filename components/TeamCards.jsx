"use client";

import { useEffect, useState } from "react";

const anggota = [
  { nomor: "01", nama: "Nama Anggota 1", peran: "Peran dalam tim", deskripsi: "Tambahkan cerita singkat atau kontribusi anggota di sini." },
  { nomor: "02", nama: "Nama Anggota 2", peran: "Peran dalam tim", deskripsi: "Tambahkan cerita singkat atau kontribusi anggota di sini." },
  { nomor: "03", nama: "Nama Anggota 3", peran: "Peran dalam tim", deskripsi: "Tambahkan cerita singkat atau kontribusi anggota di sini." },
  { nomor: "04", nama: "Nama Anggota 4", peran: "Peran dalam tim", deskripsi: "Tambahkan cerita singkat atau kontribusi anggota di sini." },
  { nomor: "05", nama: "Nama Anggota 5", peran: "Peran dalam tim", deskripsi: "Tambahkan cerita singkat atau kontribusi anggota di sini." },
  { nomor: "06", nama: "Nama Anggota 6", peran: "Peran dalam tim", deskripsi: "Tambahkan cerita singkat atau kontribusi anggota di sini." },
];

export default function TeamCards() {
  const [kartuTerbuka, setKartuTerbuka] = useState(null);

  function tutupKartu() {
    setKartuTerbuka(null);
  }

  function toggleKartu(index) {
    setKartuTerbuka((aktif) => (aktif === index ? null : index));
  }

  function pindahKartu(arah) {
    setKartuTerbuka((aktif) => {
      if (aktif === null) return null;
      return (aktif + arah + anggota.length) % anggota.length;
    });
  }

  // Tutup kartu saat pengguna menekan area mana pun di luar kartu aktif.
  // Tombol navigasi dikecualikan agar perpindahan anggota tetap berfungsi.
  useEffect(() => {
    if (kartuTerbuka === null) return;

    function handleOutsidePointer(event) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (
        target.closest(".team-card.is-open") ||
        target.closest(".team-card-navigation")
      ) {
        return;
      }

      setKartuTerbuka(null);
    }

    document.addEventListener("pointerdown", handleOutsidePointer, true);
    return () =>
      document.removeEventListener("pointerdown", handleOutsidePointer, true);
  }, [kartuTerbuka]);

  // Kunci scroll halaman saat kartu terbuka, termasuk pada Safari/iPhone.
  useEffect(() => {
    if (kartuTerbuka === null) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;

    const previous = {
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const arah = event.key === "ArrowLeft" ? -1 : 1;
        setKartuTerbuka((aktif) =>
          aktif === null ? null : (aktif + arah + anggota.length) % anggota.length
        );
      } else if (event.key === "Escape") {
        event.preventDefault();
        setKartuTerbuka(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.left = previous.bodyLeft;
      body.style.right = previous.bodyRight;
      body.style.width = previous.bodyWidth;
      body.style.overflow = previous.bodyOverflow;
      html.style.overflow = previous.htmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.scrollTo(0, scrollY);
    };
  }, [kartuTerbuka !== null]);

  return (
    <div className={`team-deck ${kartuTerbuka !== null ? "has-open-card" : ""}`}>
      {kartuTerbuka !== null && (
        <>
          <button
            className="team-card-backdrop"
            type="button"
            aria-label="Tutup kartu anggota"
            onClick={tutupKartu}
          />
          <div className="team-card-navigation" aria-label="Navigasi anggota tim">
            <button
              className="team-card-navigation__button"
              type="button"
              aria-label="Anggota sebelumnya"
              onClick={() => pindahKartu(-1)}
            >
              ‹
            </button>
            <span className="team-card-navigation__count" aria-live="polite">
              {anggota[kartuTerbuka].nomor} / 06
            </span>
            <button
              className="team-card-navigation__button"
              type="button"
              aria-label="Anggota berikutnya"
              onClick={() => pindahKartu(1)}
            >
              ›
            </button>
          </div>
        </>
      )}

      <div className="team-cards" aria-label="Enam kartu anggota HumanityTech">
        {anggota.map((orang, index) => {
          const terbuka = kartuTerbuka === index;
          const redup = kartuTerbuka !== null && !terbuka;

          return (
            <button
              className={`team-card team-card--${index + 1}${terbuka ? " is-open" : ""}${redup ? " is-muted" : ""}`}
              key={orang.nomor}
              type="button"
              aria-pressed={terbuka}
              aria-label={`${terbuka ? "Tutup" : "Buka"} kartu ${orang.nama}`}
              onClick={() => toggleKartu(index)}
            >
              <span className="team-card__inner">
                <span className="team-card__front">
                  <span className="playing-corner playing-corner--top">
                    <span>H</span><span className="playing-suit">✦</span>
                  </span>
                  <span className="team-card__front-logo" aria-hidden="true">H</span>
                  <span className="team-card__front-name">HumanityTech</span>
                  <span className="playing-corner playing-corner--bottom">
                    <span>H</span><span className="playing-suit">✦</span>
                  </span>
                </span>

                <span className="team-card__back">
                  <span className="team-card__photo">
                    <span className="team-card__photo-placeholder">
                      <svg viewBox="0 0 100 100" aria-hidden="true">
                        <circle cx="50" cy="34" r="19" />
                        <path d="M15 94c2-23 16-36 35-36s33 13 35 36" />
                      </svg>
                      <span>Foto anggota {orang.nomor}</span>
                    </span>
                    <span className="team-card__number">{orang.nomor} / 06</span>
                  </span>
                  <span className="team-card__details">
                    <span className="team-card__name">{orang.nama}</span>
                    <span className="team-card__role">{orang.peran}</span>
                    <span className="team-card__description">{orang.deskripsi}</span>
                    <span className="team-card__close">Klik di mana saja untuk menutup</span>
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
