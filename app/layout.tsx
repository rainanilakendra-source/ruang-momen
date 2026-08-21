import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "./_components/i18n-provider";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Ruang Momen — Satu acara. Banyak sudut. Satu cerita.",
  description:
    "Kumpulkan foto dari setiap sudut acaramu dalam satu album bersama. Cukup bagikan satu QR, tanpa install aplikasi.",
  icons: {
    icon: {
      url: "/brand/ruang-momen-icon.png",
      type: "image/png",
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><I18nProvider>{children}</I18nProvider></body>
    </html>
  );
}
