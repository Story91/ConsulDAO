"use client";

import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with WebGL
const Iridescence = dynamic(() => import("./Iridescence"), {
  ssr: false,
});

export function IridescenceBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Iridescence
        color={[1, 1, 1]}
        mouseReact={true}
        amplitude={0.1}
        speed={0.3}
      />
    </div>
  );
}

