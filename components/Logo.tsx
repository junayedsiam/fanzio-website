import React from "react";

type LogoProps = {
  className?: string;
};

/*
  Pentagon Logo — concentric pentagons, pointing upward.
  Center: (20, 20) in a 40×40 viewBox.

  Outer pentagon  (R = 18): visible dark shape
  Middle pentagon (R = 11): white "ring" cut-out
  Inner pentagon  (R = 5.5): dark centre dot

  Vertex angles: -90° + k*72°  (k = 0…4)
  cos/sin values:
    k=0  → (  0,  -1   )
    k=1  → ( 0.9511, -0.3090 )
    k=2  → ( 0.5878,  0.8090 )
    k=3  → (-0.5878,  0.8090 )
    k=4  → (-0.9511, -0.3090 )
*/
export function Logo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Fanzio Logo"
    >
      {/* ── Outer pentagon ── */}
      <polygon
        points="20,2 37.1,14.4 30.6,34.6 9.4,34.6 2.9,14.4"
        fill="#111111"
      />

      {/* ── Middle pentagon (white ring) ── */}
      <polygon
        points="20,9 30.5,16.6 26.5,28.9 13.5,28.9 9.5,16.6"
        fill="white"
      />

      {/* ── Inner pentagon (dark centre) ── */}
      <polygon
        points="20,14.5 25.2,18.3 23.2,24.5 16.8,24.5 14.8,18.3"
        fill="#111111"
      />
    </svg>
  );
}
