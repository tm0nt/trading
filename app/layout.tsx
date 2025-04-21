import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/theme-context";
import { prisma } from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"] });

const DEFAULT_SITE_NAME = "Plataforma de Trading";

// Função utilitária para buscar config no banco via Prisma
async function getSiteName() {
  try {
    const config = await prisma.config.findUnique({
      where: { id: 1 },
      select: { nomeSite: true },
    });

    return config?.nomeSite || DEFAULT_SITE_NAME;
  } catch (error) {
    console.error("Erro ao buscar configurações no banco:", error);
    return DEFAULT_SITE_NAME;
  }
}

// Geração de metadata dinâmica com dados do banco
export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();

  return {
    title: siteName,
    description: `${siteName} - Plataforma completa para trading`,
    openGraph: {
      title: siteName,
      description: `${siteName} - Plataforma completa para trading`,
      siteName,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

// Root layout
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteName = await getSiteName();

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider>
          {/* <Header siteName={siteName} /> */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
