// components/EbinexLogoImg.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function EbinexLogoImg({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const [logoUrl, setLogoUrl] = useState("/default-logo.png");

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch("/api/config/general");
        const data = await response.json();
        if (data.logoUrl) {
          setLogoUrl(data.logoUrl);
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };

    fetchLogo();
  }, []);

  return (
    <Image
      src={logoUrl}
      alt="Ebinex Logo"
      width={width}
      height={height}
      className="object-contain"
      onError={() => setLogoUrl("/default-logo.png")}
    />
  );
}
