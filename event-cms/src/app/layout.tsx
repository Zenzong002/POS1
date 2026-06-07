import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Great_Vibes, Cinzel, Lato } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "EventCraft – Beautiful Event Websites",
  description: "Create stunning wedding and event websites in minutes with EventCraft.",
  keywords: ["wedding website", "event website", "invitation", "RSVP"],
  openGraph: {
    title: "EventCraft – Beautiful Event Websites",
    description: "Create stunning wedding and event websites in minutes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${cormorant.variable} ${greatVibes.variable} ${cinzel.variable} ${lato.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1a1a2e",
              color: "#ffffff",
              border: "1px solid #D4AF37",
              borderRadius: "8px",
            },
            success: {
              iconTheme: { primary: "#D4AF37", secondary: "#1a1a2e" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
            },
          }}
        />
      </body>
    </html>
  );
}
