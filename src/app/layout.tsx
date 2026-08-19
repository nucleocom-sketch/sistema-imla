import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { RegistrarServiceWorker } from "@/components/RegistrarServiceWorker";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Instituto Mãe Lalu",
  description: "Sistema de gestão do Instituto Mãe Lalu",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mãe Lalu",
  },
};

export const viewport: Viewport = {
  themeColor: "#4fc3d1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div className="imla-mesh-bg">
          <div className="imla-mesh-blob-pink" />
        </div>
        {children}
        <RegistrarServiceWorker />
      </body>
    </html>
  );
}
