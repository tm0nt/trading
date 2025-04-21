import type React from "react";
import ClientRootLayout from "./clientLayout";

import "./globals.css";

export const metadata = {
  title: "Painel Administrativo",
  description: "Painel administrativo moderno e responsivo",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark" style={{ colorScheme: "dark" }}>
      <body className="dark:bg-[#101010]">
        <ClientRootLayout>{children}</ClientRootLayout>
      </body>
    </html>
  );
}
