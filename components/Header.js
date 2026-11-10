"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { halaman } from "@/data/navigasi";

// Navigasi desktop
export default function Header() {
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const menuRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    setMenuTerbuka(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuTerbuka) return;

    function tutupDenganEscape(event) {
      if (event.key === "Escape") setMenuTerbuka(false);
    }
    function tutupSaatKlikDiLuar(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuTerbuka(false);
      }
    }

    document.addEventListener("pointerdown", tutupSaatKlikDiLuar);
    window.addEventListener("keydown", tutupDenganEscape);
    return () => {
      document.removeEventListener("pointerdown", tutupSaatKlikDiLuar);
      window.removeEventListener("keydown", tutupDenganEscape);
    };
  }, [menuTerbuka]);

  return (
    <header className="header">
      <a className="lewati" href="#isi">
        Lewati ke konten
      </a>
      <div className="kontainer header-isi">
        <Link href="/" className="header-logo" onClick={() => setMenuTerbuka(false)}>
          <span className="header-logo-mark" aria-hidden="true">✳</span>
          <span>Humanity<span className="header-logo-accent">Tech</span></span>
        </Link>

        <nav className="menu menu-desktop" aria-label="Menu utama">
          <ul>
            {halaman.map((h) => (
              <li key={h.alamat}>
                <Link href={h.alamat}>{h.nama}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div ref={menuRef} className={`menu-mobile${menuTerbuka ? " menu-mobile-terbuka" : ""}`}>
          <button
            className="menu-mobile-tombol"
            type="button"
            aria-expanded={menuTerbuka}
            aria-controls="navigasi-mobile"
            aria-label={menuTerbuka ? "Tutup menu navigasi" : "Buka menu navigasi"}
            onClick={() => setMenuTerbuka((terbuka) => !terbuka)}
          >
            <span className="menu-mobile-garis" aria-hidden="true"><i /><i /><i /></span>
            <span className="menu-mobile-label">Menu</span>
          </button>

          {menuTerbuka && (
            <nav id="navigasi-mobile" className="menu-mobile-panel" aria-label="Navigasi mobile">
              <ul>
                {halaman.map((h) => (
                  <li key={h.alamat}>
                    <Link href={h.alamat} onClick={() => setMenuTerbuka(false)}>
                      {h.nama}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
