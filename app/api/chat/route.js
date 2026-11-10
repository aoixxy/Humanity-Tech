import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BATAS_KARAKTER = 500;

const INSTRUKSI_SISTEM = `
Kamu adalah asisten umum di Ruang Diskusi AI HumanityTech.
Jika ditanya siapa pengembang atau developer HumanityTech, jawab dengan jelas:
"HumanityTech dikembangkan oleh Amru." Jangan menyebut OpenAI atau Groq sebagai pengembang website.
Groq adalah penyedia layanan model AI, bukan pengembang HumanityTech.

Pengguna bebas bertanya tentang berbagai topik, termasuk pendidikan, sains,
teknologi, pemrograman, budaya, kehidupan sehari-hari, dan Sosiologi.
Jangan membatasi jawaban hanya pada Globalisasi atau materi sekolah.

GAYA JAWABAN — SANTAI, TAPI TETAP TEPAT:
- Balas dengan bahasa yang sama seperti pengguna. Untuk bahasa Indonesia, gunakan gaya ngobrol yang natural, ramah, dan jelas—bukan gaya makalah atau customer service.
- Mulai langsung dari jawaban inti. Hindari kalimat pembuka seperti "Tentu, saya akan menjelaskan" atau "Pertanyaan yang menarik".
- Tetap fokus pada pertanyaan. Jangan melebar, mengulang poin yang sama, atau menambahkan kesimpulan yang tidak diperlukan.
- Pertanyaan sederhana: jawab singkat, biasanya 1–3 paragraf. Pertanyaan yang meminta langkah, analisis, atau penjelasan mendalam: uraikan secukupnya dengan contoh yang relevan.
- Gunakan kata sehari-hari yang mudah dipahami. Jangan memaksakan slang Gen Z, singkatan, atau emoji; pakai hanya jika terasa wajar mengikuti gaya pengguna.
- Jangan otomatis memakai judul, daftar, atau format kaku. Gunakan format hanya jika membantu.
- Untuk pertanyaan sekolah atau teknis, tetap akurat dan jelaskan istilah sulit dengan bahasa sederhana. Jangan menyederhanakan sampai maknanya salah.
- Jika ada beberapa kemungkinan jawaban atau informasi belum pasti, jelaskan batas kepastiannya secara langsung. Jangan berpura-pura yakin.
- Gunakan hasil pencarian web sebagai bahan verifikasi, bukan sebagai bukti bahwa semua isi pasti benar. Jangan mengklaim sumber mendukung sesuatu jika isi sumber tidak menunjukkan hal itu.
- Jawab inti pertanyaan dengan gaya ngobrol yang natural, tidak kaku, tetapi tetap akurat dan on point.
- Jangan menulis bagian berjudul "Sumber" atau daftar tautan sumber sendiri. Server akan menambahkan satu bagian Sumber setelah jawaban.
- Gunakan hasil pencarian hanya untuk mendukung klaim yang memang sesuai dengan ringkasan sumber. Jangan mengarang fakta, kutipan, judul, atau URL.
- Jika sumber tidak cukup mendukung suatu klaim atau informasi belum pasti, jelaskan keterbatasannya secara singkat.
- Bedakan fakta dari opini atau saran. Tetap sopan tanpa menggurui dan jangan menampilkan tag HTML.

Jika pengguna membahas Globalisasi atau riset sosial, bantu dengan sudut pandang Sosiologi jika memang relevan, tetapi jangan membatasi topik lain.
`;

// Filter pesan yang ga penting
function perluSumberWeb(pesan) {
  const teks = pesan.trim().toLowerCase();
  const tanpaSumber = [
    /^(hai|halo|hi|hello|hei|hey|pagi|siang|sore|malam|apa kabar)[!?.\s]*$/i,
    /^(makasih|terima kasih|thanks|thank you|thx|oke|ok|sip|siap|wkwk+|haha+|hehe+)[!?.\s]*$/i,
    /\b(menurutmu|menurut kamu|menurut anda|apa pendapatmu|pendapat kamu|kamu pikir|aku merasa|saya merasa|curhat|aku sedih|saya sedih)\b/i,
    /\b(buatkan|bikinkan|tuliskan|susunlah|karang|buat puisi|buat pantun|buat caption|buat slogan|buat dialog|buat naskah|buat ide)\b/i,
    /\b(terjemahkan|translate|alihbahasakan|parafrase|tulis ulang|perbaiki kalimat|koreksi tata bahasa|ubah kalimat|rapikan tulisan|ringkas teks berikut|rangkum teks berikut)\b/i,
    /^(berapa hasil|hitung(kan)?|jumlahkan|kurangkan|kalikan|bagikan|dev|modelsiapa kamu|nama kamu|kamu itu apa|kamu robot|kamu ai|kamu siapa)\b/i,
    /^\d+(?:[.,]\d+)?\s*[+*/x×÷-]\s*\d+(?:[.,]\d+)?[?!.\s]*$/i,
  ];
  return !tanpaSumber.some((pola) => pola.test(teks));
}

export async function POST(request) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Silakan masuk untuk menggunakan Ruang Diskusi AI." },
      { status: 401 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { success: false, error: "Konfigurasi autentikasi server belum lengkap." },
      { status: 500 }
    );
  }

  const supabaseAuth = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } =
    await supabaseAuth.auth.getUser(token);

  if (userError || !userData?.user) {
    return NextResponse.json(
      { success: false, error: "Sesi login tidak valid. Silakan masuk kembali." },
      { status: 401 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Format permintaan tidak valid." },
      { status: 400 }
    );
  }

  const pesan = typeof body?.message === "string" ? body.message.trim() : "";

  if (!pesan) {
    return NextResponse.json(
      { success: false, error: "Tulis pertanyaan terlebih dahulu." },
      { status: 400 }
    );
  }

  if (pesan.length > BATAS_KARAKTER) {
    return NextResponse.json(
      { success: false, error: `Pesan maksimal ${BATAS_KARAKTER} karakter.` },
      { status: 400 }
    );
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  const groqModel = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
  const tavilyApiKey = process.env.TAVILY_API_KEY;

  const gunakanSumberWeb = perluSumberWeb(pesan);

  if (gunakanSumberWeb && !tavilyApiKey) {
    return NextResponse.json(
      { success: false, error: "Fitur sumber web belum dikonfigurasi. Tambahkan TAVILY_API_KEY di .env.local, lalu restart server." },
      { status: 503 }
    );
  }

  if (!groqApiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "Konfigurasi Groq belum lengkap. Isi GROQ_API_KEY di .env.local, lalu restart server.",
      },
      { status: 503 }
    );
  }

  // Sumber jika perlu saja
  let sumberWeb = [];
  let konteksWeb = "Pencarian web tidak diperlukan untuk jenis pesan ini. Jangan menampilkan bagian Sumber.";
  if (gunakanSumberWeb) try {
    const searchResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query: pesan,
        search_depth: "basic",
        topic: "general",
        max_results: 3,
        include_answer: false,
        include_raw_content: false,
      }),
      signal: AbortSignal.timeout(20000),
      cache: "no-store",
    });

    if (!searchResponse.ok) {
      console.error("[HumanityTech Tavily] Pencarian gagal", { status: searchResponse.status });
      return NextResponse.json(
        { success: false, error: "Pencarian sumber web gagal. Periksa TAVILY_API_KEY atau coba lagi nanti." },
        { status: 502 }
      );
    }

    const searchData = await searchResponse.json();
    sumberWeb = (Array.isArray(searchData?.results) ? searchData.results : [])
      .filter((item) => typeof item?.url === "string" && /^https?:\/\//i.test(item.url))
      .map((item) => ({
        title: String(item.title || item.url).slice(0, 200),
        url: item.url,
        content: String(item.content || "").slice(0, 1800),
      }))
      // Hilangkan URL duplikat dan batasi maksimal 3 sumber.
      .filter((item, index, all) => all.findIndex((candidate) => candidate.url === item.url) === index)
      .slice(0, 3);

    konteksWeb = sumberWeb.length
      ? sumberWeb.map((item, index) => `[${index + 1}] ${item.title}\nURL: ${item.url}\nRingkasan: ${item.content}`).join("\n\n")
      : "Tidak ada hasil web yang relevan. Jawab berdasarkan pengetahuan yang tersedia dengan menyatakan ketidakpastian bila perlu. Jangan mengarang sumber dan jangan membuat bagian Sumber.";
  } catch (error) {
    console.error("[HumanityTech Tavily] Koneksi pencarian gagal", error instanceof Error ? error.message : "Kesalahan jaringan");
    return NextResponse.json(
      { success: false, error: "Tidak dapat mencari sumber web. Periksa koneksi lalu coba lagi." },
      { status: 502 }
    );
  }

  let groqResponse;
  let lastNetworkError = false;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: "system", content: INSTRUKSI_SISTEM },
            { role: "user", content: gunakanSumberWeb
              ? `Pertanyaan pengguna:
${pesan}

Hasil pencarian web untuk verifikasi (gunakan secara kritis):
${konteksWeb}

Jika ada hasil yang relevan, server akan menambahkan maksimal 3 tautan sumber. Jangan membuat bagian Sumber sendiri.`
              : `Pesan pengguna:
${pesan}

Pesan ini tidak memerlukan pencarian web. Jawab secara natural dan jangan menambahkan bagian Sumber atau tautan referensi.` },
          ],
          temperature: 0.7,
          max_completion_tokens: 4096,
        }),
        signal: AbortSignal.timeout(60000),
        cache: "no-store",
      });
      lastNetworkError = false;

      if (
        groqResponse.ok ||
        ![429, 500, 502, 503, 504].includes(groqResponse.status) ||
        attempt === maxAttempts
      ) {
        break;
      }

      console.warn("[HumanityTech Groq API] Respons sementara, mencoba ulang", {
        status: groqResponse.status,
        model: groqModel,
        attempt,
        nextAttempt: attempt + 1,
      });

      await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
    } catch (error) {
      lastNetworkError = true;

      if (attempt === maxAttempts) {
        console.error("[HumanityTech Groq API] Koneksi gagal setelah retry", {
          model: groqModel,
          attempts: maxAttempts,
          message: error instanceof Error ? error.message : "Kesalahan jaringan",
        });
        return NextResponse.json(
          { success: false, error: "Tidak dapat menghubungi layanan AI setelah beberapa percobaan. Coba lagi sebentar." },
          { status: 502 }
        );
      }

      console.warn("[HumanityTech Groq API] Koneksi gagal, mencoba ulang", {
        model: groqModel,
        attempt,
        nextAttempt: attempt + 1,
      });

      await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
    }
  }

  if (lastNetworkError || !groqResponse) {
    return NextResponse.json(
      { success: false, error: "Tidak dapat menghubungi layanan AI setelah beberapa percobaan. Coba lagi sebentar." },
      { status: 502 }
    );
  }

  if (!groqResponse.ok) {
    let detail = "";
    try {
      const errorBody = await groqResponse.json();
      detail = errorBody?.error?.message || "";
    } catch {
    }

    console.error("[HumanityTech Groq API]", {
      status: groqResponse.status,
      model: groqModel,
      message: detail,
    });

    if (groqResponse.status === 400) {
      return NextResponse.json(
        { success: false, error: "Permintaan ke Groq tidak diterima. Periksa nama model atau konfigurasi API. Detail tersedia di terminal server." },
        { status: 502 }
      );
    }
    if (groqResponse.status === 401 || groqResponse.status === 403) {
      return NextResponse.json(
        { success: false, error: "Kunci API Groq tidak valid atau akses API ditolak. Periksa GROQ_API_KEY dan izin API." },
        { status: 502 }
      );
    }
    if (groqResponse.status === 404) {
      return NextResponse.json(
        { success: false, error: `Model Groq '${groqModel}' tidak ditemukan atau tidak tersedia. Periksa GROQ_MODEL di .env.local.` },
        { status: 502 }
      );
    }
    if (groqResponse.status === 429) {
      return NextResponse.json(
        { success: false, error: "Batas penggunaan Groq sedang tercapai. Periksa kuota dan rate limit akun Groq." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { success: false, error: `Groq gagal memproses permintaan (HTTP ${groqResponse.status}). Periksa terminal server untuk detailnya.` },
      { status: 502 }
    );
  }

  let hasil;
  try {
    hasil = await groqResponse.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Respons dari layanan AI tidak dapat dibaca." },
      { status: 502 }
    );
  }

  const reply = hasil?.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    return NextResponse.json(
      { success: false, error: "Groq tidak mengembalikan jawaban teks. Coba ubah pertanyaan atau coba lagi." },
      { status: 502 }
    );
  }

  const jawabanBersih = reply
    .replace(/\n{0,2}#{1,6}\s*Sumber\s*\n[\s\S]*$/i, "")
    .replace(/\n{0,2}\*\*Sumber\*\*\s*:?\s*\n[\s\S]*$/i, "")
    .trim();

  // Sumber ditampilkan jika pencarian diperlukan saja.
  const blokSumber = gunakanSumberWeb && sumberWeb.length
    ? `\n\n### Sumber\n` + sumberWeb.map((item) => `- [${item.title.replace(/[\[\]]/g, "")}](${item.url})`).join("\n")
    : "";

  return NextResponse.json({
    success: true,
    reply: `${jawabanBersih}${blokSumber}`,
    simulated: false,
  });
}
