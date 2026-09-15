/** Isotipos de fuente: Google Maps (pin de producto) e INEGI (marca 2018, azul institucional). */

export function GoogleMapsMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M12 22s7-7.16 7-12.15C19 6.24 15.87 3 12 3S5 6.24 5 9.85C5 14.84 12 22 12 22Z"
        fill="#EA4335"
      />
      <path d="M12 22s7-7.16 7-12.15C19 6.24 15.87 3 12 3v19Z" fill="#34A853" />
      <path d="M12 3C9.6 3 7.5 4.28 6.4 6.2L12 12V3Z" fill="#FBBC04" />
      <path d="M17.6 6.2C16.5 4.28 14.4 3 12 3v9l5.6-5.8Z" fill="#4285F4" />
      <circle cx="12" cy="9.6" r="2.55" fill="#FFFFFF" />
    </svg>
  );
}

export function InegiMark({ size = 16 }: { size?: number }) {
  const navy = "#003057";
  const cyan = "#00A3E0";
  const cells: { x: number; y: number; fill: string }[] = [
    { x: 8, y: 1, fill: cyan },
    { x: 11, y: 1, fill: navy },
    { x: 5, y: 4, fill: navy },
    { x: 8, y: 4, fill: cyan },
    { x: 11, y: 4, fill: navy },
    { x: 14, y: 4, fill: cyan },
    { x: 2, y: 7, fill: navy },
    { x: 5, y: 7, fill: cyan },
    { x: 8, y: 7, fill: navy },
    { x: 11, y: 7, fill: cyan },
    { x: 14, y: 7, fill: navy },
    { x: 17, y: 7, fill: cyan },
    { x: 5, y: 10, fill: navy },
    { x: 8, y: 10, fill: cyan },
    { x: 11, y: 10, fill: navy },
    { x: 14, y: 10, fill: cyan },
    { x: 8, y: 13, fill: navy },
    { x: 11, y: 13, fill: cyan },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      {cells.map((cell) => (
        <rect
          key={`${cell.x}-${cell.y}`}
          x={cell.x}
          y={cell.y}
          width="2.6"
          height="2.6"
          rx="0.35"
          fill={cell.fill}
        />
      ))}
    </svg>
  );
}
