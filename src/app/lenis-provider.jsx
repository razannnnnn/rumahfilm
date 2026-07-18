"use client";

import { ReactLenis } from "lenis/react";

export default function LenisProvider({ children }) {
  return (
    <ReactLenis root options={{ autoRaf: true }}>
      {children}
    </ReactLenis>
  );
}
