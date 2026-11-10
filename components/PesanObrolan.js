import RobotKecil from "@/components/RobotKecil";

// Logika RuangObrolan.js
export default function PesanObrolan({ jenis, penanda, children }) {
  if (jenis === "pengguna") {
    return (
      <div className="obrolan-pesan obrolan-pesan-pengguna">
        <p className="obrolan-sr">Kamu:</p>
        <div className="obrolan-isi">{children}</div>
      </div>
    );
  }

  const menunggu = jenis === "menunggu";

  return (
    <div
      className={`obrolan-pesan obrolan-pesan-robot${
        menunggu ? " obrolan-pesan-menunggu" : ""
      }`}
    >
      <p className="obrolan-sr">Robot HumanityTech:</p>
      <div className="obrolan-isi">{children}</div>
      <div className="obrolan-kaki">
        <RobotKecil ukuran="avatar" kondisi={menunggu ? "menjawab" : "normal"} />
        {penanda ? <p className="obrolan-penanda">{penanda}</p> : null}
      </div>
    </div>
  );
}
