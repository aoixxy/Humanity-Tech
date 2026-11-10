// Ilustrasi robot kecil
export default function RobotKecil({ ukuran = "avatar", kondisi = "normal" }) {
  const menjawab = kondisi === "menjawab";

  return (
    <svg
      className={`robot robot-${ukuran}`}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      {/* Antena */}
      <line className="robot-garis" x1="32" y1="14" x2="32" y2="7" />
      <circle className="robot-titik" cx="32" cy="6" r="3.5" />

      {/* Telinga */}
      <rect className="robot-badan" x="4.5" y="26" width="5.5" height="11" rx="2.5" />
      <rect className="robot-badan" x="54" y="26" width="5.5" height="11" rx="2.5" />

      {/* Kepala */}
      <rect className="robot-kepala" x="10" y="14" width="44" height="34" rx="12" />

      {/* Mata dan mulut */}
      {menjawab ? (
        <>
          <path className="robot-garis robot-garis-tebal" d="M20.5 31 H27.5" />
          <path className="robot-garis robot-garis-tebal" d="M36.5 31 H43.5" />
          <path className="robot-garis" d="M28 41 H36" />
        </>
      ) : (
        <>
          <circle className="robot-mata" cx="24" cy="30" r="3.4" />
          <circle className="robot-mata" cx="40" cy="30" r="3.4" />
          <path className="robot-garis" d="M25 39.5 Q32 45 39 39.5" />
        </>
      )}

      {/* Badan */}
      <rect className="robot-badan" x="18" y="51" width="28" height="9" rx="4.5" />
      <circle className="robot-titik" cx="32" cy="55.5" r="1.8" />
    </svg>
  );
}
