"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";

const inter = Inter({ subsets: ["latin"] });

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthPage, setIsAuthPage] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsAuthPage(pathname === "/login" || pathname === "/recuperar-senha");
  }, [pathname]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <SidebarProvider>
        <AuthGuard>
          <LayoutWrapper isAuthPage={isAuthPage}>{children}</LayoutWrapper>
        </AuthGuard>
        <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  );
}

function LayoutWrapper({
  children,
  isAuthPage,
}: {
  children: React.ReactNode;
  isAuthPage: boolean;
}) {
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className={`flex min-h-screen bg-pattern ${inter.className}`}>
      <AppSidebar />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
