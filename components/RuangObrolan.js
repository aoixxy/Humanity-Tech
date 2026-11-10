"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import PesanObrolan from "@/components/PesanObrolan";
import MarkdownJawaban from "@/components/MarkdownJawaban";
import RobotKecil from "@/components/RobotKecil";

const BATAS_KARAKTER = 500;
const SISA_PERINGATAN = 50; 

const CONTOH_PERTANYAAN = [
  {
    teks: "Apa dampak globalisasi terhadap kehidupan masyarakat Indonesia?",
    topik: "konsep-globalisasi",
  },
  {
    teks: "Bagaimana perkembangan teknologi memengaruhi budaya dan kehidupan sosial masyarakat?",
    topik: "dampak-sosial-budaya",
  },
];

const PENANDA_SIMULASI = "Jawaban AI · HumanityTech";

export default function RuangObrolan() {
  const router = useRouter();
  const [pengguna, setPengguna] = useState(null);
  const [statusAuth, setStatusAuth] = useState("memuat");
  const [pesan, setPesan] = useState([]);
  const [teks, setTeks] = useState("");
  const [menunggu, setMenunggu] = useState(false);
  const [petunjuk, setPetunjuk] = useState("");
  const [riwayat, setRiwayat] = useState([]);
  const [threadAktif, setThreadAktif] = useState(null);
  const [sidebarTerbuka, setSidebarTerbuka] = useState(false);
  const sudahMemuatRiwayat = useRef(false);
  const idPesanTersimpan = useRef(new Set());

  const idBerikut = useRef(1);
  const ruangRef = useRef(null);
  const logRef = useRef(null);
  const diDasar = useRef(true); 
  const inputRef = useRef(null);
  const judulRef = useRef(null);
  const fokusKeJudul = useRef(false);

  // Tampilan percakapan dimulai sejak pesan pertama dikirim
  const mulai = pesan.length > 0;

  // sesi Supabase dan muat riwayat
  useEffect(() => {
    let aktif = true;
    async function muatSesi() {
      const { data } = await supabase.auth.getSession();
      if (!aktif) return;
      const user = data.session?.user || null;
      setPengguna(user);
      setStatusAuth(user ? "masuk" : "keluar");
      if (!user) {
        setPesan([]);
        setRiwayat([]);
        setThreadAktif(null);
        sudahMemuatRiwayat.current = false;
        idPesanTersimpan.current = new Set();
        return;
      }
      await muatRiwayat(user.id);
    }
    muatSesi();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setPengguna(user);
      setStatusAuth(user ? "masuk" : "keluar");
      if (!user) {
        setPesan([]); setRiwayat([]); setThreadAktif(null);
        sudahMemuatRiwayat.current = false;
        idPesanTersimpan.current = new Set();
      } else {
        // Callback auth tidak perlu menunggu operasi database di dalamnya.
        setTimeout(() => { if (aktif) muatRiwayat(user.id); }, 0);
      }
    });
    return () => { aktif = false; listener.subscription.unsubscribe(); };
  }, []);

  async function muatRiwayat(userId) {
    sudahMemuatRiwayat.current = false;
    const { data, error } = await supabase
      .from("chat_history")
      .select("id, thread_id, role, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) {
      setPetunjuk("Riwayat belum bisa dimuat. Coba muat ulang halaman.");
      sudahMemuatRiwayat.current = true;
      return;
    }
    const grup = new Map();
    for (const row of data || []) {
      if (!grup.has(row.thread_id)) grup.set(row.thread_id, []);
      grup.get(row.thread_id).push({
        id: row.id,
        jenis: row.role === "user" ? "pengguna" : "robot",
        teks: row.content,
        waktu: row.created_at,
      });
      idPesanTersimpan.current.add(row.id);
    }
    const daftar = Array.from(grup.entries()).map(([id, items]) => {
      const pesanPengguna = items.find((item) => item.jenis === "pengguna");
      const diperbarui = items[items.length - 1]?.waktu || new Date().toISOString();
      return { id, judul: (pesanPengguna?.teks || "Percakapan baru").slice(0, 54), diperbarui, pesan: items };
    }).sort((a, b) => new Date(b.diperbarui) - new Date(a.diperbarui));
    setRiwayat(daftar);
    const aktifTersimpan = typeof window !== "undefined" ? window.sessionStorage.getItem(`humanitytech-chat-aktif-v1-${userId}`) : null;
    const terpilih = daftar.find((item) => item.id === aktifTersimpan) || daftar[0];
    setThreadAktif(terpilih?.id || null);
    setPesan(terpilih?.pesan || []);
    sudahMemuatRiwayat.current = true;
  }

  async function simpanPesan(threadId, role, content) {
    if (!pengguna?.id) throw new Error("Silakan masuk kembali untuk menyimpan percakapan.");
    const { data, error } = await supabase.from("chat_history").insert({
      user_id: pengguna.id,
      thread_id: threadId,
      role,
      content,
    }).select("id, created_at").single();
    if (error) throw new Error("Pesan belum berhasil disimpan ke riwayat.");
    idPesanTersimpan.current.add(data.id);
    return data;
  }


  // Pesan baru 
  useEffect(() => {
    if (pesan.length === 0 && !menunggu) return;
    const area = logRef.current;
    if (!area) return;
    area.scrollTop = area.scrollHeight;
    diDasar.current = true;
  }, [pesan, menunggu]);

  useEffect(() => {
    const area = logRef.current;
    if (!area || typeof ResizeObserver === "undefined") return;
    const pengamat = new ResizeObserver(() => {
      if (diDasar.current) area.scrollTop = area.scrollHeight;
    });
    pengamat.observe(area);
    return () => pengamat.disconnect();
  }, []);


  useEffect(() => {
    if (!mulai && fokusKeJudul.current) {
      fokusKeJudul.current = false;
      if (judulRef.current) judulRef.current.focus();
    }
  }, [mulai]);

  async function kirim(isiMentah, { topik, dariKolom = false } = {}) {
    if (statusAuth === "memuat") { setPetunjuk("Memeriksa sesi akun, tunggu sebentar."); return; }
    if (!pengguna) { router.push("/akun"); return; }
    if (menunggu) {
      setPetunjuk("Tunggu sebentar, robot sedang menyusun balasan.");
      return;
    }

    const isi = isiMentah.trim();

    if (!isi) {
      setPetunjuk("Tulis pertanyaanmu dulu sebelum mengirim.");
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    if (isi.length > BATAS_KARAKTER) {
      setPetunjuk(`Pesan terlalu panjang. Maksimal ${BATAS_KARAKTER} karakter.`);
      return;
    }

    setPetunjuk("");
    const idThread = threadAktif || crypto.randomUUID();
    setThreadAktif(idThread);
    const pesanPengguna = { id: idBerikut.current++, jenis: "pengguna", teks: isi };
    setPesan((lama) => [...lama, pesanPengguna]);
    setMenunggu(true);

    if (dariKolom) {
      setTeks("");
      if (inputRef.current) inputRef.current.focus();
    } else if (logRef.current) {
      logRef.current.focus({ preventScroll: true });
    }

    try {
      await simpanPesan(idThread, "user", isi);
      const { data: sesiData } = await supabase.auth.getSession();
      const accessToken = sesiData.session?.access_token;
      if (!accessToken) throw new Error("Sesi login berakhir. Silakan masuk kembali.");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ message: isi }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success || typeof data.reply !== "string") {
        throw new Error(data?.error || "Balasan tidak dapat diperoleh. Coba lagi.");
      }

      await simpanPesan(idThread, "assistant", data.reply);
      setPesan((lama) => [
        ...lama,
        { id: idBerikut.current++, jenis: "robot", teks: data.reply,
          tautan: topik ? `/wawasan#${topik}` : null,
          teksTautan: topik ? "Baca topik terkait di Wawasan" : null },
      ]);
      await muatRiwayat(pengguna.id);
    } catch (error) {
      setPetunjuk(
        error instanceof Error
          ? error.message
          : "Terjadi masalah saat menghubungi server. Coba lagi."
      );
    } finally {
      setMenunggu(false);
    }
  }

  function mulaiBaru() {
    fokusKeJudul.current = true;
    diDasar.current = true;
    setThreadAktif(null);
    setPesan([]);
    setTeks("");
    setPetunjuk("");
    setMenunggu(false);
    setSidebarTerbuka(false);
  }

  function bukaRiwayat(thread) {
    setThreadAktif(thread.id);
    if (pengguna?.id) window.sessionStorage.setItem(`humanitytech-chat-aktif-v1-${pengguna.id}`, thread.id);
    setPesan(thread.pesan || []);
    setTeks("");
    setPetunjuk("");
    setMenunggu(false);
    setSidebarTerbuka(false);
    diDasar.current = true;
  }

  async function hapusRiwayat(thread) {
    if (!pengguna?.id || !window.confirm(`Hapus percakapan “${thread.judul}”?`)) return;
    const { error } = await supabase.from("chat_history").delete()
      .eq("user_id", pengguna.id).eq("thread_id", thread.id);
    if (error) { setPetunjuk("Percakapan belum berhasil dihapus."); return; }
    const sisa = riwayat.filter((item) => item.id !== thread.id);
    setRiwayat(sisa);
    if (threadAktif === thread.id) { setThreadAktif(null); setPesan([]); }
  }

  async function keluarAkun() {
    const { error } = await supabase.auth.signOut();
    if (error) { setPetunjuk("Logout belum berhasil. Coba lagi."); return; }
    setPengguna(null); setPesan([]); setRiwayat([]); setThreadAktif(null);
    router.push("/akun"); router.refresh();
  }

  function waktuRiwayat(iso) {
    try {
      return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(iso));
    } catch {
      return "";
    }
  }

  function saatGulir() {
    const area = logRef.current;
    if (!area) return;
    diDasar.current = area.scrollHeight - area.scrollTop - area.clientHeight < 24;
  }

  function saatKirim(e) {
    e.preventDefault();
    kirim(teks, { dariKolom: true });
  }

  function saatTekan(e) {
    // Enter mengirim. Shift+Enter membuat baris baru.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      kirim(teks, { dariKolom: true });
    }
  }

  function saatUbah(e) {
    setTeks(e.target.value);
    if (petunjuk) setPetunjuk("");
  }

  const sisa = BATAS_KARAKTER - teks.length;
  const hampirPenuh = sisa <= SISA_PERINGATAN;
  const teksHitung = hampirPenuh
    ? `${teks.length} / ${BATAS_KARAKTER} karakter (sisa ${sisa})`
    : `${teks.length} / ${BATAS_KARAKTER} karakter`;
  const petunjukTampil =
    petunjuk || (sisa <= 0 ? `Batas ${BATAS_KARAKTER} karakter tercapai.` : "");

  return (
    <div className="ht-ai-shell">
      {sidebarTerbuka ? (
        <button
          type="button"
          className="ht-ai-sidebar-backdrop"
          aria-label="Tutup menu riwayat"
          onClick={() => setSidebarTerbuka(false)}
        />
      ) : null}
      <aside className={`ht-ai-sidebar${sidebarTerbuka ? " ht-ai-sidebar-terbuka" : ""}`} aria-label="Navigasi Ruang Diskusi AI">
        <div className="ht-ai-brand">
          <span className="ht-ai-brand-mark" aria-hidden="true">✳</span>
          <span>Humanity<span>Tech</span></span>
        </div>

        <nav className="ht-ai-nav" aria-label="Navigasi utama">
          <Link href="/" className="ht-ai-nav-item"><span aria-hidden="true">⌂</span> Beranda</Link>
          <Link href="/diskusi-ai" className="ht-ai-nav-item aktif" aria-current="page"><span aria-hidden="true">◉</span> Ruang Diskusi AI</Link>
          <Link href="/wawasan" className="ht-ai-nav-item"><span aria-hidden="true">◌</span> Wawasan</Link>
          <Link href="/riset-sosial" className="ht-ai-nav-item"><span aria-hidden="true">⌕</span> Riset Sosial</Link>
          <Link href="/tentang-kami" className="ht-ai-nav-item"><span aria-hidden="true">♡</span> Tentang Kami</Link>
        </nav>

        <div className="ht-ai-sidebar-divider" />
        {statusAuth === "memuat" ? <p className="ht-ai-thread-empty">Memeriksa akun…</p> : !pengguna ? (
          <div className="ht-ai-auth-prompt"><p>Masuk untuk mulai berdiskusi dan menyimpan riwayat chat.</p><Link href="/akun" className="ht-ai-account-link">Masuk / Daftar</Link></div>
        ) : <>
        <div className="ht-ai-threads-heading">
          <span>Thread Terbaru</span>
          <button type="button" onClick={mulaiBaru} aria-label="Mulai percakapan baru" title="Percakapan baru">+</button>
        </div>
        <div className="ht-ai-thread-list" aria-live="polite">
          {riwayat.length ? riwayat.map((thread) => (
            <button
              type="button"
              key={thread.id}
              className={`ht-ai-thread${threadAktif === thread.id ? " ht-ai-thread-aktif" : ""}`}
              onClick={() => bukaRiwayat(thread)}
              title={thread.judul}
            >
              <span className="ht-ai-thread-icon" aria-hidden="true">◷</span>
              <span className="ht-ai-thread-title">{thread.judul}</span>
              <span className="ht-ai-thread-time">{waktuRiwayat(thread.diperbarui)}</span>
              <span className="ht-ai-thread-delete" onClick={(event) => { event.stopPropagation(); hapusRiwayat(thread); }} role="button" tabIndex={0} aria-label={`Hapus ${thread.judul}`} title="Hapus chat" onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); hapusRiwayat(thread); } }}>×</span>
            </button>
          )) : (
            <p className="ht-ai-thread-empty">Belum ada percakapan tersimpan.</p>
          )}
        </div>
        </>}
        <div className="ht-ai-sidebar-footer">
          <p>Teknologi yang lebih manusiawi, untuk masa depan yang lebih baik.</p>
          <span className="ht-ai-leaf" aria-hidden="true">⌁</span>
          {pengguna ? <button type="button" className="ht-ai-logout" onClick={keluarAkun}>Logout</button> : null}
        </div>
      </aside>

      <div className="ht-ai-main">
        <div className="ht-ai-topbar">
          <div className="ht-ai-topbar-leading">
            <button
              type="button"
              className="ht-ai-menu-button"
              aria-label={sidebarTerbuka ? "Tutup riwayat percakapan" : "Buka riwayat percakapan"}
              aria-expanded={sidebarTerbuka}
              onClick={() => setSidebarTerbuka((terbuka) => !terbuka)}
            >
              <span aria-hidden="true">{sidebarTerbuka ? "×" : "☰"}</span>
            </button>
            <span className="ht-ai-topbar-title">Ruang Diskusi AI</span>
          </div>
          <div className="ht-ai-topbar-actions">
            <span className="ht-ai-status"><i /> {statusAuth === "memuat" ? "Memeriksa akun" : pengguna ? "Akun aktif" : "Belum masuk"}</span>
            <span className="ht-ai-humanity-label">Teknologi untuk manusia</span>
          </div>
        </div>
        <div className="ht-ai-watermark" aria-hidden="true">
          <RobotKecil ukuran="besar" />
        </div>
        <section
          ref={ruangRef}
          className={`obrolan-ruang${mulai ? " obrolan-ruang-aktif" : ""}`}
          aria-labelledby="judul-obrolan"
        >
      {mulai ? (
        <div className="obrolan-bar">
          <div className="obrolan-bar-judul">
            <RobotKecil ukuran="avatar" />
            <h1 id="judul-obrolan">Ruang Diskusi AI</h1>
            <span className="obrolan-lencana">AI aktif</span>
          </div>
          <button type="button" className="obrolan-baru" onClick={mulaiBaru}>
            Percakapan baru
          </button>
        </div>
      ) : (
        <div className="obrolan-sambutan">
          <RobotKecil ukuran="besar" />
          <h1
            id="judul-obrolan"
            ref={judulRef}
            tabIndex={-1}
            className="obrolan-judul"
          >
            Ruang Diskusi AI
          </h1>
          <p className="obrolan-sapaan">
            Halo! Saya robot HumanityTech.
          </p>
          <p className="obrolan-deskripsi">
            Tanyakan apa saja kepada AI.
          </p>
        </div>
      )}

      {/* Selalu ada di halaman agar pembaca layar mengumumkan pesan baru */}
      <div
        ref={logRef}
        className="obrolan-log"
        role="log"
        aria-label="Percakapan dengan robot"
        tabIndex={mulai ? 0 : -1}
        onScroll={saatGulir}
      >
        {pesan.map((p) =>
          p.jenis === "pengguna" ? (
            <PesanObrolan key={p.id} jenis="pengguna">
              {p.teks}
            </PesanObrolan>
          ) : (
            <PesanObrolan key={p.id} jenis="robot" penanda={PENANDA_SIMULASI}>
              <MarkdownJawaban>{p.teks}</MarkdownJawaban>
              {p.tautan ? (
                <p>
                  <Link href={p.tautan}>{p.teksTautan}</Link>
                </p>
              ) : null}
            </PesanObrolan>
          )
        )}

        {menunggu ? (
          <PesanObrolan jenis="menunggu">Sedang menyusun balasan…</PesanObrolan>
        ) : null}
      </div>

      <div className="obrolan-bawah">
        {!mulai ? (
          <ul className="obrolan-contoh-daftar" aria-label="Contoh pertanyaan">
            {CONTOH_PERTANYAAN.map((c) => (
              <li key={c.topik}>
                <button
                  type="button"
                  className="obrolan-contoh"
                  onClick={() => kirim(c.teks, { topik: c.topik })}
                >
                  {c.teks}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {!pengguna && statusAuth !== "memuat" ? <p className="obrolan-login-notice">Untuk menggunakan Ruang Diskusi AI, silakan <Link href="/akun">masuk atau daftar</Link> terlebih dahulu.</p> : null}
        <form onSubmit={saatKirim} noValidate>
          <label htmlFor="obrolan-input" className="obrolan-sr">
            Tulis pesanmu
          </label>
          <div className="obrolan-kolom">
            <textarea
              id="obrolan-input"
              ref={inputRef}
              name="pesan"
              className="obrolan-input"
              rows={2}
              maxLength={BATAS_KARAKTER}
              value={teks}
              onChange={saatUbah}
              onKeyDown={saatTekan}
              enterKeyHint="send"
              placeholder="Tulis pertanyaanmu tentang apa saja…"
              aria-describedby="obrolan-hitung obrolan-petunjuk obrolan-catatan"
            />
            <div className="obrolan-aksi">
              <div className="obrolan-info">
                <p
                  id="obrolan-hitung"
                  className={`obrolan-hitung${hampirPenuh ? " obrolan-hitung-dekat" : ""}`}
                >
                  {teksHitung}
                  <span className="obrolan-pintasan">
                    {" "}
                    · Enter kirim, Shift+Enter baris baru
                  </span>
                </p>
                <p
                  id="obrolan-petunjuk"
                  className="obrolan-petunjuk"
                  role="status"
                >
                  {petunjukTampil}
                </p>
              </div>
              <button
                type="submit"
                className="tombol obrolan-kirim"
                disabled={menunggu || !pengguna || statusAuth === "memuat"}
              >
                Kirim
              </button>
            </div>
          </div>
        </form>

        <p id="obrolan-catatan" className="obrolan-catatan">
          Jawaban dibuat oleh AI dan bisa saja kurang tepat. Riwayat tersimpan di akunmu; hindari menulis data pribadi.
        </p>
      </div>
        </section>
      </div>
    </div>
  );
}
