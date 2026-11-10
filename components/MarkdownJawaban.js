import React from "react";

function formatBaris(teks, kunciAwal = "teks") {
  const pola = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;
  const bagian = teks.split(pola);
  return bagian.map((bagianTeks, index) => {
    const kunci = `${kunciAwal}-${index}`;
    if (/^\*\*[^*]+\*\*$/.test(bagianTeks)) {
      return <strong key={kunci}>{bagianTeks.slice(2, -2)}</strong>;
    }
    if (/^\*[^*]+\*$/.test(bagianTeks)) {
      return <em key={kunci}>{bagianTeks.slice(1, -1)}</em>;
    }
    if (/^`[^`]+`$/.test(bagianTeks)) {
      return <code key={kunci}>{bagianTeks.slice(1, -1)}</code>;
    }
    const tautan = bagianTeks.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (tautan) {
      return <a key={kunci} href={tautan[2]} target="_blank" rel="noopener noreferrer">{tautan[1]}</a>;
    }
    return <React.Fragment key={kunci}>{bagianTeks}</React.Fragment>;
  });
}

export default function MarkdownJawaban({ children }) {
  const teks = typeof children === "string" ? children : "";
  const baris = teks.replace(/\r\n?/g, "\n").split("\n");
  const elemen = [];
  let paragraf = [];
  let daftar = [];
  let jenisDaftar = null;
  let kode = [];
  let dalamKode = false;

  const simpanParagraf = () => {
    if (paragraf.length) {
      elemen.push(<p key={`p-${elemen.length}`}>{formatBaris(paragraf.join(" "), `p-${elemen.length}`)}</p>);
      paragraf = [];
    }
  };
  const simpanDaftar = () => {
    if (!daftar.length) return;
    const Item = jenisDaftar === "nomor" ? "ol" : "ul";
    elemen.push(
      <Item key={`list-${elemen.length}`}>
        {daftar.map((item, i) => <li key={`li-${i}`}>{formatBaris(item, `li-${elemen.length}-${i}`)}</li>)}
      </Item>
    );
    daftar = [];
    jenisDaftar = null;
  };
  const simpanKode = () => {
    elemen.push(<pre key={`code-${elemen.length}`}><code>{kode.join("\n")}</code></pre>);
    kode = [];
    dalamKode = false;
  };

  for (const barisAsli of baris) {
    const barisTeks = barisAsli.trimEnd();
    if (barisTeks.trim().startsWith("```")) {
      simpanParagraf(); simpanDaftar();
      if (dalamKode) simpanKode();
      else dalamKode = true;
      continue;
    }
    if (dalamKode) { kode.push(barisAsli); continue; }
    if (!barisTeks.trim()) { simpanParagraf(); simpanDaftar(); continue; }

    const judul = barisTeks.match(/^(#{1,3})\s+(.+)$/);
    if (judul) {
      simpanParagraf(); simpanDaftar();
      const Tag = `h${Math.min(judul[1].length + 1, 4)}`;
      elemen.push(<Tag key={`h-${elemen.length}`}>{formatBaris(judul[2], `h-${elemen.length}`)}</Tag>);
      continue;
    }
    const butir = barisTeks.match(/^\s*[-*•]\s+(.+)$/);
    const nomor = barisTeks.match(/^\s*\d+[.)]\s+(.+)$/);
    if (butir || nomor) {
      simpanParagraf();
      const tipe = nomor ? "nomor" : "bullet";
      if (jenisDaftar && jenisDaftar !== tipe) simpanDaftar();
      jenisDaftar = tipe;
      daftar.push((butir || nomor)[1]);
      continue;
    }
    const kutipan = barisTeks.match(/^\s*>\s?(.+)$/);
    if (kutipan) {
      simpanParagraf(); simpanDaftar();
      elemen.push(<blockquote key={`quote-${elemen.length}`}>{formatBaris(kutipan[1], `quote-${elemen.length}`)}</blockquote>);
      continue;
    }
    simpanDaftar();
    paragraf.push(barisTeks.trim());
  }
  simpanParagraf(); simpanDaftar();
  if (dalamKode) simpanKode();

  return <div className="ht-markdown">{elemen}</div>;
}
