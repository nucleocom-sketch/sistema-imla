import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Instituto Mãe Lalu",
  description: "Sistema de gestão do Instituto Mãe Lalu",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div className="imla-mesh-bg">
          <div className="imla-mesh-blob-pink" />
        </div>
        {children}
      </body>
    </html>
  );
}
