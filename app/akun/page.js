 "use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import "@/styles/akun.css";
import "@/styles/akun-logo.css";

export default function AkunPage() {
  const router = useRouter();
  const [mode, setMode] = useState("masuk");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");
  const [error, setError] = useState("");
  const sudahMengalihkan = useRef(false);

  useEffect(() => {
    let aktif = true;

    function arahkanJikaTerverifikasi(user) {
      const terverifikasi = Boolean(user?.email_confirmed_at || user?.confirmed_at);
      if (!aktif || !terverifikasi || sudahMengalihkan.current) return;
      sudahMengalihkan.current = true;
      router.replace("/diskusi-ai");
      router.refresh();
    }

    async function prosesCallbackVerifikasi() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const punyaTokenDiHash = window.location.hash.includes("access_token=");
      const callbackVerifikasi = Boolean(code || punyaTokenDiHash || url.searchParams.get("verified") === "1");

      if (!callbackVerifikasi) return;

      if (code) {
        const { data, error: callbackError } = await supabase.auth.exchangeCodeForSession(code);
        if (!aktif) return;
        if (callbackError) {
          setError("Verifikasi email belum berhasil diproses. Coba buka kembali tautan dari email atau masuk setelah akun terverifikasi.");
          return;
        }
        arahkanJikaTerverifikasi(data?.user || data?.session?.user);
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!aktif) return;
      if (!sessionError && data?.session?.user) {
        arahkanJikaTerverifikasi(data.session.user);
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const url = new URL(window.location.href);
      const callbackVerifikasi = Boolean(
        url.searchParams.get("code") ||
        url.searchParams.get("verified") === "1" ||
        window.location.hash.includes("access_token=")
      );
      if (callbackVerifikasi) arahkanJikaTerverifikasi(session?.user);
    });

    prosesCallbackVerifikasi();

    return () => {
      aktif = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setPesan("");
    setError("");

    try {
      if (mode === "daftar") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/akun`,
            data: nama.trim() ? { full_name: nama.trim() } : {},
          },
        });

        if (authError) throw authError;

        if (data.session) {
          router.push("/diskusi-ai");
          router.refresh();
        } else {
          setPesan("Pendaftaran berhasil dikirim. Periksa email kamu untuk mengonfirmasi akun sebelum masuk.");
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (authError) throw authError;
        router.push("/diskusi-ai");
        router.refresh();
      }
    } catch (err) {
      setError(err?.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setPesan("");
    setError("");
  }

  const daftar = mode === "daftar";

  return (
    <section className={`akun-bagian ${daftar ? "akun-mode-daftar" : ""}`}>
      <div className="akun-latar-dekor" aria-hidden="true">
        <span />
        <span />
      </div>

      <div className="akun-kartu">
        <div className="akun-panel-form">
          <Link className="akun-brand" href="/" aria-label="HumanityTech, kembali ke beranda">
            <img
              className="akun-brand-logo"
              src="/humanitytech-robot.png"
              alt="Logo robot HumanityTech"
              width="100"
              height="103"
              fetchPriority="high"
            />
          </Link>

          <div className="akun-judul">
            <p className="akun-kicker">{daftar ? "MULAI PERJALANANMU" : "SENANG MELIHATMU KEMBALI"}</p>
            <h1>{daftar ? "Buat akun" : "Selamat datang kembali"}</h1>
            <p className="akun-pengantar">
              {daftar
                ? "Bergabunglah untuk berdiskusi tentang teknologi dan masyarakat."
                : "Masuk untuk melanjutkan percakapan dan membuka riwayat diskusimu."}
            </p>
          </div>

          <form className="akun-form" onSubmit={handleSubmit}>
            {daftar && (
              <>
                <label htmlFor="akun-nama">Nama</label>
                <input
                  id="akun-nama"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={nama}
                  onChange={(event) => setNama(event.target.value)}
                  placeholder="Nama kamu"
                  maxLength={80}
                  required
                />
              </>
            )}

            <label htmlFor="akun-email">Email</label>
            <input
              id="akun-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
              required
            />

            <label htmlFor="akun-password">Kata sandi</label>
            <input
              id="akun-password"
              name="password"
              type="password"
              autoComplete={daftar ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              placeholder={daftar ? "Minimal 6 karakter" : "Masukkan kata sandi"}
              required
            />

            {error ? <p className="akun-pesan akun-error" role="alert">{error}</p> : null}
            {pesan ? <p className="akun-pesan akun-sukses" role="status">{pesan}</p> : null}

            <button className="akun-kirim" type="submit" disabled={loading}>
              {loading ? "Memproses..." : daftar ? "Buat akun" : "Masuk"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className="akun-mobile-switch">
            {daftar ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <button type="button" onClick={() => changeMode(daftar ? "masuk" : "daftar")}>
              {daftar ? "Masuk" : "Daftar"}
            </button>
          </div>

          <p className="akun-kembali"><Link href="/">← Kembali ke beranda</Link></p>
        </div>

        <aside className="akun-panel-sambutan">
          <div className="akun-orbit akun-orbit-atas" aria-hidden="true" />
          <div className="akun-orbit akun-orbit-bawah" aria-hidden="true" />
          <div className="akun-sambutan-isi">
            <span className="akun-sambutan-label">TEKNOLOGI, DENGAN MANUSIA DI TENGAHNYA</span>
            <img
              className="akun-panel-logo"
              src="/humanitytech-robot.png"
              alt="Logo robot HumanityTech"
              width="150"
              height="154"
            />
            <h2>{daftar ? "Selamat datang!" : "Halo, teman."}</h2>
            <p>
              {daftar
                ? "Ruang untuk bertukar pikiran, memahami dampak teknologi, dan menemukan ide yang bermanfaat bagi sesama."
                : "Lanjutkan rasa ingin tahumu. Mari melihat teknologi dari sisi manusia dan masyarakat."}
            </p>
            <div className="akun-sambutan-aksi">
              <span>{daftar ? "Sudah punya akun?" : "Baru di HumanityTech?"}</span>
              <button type="button" onClick={() => changeMode(daftar ? "masuk" : "daftar")}>
                {daftar ? "Masuk" : "Buat akun"} <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
          <p className="akun-panel-catatan">INFORMATIKA <span>·</span> SOSIOLOGI <span>·</span> KEMANUSIAAN</p>
        </aside>
      </div>
    </section>
  );
}
